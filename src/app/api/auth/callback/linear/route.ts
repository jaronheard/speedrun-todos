import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { env } from "~/env";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://api.linear.app/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: env.NEXT_PUBLIC_LINEAR_CLIENT_ID,
        client_secret: env.LINEAR_CLIENT_SECRET,
        redirect_uri: env.NEXT_PUBLIC_LINEAR_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to exchange Linear code for token");
      return new Response("Failed to connect Linear account", { status: 500 });
    }

    const { access_token } = (await tokenResponse.json()) as {
      access_token: string;
    };

    // Store the token
    await db.integration.upsert({
      where: {
        provider_userId: {
          provider: "linear",
          userId: session.user.id,
        },
      },
      create: {
        provider: "linear",
        userId: session.user.id,
        token: access_token,
      },
      update: {
        token: access_token,
      },
    });

    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Error connecting Linear account:", error);
    return new Response("Failed to connect Linear account", { status: 500 });
  }
}
