import { type Task } from "@doist/todoist-api-typescript";
import { type Issue } from "@linear/sdk";

export interface LinearLabel {
  name: string;
  color?: string;
}

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  source: "todoist" | "linear";
  labels?: string[] | LinearLabel[];
}

export interface TodoistTaskData extends BaseTask {
  source: "todoist";
  originalData: Task;
  priority: number;
  labels?: string[];
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
  labels?: LinearLabel[];
  url?: string;
}

export type TaskData = TodoistTaskData | LinearTaskData;

export type CompletedTaskData = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  source: "todoist" | "linear";
  labels?: string[] | LinearLabel[];
  duration: number;
  identifier?: string;
  state?: {
    name: string;
  };
  priority?: number;
  estimate?: number;
  url?: string;
  originalData: Task | Issue;
};

export function mapTodoistTask(task: Task): TodoistTaskData {
  return {
    id: task.id,
    title: task.content,
    description: task.description ?? undefined,
    dueDate: task.due?.date ?? undefined,
    source: "todoist" as const,
    originalData: task,
    priority: task.priority ?? 1,
    labels: task.labels,
  };
}

export function mapLinearIssue(issue: Issue): LinearTaskData {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description ?? undefined,
    dueDate: undefined,
    source: "linear",
    originalData: issue,
    identifier: issue.identifier,
    state:
      issue.state && typeof issue.state === "object" && "name" in issue.state
        ? { name: String(issue.state.name) }
        : undefined,
    priority: issue.priority ?? undefined,
    estimate: issue.estimate ?? undefined,
    url: issue.url,
  };
}
