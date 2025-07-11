import { z } from "zod";

export const aiModelRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
  model: z.enum(['deepseek-chat', 'deepseek-reasoner'], {
    errorMap: () => ({ message: "Please select a valid model" })
  }),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(8000).optional().default(1000), // Increased for DeepSeek
  useCache: z.boolean().optional().default(true),
});

export const aiModelStreamRequestSchema = aiModelRequestSchema.extend({
  stream: z.literal(true),
});

export type AIModelRequest = z.infer<typeof aiModelRequestSchema>;
export type AIModelStreamRequest = z.infer<typeof aiModelStreamRequestSchema>;