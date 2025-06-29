import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    uid: v.string(),
    conversationCount: v.optional(v.number()),
    lastConversationDate: v.optional(v.string()),
  }).index("uid", ["uid"]),
  workspaces: defineTable({
    info: v.optional(v.any()),
    messages: v.any(),
    files: v.optional(v.any()),
    user: v.id("users"),
  }).index("by_user", ["user"]),
});
