"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SubjectReadinessCard } from "./SubjectReadinessCard";
import type { CETReadiness } from "@/types/dashboard";

interface SubjectReadinessCenterProps {
  readiness: CETReadiness;
}

type SortOption = 'highest' | 'lowest' | 'potential' | 'overdue' | 'alphabetical';

export function SubjectReadinessCenter({ readiness }: SubjectReadinessCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lowest');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Generate subject data from readiness
  const subjects = useMemo(() => {
    // For now, generate sample subjects based on overall readiness
    // In production, this would come from actual subject-level data
    const sampleSubjects = ['Mathematics', 'English', 'Science', 'Reading Comprehension'];
    const overallScore = readiness.overallScore;
    
    return sampleSubjects.map((subjectName) => {
      const variance = (Math.random() - 0.5) * 20; // +/- 10%
      const score = Math.max(0, Math.min(100, overallScore + variance));
      
      const trend: 'improving' | 'stable' | 'declining' = 
        score > 70 ? 'improving' : score > 40 ? 'stable' : 'declining';
      
      return {
        name: subjectName,
        readiness: score,
        mastery: Math.min(score + 5, 100),
        retention: Math.min(score + 3, 100),
        quizAccuracy: Math.min(score + 2, 100),
        questionsAnswered: Math.floor(Math.random() * 200) + 50,
        cardsLearned: Math.floor(Math.random() * 100) + 20,
        cardsDue: Math.floor(Math.random() * 30),
        trend,
        confidence: readiness.confidenceLevel,
        improvementPotential: Math.max(0, 90 - score),
      };
    });
  }, [readiness]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter(s => s.name.toLowerCase().includes(query));
  }, [subjects, searchQuery]);

  // Sort subjects
  const sortedSubjects = useMemo(() => {
    return [...filteredSubjects].sort((a, b) => {
      switch (sortBy) {
        case 'highest':
          return b.readiness - a.readiness;
        case 'lowest':
          return a.readiness - b.readiness;
        case 'potential':
          return b.improvementPotential - a.improvementPotential;
        case 'overdue':
          return b.cardsDue - a.cardsDue;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredSubjects, sortBy]);

  if (subjects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[var(--muted)]">
          No subject data available yet. Complete some quizzes to see subject-level readiness.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Subject Readiness
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Readiness breakdown by subject
        </p>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full pl-9 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="lowest">Lowest Readiness</option>
            <option value="highest">Highest Readiness</option>
            <option value="potential">Highest Potential</option>
            <option value="overdue">Most Overdue</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-[var(--muted)]">
        Showing {sortedSubjects.length} of {subjects.length} subjects
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSubjects.map((subject) => (
          <SubjectReadinessCard
            key={subject.name}
            subject={subject}
            isExpanded={expandedSubject === subject.name}
            onToggle={() =>
              setExpandedSubject(
                expandedSubject === subject.name ? null : subject.name
              )
            }
          />
        ))}
      </div>

      {/* No Results */}
      {sortedSubjects.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            No subjects found matching "{searchQuery}"
          </p>
        </Card>
      )}
    </div>
  );
}