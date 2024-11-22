import { type Task } from "@doist/todoist-api-typescript";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function TodoCard({ task }: { task: Task }) {
  return (
    <Card className="mb-2">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="font-medium">{task.content}</p>
          {task.due && (
            <p className="text-muted-foreground text-sm">
              Due {formatDistanceToNow(new Date(task.due.date))}
            </p>
          )}
        </div>
        {task.priority > 1 && (
          <Badge variant={task.priority === 4 ? "destructive" : "secondary"}>
            P{task.priority}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
