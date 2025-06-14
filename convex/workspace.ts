import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateWorkspace = mutation({
    args: {
        message: v.any(),
        user: v.id('users'),
    },
    handler: async (ctx, args) => {
        const workspaceID = await ctx.db.insert("workspaces", {
            messages: args.message,
            user: args.user,
        });
        return workspaceID;
    }
})

export const UpdateMessages = mutation({
    args: {
        workspaceID: v.id('workspaces'),
        message: v.any(),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.patch(args.workspaceID,{
            messages: args.message,
        });
        return result;
    }
})