import { ExamConfigForm } from "./ExamConfigForm";
import { getCachedSubjects } from "@/lib/cache";

export default async function ExamLandingPage() {
  const subjects = await getCachedSubjects();

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Mock Exam Engine</h1>
        <p className="text-[var(--muted)] mt-2">
          Simulate the real CET experience under time pressure.
        </p>
      </div>

      <ExamConfigForm subjects={subjects} />
    </div>
  );
}
