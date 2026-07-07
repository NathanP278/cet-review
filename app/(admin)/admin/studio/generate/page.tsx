"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStudioQuestions } from "@/app/actions/studio";
import { getCompleteCurriculum, CompleteCurriculum } from "@/app/actions/content";

export default function StudioGeneratePage() {
  const [curriculum, setCurriculum] = useState<CompleteCurriculum[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

  useEffect(() => {
    getCompleteCurriculum().then(data => {
      setCurriculum(data);
      if (data.length > 0) {
        setSubjectId(data[0].id);
        const firstTopic = data[0].categories[0]?.topics[0];
        if (firstTopic) setTopicId(firstTopic.id);
      }
    });
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !topicId) return;

    // Find the topic name
    let topicName = "Unknown Topic";
    for (const sub of curriculum) {
      if (sub.id === subjectId) {
        for (const cat of sub.categories) {
          for (const top of cat.topics) {
            if (top.id === topicId) topicName = top.name;
          }
        }
      }
    }

    setIsGenerating(true);
    setResult(null);

    const res = await generateStudioQuestions(subjectId, topicId, topicName, count, difficulty);
    setResult(res);
    setIsGenerating(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Bulk Generation
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure parameters to generate high-quality cognitive questions.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Subject & Topic</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    const sub = curriculum.find(s => s.id === e.target.value);
                    if (sub && sub.categories.length > 0 && sub.categories[0].topics.length > 0) {
                      setTopicId(sub.categories[0].topics[0].id);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-white"
                  required
                >
                  {curriculum.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>

                <select 
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-white"
                  required
                >
                  {curriculum.find(s => s.id === subjectId)?.categories.map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.topics.map(top => (
                        <option key={top.id} value={top.id}>{top.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty Target</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="easy">Easy (Recall & Basic App)</option>
                  <option value="medium">Medium (Analysis)</option>
                  <option value="hard">Hard (Synthesis & Evaluation)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Batch Size</label>
                <input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button 
              type="submit" 
              disabled={isGenerating || !subjectId || !topicId} 
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Orchestrating...</>
              ) : (
                <><Brain className="mr-2 h-4 w-4" /> Generate Drafts</>
              )}
            </Button>
          </div>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            <Target className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">{result.success ? 'Generation Successful' : 'Generation Failed'}</h3>
              <p className="text-sm mt-1">
                {result.success 
                  ? `Successfully orchestrated ${result.count} new questions. They have been sent to the Review Queue.` 
                  : result.error}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
