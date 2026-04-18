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
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "loading">("loading");
  const [currentTurn, setCurrentTurn] = useState("");
  const [rotationData, setRotationData] = useState("");
  const [ready, setReady] = useState(false);

  const fetchTurn = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Who is next to fill the gas?" }),
      });
      const data: ChatResponse = await res.json();
      if (!data.error) {
        if (data.tool_used === "whos_turn") setCurrentTurn(data.tool_result);
        setConnectionStatus("online");
      } else {
        setConnectionStatus("offline");
      }
    } catch {
      setConnectionStatus("offline");
    }
  };

  const fetchRotation = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Show the full rotation" }),
      });
      const data: ChatResponse = await res.json();
      if (!data.error && data.tool_used === "show_rotation") {
        setRotationData(data.tool_result);
      }
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchTurn(), fetchRotation()])
      .finally(() => setReady(true));
  }, []);

  const sendMessage = async (content: string, silent = false) => {
    if (!silent) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }]);
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data: ChatResponse = await res.json();

      if (data.error) {
        if (!silent) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "error",
            content: data.error || "An error occurred",
            timestamp: new Date(),
          }]);
        }
        setConnectionStatus("offline");
      } else {
        if (!silent) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.answer,
            tool_used: data.tool_used,
            tool_args: data.tool_args,
            tool_result: data.tool_result,
            timestamp: new Date(),
          }]);
        }
        if (data.tool_used === "whos_turn") setCurrentTurn(data.tool_result);
        if (data.tool_used === "show_rotation") setRotationData(data.tool_result);
        setConnectionStatus("online");
      }
    } catch (err: any) {
      if (!silent) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: `Failed to connect to backend: ${err.message}`,
          timestamp: new Date(),
        }]);
      }
      setConnectionStatus("offline");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.logo}>⛽ GAS TRACKER</span>
        <StatusIndicator status={connectionStatus} />
      </header>

      {!ready ? (
        <div className={styles.globalSkeleton}>INITIALIZING...</div>
      ) : (
        <main className={styles.grid}>
          <section className={styles.colLeft}>
            <TurnBanner
              currentTurn={currentTurn}
              onRefresh={fetchTurn}
              isLoading={isLoading}
            />
            <QuickActions onAction={(msg) => sendMessage(msg)} isLoading={isLoading} />
          </section>

          <section className={styles.colRight}>
            <RotationTable
              data={rotationData}
              onRefresh={fetchRotation}
              isLoading={isLoading}
            />
          </section>

          <section className={styles.colFull}>
            <ChatHistory messages={messages} isLoading={isLoading} />
            <ChatInput onSend={(msg) => sendMessage(msg)} isLoading={isLoading} />
          </section>
        </main>
      )}
    </div>
  );
}
