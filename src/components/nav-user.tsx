"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/user-context";

export function NavUser() {
  const { currentUser } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-2 w-full rounded-md hover:bg-accent focus-visible:outline-none"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="" />
            <AvatarFallback>
              {currentUser ? getInitials(currentUser.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <div className="text-sm font-medium">
              {currentUser ? currentUser.name : "Select User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentUser ? currentUser.username : ""}
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="text-sm font-semibold">
            {currentUser ? currentUser.name : "Select User"}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentUser ? currentUser.email : ""}
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link href="/login">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Switch User</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
