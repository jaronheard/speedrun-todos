import {
  type TaskData,
  type LinearTaskData,
  type TodoistTaskData,
  type LinearLabel,
} from "~/types/task";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";

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
    0: "bg-gray-100 text-gray-600",
    1: "bg-red-50 text-red-600",
    2: "bg-red-100 text-red-700",
    3: "bg-red-400 text-red-800",
    4: "bg-red-700 text-white",
  };

  const priorityIcons = {
    0: "",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent",
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
      {priorityIcons[priority as keyof typeof priorityIcons]}
    </Badge>
  );
}

function LinearTaskCard({ task }: { task: LinearTaskData }) {
  const openInLinear = () => {
    const baseUrl = task.url;
    if (baseUrl) {
      window.open(baseUrl, "_blank");
    }
  };

  return (
    <Card className="min-h-[100px]">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-tight">{task.title}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 shrink-0 gap-1.5 text-xs"
            onClick={openInLinear}
            title="Open in Linear"
          >
            <span className="font-medium">{task.identifier}</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {task.state && (
            <Badge variant="secondary" className="text-xs">
              {task.state.name}
            </Badge>
          )}
          {task.priority && task.priority >= 0 && (
            <LinearPriorityBadge priority={task.priority} className="text-xs" />
          )}
          {task.estimate && (
            <Badge variant="outline" className="text-xs">
              {task.estimate} pts
            </Badge>
          )}
          {task.labels?.map((label: LinearLabel) => (
            <Badge
              key={label.name}
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: label.color ? `#${label.color}15` : undefined,
                borderColor: label.color ? `#${label.color}30` : undefined,
                color: label.color ? `#${label.color}` : undefined,
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>

        {task.description && (
          <div className="line-clamp-2 text-sm text-muted-foreground">
            <ReactMarkdown>{task.description}</ReactMarkdown>
          </div>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {formatDistanceToNow(new Date(task.dueDate))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TodoistTaskCard({ task }: { task: TodoistTaskData }) {
  return (
    <Card className="min-h-[100px]">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 truncate font-medium leading-tight">
            {task.title}
          </p>
          {task.priority > 1 && (
            <Badge
              className="shrink-0 text-xs"
              variant={task.priority === 4 ? "destructive" : "secondary"}
            >
              P{task.priority}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {formatDistanceToNow(new Date(task.dueDate))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TodoCard({ task }: { task: TaskData }) {
  if (task.source === "linear") {
    return <LinearTaskCard task={task} />;
  }
  return <TodoistTaskCard task={task} />;
}
