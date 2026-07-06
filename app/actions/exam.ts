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

  // Generate Blueprint - fetch randomized questions via RPC
  const { data: questions, error: rpcError } = await supabase.rpc("get_randomized_questions", {
    p_limit: config.questionCount,
    p_subject_id: config.subjectId || null,
    p_category_id: config.categoryId || null,
    p_topic_id: config.topicId || null,
    p_difficulty: config.difficulty || null,
  });

  if (rpcError || !questions) {
    console.error("RPC Error:", rpcError);
    throw new Error("Failed to generate exam questions.");
  }

  if (questions.length === 0) {
    throw new Error("No questions found matching the selected criteria.");
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
        questions: questions.map((q) => q.id), // Store question IDs to freeze the blueprint
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
  remainingSeconds: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // We read current state, update it, and write it back.
  // In a high-concurrency app we'd use raw SQL jsonb updates, but for MVP this is fine since it's just the user.
  const { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("state")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt) return { success: false };

  const currentState = attempt.state as any;

  const { error } = await supabase
    .from("mock_exam_attempts")
    .update({
      state: {
        ...currentState,
        answers,
        flagged,
        remainingSeconds,
      },
    })
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .eq("status", "in_progress");

  if (error) {
    console.error("Failed to autosave exam state:", error);
    return { success: false };
  }

  return { success: true };
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
  const sm2Updates: any[] = [];

  // Sort questions to match the original blueprint order
  const orderedQuestions = questionIds
    .map((id: string) => questions.find((q) => q.id === id))
    .filter(Boolean) as typeof questions;

  orderedQuestions.forEach((q, idx) => {
    // Subject mapping
    let subjectName = "General";
    if (q.topics && !Array.isArray(q.topics) && q.topics.subjects && !Array.isArray(q.topics.subjects)) {
      subjectName = q.topics.subjects.name;
    }

    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = { score: 0, total: 0 };
    }

    subjectMap[subjectName].total += 1;

    const userAnswer = answers[idx];
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
      totalScore += 1;
      subjectMap[subjectName].score += 1;
    }

    // Estimate time spent per question: total time / number of answered questions
    // This is rough but sufficient for SM-2 if we don't track per-question time precisely
    const answeredCount = Object.keys(answers).length || 1;
    const timePerQuestion = Math.round(timeSpent / answeredCount);

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

  const scoreData = {
    totalScore,
    totalQuestions: questionIds.length,
    subjectScores,
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

  return { success: true };
}
