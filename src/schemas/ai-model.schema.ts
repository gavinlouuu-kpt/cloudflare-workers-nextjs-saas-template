import { z } from "zod";

export const aiModelRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
  model: z.enum(['qwen2.5:0.5b', 'llama3.2:1b', 'llama3.2:3b', 'phi3:mini'], {
    errorMap: () => ({ message: "Please select a valid model" })
  }),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(4000).optional().default(1000),
  useCache: z.boolean().optional().default(true),
});

export const aiModelStreamRequestSchema = aiModelRequestSchema.extend({
  stream: z.literal(true),
});

export type AIModelRequest = z.infer<typeof aiModelRequestSchema>;
export type AIModelStreamRequest = z.infer<typeof aiModelStreamRequestSchema>; 