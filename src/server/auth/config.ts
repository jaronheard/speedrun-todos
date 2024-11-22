import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Todoist from "next-auth/providers/todoist";

import { env } from "~/env";
import { db } from "~/server/db";

// Add interface for Todoist user profile
interface TodoistUserProfile {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string;
}

// Add interface for Todoist API response
interface TodoistApiResponse {
  user: TodoistUserProfile;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Todoist({
      clientId: env.AUTH_TODOIST_ID,
      clientSecret: env.AUTH_TODOIST_SECRET,
      issuer: "https://todoist.com",
      authorization: {
        url: "https://todoist.com/oauth/authorize",
        params: { scope: "data:read_write,data:delete" },
      },
      token: {
        url: "https://todoist.com/oauth/access_token",
      },
      userinfo: {
        url: "https://api.todoist.com/sync/v9/sync",
        params: { resource_types: '["user"]' },
        async request(context: {
          provider: { userinfo: { url: string } };
          tokens: { access_token: string };
        }) {
          const response = await fetch(context.provider.userinfo?.url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              sync_token: "*",
              resource_types: '["user"]',
            }),
          });
          const data = (await response.json()) as TodoistApiResponse;
          const profile = data.user;

          return {
            id: profile.id.toString(),
            name: profile.full_name,
            email: profile.email,
            image: profile.avatar_url,
          };
        },
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
