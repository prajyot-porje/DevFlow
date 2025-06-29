"use client";
import {  useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect  } from "react";

export default function CreateUserOnSignIn() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.CreateUser);
  useEffect(() => {
    if (isLoaded && user) {
      createUser({
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        image: user.imageUrl || "",
        uid: user.id,
        
      });
    }
  }, [isLoaded, user, createUser]);

  return null;
}

