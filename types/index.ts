export type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
export type Role = "USER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role: Role;
  plan: Plan;
  stripeCustomerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  folderId?: string | null;
  pinned: boolean;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  model?: string | null;
  tokens?: number | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD";
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string | null;
  goalId?: string | null;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | null;
  progress: number;
  aiPlan?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  leadScore: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  userId: string;
  contactId?: string | null;
  title: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  value?: number | null;
  aiScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeItem {
  id: string;
  userId: string;
  title: string;
  type: "PDF" | "DOCX" | "PPT" | "WEBSITE" | "VIDEO" | "TEXT";
  fileUrl?: string | null;
  fileSize?: number | null;
  processed: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Automation {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  trigger: Record<string, any>;
  actions: Record<string, any>[];
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  runCount: number;
  lastRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: Plan;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
