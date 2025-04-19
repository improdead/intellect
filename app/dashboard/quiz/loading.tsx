import { Card, CardContent } from "@/components/ui/card";
import { QuizSkeleton } from "@/components/ui/skeleton-loader";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded mb-6"></div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card 
            key={`skeleton-${index}`} 
            className="overflow-hidden border-0 shadow-md bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <QuizSkeleton />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
