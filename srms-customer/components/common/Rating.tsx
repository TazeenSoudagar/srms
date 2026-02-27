"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export default function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: RatingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const filled = index < Math.floor(value);
          const partial = index < value && index >= Math.floor(value);
          const fillPercentage = partial ? (value % 1) * 100 : 0;

          return (
            <div key={index} className="relative">
              {partial ? (
                <>
                  <Star
                    className={cn(sizes[size], "text-neutral-300")}
                    fill="currentColor"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star
                      className={cn(sizes[size], "text-amber-400")}
                      fill="currentColor"
                    />
                  </div>
                </>
              ) : (
                <Star
                  className={cn(
                    sizes[size],
                    filled ? "text-amber-400" : "text-neutral-300"
                  )}
                  fill="currentColor"
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-medium text-neutral-700", textSizes[size])}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
