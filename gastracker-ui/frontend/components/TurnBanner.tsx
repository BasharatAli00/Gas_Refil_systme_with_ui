"use client";
import React from "react";
import styles from "../styles/dashboard.module.css";

interface TurnBannerProps {
  currentTurn: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function TurnBanner({ currentTurn, onRefresh, isLoading }: TurnBannerProps) {
  // Parse something like "It's UK's turn (turn #3)"
  const nameMatch = currentTurn.match(/It's (.*?)'s turn/);
  const turnMatch = currentTurn.match(/\(turn #(.*?)\)/);

  const name = nameMatch ? nameMatch[1] : "Unknown";
  const turnLabel = turnMatch ? `Turn #${turnMatch[1]}` : "";

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Currently Filling</h2>
        <button className={styles.refreshBtn} onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "..." : "Refresh"}
        </button>
      </div>
      <div className={styles.bannerContent}>
        {currentTurn ? (
          <>
            <div className={styles.bannerName}>{name}</div>
            <div className={styles.bannerTurn}>{turnLabel}</div>
          </>
        ) : (
          <div className={styles.bannerTurn}>{isLoading ? "Fetching..." : "No data"}</div>
        )}
      </div>
    </div>
  );
}
