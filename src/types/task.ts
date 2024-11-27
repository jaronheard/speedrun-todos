import { type Task } from "@doist/todoist-api-typescript";
import { type Issue } from "@linear/sdk";

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  source: "todoist" | "linear";
  originalData: Task | Issue;
}

export interface TodoistTaskData extends BaseTask {
  source: "todoist";
  originalData: Task;
  priority: number;
}

export interface LinearTaskData extends BaseTask {
  source: "linear";
  originalData: Issue;
  identifier: string;
  state?: {
    name: string;
  };
  priority?: number;
  estimate?: number;
  labels?: Array<{
    name: string;
    color?: string;
  }>;
  url?: string;
}

export type TaskData = TodoistTaskData | LinearTaskData;

export function mapTodoistTask(task: Task): TodoistTaskData {
  return {
    id: task.id,
    title: task.content,
    description: task.description ?? undefined,
    dueDate: task.due?.date ?? undefined,
    source: "todoist" as const,
    originalData: task,
    priority: task.priority ?? 1,
  };
}

interface LinearLabel {
  name: string;
  color?: string;
}

export function mapLinearIssue(issue: Issue): LinearTaskData {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description ?? undefined,
    dueDate: issue.dueDate ?? undefined,
    source: "linear",
    originalData: issue,
    identifier: issue.identifier,
    state: issue.state ? { name: String(issue.state.name) } : undefined,
    priority: issue.priority,
    estimate: issue.estimate,
    labels: issue.labels?.nodes?.map(
      (label: any): LinearLabel => ({
        name: String(label.name),
        color: label.color,
      }),
    ),
    url: issue.url,
  };
}
