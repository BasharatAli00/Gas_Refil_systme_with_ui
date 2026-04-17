"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/dashboard.module.css";
import { Message } from "../types/chat";

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className={styles.chatHistory} ref={scrollRef}>
      {messages.length === 0 && (
        <div className={styles.assistantMessage} style={{ alignSelf: 'center', opacity: 0.5 }}>
          No messages yet. Ask me anything about the gas tracker!
        </div>
      )}
      {messages.map((m) => (
        <div key={m.id} className={`${styles.message} ${m.role === 'user' ? styles.userMessage : m.role === 'error' ? styles.errorMessage : styles.assistantMessage}`}>
          {m.content}
          
          {m.tool_used && (
            <div className={styles.toolMetadata}>
              <div 
                className={styles.toolPill} 
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              >
                🔧 {m.tool_used}
              </div>
              {expandedId === m.id && (
                <div className={styles.toolDetails}>
                  <strong>Args:</strong> {JSON.stringify(m.tool_args, null, 2)}
                  {"\n\n"}
                  <strong>Result:</strong> {m.tool_result}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className={styles.assistantMessage}>
          Thinking...
        </div>
      )}
    </div>
  );
}
