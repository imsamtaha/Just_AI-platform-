import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1),
    })
  ).min(1),
  model: z.enum([
    "GPT4O", "GPT4", "GPT4O_MINI",
    "CLAUDE3_OPUS", "CLAUDE3_SONNET", "CLAUDE3_HAIKU",
    "GEMINI_PRO", "GEMINI_FLASH",
    "DEEPSEEK_CHAT",
  ]).default("GPT4O"),
  systemPrompt: z.string().optional(),
});

export const writerSchema = z.object({
  type: z.string().min(1),
  prompt: z.string().min(1, "Prompt is required").max(2000),
  tone: z.string().default("Professional"),
  length: z.string().default("Medium (400 words)"),
  model: z.string().default("GPT4O"),
});

export const consultantSchema = z.object({
  type: z.enum(["swot", "market", "competitor", "startup", "revenue", "sales", "roadmap"]),
  businessInfo: z.string().min(10, "Please describe your business").max(3000),
  model: z.string().default("GPT4O"),
});

export const plannerSchema = z.object({
  goalTitle: z.string().min(1, "Goal title required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  model: z.string().default("GPT4O"),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  leadScore: z.number().min(0).max(100).default(0),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title required").max(200),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  estimatedHours: z.number().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name required").max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  dueDate: z.string().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Goal title required").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

export const automationSchema = z.object({
  name: z.string().min(1, "Automation name required").max(100),
  description: z.string().optional(),
  trigger: z.record(z.any()),
  actions: z.array(z.record(z.any())).min(1, "At least one action required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type WriterInput = z.infer<typeof writerSchema>;
export type ConsultantInput = z.infer<typeof consultantSchema>;
export type PlannerInput = z.infer<typeof plannerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type AutomationInput = z.infer<typeof automationSchema>;
