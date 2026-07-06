import { createClient } from "@/lib/supabase/server";

export interface ReadinessMetrics {
  overallScore: number;
  confidenceScore: number;
  estimatedExamDayScore: number;
  subjectReadiness: Record<string, number>;
  trend: "improving" | "declining" | "stagnant";
}

export async function calculateReadiness(userId: string): Promise<ReadinessMetrics> {
  const supabase = await createClient();

  // 1. Fetch Mock Exam Scores (Weight: 40%)
  const { data: mockExams } = await supabase
    .from("mock_exam_attempts")
    .select("score_data, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  let mockExamScore = 0;
  let subjectScores: Record<string, { score: number; total: number }> = {};
  
  if (mockExams && mockExams.length > 0) {
    const totalScore = mockExams.reduce((acc, exam) => {
      const data = exam.score_data as any;
      if (data && data.totalScore !== undefined && data.totalQuestions > 0) {
        
        // Aggregate subject scores
        if (data.subjectScores) {
          data.subjectScores.forEach((ss: any) => {
            if (!subjectScores[ss.name]) subjectScores[ss.name] = { score: 0, total: 0 };
            subjectScores[ss.name].score += ss.score;
            subjectScores[ss.name].total += ss.total;
          });
        }
        
        return acc + (data.totalScore / data.totalQuestions) * 100;
      }
      return acc;
    }, 0);
    mockExamScore = totalScore / mockExams.length;
  }

  // 2. Fetch SM-2 Retention Data (Weight: 30%)
  const { data: sm2Stats } = await supabase
    .from("user_cards")
    .select("retention_score, state")
    .eq("user_id", userId);

  let retentionScore = 0;
  if (sm2Stats && sm2Stats.length > 0) {
    const reviewCards = sm2Stats.filter(c => c.state === 'review');
    if (reviewCards.length > 0) {
      retentionScore = reviewCards.reduce((acc, c) => acc + (c.retention_score * 100), 0) / reviewCards.length;
    }
  }

  // 3. Quiz Accuracy (Weight: 15%)
  const { data: quizzes } = await supabase
    .from("quiz_attempts")
    .select("score, total")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
    
  let quizScore = 0;
  if (quizzes && quizzes.length > 0) {
    const totalQuizScore = quizzes.reduce((acc, q) => acc + (q.score / q.total) * 100, 0);
    quizScore = totalQuizScore / quizzes.length;
  }

  // 4. Study Consistency (Weight: 15%)
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak")
    .eq("id", userId)
    .single();
    
  const streak = profile?.streak || 0;
  // Cap streak score at 30 days = 100%
  const consistencyScore = Math.min((streak / 30) * 100, 100);

  // Compute Overall Score
  // If user has no mock exams, distribute weight
  let overallScore = 0;
  let confidenceScore = 0;
  
  if (mockExams && mockExams.length > 0) {
    overallScore = (mockExamScore * 0.40) + (retentionScore * 0.30) + (quizScore * 0.15) + (consistencyScore * 0.15);
    confidenceScore = Math.min((mockExams.length * 10) + (sm2Stats?.length || 0) * 0.1, 100);
  } else if (sm2Stats && sm2Stats.length > 0) {
    overallScore = (retentionScore * 0.60) + (quizScore * 0.20) + (consistencyScore * 0.20);
    confidenceScore = Math.min((sm2Stats.length * 0.2), 60); // Low confidence without full mock exams
  } else {
    overallScore = 0;
    confidenceScore = 0;
  }

  // Calculate Subject Readiness based on historical exams and current retention (simplified for MVP)
  const subjectReadiness: Record<string, number> = {};
  for (const [subject, data] of Object.entries(subjectScores)) {
    subjectReadiness[subject] = (data.score / data.total) * 100;
  }

  // Estimated Exam Day Score assumes slight pressure penalty but benefits from recent upward trends
  // We'll apply a 0.95 modifier if confidence is low, and 1.05 if confidence is high and streak is active.
  const pressureModifier = confidenceScore > 75 ? 1.02 : 0.95;
  const estimatedExamDayScore = Math.min(overallScore * pressureModifier, 100);

  return {
    overallScore: Math.round(overallScore),
    confidenceScore: Math.round(confidenceScore),
    estimatedExamDayScore: Math.round(estimatedExamDayScore),
    subjectReadiness,
    trend: overallScore > 80 ? "improving" : overallScore < 50 ? "declining" : "stagnant"
  };
}
