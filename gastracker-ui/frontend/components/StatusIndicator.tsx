"use client";
import React from "react";
import styles from "../styles/dashboard.module.css";

interface StatusIndicatorProps {
  status: "online" | "offline" | "loading";
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const label = {
    online: "BACKEND LIVE",
    offline: "OFFLINE",
    loading: "CONNECTING...",
  }[status];

  return (
    <div className={styles.statusIndicator}>
      <div
        className={`${styles.statusDot} ${
          status === "online" ? styles.online : status === "offline" ? styles.error : ""
        }`}
      />
      <span>{label}</span>
    </div>
  );
}
