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
    // NOTE: existing records may need manual migration if they 
    // don't conform to this shape. Wipe dev data if needed.
    messages: v.optional(v.array(v.object({
      role: v.optional(v.string()),
      type: v.optional(v.string()),
      id: v.optional(v.string()),
      content: v.string(),
      timestamp: v.optional(v.number())
    }))),
    files: v.optional(v.record(v.string(), v.object({ code: v.string() }))),
    user: v.id("users"),
  }).index("by_user", ["user"]),
});
