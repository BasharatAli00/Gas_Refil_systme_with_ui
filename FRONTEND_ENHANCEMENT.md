# Gas Tracker — Frontend Enhancement Spec

> **Scope:** UI/UX only. No backend, MCP tools, or API logic touched.  
> **Aesthetic direction:** Dark industrial-utility — like a control room dashboard. Think oil-rig gauges, neon flame accents, heavy monospace numbers, tactile buttons.  
> **Tone:** Serious utility with a single playful personality (the flame 🔥).

---

## 1. Design System — CSS Variables (replace current)

Edit `dashboard.module.css` — replace the `:root` block:

```css
:root {
  /* Core palette */
  --bg:          #0a0b0d;
  --surface:     #111318;
  --surface-2:   #181c24;
  --border:      #1f2535;
  --border-glow: #ff6b2240;

  /* Accent — flame orange */
  --accent:      #ff6b22;
  --accent-dim:  #ff6b2233;
  --accent-text: #ffb347;

  /* Status */
  --green:  #22c55e;
  --yellow: #eab308;
  --red:    #ef4444;
  --muted:  #4b5563;

  /* Typography */
  --font-display: 'Orbitron', monospace;   /* import from Google Fonts */
  --font-body:    'IBM Plex Mono', monospace;
  --font-ui:      'Inter', sans-serif;

  /* Spacing scale */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 14px;

  /* Shadows */
  --shadow-flame: 0 0 20px #ff6b2233, 0 0 60px #ff6b2211;
  --shadow-card:  0 4px 24px rgba(0,0,0,0.6);
}
```

Add to `<head>` in `layout.tsx` (or `_document.tsx`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
```

---

## 2. Global Layout (`page.tsx`)

### Before (conceptual):
Simple stacked components, plain dark background.

### After — Grid layout:
```tsx
// page.tsx JSX structure
<div className={styles.shell}>
  <header className={styles.header}>
    <span className={styles.logo}>⛽ GAS TRACKER</span>
    <StatusIndicator />
  </header>

  <main className={styles.grid}>
    <section className={styles.colLeft}>
      <TurnBanner />
      <QuickActions />
    </section>
    <section className={styles.colRight}>
      <RotationTable />
    </section>
    <section className={styles.colFull}>
      <ChatHistory />
      <ChatInput />
    </section>
  </main>
</div>
```

### CSS for layout:
```css
.shell {
  min-height: 100vh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, #ff6b2209 0%, transparent 60%),
    repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 40px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  font-family: var(--font-body);
  color: #e2e8f0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0a0b0de0;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  color: var(--accent);
  text-shadow: var(--shadow-flame);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-template-rows: auto auto;
  gap: 20px;
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.colLeft  { grid-column: 1; display: flex; flex-direction: column; gap: 16px; }
.colRight { grid-column: 2; }
.colFull  { grid-column: 1 / -1; }

/* Mobile */
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; padding: 16px; }
  .colRight, .colFull { grid-column: 1; }
}
```

---

## 3. `TurnBanner` Component

The most important component — make it feel like a live alert panel.

```css
.turnBanner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--r-lg);
  padding: 24px 28px;
  box-shadow: var(--shadow-card), inset 0 1px 0 #ffffff08;
  position: relative;
  overflow: hidden;
}

/* Ambient glow behind the name */
.turnBanner::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, #ff6b2220 0%, transparent 70%);
  pointer-events: none;
}

.bannerLabel {
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.bannerName {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--accent-text);
  text-shadow: 0 0 30px #ff6b2266;
  line-height: 1;
  margin-bottom: 8px;
  /* Animate in on data load */
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.bannerSub {
  font-size: 0.8rem;
  color: var(--muted);
  font-family: var(--font-ui);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* "YOUR TURN" badge */
.myTurnBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  padding: 4px 10px;
  border-radius: 4px;
  margin-top: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--border-glow); }
  50%       { box-shadow: 0 0 0 6px transparent; }
}
```

---

## 4. `RotationTable` Component

Make it look like a leaderboard / mission roster.

```css
.rotationCard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.rotationTitle {
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  color: var(--muted);
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
}

.rotationRow {
  display: grid;
  grid-template-columns: 28px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
  font-size: 0.85rem;
}

.rotationRow:last-child { border-bottom: none; }
.rotationRow:hover { background: var(--surface-2); }

/* Highlight the current turn row */
.rotationRow.active {
  background: var(--accent-dim);
  border-left: 2px solid var(--accent);
}

.rowIndex {
  font-family: var(--font-display);
  font-size: 0.7rem;
  color: var(--muted);
  text-align: center;
}

.rowName {
  font-family: var(--font-ui);
  font-weight: 500;
  color: #e2e8f0;
}
.rotationRow.active .rowName { color: var(--accent-text); }

.rowCount {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--muted);
}

.rowStatus {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--muted);
}
.rowStatus.current { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
```

---

## 5. `QuickActions` Component

Big tactile buttons — feel like physical controls.

```css
.quickActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.actionBtn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-ui);
  text-align: left;
  position: relative;
  overflow: hidden;
}

.actionBtn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.actionBtn:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px var(--border-glow);
}

.actionBtn:active {
  transform: translateY(0px) scale(0.98);
  border-color: var(--accent);
}

/* Loading spinner overlay */
.actionBtn.loading { pointer-events: none; opacity: 0.6; }

.btnIcon {
  font-size: 1.2rem;
  line-height: 1;
}

.btnLabel {
  font-size: 0.75rem;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.2;
}

.btnSub {
  font-size: 0.65rem;
  color: var(--muted);
}

/* Primary action (mark done) spans full width and glows */
.actionBtn.primary {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-color: var(--accent);
  background: var(--accent-dim);
}
.actionBtn.primary .btnLabel { font-size: 0.85rem; color: var(--accent-text); }
.actionBtn.primary:hover { box-shadow: var(--shadow-flame); }
```

In `QuickActions.tsx`, wire up buttons like:
```tsx
<button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => sendChat("mark my turn done")}>
  <span className={styles.btnIcon}>🔥</span>
  <div>
    <div className={styles.btnLabel}>Mark My Turn Done</div>
    <div className={styles.btnSub}>Record refill & advance rotation</div>
  </div>
</button>
<button className={styles.actionBtn} onClick={() => sendChat("skip my turn")}>
  <span className={styles.btnIcon}>⏭</span>
  <div className={styles.btnLabel}>Skip Turn</div>
  <div className={styles.btnSub}>Pass to next</div>
</button>
<button className={styles.actionBtn} onClick={() => sendChat("show history")}>
  <span className={styles.btnIcon}>📋</span>
  <div className={styles.btnLabel}>History</div>
  <div className={styles.btnSub}>Past refills</div>
</button>
<button className={styles.actionBtn} onClick={() => sendChat("show rotation")}>
  <span className={styles.btnIcon}>🔄</span>
  <div className={styles.btnLabel}>Rotation</div>
  <div className={styles.btnSub}>Full order</div>
</button>
```

---

## 6. `ChatHistory` Component

Terminal-style message log.

```css
.chatHistory {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.chatHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--muted);
  text-transform: uppercase;
}

/* Blinking cursor in header to signal live */
.chatHeader::after {
  content: '▊';
  color: var(--accent);
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

.chatScroll {
  max-height: 320px;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* Messages */
.msgUser {
  align-self: flex-end;
  background: var(--accent-dim);
  border: 1px solid var(--border-glow);
  border-radius: var(--r-md) var(--r-md) 2px var(--r-md);
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--accent-text);
  max-width: 75%;
  font-family: var(--font-ui);
  animation: fadeInRight 0.25s ease both;
}

.msgBot {
  align-self: flex-start;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-md) var(--r-md) var(--r-md) 2px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #e2e8f0;
  max-width: 80%;
  font-family: var(--font-ui);
  animation: fadeInLeft 0.25s ease both;
}

/* Tool used badge inside bot message */
.toolBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 7px;
  margin-bottom: 6px;
}

@keyframes fadeInRight { from { opacity:0; transform:translateX(8px) } }
@keyframes fadeInLeft  { from { opacity:0; transform:translateX(-8px) } }
```

---

## 7. `ChatInput` Component

Floating command bar feel.

```css
.chatInputWrap {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  /* Attach to chat history box bottom */
}

.chatInput {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #e2e8f0;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.chatInput::placeholder { color: var(--muted); }
.chatInput:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.sendBtn {
  background: var(--accent);
  border: none;
  border-radius: var(--r-md);
  width: 42px; height: 42px;
  display: grid; place-items: center;
  cursor: pointer;
  color: #000;
  font-size: 1rem;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.sendBtn:hover { background: var(--accent-text); transform: scale(1.05); }
.sendBtn:active { transform: scale(0.95); }
.sendBtn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
```

---

## 8. `StatusIndicator` Component

Replace the plain text indicator with a live-feeling pulse.

```css
.statusIndicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--muted);
}

.statusDot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--muted);
  transition: background 0.3s ease;
}
.statusDot.online {
  background: var(--green);
  box-shadow: 0 0 0 0 #22c55e66;
  animation: ripple 2s ease-out infinite;
}
.statusDot.error { background: var(--red); }

@keyframes ripple {
  0%   { box-shadow: 0 0 0 0 #22c55e66; }
  70%  { box-shadow: 0 0 0 8px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
```

```tsx
// StatusIndicator.tsx
export function StatusIndicator({ status }: { status: 'online'|'offline'|'loading' }) {
  const label = { online: 'BACKEND LIVE', offline: 'OFFLINE', loading: 'CONNECTING...' }
  return (
    <div className={styles.statusIndicator}>
      <div className={`${styles.statusDot} ${status === 'online' ? styles.online : status === 'error' ? styles.error : ''}`} />
      <span>{label[status]}</span>
    </div>
  )
}
```

---

## 9. Loading Skeleton (add to all data-dependent components)

```css
.skeleton {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--r-sm);
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeletonLine { height: 14px; margin-bottom: 8px; }
.skeletonLine.short { width: 40%; }
.skeletonLine.long  { width: 80%; }
```

In TSX use like: `{loading ? <div className={`${styles.skeleton} ${styles.skeletonLine}`} /> : <ActualContent />}`

---

## 10. Empty & Error States

```css
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 8px;
  color: var(--muted);
  font-size: 0.8rem;
  font-family: var(--font-ui);
}

.emptyIcon { font-size: 2rem; opacity: 0.4; }

.errorBanner {
  background: #ef444420;
  border: 1px solid #ef4444;
  border-radius: var(--r-md);
  padding: 10px 14px;
  font-size: 0.8rem;
  color: #fca5a5;
  font-family: var(--font-ui);
}
```

---

## 11. `page.tsx` — `fetchInitialData` UX improvement

Ensure both API calls resolve before revealing the grid (prevents layout flash):

```tsx
const [ready, setReady] = useState(false)

useEffect(() => {
  Promise.all([fetchTurn(), fetchRotation()])
    .finally(() => setReady(true))
}, [])

// In JSX:
{!ready
  ? <div className={styles.globalSkeleton}>/* skeleton grid */</div>
  : <main className={styles.grid}>...</main>
}
```

---

## 12. Quick Win — `globals.css` resets

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; }

body {
  background: #0a0b0d;
  color: #e2e8f0;
  -webkit-font-smoothing: antialiased;
}

/* Kill default button styles */
button { cursor: pointer; font: inherit; background: none; border: none; }

/* Remove ugly blue autofill */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 100px var(--surface) inset;
  -webkit-text-fill-color: #e2e8f0;
}
```

---

## Implementation Priority (to save API tokens)

Do these in order — each gives big visual payoff per minute of work:

| # | Task | Impact | Time |
|---|------|--------|------|
| 1 | CSS variables + grid background + fonts | 🔥🔥🔥 | 10 min |
| 2 | `TurnBanner` glow + animation | 🔥🔥🔥 | 10 min |
| 3 | `QuickActions` tactile buttons | 🔥🔥 | 8 min |
| 4 | `RotationTable` row styling | 🔥🔥 | 8 min |
| 5 | `ChatHistory` terminal style | 🔥🔥 | 10 min |
| 6 | `StatusIndicator` pulse dot | 🔥 | 5 min |
| 7 | Skeleton loading states | 🔥 | 10 min |

---

## File Checklist

```
gastracker-ui/frontend/
├── styles/
│   ├── dashboard.module.css   ← bulk of changes (sections 1-10)
│   └── globals.css            ← section 12
├── app/
│   ├── layout.tsx             ← add Google Fonts <link>
│   └── page.tsx               ← grid layout + fetchInitialData (sections 2, 11)
└── components/
    ├── TurnBanner.tsx          ← section 3
    ├── RotationTable.tsx       ← section 4
    ├── QuickActions.tsx        ← section 5
    ├── ChatHistory.tsx         ← section 6
    ├── ChatInput.tsx           ← section 7
    └── StatusIndicator.tsx     ← section 8
```

> **No backend files, no MCP tools, no API routes were modified.**
