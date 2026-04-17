"use client";
import React, { useState } from "react";
import styles from "../styles/dashboard.module.css";

interface QuickActionsProps {
  onAction: (message: string) => void;
  isLoading: boolean;
}

export default function QuickActions({ onAction, isLoading }: QuickActionsProps) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleBtnClick = (action: string) => {
    if (action === "whos_next") {
      onAction("Who is next to fill the gas?");
      setActiveForm(null);
    } else if (action === "rotation") {
      onAction("Show the full rotation");
      setActiveForm(null);
    } else {
      setActiveForm(activeForm === action ? null : action);
      setFormData({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = "";
    switch (activeForm) {
      case "mark_done":
        msg = `Mark ${formData.name}'s turn as done. Notes: ${formData.notes || ""}. Date: ${formData.date || ""}`;
        break;
      case "skip_turn":
        msg = `Skip ${formData.name}'s turn. Reason: ${formData.reason || ""}`;
        break;
      case "swap_turns":
        msg = `Swap turns between ${formData.name_a} and ${formData.name_b}`;
        break;
      case "history":
        msg = `Show last ${formData.limit || 10} gas refill history records`;
        break;
    }
    if (msg) onAction(msg);
    setActiveForm(null);
  };

  const updateField = (field: string, val: string) => {
    setFormData({ ...formData, [field]: val });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Quick Actions</h2>
      </div>
      
      <div className={styles.quickActionsGrid}>
        <button className={`${styles.actionBtn} ${activeForm === 'whos_next' ? styles.active : ''}`} onClick={() => handleBtnClick("whos_next")} disabled={isLoading}>Who's Next?</button>
        <button className={`${styles.actionBtn} ${activeForm === 'mark_done' ? styles.active : ''}`} onClick={() => handleBtnClick("mark_done")} disabled={isLoading}>Mark Done</button>
        <button className={`${styles.actionBtn} ${activeForm === 'skip_turn' ? styles.active : ''}`} onClick={() => handleBtnClick("skip_turn")} disabled={isLoading}>Skip Turn</button>
        <button className={`${styles.actionBtn} ${activeForm === 'swap_turns' ? styles.active : ''}`} onClick={() => handleBtnClick("swap_turns")} disabled={isLoading}>Swap Turns</button>
        <button className={`${styles.actionBtn} ${activeForm === 'history' ? styles.active : ''}`} onClick={() => handleBtnClick("history")} disabled={isLoading}>History</button>
        <button className={`${styles.actionBtn} ${activeForm === 'rotation' ? styles.active : ''}`} onClick={() => handleBtnClick("rotation")} disabled={isLoading}>Rotation</button>
      </div>

      {activeForm && (
        <form className={styles.inlineForm} onSubmit={handleSubmit}>
          {activeForm === 'mark_done' && (
            <>
              <div className={styles.formField}>
                <label>Name (Req)</label>
                <input required type="text" onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Notes</label>
                <input type="text" onChange={(e) => updateField('notes', e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Date</label>
                <input type="date" onChange={(e) => updateField('date', e.target.value)} />
              </div>
            </>
          )}
          {activeForm === 'skip_turn' && (
            <>
              <div className={styles.formField}>
                <label>Name (Req)</label>
                <input required type="text" onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Reason</label>
                <input type="text" onChange={(e) => updateField('reason', e.target.value)} />
              </div>
            </>
          )}
          {activeForm === 'swap_turns' && (
            <>
              <div className={styles.formField}>
                <label>Name A (Req)</label>
                <input required type="text" onChange={(e) => updateField('name_a', e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Name B (Req)</label>
                <input required type="text" onChange={(e) => updateField('name_b', e.target.value)} />
              </div>
            </>
          )}
          {activeForm === 'history' && (
            <>
              <div className={styles.formField}>
                <label>Limit (default 10)</label>
                <input type="number" defaultValue="10" onChange={(e) => updateField('limit', e.target.value)} />
              </div>
            </>
          )}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveForm(null)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Submit Action</button>
          </div>
        </form>
      )}
    </div>
  );
}
