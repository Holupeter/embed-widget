import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- TOURS TABLE ---
  tours: defineTable({
    userId: v.optional(v.string()), // Added to match existing data
    name: v.string(),
    description: v.optional(v.string()), // Added from guide
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
    targetUrl: v.optional(v.string()), // Added from guide
    
    // Theme object (now optional as per guide)
    theme: v.optional(v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
      textColor: v.string(),
      borderRadius: v.number(),
      overlayEnabled: v.boolean(),
      overlayOpacity: v.number(),
    })),

    // Targeting object (now optional as per guide)
    targeting: v.optional(v.object({
      urlMatchType: v.union(v.literal("exact"), v.literal("contains"), v.literal("regex")),
      urlPattern: v.string(),
      triggerType: v.union(v.literal("pageload"), v.literal("delay"), v.literal("click")), // Added from guide
      triggerDelay: v.optional(v.number()), // Added from guide
      frequency: v.union(v.literal("once"), v.literal("session"), v.literal("always")),
    })),
  }),

  // --- STEPS TABLE ---
  steps: defineTable({
    tourId: v.id("tours"), // Link to the tours table
    stepId: v.string(), // A unique identifier for the step within the tour
    title: v.string(),
    content: v.string(),
    targetSelector: v.string(),
    position: v.union(v.literal("top"), v.literal("bottom"), v.literal("left"), v.literal("right")),
    order: v.number(),
  }).index("by_tourId", ["tourId"]), // Index for faster step lookups by tour

  // --- API KEYS TABLE ---
  apiKeys: defineTable({
    key: v.string(),
    userId: v.optional(v.string()), 
  }).index("by_key", ["key"]), // Index for fast key validation

  // --- ANALYTICS TABLE ---
  analytics: defineTable({
    tourId: v.id("tours"),
    visitorId: v.string(),
    event: v.string(), // This should be a union of specific event types for better type safety
    stepId: v.optional(v.string()),
    metadata: v.optional(v.any()), // Using v.any() for metadata for flexibility
  }).index("by_tourId_visitorId", ["tourId", "visitorId"]),
});