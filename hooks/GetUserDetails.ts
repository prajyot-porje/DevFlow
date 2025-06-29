import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function GetUserDetails() {
  const { user, isLoaded } = useUser();
  const userDetails = useQuery(
    api.users.GetUser,
    isLoaded && user ? { uid: user.id } : "skip"
  );

  return userDetails;
}