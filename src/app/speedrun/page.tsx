import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SpeedrunTimer from "~/components/speedrun-timer";
import { type TaskData } from "~/types/task";

export default async function SpeedrunPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const resolvedParams = await searchParams;

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const tasks = resolvedParams.tasks
    ? (JSON.parse(resolvedParams.tasks as string) as TaskData[])
    : [];

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <SpeedrunTimer tasks={tasks} />
    </main>
  );
}
