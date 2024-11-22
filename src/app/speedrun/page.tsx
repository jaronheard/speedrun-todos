import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SpeedrunTimer from "~/components/speedrun-timer";
import { type Task } from "@doist/todoist-api-typescript";

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
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <SpeedrunTimer tasks={tasks} />
    </main>
  );
}
