"use client";

import { useState } from "react";
import { Youtube, FileText, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { processYoutubeResource } from "@/app/actions/studio";

export default function StudioMediaPage() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; chunks?: number; error?: string } | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    const res = await processYoutubeResource(url);
    setResult(res);
    setIsProcessing(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          Media Ingestion Engine
        </h1>
        <p className="text-slate-500 text-sm mt-1">Transform YouTube videos and PDF documents into structured study resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YouTube Ingestion */}
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-500">
              <Youtube className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">YouTube Extractor</h3>
              <p className="text-xs text-slate-500">Auto-generate flashcards from transcripts.</p>
            </div>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Video URL</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-white"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isProcessing || !url.trim()} 
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isProcessing ? "Extracting Transcript..." : <><Sparkles className="h-4 w-4" /> Process Video</>}
            </Button>
          </form>

          {result && (
            <div className={`mt-4 p-3 rounded text-sm ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {result.success ? `Success! Transcript extracted and split into ${result.chunks} semantic chunks.` : `Error: ${result.error}`}
            </div>
          )}
        </div>

        {/* Document Ingestion */}
        <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Document Parser (Beta)</h3>
              <p className="text-xs text-slate-500">Extract questions from PDFs and DOCX.</p>
            </div>
          </div>

          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400">
            <Upload className="h-6 w-6 mb-2" />
            <p className="text-sm font-medium">Drag & drop files here</p>
            <p className="text-xs mt-1">PDFs up to 10MB</p>
          </div>
          <Button disabled className="w-full mt-4 bg-slate-200 dark:bg-slate-800 text-slate-400">
            Feature Unlocked in V2
          </Button>
        </div>
      </div>
    </div>
  );
}
