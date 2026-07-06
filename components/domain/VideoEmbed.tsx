/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookmarkButton } from "./BookmarkButton";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoEmbedProps {
  title: string;
  url: string;
  duration?: string;
  topicId?: string;
}

export function VideoEmbed({ title, url, duration, topicId }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple extraction for YouTube video ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  return (
    <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] group transition-all hover:border-[var(--ring)]/50">
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {isPlaying && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        ) : (
          <div 
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            {videoId && (
              <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg backdrop-blur-sm">
                <Play className="h-8 w-8 ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex items-start justify-between">
        <div>
          <h4 className="font-semibold line-clamp-2">{title}</h4>
          {duration && <p className="text-sm text-[var(--muted)] mt-1">{duration}</p>}
        </div>
        <BookmarkButton entityType="video" itemRef={url} entityId={topicId} className="-mr-2 -mt-2" />
      </CardContent>
    </Card>
  );
}
