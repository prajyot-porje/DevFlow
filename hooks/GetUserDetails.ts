import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// Custom hook to get user details from Convex DB
export function GetUserDetails() {
  const { user, isLoaded } = useUser();
  // Only run the query if Clerk user is loaded and present
  const userDetails = useQuery(
    api.users.GetUser,
    isLoaded && user ? { uid: user.id } : "skip"
  );

  return userDetails;
}