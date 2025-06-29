"use client";
import { ConvexClientProvider } from "./ConvexClientProvider";
import CreateUserOnSignIn from "@/lib/CreateUserOnSignIn";
import {  MessageContext } from "@/context/MessageContext";
import React, { useState } from "react";
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState();
  return (
      <MessageContext.Provider value={{ messages, setMessages }}>
        <ConvexClientProvider>
          
          <CreateUserOnSignIn />
          {children}
        </ConvexClientProvider>
      </MessageContext.Provider>
  );
}
