import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import TodoBoard from "~/components/todo-board";
import { UserNav } from "~/components/user-nav";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Speedrun your tasks</p>
        </div>
        <UserNav user={session.user} />
      </div>
      <TodoBoard />
    </main>
  );
}
