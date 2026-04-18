"use client";
import React, { useState } from "react";
import styles from "../styles/dashboard.module.css";

interface QuickActionsProps {
  onAction: (message: string) => void;
  isLoading: boolean;
}

export default function QuickActions({ onAction, isLoading }: QuickActionsProps) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const sendChat = onAction;

  const openForm = (form: string) => {
    setActiveForm(activeForm === form ? null : form);
    setFormData({});
  };

  const updateField = (field: string, val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = "";
    if (activeForm === "skip_turn") {
      msg = `Skip ${formData.name}'s turn${formData.reason ? `. Reason: ${formData.reason}` : ""}`;
    } else if (activeForm === "swap_turns") {
      msg = `Swap turns between ${formData.name_a} and ${formData.name_b}`;
    }
    if (msg) sendChat(msg);
    setActiveForm(null);
  };

  return (
    <div className={styles.quickActions}>
      <button
        className={`${styles.actionBtn} ${styles.primary}`}
        onClick={() => sendChat("mark my turn done")}
        disabled={isLoading}
      >
        <span className={styles.btnIcon}>🔥</span>
        <div>
          <div className={styles.btnLabel}>Mark My Turn Done</div>
          <div className={styles.btnSub}>Record refill &amp; advance rotation</div>
        </div>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => openForm("skip_turn")}
        disabled={isLoading}
      >
        <span className={styles.btnIcon}>⏭</span>
        <div className={styles.btnLabel}>Skip Turn</div>
        <div className={styles.btnSub}>Pass to next</div>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => openForm("swap_turns")}
        disabled={isLoading}
      >
        <span className={styles.btnIcon}>🔀</span>
        <div className={styles.btnLabel}>Swap Turns</div>
        <div className={styles.btnSub}>Exchange with someone</div>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => sendChat("show last 10 refills history")}
        disabled={isLoading}
      >
        <span className={styles.btnIcon}>📋</span>
        <div className={styles.btnLabel}>History</div>
        <div className={styles.btnSub}>Past refills</div>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => sendChat("show rotation")}
        disabled={isLoading}
      >
        <span className={styles.btnIcon}>🔄</span>
        <div className={styles.btnLabel}>Rotation</div>
        <div className={styles.btnSub}>Full order</div>
      </button>

      {activeForm && (
        <form className={styles.inlineForm} onSubmit={handleSubmit}>
          {activeForm === "skip_turn" && (
            <>
              <div className={styles.formField}>
                <label>Name (required)</label>
                <input required type="text" onChange={e => updateField("name", e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Reason</label>
                <input type="text" onChange={e => updateField("reason", e.target.value)} />
              </div>
            </>
          )}
          {activeForm === "swap_turns" && (
            <>
              <div className={styles.formField}>
                <label>Name A (required)</label>
                <input required type="text" onChange={e => updateField("name_a", e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Name B (required)</label>
                <input required type="text" onChange={e => updateField("name_b", e.target.value)} />
              </div>
            </>
          )}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveForm(null)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Submit</button>
          </div>
        </form>
      )}
    </div>
  );
}
