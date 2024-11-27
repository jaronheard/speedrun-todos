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

export function mapLinearIssue(issue: Issue): LinearTaskData {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description ?? undefined,
    dueDate: issue.dueDate ?? undefined,
    source: "linear",
    originalData: issue,
    identifier: issue.identifier,
    state: issue.state ? { name: issue.state.name } : undefined,
  };
}