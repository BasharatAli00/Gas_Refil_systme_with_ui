"use client";
import React from "react";
import styles from "../styles/dashboard.module.css";

interface RotationTableProps {
  data: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function RotationTable({ data, onRefresh, isLoading }: RotationTableProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Rotation & Stats</h2>
        <button className={styles.refreshBtn} onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "..." : "Refresh"}
        </button>
      </div>
      <pre className={styles.rotationTable}>
        {data || (isLoading ? "Loading rotation..." : "Full rotation data will appear here.")}
      </pre>
    </div>
  );
}
