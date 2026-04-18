"use client";
import React from "react";
import styles from "../styles/dashboard.module.css";

interface TurnBannerProps {
  currentTurn: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function TurnBanner({ currentTurn, onRefresh, isLoading }: TurnBannerProps) {
  const nameMatch = currentTurn.match(/It's (.*?)'s turn/i);
  const turnMatch = currentTurn.match(/\(turn #(.*?)\)/i);

  const name = nameMatch ? nameMatch[1] : null;
  const turnLabel = turnMatch ? `Turn #${turnMatch[1]}` : null;

  return (
    <div className={styles.turnBanner}>
      <div className={styles.bannerHeader}>
        <div className={styles.bannerLabel}>Currently Filling</div>
        <button className={styles.refreshBtn} onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "..." : "↻ Refresh"}
        </button>
      </div>

      {name ? (
        <>
          <div className={styles.bannerName}>{name}</div>
          {turnLabel && <div className={styles.bannerSub}>{turnLabel}</div>}
        </>
      ) : (
        <div className={styles.bannerName} style={{ fontSize: "1rem", color: "var(--muted)" }}>
          {isLoading ? "Fetching..." : "—"}
        </div>
      )}
    </div>
  );
}
