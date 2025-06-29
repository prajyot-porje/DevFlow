import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
    args:{
        name: v.string(),
        email: v.string(),
        image: v.string(),
        uid: v.string(),

    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").filter(q => q.eq(q.field("uid"), args.uid)).collect();
        if (user.length === 0) { 
            const today = new Date().toISOString().slice(0, 10); 
            const result = await ctx.db.insert("users", {
                name: args.name,
                email: args.email,
                image: args.image,
                uid: args.uid,
                conversationCount: 0,
                lastConversationDate: today,
            });
            return result;
        } 
    }
})

export const GetUser = query({
    args: {
        uid: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").filter(q => q.eq(q.field("uid"), args.uid)).collect();
        if (user.length > 0) {
            return user[0];
        } else {
            return '';
        }
    }
});

export const getUserByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("uid", (q) => q.eq("uid", args.uid))
      .first();
  },
});

export const canStartConversation = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const today = new Date().toISOString().slice(0, 10);
    let count = user?.conversationCount ?? 0;
    let lastDate = user?.lastConversationDate ?? "";

    if (lastDate !== today) {
      count = 0;
      lastDate = today;
    }

    if (count >= 4) {
      return { allowed: false, count };
    }

    await ctx.db.patch(args.userId, {
      conversationCount: count + 1,
      lastConversationDate: today,
    });

    return { allowed: true, count: count + 1 };
  },
});

export const getUserConversationUsage = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("uid", (q) => q.eq("uid", args.uid))
      .first();
    if (!user) return null;
    return {
      conversationCount: user.conversationCount ?? 0,
      lastConversationDate: user.lastConversationDate ?? "",
      limit: 4, 
    };
  },
});