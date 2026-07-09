"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { generateJSON } from "@/lib/ai-provider";
import { revalidatePath } from "next/cache";

interface GeneratedQuestion {
  content: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  learning_objective: string;
  quality_score: number;
}

export async function generateStudioQuestions(
  subjectId: string, 
  topicId: string, 
  topicName: string, 
  count: number = 3, 
  difficulty: string = "medium"
) {
  const { supabase, user } = await requireAdmin(50); // Min Content Manager
  
  const startTime = Date.now();
  const prompt = `Generate ${count} high-quality, cognitively demanding multiple-choice questions for the topic "${topicName}".
Difficulty target: ${difficulty}.
Return EXACTLY a JSON array of objects with the following keys:
- content (string: the question text)
- choices (array of exactly 4 strings: the distractors + correct answer shuffled)
- correct_answer (string: must exactly match one of the choices)
- explanation (string: highly detailed explanation of why the answer is correct and why distractors are wrong)
- difficulty (string: "easy", "medium", or "hard")
- learning_objective (string: what this tests)
- quality_score (number between 80-100 estimating how good the question is)`;

  try {
    const rawQuestions = await generateJSON<GeneratedQuestion[]>(prompt, "You are an expert CET (College Entrance Test) examiner and academic content creator.");
    
    // Log the generation
    const { data: generationLog, error: genError } = await supabase.from("ai_generations").insert({
      generator_id: user.id,
      prompt,
      provider: "gemini",
      model: "gemini-2.5-flash",
      output: JSON.parse(JSON.stringify(rawQuestions)),
      processing_time_ms: Date.now() - startTime
    }).select("id").single();

    if (genError) throw genError;

    // Insert as DRAFT questions
    const inserts = rawQuestions.map(q => ({
      subject_id: subjectId,
      topic_id: topicId,
      content: q.content,
      choices: q.choices,
      answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      type: "mcq" as const,
      // status: "draft", // Column doesn't exist
      // version: 1, // Column doesn't exist
      // author_id: user.id, // Column doesn't exist
      // generation_id: generationLog.id, // Column doesn't exist
      // quality_score: q.quality_score // Column doesn't exist
    }));

    const { error: insertError } = await supabase.from("questions").insert(inserts);
    if (insertError) throw insertError;

    revalidatePath("/admin/studio/review");
    return { success: true, count: inserts.length };
  } catch (error: any) {
    console.error("Studio Generation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function evaluateQuestionQuality(questionContent: string, explanation: string) {
  const prompt = `Evaluate the following question and explanation for academic quality.
Question: "${questionContent}"
Explanation: "${explanation}"

Return EXACTLY a JSON object with:
- score: number between 0-100
- flags: array of strings (e.g. ["grammatical error", "biased", "hallucination risk"] or empty if perfect)
- suggested_fix: string (optional)
`;
  
  try {
    return await generateJSON<{score: number, flags: string[], suggested_fix?: string}>(prompt, "You are a strict QA examiner.");
  } catch (error) {
    console.error("QA Evaluation failed:", error);
    return { score: 50, flags: ["QA System Failure"] };
  }
}

export async function processYoutubeResource(url: string) {
  const { supabase, user } = await requireAdmin(50);
  
  try {
    // Call the Python Microservice (assuming it runs on port 8000 locally or internal docker network)
    const pythonApiUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
    
    const response = await fetch(`${pythonApiUrl}/process/youtube`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Microservice error: ${errorText}`);
    }
    
    const data = await response.json(); // { source, chunks: [{index, text, char_count}], total_chunks }
    
    // Save to database
    const { data: resource, error } = await supabase.from("media_resources").insert({
      type: "youtube",
      url: url,
      status: "processed",
      metadata: { total_chunks: data.total_chunks },
      uploaded_by: user.id
    }).select("id").single();
    
    if (error) throw error;
    
    // Here we would typically queue a background job to run the semantic chunks through Gemini 
    // to generate flashcards and questions asynchronously.
    
    return { success: true, resource_id: resource.id, chunks: data.total_chunks };
  } catch (error: any) {
    console.error("Failed to process YouTube resource:", error);
    return { success: false, error: error.message };
  }
}


