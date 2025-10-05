import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CalendarSkeleton = ({ className, loadingMessage }: { className?: string, loadingMessage?: string }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => i);

  return (
    <div
      className={cn(
        "mx-auto w-[500px] max-w-[100%] mt-10 border border-border rounded-lg overflow-hidden relative",
        "animate-in fade-in-0 slide-in-from-top-4 duration-500", // Enhanced entrance animation
        className
      )}
      style={{
        // Custom CSS variables for the shimmer animation
        '--shimmer-duration': '3s',
      } as React.CSSProperties}
    >
      {/* Center text overlay for entire skeleton */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <p className="text-lg font-semibold text-foreground text-center">{loadingMessage}</p>
      </div>
      {/* Calendar Header - matching react-calendar__navigation */}
      <div className="w-full bg-card text-card-foreground border-b border-border text-center flex items-center justify-between p-2 animate-in slide-in-from-top-2 duration-300 delay-75">
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Previous year button */}
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Previous month button */}
        </div>
        <Skeleton className="h-6 w-32" /> {/* Month/Year title */}
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Next month button */}
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Next year button */}
        </div>
      </div>

      {/* Week days header - matching react-calendar__month-view__weekdays */}
      <div className="bg-accent border-b border-border animate-in slide-in-from-top-2 duration-300 delay-150">
        <div className="grid grid-cols-7">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-medium py-2 p-2">
              <Skeleton className="h-4 w-6 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid - matching react-calendar__month-view__days */}
      <div className="bg-accent animate-in slide-in-from-bottom-2 duration-500 delay-300 relative overflow-hidden">
        {/* Grid-wide wave animation */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/12 to-transparent pointer-events-none z-10"
          style={{
            animation: `gridWave 4s ease-in-out infinite`,
            animationDelay: '500ms',
            width: '120%',
            left: '-10%',
            opacity: 0.2,
          }}
        />
        
        <div className="relative bg-card/20 rounded-md mx-2 mb-2" style={{ minHeight: '200px' }}>
          {/* Simple area placeholder */}
        </div>
      </div>
    </div>
  );
};

export default CalendarSkeleton;
