"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown } from "lucide-react";
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
    if (!readiness.subjectReadiness) return [];

    return Object.entries(readiness.subjectReadiness).map(([subjectName, score]) => ({
      name: subjectName,
      readiness: score,
      mastery: Math.min(score + 5, 100), // Simplified
      retention: Math.min(score + 3, 100), // Simplified
      quizAccuracy: Math.min(score + 2, 100), // Simplified
      questionsAnswered: Math.floor(Math.random() * 200) + 50, // Placeholder
      cardsLearned: Math.floor(Math.random() * 100) + 20, // Placeholder
      cardsDue: Math.floor(Math.random() * 30), // Placeholder
      trend: score > 70 ? 'improving' : score > 40 ? 'stable' : 'declining' as const,
      confidence: readiness.confidenceLevel,
      improvementPotential: Math.max(0, 90 - score),
    }));
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
          <Input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
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