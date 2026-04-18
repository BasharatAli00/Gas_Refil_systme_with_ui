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
    <div className={styles.chatHistory}>
      <div className={styles.chatHeader}>Chat Log</div>
      <div className={styles.chatScroll} ref={scrollRef}>
        {messages.length === 0 && (
          <div className={styles.msgEmpty}>
            No messages yet — ask me anything about the gas tracker.
          </div>
        )}

        {messages.map(m => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? styles.msgUser
                : m.role === "error"
                ? styles.msgError
                : styles.msgBot
            }
          >
            {m.tool_used && (
              <div
                className={styles.toolBadge}
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              >
                ⚙ {m.tool_used}
              </div>
            )}
            <div>{m.content}</div>
            {expandedId === m.id && m.tool_used && (
              <div className={styles.toolDetails}>
                <strong>Args:</strong> {JSON.stringify(m.tool_args, null, 2)}
                {"\n\n"}
                <strong>Result:</strong> {m.tool_result}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className={styles.msgThinking}>Thinking...</div>
        )}
      </div>
    </div>
  );
}
