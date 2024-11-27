import { LinearClient } from "@linear/sdk";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const integrationsRouter = createTRPCRouter({
  getConnectedProviders: protectedProcedure.query(async ({ ctx }) => {
    const integrations = await ctx.db.integration.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        provider: true,
      },
    });
    return integrations.map((i) => i.provider);
  }),

  getLinearTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const integration = await ctx.db.integration.findUnique({
        where: {
          provider_userId: {
            provider: "linear",
            userId: ctx.session.user.id,
          },
        },
      });

      if (!integration) {
        return null;
      }

      const linearClient = new LinearClient({
        accessToken: integration.token,
      });

      const viewer = await linearClient.viewer;

      const issues = await linearClient.issues({
        // filter: {
        //   assignee: { id: { eq: viewer.id } },
        //   state: {
        //     name: { in: ["Todo", "In Progress", "Backlog"] },
        //   },
        // },
      });

      if (!issues.nodes) {
        return [];
      }
      console.log(issues.nodes);
      return issues.nodes;
    } catch (error) {
      console.error("Error fetching Linear tasks:", error);
      throw new Error("Failed to fetch Linear tasks");
    }
  }),
});
