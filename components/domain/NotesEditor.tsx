"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { saveUserNote } from "@/app/actions/learning";

interface NotesEditorProps {
  topicId: string;
  subtopicId?: string;
  initialContent?: string;
}

export function NotesEditor({ topicId, subtopicId, initialContent = "" }: NotesEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSave = useCallback(() => {
    if (content === initialContent) return;
    setSaveStatus("saving");
    
    startTransition(async () => {
      try {
        await saveUserNote(topicId, content, subtopicId);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save note:", error);
        setSaveStatus("idle");
      }
    });
  }, [content, initialContent, topicId, subtopicId]);

  // Auto-save debouncer
  useEffect(() => {
    if (content === initialContent || saveStatus === "saving") return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2s of inactivity

    return () => clearTimeout(timer);
  }, [content, initialContent, saveStatus, handleSave]);

  return (
    <div className="flex flex-col h-full border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)]">
      <div className="bg-[var(--muted)]/50 px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--muted-foreground)]">My Private Notes</span>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && <span className="text-xs text-[var(--muted)] flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</span>}
          {saveStatus === "saved" && <span className="text-xs text-green-500 flex items-center"><Check className="h-3 w-3 mr-1" /> Saved</span>}
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs" 
            onClick={handleSave}
            disabled={isPending || content === initialContent}
          >
            <Save className="h-3 w-3 mr-1" />
            Save Now
          </Button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your notes here... (Markdown supported)"
        className="flex-1 w-full resize-none p-4 bg-transparent outline-none focus:ring-0 text-[var(--foreground)] min-h-[300px] md:min-h-[500px]"
      />
    </div>
  );
}
