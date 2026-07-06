"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/app/actions/learning";

interface BookmarkButtonProps {
  entityType: "topic" | "subtopic" | "resource" | "video" | "formula";
  entityId?: string;
  itemRef?: string;
  initialBookmarked?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "danger" | "success" | "warning";
  className?: string;
}

export function BookmarkButton({
  entityType,
  entityId,
  itemRef,
  initialBookmarked = false,
  size = "icon",
  variant = "ghost",
  className,
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleToggle = () => {
    // Optimistic update
    setIsBookmarked(!isBookmarked);
    
    startTransition(async () => {
      try {
        await toggleBookmark(entityType, entityId || null, itemRef);
      } catch (error) {
        // Revert on error
        setIsBookmarked(isBookmarked);
        console.error("Failed to toggle bookmark", error);
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleToggle}
      disabled={isPending}
      title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
    >
      <Bookmark
        className={`h-4 w-4 transition-all ${
          isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
      <span className="sr-only">{isBookmarked ? "Remove Bookmark" : "Add Bookmark"}</span>
    </Button>
  );
}
