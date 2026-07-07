"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai-provider";

export async function generateDailyBrief() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Gather context: user profile, recent reviews, overdue, mastery
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, streak")
    .eq("id", user.id)
    .single();

  const { data: cards } = await supabase
    .from("user_cards")
    .select("next_review, state, lapse_count")
    .eq("user_id", user.id);

  let overdue = 0;
  let totalLapses = 0;
  const now = new Date();

  if (cards) {
    cards.forEach(card => {
      const nextReview = new Date(card.next_review);
      if (nextReview < now) overdue++;
      totalLapses += card.lapse_count;
    });
  }

  const { data: exams } = await supabase
    .from("mock_exam_attempts")
    .select("score_data, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(3);

  // Construct context string
  let contextStr = `Student Name: ${profile?.first_name || "Student"}\n`;
  contextStr += `Current Study Streak: ${profile?.streak || 0} days\n`;
  contextStr += `Overdue Flashcards: ${overdue}\n`;
  contextStr += `Total Flashcard Lapses (Forgotten items): ${totalLapses}\n`;
  
  if (exams && exams.length > 0) {
    contextStr += "Recent Exam Scores:\n";
    exams.forEach(ex => {
      const data = ex.score_data as any;
      if (data && data.totalScore !== undefined) {
        contextStr += `- Score: ${Math.round((data.totalScore / (data.totalQuestions || 1)) * 100)}%\n`;
      }
    });
  }

  const systemPrompt = `You are a highly encouraging, elite AI study coach for a student preparing for college entrance exams (CETs). 
Your goal is to write a short "Daily AI Brief" (2-3 sentences max).
Use the provided user context to make it highly personalized. 
Do not use generic greetings like "Hello". Jump straight into the brief.
Example format: "You have a 5-day streak going! Your math scores are looking great, but you have 14 overdue flashcards today. Knock those out to protect your memory retention."
Keep it punchy, motivating, and specific. Do not use markdown formatting.`;

  try {
    const brief = await generateText(`Please generate my daily brief based on this data:\n${contextStr}`, systemPrompt);
    return brief;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "AI features are currently unavailable. Focus on clearing your review backlog today!";
  }
}

export async function explainQuestion(questionText: string, correctAnswer: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const systemPrompt = `You are a patient, expert tutor preparing a student for college entrance exams. 
The student needs help understanding a specific question.
Explain exactly why the correct answer is correct. 
Break down the core concept into simple, easy-to-understand terms.
Keep your response concise (3-4 short paragraphs maximum) and format it beautifully.`;

  const prompt = `Question: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nPlease explain this simply.`;

  try {
    return await generateText(prompt, systemPrompt);
  } catch (error) {
    console.error("AI Explain Error:", error);
    return "The AI tutor is currently resting. Please check your study material for the explanation!";
  }
}

export async function analyzeMockExam(attemptId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("score_data")
    .eq("id", attemptId)
    .single();

  if (!attempt || !attempt.score_data) {
    return "Insufficient data to analyze this exam.";
  }

  const scoreData = attempt.score_data as any;
  const totalScore = scoreData.totalScore || 0;
  const totalQuestions = scoreData.totalQuestions || 1;
  const pct = Math.round((totalScore / totalQuestions) * 100);

  const subjectScores = Object.entries(scoreData.subjectScores || {})
    .map(([sub, data]: any) => `${sub}: ${Math.round((data.score / data.total) * 100)}%`)
    .join(", ");

  const systemPrompt = `You are an elite, analytical AI Exam Coach. 
A student has just completed a college entrance mock exam.
Analyze their performance and provide a 3-paragraph post-exam debrief.
Paragraph 1: Categorize their likely mistake patterns based on their weakest subjects.
Paragraph 2: A highly targeted next-step study plan (tell them exactly what to do tomorrow).
Paragraph 3: An encouraging sign-off about their overall trajectory.
Do not use markdown formatting.`;

  const prompt = `Exam Score: ${pct}%\nSubject Breakdown: ${subjectScores}\n\nGenerate my exam debrief.`;

  try {
    return await generateText(prompt, systemPrompt);
  } catch (error) {
    console.error("AI Exam Analysis Error:", error);
    return "Your exam scores are safely recorded! The AI analyzer is currently offline, but you can review your incorrect answers in the history tab.";
  }
}

export async function generateMnemonic(topicName: string, conceptInfo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const systemPrompt = `You are a creative tutor specializing in memory tricks.
Generate a catchy, memorable mnemonic (acronym, rhyme, or visual association) to help a student remember the provided concept.
Keep it extremely short and punchy.`;

  const prompt = `Topic: ${topicName}\nConcept Details: ${conceptInfo}\n\nGenerate a mnemonic.`;

  try {
    return await generateText(prompt, systemPrompt);
  } catch (error) {
    console.error("AI Mnemonic Error:", error);
    return "Could not generate a mnemonic at this time.";
  }
}
