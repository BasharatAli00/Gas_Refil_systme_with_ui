export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  tool_used: string | null;
  tool_args: Record<string, any>;
  tool_result: string;
  error?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  tool_used?: string | null;
  tool_args?: Record<string, any>;
  tool_result?: string;
  timestamp: Date;
}
