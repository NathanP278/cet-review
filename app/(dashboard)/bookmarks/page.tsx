import { getBookmarks } from "@/app/actions/learning";
import { Bookmark as BookmarkIcon, BookOpen, Video, BarChart, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
          <BookmarkIcon className="h-8 w-8 text-primary fill-primary/20" />
          My Bookmarks
        </h1>
        <p className="text-[var(--muted)]">Quickly access your saved topics, videos, and formulas.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <BookmarkIcon className="h-12 w-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--muted)] text-lg">You haven&apos;t bookmarked anything yet.</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Click the bookmark icon on any topic, video, or formula to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => {
            let icon = <FileText className="h-5 w-5 text-primary" />;
            let title = "Saved Item";
            let link = "#";
            
            if (b.entity_type === "topic") {
              icon = <BookOpen className="h-5 w-5 text-primary" />;
              title = "Topic";
              link = `/learn/${b.entity_id}`;
            } else if (b.entity_type === "video") {
              icon = <Video className="h-5 w-5 text-primary" />;
              title = "Video Lesson";
              link = `/learn/${b.entity_id}?tab=resources`;
            } else if (b.entity_type === "formula") {
              icon = <BarChart className="h-5 w-5 text-primary" />;
              title = `Formula: ${b.item_ref}`;
              link = `/learn/${b.entity_id}?tab=formulas`;
            }

            return (
              <Link key={b.id} href={link} className="group block">
                <Card className="bg-[var(--card)] border-[var(--border)] transition-colors group-hover:border-[var(--ring)]/50 h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{b.entity_type}</Badge>
                      </div>
                      <h3 className="font-medium text-[var(--foreground)] group-hover:text-primary transition-colors">
                        {b.entity_type === 'topic' ? "View Bookmarked Topic" : title}
                      </h3>
                      {b.item_ref && b.entity_type !== 'formula' && (
                        <p className="text-xs text-[var(--muted)] mt-1 truncate max-w-[200px]">{b.item_ref}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
