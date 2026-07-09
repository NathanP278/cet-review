"use server";

import { createClient } from "@/lib/supabase/server";
import { processBatchSM2Updates } from "./sm2";
import { revalidatePath } from "next/cache";
import { awardXP, ensureDailyMissions } from "@/app/actions/progression";

export interface QuizFilters {
  subjectId?: string;
  categoryId?: string;
  topicId?: string;
  difficulty?: "easy" | "medium" | "hard" | "challenge";
  tags?: string[];
  limit?: number;
}

export interface ShuffledQuestion {
  id: string;
  content: string;
  choices: string[];
  type: string;
  difficulty: string;
  estimated_time_seconds: number;
}

/**
 * Fisher-Yates Shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Fetches questions based on filters, and securely shuffles their choices.
 * Crucially, it DOES NOT return the correct answer or explanation to the client
 * to prevent cheating by inspecting network requests.
 */
export async function fetchQuizQuestions(filters: QuizFilters): Promise<ShuffledQuestion[]> {
  const supabase = await createClient();

  let query = supabase.from("questions").select("*");

  if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.topicId) query = query.eq("topic_id", filters.topicId);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.tags && filters.tags.length > 0) query = query.contains("tags", filters.tags);

  // Use PostgreSQL random sorting
  // Note: For very large datasets, ORDER BY random() is slow, 
  // but for 50k it's acceptable for an MVP. Can optimize later with TABLESAMPLE.
  query = query.limit(filters.limit || 10).order("id", { ascending: true }); 
  // Actually, standard supabase order random requires a custom RPC or using the js shuffle.
  // For MVP, we fetch up to limit * 5, then shuffle in JS, then slice to limit.

  const { data, error } = await query;
  if (error || !data) throw new Error("Failed to fetch questions");

  // Shuffle the questions themselves
  const shuffledQuestions = shuffleArray(data).slice(0, filters.limit || 10);

  // Return only safe data to the client (NO ANSWERS)
  return shuffledQuestions.map((q) => {
    // Determine choices. MCQ choices array, plus the correct answer.
    let allChoices: string[] = [];
    if (q.type === "mcq") {
      const incorrectChoices = Array.isArray(q.choices) ? (q.choices as string[]) : [];
      allChoices = [...incorrectChoices, q.answer];
      allChoices = shuffleArray(allChoices);
    }

    return {
      id: q.id,
      content: q.content,
      choices: allChoices,
      type: q.type,
      difficulty: q.difficulty || "medium",
      estimated_time_seconds: q.estimated_time_seconds || 60,
    };
  });
}

export interface QuizSubmission {
  questionId: string;
  userAnswer: string;
  timeSpentSeconds: number;
}

export interface QuizResult {
  score: number;
  total: number;
  results: {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: string;
    userAnswer: string;
    explanation: string | null;
    hint: string | null;
  }[];
}

/**
 * Submits the user's answers, evaluates them securely against the DB,
 * and updates the SM-2 spaced repetition state.
 */
export async function submitQuizAttempt(submissions: QuizSubmission[], totalTimeSeconds: number = 0, filters: any = {}): Promise<QuizResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const questionIds = submissions.map(s => s.questionId);

  // Fetch the actual answers and explanations
  const { data: questions } = await supabase
    .from("questions")
    .select("id, answer, explanation, hint, topic_id")
    .in("id", questionIds);

  if (!questions) throw new Error("Failed to fetch validation data");

  let score = 0;
  const results = submissions.map((sub) => {
    const q = questions.find((q) => q.id === sub.questionId);
    if (!q) throw new Error(`Question ${sub.questionId} not found`);

    const isCorrect = q.answer === sub.userAnswer;
    if (isCorrect) score += 1;

    return {
      questionId: q.id,
      isCorrect,
      correctAnswer: q.answer,
      userAnswer: sub.userAnswer,
      explanation: q.explanation,
      hint: q.hint,
      topicId: q.topic_id,
      timeSpent: sub.timeSpentSeconds
    };
  });

  // 1. Record // Create quiz attempt record
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      score,
      total: submissions.length,
      // time_spent_seconds: Math.round(totalTimeSeconds), // Column doesn't exist
      // filters: filters as any, // Column doesn't exist
    })
    .select()
    .single();

  if (attemptError) {
    console.error("Failed to save attempt", attemptError);
    throw new Error("Failed to save quiz attempt.");
  }

  // Progression Engine Integration
  let multiplier = score / (submissions.length || 1); // 0 to 1.0 based on accuracy
  if (multiplier === 1.0) multiplier = 1.5; // Perfect score bonus
  if (multiplier < 0.2) multiplier = 0.2; // Minimum participation XP

  await ensureDailyMissions(user.id);
  await awardXP("quiz_completed", multiplier, { attemptId: attempt.id, score });

  revalidatePath("/dashboard");
  revalidatePath("/practice");

  // 2. Process SM-2 Spaced Repetition (Batched)
  const sm2Updates = results.map(res => ({
    questionId: res.questionId,
    quality: res.isCorrect ? 4 : 1, // 5 = perfect response, 0 = complete blackout. For MVP: correct = 4, incorrect = 1.
    responseTimeSeconds: res.timeSpent
  }));

  await processBatchSM2Updates(sm2Updates);

  // Clear cache for key pages to reflect new mastery and heatmaps immediately
  revalidatePath("/dashboard");
  revalidatePath("/practice");
  revalidatePath("/subjects", "layout");
  revalidatePath("/topics", "layout");

  return {
    score,
    total: submissions.length,
    results
  };
}

export async function verifyAnswer(questionId: string, userAnswer: string) {
  const supabase = await createClient();
  const { data: q } = await supabase
    .from("questions")
    .select("answer, explanation")
    .eq("id", questionId)
    .single();

  if (!q) throw new Error("Question not found");

  const isCorrect = q.answer === userAnswer;

  return {
    isCorrect,
    correctAnswer: q.answer,
    explanation: q.explanation || "No detailed explanation available.",
  };
}
