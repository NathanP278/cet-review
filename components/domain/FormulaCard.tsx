"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";

interface FormulaCardProps {
  name: string;
  formula: string;
  explanation?: string;
  variables?: Record<string, string>;
  topicId?: string;
}

export function FormulaCard({ name, formula, explanation, variables, topicId }: FormulaCardProps) {
  return (
    <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] relative group transition-all hover:border-[var(--ring)]/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="font-mono text-xs">FORMULA</Badge>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <BookmarkButton entityType="formula" itemRef={name} entityId={topicId} size="sm" />
          </div>
        </div>
        
        <h4 className="text-lg font-semibold mb-3">{name}</h4>
        
        <div className="bg-[var(--muted)]/30 rounded-lg p-4 mb-4 text-center overflow-x-auto">
          <code className="text-xl font-mono text-[var(--foreground)] whitespace-nowrap">
            {formula}
          </code>
        </div>
        
        {explanation && (
          <p className="text-sm text-[var(--muted)] mb-4">{explanation}</p>
        )}
        
        {variables && Object.keys(variables).length > 0 && (
          <div className="space-y-1 mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Variables</p>
            {Object.entries(variables).map(([key, val]) => (
              <div key={key} className="flex items-center text-sm">
                <code className="font-mono bg-[var(--muted)]/50 px-1.5 py-0.5 rounded text-xs mr-2">{key}</code>
                <span className="text-[var(--muted)]">= {val}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
