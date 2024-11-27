"use client";

import { Button } from "./ui/button";
import { api } from "~/trpc/react";

export function ConnectLinear() {
  const { data: connectedProviders } =
    api.integrations.getConnectedProviders.useQuery();
  const isConnected = connectedProviders?.includes("linear");

  const handleConnect = () => {
    const state = crypto.randomUUID();
    const url = new URL("https://linear.app/oauth/authorize");
    url.searchParams.append(
      "client_id",
      process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID!,
    );
    url.searchParams.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI!,
    );
    url.searchParams.append("response_type", "code");
    url.searchParams.append("state", state);
    url.searchParams.append("scope", "read,write");
    window.location.href = url.toString();
  };

  return (
    <Button
      variant={isConnected ? "secondary" : "default"}
      onClick={handleConnect}
      disabled={isConnected}
    >
      {isConnected ? "Linear Connected" : "Connect Linear"}
    </Button>
  );
}
