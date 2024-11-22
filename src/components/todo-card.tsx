import { type Task } from "@doist/todoist-api-typescript";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function TodoCard({ task }: { task: Task }) {
  return (
    <Card className="h-[100px]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4">
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium">{task.content}</p>
          {task.due && (
            <p className="text-muted-foreground truncate text-sm">
              Due {formatDistanceToNow(new Date(task.due.date))}
            </p>
          )}
          {task.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {task.description}
            </p>
          )}
        </div>
        {task.priority > 1 && (
          <Badge
            className="shrink-0"
            variant={task.priority === 4 ? "destructive" : "secondary"}
          >
            P{task.priority}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
