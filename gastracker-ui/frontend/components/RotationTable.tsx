"use client";
import React from "react";
import styles from "../styles/dashboard.module.css";

interface RotationTableProps {
  data: string;
  onRefresh: () => void;
  isLoading: boolean;
}

interface RotationEntry {
  index: number;
  name: string;
  count: string;
  isCurrent: boolean;
}

function parseRotation(data: string): RotationEntry[] | null {
  const lines = data.split("\n").filter(l => l.trim());
  const entries: RotationEntry[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)[.)]\s+(.+)/);
    if (!match) continue;

    const index = parseInt(match[1]);
    const rest = match[2];
    const isCurrent = /current|CURRENT|\*/.test(rest);
    const countMatch = rest.match(/(\d+)\s*(?:fill|refill|time)/i);
    const count = countMatch ? `${countMatch[1]}x` : "";
    const name = rest
      .replace(/[-–]\s*\d+\s*(fill|refill|time)s?.*/i, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\*/g, "")
      .trim();

    if (name) entries.push({ index, name, count, isCurrent });
  }

  return entries.length >= 2 ? entries : null;
}

export default function RotationTable({ data, onRefresh, isLoading }: RotationTableProps) {
  const entries = data ? parseRotation(data) : null;

  return (
    <div className={styles.rotationCard}>
      <div className={styles.rotationTitle}>
        <span>Rotation &amp; Stats</span>
        <button className={styles.refreshBtn} onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "..." : "↻ Refresh"}
        </button>
      </div>

      {!data ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <span>{isLoading ? "Loading rotation..." : "No rotation data"}</span>
        </div>
      ) : entries ? (
        entries.map(entry => (
          <div
            key={entry.index}
            className={`${styles.rotationRow} ${entry.isCurrent ? styles.active : ""}`}
          >
            <div className={styles.rowIndex}>{entry.index}</div>
            <div className={styles.rowName}>{entry.name}</div>
            <div className={styles.rowCount}>{entry.count}</div>
            <div className={`${styles.rowStatus} ${entry.isCurrent ? styles.current : ""}`} />
          </div>
        ))
      ) : (
        <pre className={styles.rotationRaw}>{data}</pre>
      )}
    </div>
  );
}
