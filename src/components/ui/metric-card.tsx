import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: IconType | React.ElementType;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card text-card-foreground shadow p-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
            {title}
          </h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-green-500 dark:text-green-400">
            {change}
          </p>
        </div>
        <div className="bg-primary rounded-full p-3">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}