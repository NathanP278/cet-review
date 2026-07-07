"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export interface ExamConfig {
  mode: "full" | "subject" | "custom" | "quick";
  subjectId?: string;
  categoryId?: string;
  topicId?: string;
  difficulty?: Database["public"]["Enums"]["difficulty_level"];
  questionCount: number;
  timeLimitSeconds: number;
}

export async function createExamSession(config: ExamConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch all candidate question IDs and metadata
  let query = supabase.from("questions").select("id, topic_id, difficulty");

  if (config.subjectId) query = query.eq("subject_id", config.subjectId);
  if (config.categoryId) query = query.eq("category_id", config.categoryId);
  if (config.topicId) query = query.eq("topic_id", config.topicId);
  if (config.difficulty) query = query.eq("difficulty", config.difficulty);

  const { data: candidateQuestions, error: fetchError } = await query;

  if (fetchError || !candidateQuestions) {
    console.error("Fetch Error:", fetchError);
    throw new Error("Failed to fetch candidate questions.");
  }

  if (candidateQuestions.length === 0) {
    throw new Error("No questions found matching the selected criteria.");
  }

  // 2. Group by Topic to ensure balanced coverage
  const groupedByTopic: Record<string, typeof candidateQuestions> = {};
  candidateQuestions.forEach(q => {
    const tid = q.topic_id || "general";
    if (!groupedByTopic[tid]) groupedByTopic[tid] = [];
    groupedByTopic[tid].push(q);
  });

  // 3. Shuffle each group using Fisher-Yates
  const shuffleArray = <T,>(array: T[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  Object.keys(groupedByTopic).forEach(tid => {
    groupedByTopic[tid] = shuffleArray(groupedByTopic[tid]);
  });

  // 4. Interleave questions to build the final blueprint
  const finalQuestionIds: string[] = [];
  const topics = Object.keys(groupedByTopic);
  let added = true;

  while (added && finalQuestionIds.length < config.questionCount) {
    added = false;
    for (const tid of topics) {
      if (finalQuestionIds.length >= config.questionCount) break;
      const q = groupedByTopic[tid].pop();
      if (q) {
        finalQuestionIds.push(q.id);
        added = true;
      }
    }
  }

  // Final shuffle of the selected blueprint so topics aren't perfectly cyclical
  const randomizedBlueprint = shuffleArray(finalQuestionIds);

  if (randomizedBlueprint.length === 0) {
    throw new Error("Failed to generate blueprint.");
  }

  // Create the in_progress attempt
  const { data: attempt, error: insertError } = await supabase
    .from("mock_exam_attempts")
    .insert({
      user_id: user.id,
      status: "in_progress",
      config: config as any,
      state: {
        answers: {},
        flagged: [],
        remainingSeconds: config.timeLimitSeconds,
        questions: randomizedBlueprint, // Store question IDs to freeze the blueprint
      } as any,
    })
    .select()
    .single();

  if (insertError || !attempt) {
    console.error("Insert Error:", insertError);
    throw new Error("Failed to initialize exam session.");
  }

  return attempt.id;
}

export async function saveExamState(
  attemptId: string,
  answers: Record<number, string>,
  flagged: number[],
  timePerQuestion: Record<number, number>,
  remainingSeconds: number,
  expectedVersion: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Use the atomic optimistic locking RPC
  const { data: newVersion, error } = await supabase.rpc("update_exam_state", {
    p_attempt_id: attemptId,
    p_user_id: user.id,
    p_expected_version: expectedVersion,
    p_new_answers: answers as any,
    p_new_flagged: flagged as any,
    p_new_time_per_question: timePerQuestion as any,
    p_remaining_seconds: remainingSeconds,
  });

  if (error || newVersion === -1) {
    console.error("Failed to autosave exam state - Conflict or Error:", error || "Version mismatch");
    return { success: false, conflict: true };
  }
  
  if (newVersion === 0) {
    console.error("Attempt not found or not in progress");
    return { success: false, conflict: false };
  }

  return { success: true, version: newVersion, conflict: false };
}

import { processBatchSM2Updates } from "./sm2";

export async function submitExam(attemptId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch attempt and questions
  const { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt || attempt.status === "completed") {
    return { success: attempt?.status === "completed" };
  }

  const state = attempt.state as any;
  const config = attempt.config as any;
  const questionIds: string[] = state.questions || [];
  const answers: Record<number, string> = state.answers || {};
  const timePerQuestionData: Record<number, number> = state.timePerQuestion || {};
  const remainingSeconds = state.remainingSeconds;
  
  const timeSpent = Math.max(1, config.timeLimitSeconds - remainingSeconds);

  // 2. Fetch actual answers to grade securely
  const { data: questions } = await supabase
    .from("questions")
    .select("id, answer, topic_id, topics(name, subjects(name))")
    .in("id", questionIds);

  if (!questions) throw new Error("Failed to fetch questions for grading");

  // 3. Grade
  let totalScore = 0;
  const subjectMap: Record<string, { score: number; total: number }> = {};
  const topicMap: Record<string, { score: number; total: number; subject: string }> = {};
  const sm2Updates: any[] = [];

  // Sort questions to match the original blueprint order
  const orderedQuestions = questionIds
    .map((id: string) => questions.find((q) => q.id === id))
    .filter(Boolean) as typeof questions;

  orderedQuestions.forEach((q, idx) => {
    // Subject & Topic mapping
    let subjectName = "General";
    let topicName = "General";
    
    const t = q.topics as any;
    if (t && !Array.isArray(t)) {
      if (t.name) topicName = t.name;
      if (t.subjects && !Array.isArray(t.subjects)) {
        subjectName = t.subjects.name;
      }
    }

    if (!subjectMap[subjectName]) subjectMap[subjectName] = { score: 0, total: 0 };
    if (!topicMap[topicName]) topicMap[topicName] = { score: 0, total: 0, subject: subjectName };

    subjectMap[subjectName].total += 1;
    topicMap[topicName].total += 1;

    const userAnswer = answers[idx];
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
      totalScore += 1;
      subjectMap[subjectName].score += 1;
      topicMap[topicName].score += 1;
    }

    // Use precisely tracked time if available, otherwise fallback to an even split
    const trackedTime = timePerQuestionData[idx];
    const timePerQuestion = trackedTime !== undefined ? trackedTime : Math.round(timeSpent / (Object.keys(answers).length || 1));

    if (userAnswer) {
      sm2Updates.push({
        questionId: q.id,
        quality: isCorrect ? 4 : 1, // 4 = good, 1 = blackout/wrong
        responseTimeSeconds: timePerQuestion,
      });
    }
  });

  const subjectScores = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    score: data.score,
    total: data.total,
  }));

  const topicScores = Object.entries(topicMap).map(([name, data]) => ({
    name,
    subject: data.subject,
    score: data.score,
    total: data.total,
  }));

  const overallAccuracy = (totalScore / questionIds.length) * 100;
  
  // Very rough algorithmic mapping for CET Readiness based on standard curve
  // 90%+ = 99th percentile readiness, 50% = 70th percentile
  let estimatedReadiness = 0;
  if (overallAccuracy >= 90) estimatedReadiness = 95 + (overallAccuracy - 90) / 2;
  else if (overallAccuracy >= 60) estimatedReadiness = 80 + (overallAccuracy - 60) / 2;
  else estimatedReadiness = 50 + (overallAccuracy / 2);
  
  estimatedReadiness = Math.min(99, Math.round(estimatedReadiness));

  const scoreData = {
    totalScore,
    totalQuestions: questionIds.length,
    subjectScores,
    topicScores,
    estimatedReadiness,
    timeSpentSeconds: timeSpent,
  };

  // 4. Update attempt as completed
  const { error } = await supabase
    .from("mock_exam_attempts")
    .update({
      status: "completed",
      score_data: scoreData as any,
    })
    .eq("id", attemptId);

  if (error) {
    throw new Error("Failed to finalize exam attempt");
  }

  // 5. Trigger SM-2 Spaced Repetition Batch Updates (Background processing is fine here)
  if (sm2Updates.length > 0) {
    await processBatchSM2Updates(sm2Updates).catch(console.error);
  }

  // Clear cache for key pages to reflect new mastery, readiness, and heatmaps immediately
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard");
  revalidatePath("/exam/history");
  revalidatePath("/subjects", "layout");
  revalidatePath("/topics", "layout");

  return { success: true };
}
