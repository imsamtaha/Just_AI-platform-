import "server-only";

export interface AgentPersistenceConfig {
  supabaseUrl: string;
  publishableKey: string;
  accessToken: string;
  userId: string;
}

interface SessionRow {
  id: string;
}

interface ExecutionRow {
  id: string;
}

export interface AgentMemoryRow {
  id: string;
  session_id: string | null;
  memory_key: string;
  content: string;
  memory_type: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

export interface RecentExecutionRow {
  id: string;
  input: string;
  output: string | null;
  selected_skills: string[];
  model: string | null;
  created_at: string;
}

export class AgentPersistence {
  private readonly baseUrl: string;

  constructor(private readonly config: AgentPersistenceConfig) {
    this.baseUrl = `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  }

  static fromEnv(accessToken: string, userId: string): AgentPersistence | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey || !accessToken || !userId) return null;

    return new AgentPersistence({
      supabaseUrl,
      publishableKey,
      accessToken,
      userId,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      ...init,
      headers: {
        apikey: this.config.publishableKey,
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase persistence failed (${response.status}): ${text.slice(0, 300)}`);
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  async createSession(title?: string): Promise<string> {
    const rows = await this.request<SessionRow[]>("agent_sessions", {
      method: "POST",
      body: JSON.stringify({
        user_id: this.config.userId,
        title: title?.slice(0, 120) || "JUST AI Session",
        metadata: { source: "nextjs-api" },
      }),
    });

    if (!rows?.[0]?.id) throw new Error("Supabase did not return a session id");
    return rows[0].id;
  }

  async recordExecution(input: {
    sessionId: string;
    prompt: string;
    output: string;
    selectedSkills: string[];
    validation?: Record<string, unknown>;
    model?: string;
    latencyMs?: number;
  }): Promise<string> {
    const rows = await this.request<ExecutionRow[]>("agent_executions", {
      method: "POST",
      body: JSON.stringify({
        session_id: input.sessionId,
        user_id: this.config.userId,
        input: input.prompt,
        output: input.output,
        selected_skills: input.selectedSkills,
        status: "completed",
        validation: input.validation || {},
        model: input.model || null,
        latency_ms: input.latencyMs ?? null,
      }),
    });

    if (!rows?.[0]?.id) throw new Error("Supabase did not return an execution id");
    return rows[0].id;
  }

  async recordSkillUsage(executionId: string, skills: string[]): Promise<void> {
    if (skills.length === 0) return;

    await this.request<unknown>("agent_skill_usage", {
      method: "POST",
      body: JSON.stringify(
        skills.map((skill) => ({
          execution_id: executionId,
          user_id: this.config.userId,
          skill_name: skill,
          skill_version: "1.0.0",
          metadata: { source: "nextjs-api" },
        }))
      ),
    });
  }

  async getRecentMemories(limit = 6, sessionId?: string): Promise<AgentMemoryRow[]> {
    const params = new URLSearchParams({
      select: "id,session_id,memory_key,content,memory_type,metadata,updated_at",
      order: "updated_at.desc",
      limit: String(Math.min(20, Math.max(1, limit))),
    });

    if (sessionId) {
      params.set("or", `(session_id.eq.${sessionId},session_id.is.null)`);
    }

    return this.request<AgentMemoryRow[]>(`agent_memories?${params.toString()}`, {
      method: "GET",
    });
  }

  async getRecentExecutions(
    sessionId: string,
    limit = 4
  ): Promise<RecentExecutionRow[]> {
    const params = new URLSearchParams({
      select: "id,input,output,selected_skills,model,created_at",
      session_id: `eq.${sessionId}`,
      order: "created_at.desc",
      limit: String(Math.min(10, Math.max(1, limit))),
    });

    return this.request<RecentExecutionRow[]>(`agent_executions?${params.toString()}`, {
      method: "GET",
    });
  }
}
