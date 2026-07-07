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

  // Fetch all required data in parallel
  const [
    { data: mockExams },
    { data: sm2Stats },
    { data: quizzes },
    { data: profile },
    { data: subjectMasteries },
    { count: reviewHistory }
  ] = await Promise.all([
    supabase.from("mock_exam_attempts").select("score_data, created_at").eq("user_id", userId).eq("status", "completed").order("created_at", { ascending: false }).limit(5),
    supabase.from("user_cards").select("retention_score, state").eq("user_id", userId),
    supabase.from("quiz_attempts").select("score, total").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.from("profiles").select("streak").eq("id", userId).single(),
    supabase.from("subject_mastery_analytics_view").select("subject_id, mastery_percentage").eq("user_id", userId),
    supabase.from("review_history").select("*", { count: "exact", head: true }).eq("user_id", userId)
  ]);

  // 1. Mock Exam Performance (Weight: 30%)
  let mockExamScore = 0;
  let validExams = 0;
  if (mockExams && mockExams.length > 0) {
    mockExams.forEach(exam => {
      const data = exam.score_data as any;
      if (data && data.totalScore !== undefined && data.totalQuestions > 0) {
        mockExamScore += (data.totalScore / data.totalQuestions) * 100;
        validExams++;
      }
    });
    if (validExams > 0) mockExamScore /= validExams;
  }

  // 2. SM-2 Retention (Weight: 20%)
  let retentionScore = 0;
  if (sm2Stats && sm2Stats.length > 0) {
    const reviewCards = sm2Stats.filter(c => c.state === 'review');
    if (reviewCards.length > 0) {
      retentionScore = reviewCards.reduce((acc, c) => acc + (c.retention_score * 100), 0) / reviewCards.length;
    }
  }

  // 3. Quiz Accuracy (Weight: 15%)
  let quizScore = 0;
  let validQuizzes = 0;
  if (quizzes && quizzes.length > 0) {
    quizzes.forEach(q => {
      if (q.total > 0) {
        quizScore += Math.min((q.score / q.total) * 100, 100);
        validQuizzes++;
      }
    });
    if (validQuizzes > 0) quizScore /= validQuizzes;
  }

  // 4. Study Consistency (Weight: 10%)
  const streak = profile?.streak || 0;
  const consistencyScore = Math.min((streak / 30) * 100, 100); // 30 day streak = 100%

  // 5. Subject Mastery / Topic Coverage (Weight: 15%)
  let subjectMasteryScore = 0;
  if (subjectMasteries && subjectMasteries.length > 0) {
    const totalMastery = subjectMasteries.reduce((acc, sub) => acc + Math.min(sub.mastery_percentage || 0, 100), 0);
    subjectMasteryScore = totalMastery / subjectMasteries.length;
  }

  // 6. Review Completion Experience (Weight: 10%)
  // A measure of how many reviews they've actually done. Diminishing returns after 1000 reviews.
  const reviewsDone = reviewHistory || 0;
  const experienceScore = Math.min((reviewsDone / 1000) * 100, 100);

  // Calculate Overall Score based on available data
  let overallScore = 0;
  let confidenceScore = 0;

  // Dynamic weighting depending on user stage
  if (validExams > 0) {
    // Mature user with exams
    overallScore = (mockExamScore * 0.30) + 
                   (retentionScore * 0.20) + 
                   (quizScore * 0.15) + 
                   (subjectMasteryScore * 0.15) + 
                   (consistencyScore * 0.10) + 
                   (experienceScore * 0.10);
                   
    confidenceScore = Math.min((validExams * 15) + (sm2Stats?.length || 0) * 0.1, 100);
  } else if (sm2Stats && sm2Stats.length > 0) {
    // Active user, no full exams yet
    overallScore = (retentionScore * 0.35) + 
                   (subjectMasteryScore * 0.25) + 
                   (quizScore * 0.20) + 
                   (consistencyScore * 0.10) + 
                   (experienceScore * 0.10);
                   
    confidenceScore = Math.min((sm2Stats.length * 0.2), 60); 
  } else {
    // Brand new user
    overallScore = 0;
    confidenceScore = 0;
  }

  // Ensure strict bounds
  overallScore = Math.max(0, Math.min(overallScore, 100));

  // Subject Readiness Map
  const subjectReadiness: Record<string, number> = {};
  if (subjectMasteries) {
    subjectMasteries.forEach(sm => {
      if (sm.subject_id) {
        subjectReadiness[sm.subject_id] = Math.max(0, Math.min(sm.mastery_percentage || 0, 100));
      }
    });
  }

  // Estimated Exam Day Score assumes slight pressure penalty but benefits from recent upward trends
  const pressureModifier = confidenceScore > 75 ? 1.00 : 0.95;
  const estimatedExamDayScore = Math.max(0, Math.min(overallScore * pressureModifier, 100));

  let trend: "improving" | "declining" | "stagnant" = "stagnant";
  if (overallScore > 70) trend = "improving";
  else if (overallScore < 40 && experienceScore > 10) trend = "declining";

  return {
    overallScore: Math.round(overallScore),
    confidenceScore: Math.round(confidenceScore),
    estimatedExamDayScore: Math.round(estimatedExamDayScore),
    subjectReadiness,
    trend
  };
}
