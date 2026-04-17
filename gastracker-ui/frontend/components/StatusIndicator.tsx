"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/dashboard.module.css";

interface StatusIndicatorProps {
  status: "connected" | "disconnected" | "unknown";
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case "connected": return "Connected";
      case "disconnected": return "Disconnected";
      default: return "Starting...";
    }
  };

  return (
    <div className={styles.statusBadge}>
      <span className={`${styles.dot} ${styles[status]}`}></span>
      <span>{getStatusText()}</span>
    </div>
  );
}
