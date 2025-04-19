import { SubjectSkeleton } from "@/components/ui/skeleton-loader";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded mb-6"></div>

      <div className="flex flex-col gap-5 px-6 max-w-3xl mx-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={`skeleton-${index}`}
            className="overflow-hidden border-0 shadow-lg bg-card/50 rounded-2xl"
          >
            <CardContent className="p-5 relative flex flex-col">
              <SubjectSkeleton />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
