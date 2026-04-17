"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";
import { Message, ChatResponse } from "../types/chat";
import StatusIndicator from "../components/StatusIndicator";
import TurnBanner from "../components/TurnBanner";
import RotationTable from "../components/RotationTable";
import QuickActions from "../components/QuickActions";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "unknown">("unknown");
  const [currentTurn, setCurrentTurn] = useState("");
  const [rotationData, setRotationData] = useState("");

  const checkHealth = async () => {
    try {
      const resp = await fetch("/api/health"); // Need to proxy this too or call directly
      // Simplest: use the proxy we have or just check if chat works
      setConnectionStatus("connected");
    } catch {
      setConnectionStatus("disconnected");
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    // Get Who's Turn
    await sendMessage("Who is next to fill the gas?", true);
    // Get Rotation
    await sendMessage("Show the full rotation", true);
    setIsLoading(false);
  };

  useEffect(() => {
    checkHealth();
    fetchInitialData();
  }, []);

  const sendMessage = async (content: string, silent = false) => {
    if (!silent) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data: ChatResponse = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "error",
            content: data.error || "An error occurred",
            timestamp: new Date(),
          },
        ]);
        setConnectionStatus("disconnected");
      } else {
        if (!silent) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.answer,
              tool_used: data.tool_used,
              tool_args: data.tool_args,
              tool_result: data.tool_result,
              timestamp: new Date(),
            },
          ]);
        }

        // Global state updates based on tools
        if (data.tool_used === "whos_turn") {
          setCurrentTurn(data.tool_result);
        }
        if (data.tool_used === "show_rotation") {
          setRotationData(data.tool_result);
        }
        
        setConnectionStatus("connected");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: `Failed to connect to backend: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>🔥 Gas Tracker</h1>
        <StatusIndicator status={connectionStatus} />
      </header>

      <section className={styles.topSection}>
        <TurnBanner 
          currentTurn={currentTurn} 
          onRefresh={() => sendMessage("Who is next to fill the gas?", true)} 
          isLoading={isLoading} 
        />
        <RotationTable 
          data={rotationData} 
          onRefresh={() => sendMessage("Show the full rotation", true)} 
          isLoading={isLoading} 
        />
      </section>

      <section className={styles.quickActions}>
        <QuickActions onAction={(msg) => sendMessage(msg)} isLoading={isLoading} />
      </section>

      <section className={styles.chatSection}>
        <ChatHistory messages={messages} isLoading={isLoading} />
        <ChatInput onSend={(msg) => sendMessage(msg)} isLoading={isLoading} />
      </section>

      {/* Inject CSS Variables globally or in Layout */}
      <style jsx global>{`
        :root {
          --bg-page: #0f0f0f;
          --bg-panel: #1a1a1a;
          --bg-card: #242424;
          --accent: #f97316;
          --success: #22c55e;
          --error: #ef4444;
          --text-primary: #f1f5f9;
          --text-muted: #94a3b8;
          --border: #2e2e2e;
          --radius-card: 10px;
          --radius-input: 6px;
        }
        body {
          margin: 0;
          background-color: var(--bg-page);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </main>
  );
}
