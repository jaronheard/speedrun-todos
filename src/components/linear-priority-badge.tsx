import { Badge } from "./ui/badge";
import { cn } from "~/lib/utils";

interface LinearPriorityBadgeProps {
  priority?: number;
  className?: string;
}

export function LinearPriorityBadge({
  priority,
  className,
}: LinearPriorityBadgeProps) {
  if (!priority) return null;

  const priorityColors = {
    0: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    1: "bg-[#f3f3f3] text-[#6b6f76] dark:bg-[#404040] dark:text-[#a3a3a3]",
    2: "bg-[#ffe5e5] text-[#ff4d4d] dark:bg-[#661a1a] dark:text-[#ff9999]",
    3: "bg-[#fff0e6] text-[#ff751a] dark:bg-[#662e00] dark:text-[#ffb380]",
    4: "bg-[#fff2f2] text-[#ff0000] dark:bg-[#660000] dark:text-[#ff6666]",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        priorityColors[priority as keyof typeof priorityColors],
        className,
      )}
    >
      P{priority}
    </Badge>
  );
}
