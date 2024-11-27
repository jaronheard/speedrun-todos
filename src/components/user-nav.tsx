"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { signOut } from "next-auth/react";
import { api } from "~/trpc/react";
import { useTheme } from "next-themes";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const utils = api.useUtils();
  const { setTheme } = useTheme();
  const { data: connectedProviders } =
    api.integrations.getConnectedProviders.useQuery();
  const { mutate: disconnectLinear } =
    api.integrations.disconnectLinear.useMutation({
      onSuccess: () => {
        void utils.integrations.getConnectedProviders.invalidate();
        void utils.integrations.getLinearTasks.invalidate();
      },
    });

  const handleConnectLinear = () => {
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

  const isLinearConnected = connectedProviders?.includes("linear");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback>
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLinearConnected ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => disconnectLinear()}
          >
            Disconnect Linear
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleConnectLinear}>
            Connect Linear
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
