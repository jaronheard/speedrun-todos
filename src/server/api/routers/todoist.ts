import { TodoistApi } from "@doist/todoist-api-typescript";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";

export const todoistRouter = createTRPCRouter({
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "todoist",
      },
    });
    return account;
  }),

  getTasks: protectedProcedure.query(async () => {
    const api = new TodoistApi(env.TODOIST_API_KEY);
    const tasks = await api.getTasks({ filter: "!@speedrun" });
    return tasks;
  }),

  completeTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
        labels: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const api = new TodoistApi(env.TODOIST_API_KEY);

      const results = await Promise.allSettled([
        api.updateTask(input.id, {
          content: input.content,
          labels: input.labels,
        }),
        api.closeTask(input.id),
      ]);

      return results;
    }),

  updateTaskContent: protectedProcedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const api = new TodoistApi(env.TODOIST_API_KEY);
      const task = await api.updateTask(input.id, {
        content: input.content,
      });
      return task;
    }),
});
