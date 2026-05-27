"use client";
import { ConvexClientProvider } from "./ConvexClientProvider";
import CreateUserOnSignIn from "@/lib/CreateUserOnSignIn";
import React from "react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <CreateUserOnSignIn />
      {children}
    </ConvexClientProvider>
  );
}
