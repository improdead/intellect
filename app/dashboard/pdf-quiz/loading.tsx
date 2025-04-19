import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <Skeleton className="h-10 w-64 bg-muted animate-pulse rounded mb-2" />
        <Skeleton className="h-5 w-96 bg-muted animate-pulse rounded" />
      </div>
      
      <div className="w-full flex flex-col items-center justify-center py-8">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
                <Skeleton className="h-4 w-64 bg-muted animate-pulse rounded" />
              </div>
              
              <Skeleton className="h-40 w-full bg-muted animate-pulse rounded-lg" />
              
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton 
                    key={index} 
                    className="h-12 w-full bg-muted animate-pulse rounded-lg" 
                  />
                ))}
              </div>
              
              <Skeleton className="h-10 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
