import { LinearClient } from "@linear/sdk";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

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
        filter: {
          assignee: { id: { eq: viewer.id } },
          state: {
            name: { in: ["Todo", "In Progress", "Backlog"] },
          },
        },
      });

      if (!issues.nodes) {
        return [];
      }
      return issues.nodes;
    } catch (error) {
      console.error("Error fetching Linear tasks:", error);
      throw new Error("Failed to fetch Linear tasks");
    }
  }),

  getLinearWorkflowStates: protectedProcedure.query(async ({ ctx }) => {
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

      const teams = await linearClient.teams();
      const workflowStates = await Promise.all(
        teams.nodes.map(async (team) => {
          const states = await team.states();
          return states.nodes;
        }),
      );

      // Flatten the array of states and find the "Done" state
      const doneState = workflowStates
        .flat()
        .find((state) => state.name.toLowerCase() === "done");

      return doneState?.id ?? null;
    } catch (error) {
      console.error("Error fetching Linear workflow states:", error);
      throw new Error("Failed to fetch Linear workflow states");
    }
  }),

  completeLinearTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
          throw new Error("Linear integration not found");
        }

        const linearClient = new LinearClient({
          accessToken: integration.token,
        });

        const issue = await linearClient.issue(input.id);

        // Get the "Done" state ID
        const teams = await linearClient.teams();
        const workflowStates = await Promise.all(
          teams.nodes.map(async (team) => {
            const states = await team.states();
            return states.nodes;
          }),
        );

        const doneState = workflowStates
          .flat()
          .find((state) => state.name.toLowerCase() === "done");

        if (!doneState) {
          throw new Error("Could not find 'Done' state in Linear workflow");
        }

        // Update the issue state to "Done" and add the completion comment
        await issue.update({
          stateId: doneState.id,
          description: issue.description
            ? `${issue.description}\n\n${input.comment}`
            : input.comment,
        });

        return issue;
      } catch (error) {
        console.error("Error completing Linear task:", error);
        throw new Error("Failed to complete Linear task");
      }
    }),

  disconnectLinear: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.db.integration.delete({
        where: {
          provider_userId: {
            provider: "linear",
            userId: ctx.session.user.id,
          },
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Error disconnecting Linear:", error);
      throw new Error("Failed to disconnect Linear");
    }
  }),
});
