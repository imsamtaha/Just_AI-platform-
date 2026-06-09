import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const PLAN_LIMITS = {
  FREE: {
    aiChatsPerDay: 10,
    aiWriterPerDay: 5,
    plannerTasks: 20,
    storageGB: 1,
    knowledgeItems: 5,
    automations: 0,
    teamMembers: 1,
  },
  PRO: {
    aiChatsPerDay: Infinity,
    aiWriterPerDay: Infinity,
    plannerTasks: Infinity,
    storageGB: 10,
    knowledgeItems: 100,
    automations: 10,
    teamMembers: 5,
  },
  BUSINESS: {
    aiChatsPerDay: Infinity,
    aiWriterPerDay: Infinity,
    plannerTasks: Infinity,
    storageGB: 100,
    knowledgeItems: 1000,
    automations: 50,
    teamMembers: 25,
  },
  ENTERPRISE: {
    aiChatsPerDay: Infinity,
    aiWriterPerDay: Infinity,
    plannerTasks: Infinity,
    storageGB: Infinity,
    knowledgeItems: Infinity,
    automations: Infinity,
    teamMembers: Infinity,
  },
};
