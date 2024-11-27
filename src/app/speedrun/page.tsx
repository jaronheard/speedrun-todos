import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SpeedrunTimer from "~/components/speedrun-timer";
import { type Task } from "@doist/todoist-api-typescript";
import { Badge } from "~/components/ui/badge";

export default async function SpeedrunPage({
  searchParams,
}: {
  searchParams: { tasks?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const tasks = searchParams.tasks
    ? (JSON.parse(searchParams.tasks) as Task[])
    : [];

  return (
    <main className="relative min-h-screen">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <SpeedrunTimer tasks={tasks} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto p-4">
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-muted px-2 py-1 text-sm">space</kbd>
              <span className="text-muted-foreground">to start/pause</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-muted px-2 py-1 text-sm">enter</kbd>
              <span className="text-muted-foreground">to complete task</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
