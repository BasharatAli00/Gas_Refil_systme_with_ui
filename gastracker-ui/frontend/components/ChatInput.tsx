"use client";
import React, { useState } from "react";
import styles from "../styles/dashboard.module.css";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatInputWrap}>
      <input
        type="text"
        className={styles.chatInput}
        placeholder="Ask anything — e.g. Who's next? Mark Ali's turn done."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        aria-label="Send"
      >
        ➤
      </button>
    </div>
  );
}
