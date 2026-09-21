# Frevio Extension for VS Code & Antigravity

> **Automatic coding activity & real-time presence sync for freelancers and clients.**

Connect your code editor directly with [Frevio](https://frevio.cloud). When you open and code in a client project, Frevio automatically logs your time and broadcasts a subtle, reassuring presence badge on your client's private status page (`/p/[slug]`).

---

## Features

- **⚡ Frictionless Time Tracking**: Automatically tracks continuous coding sessions in your active workspace and saves them to `/time` with `[VS Code]` attribution.
- **🟢 Live Client Presence**: Clients see a real-time pulse on their project status page: `● Currently working on this (Focus: Frontend & UI)` or `Last active 20m ago`.
- **🛡️ 100% Private by Design**: **Never transmits code, files, or keystrokes.** Only sends high-level heartbeats (`"Frontend"`, `"Backend"`, `"Testing"`) based on file extensions.
- **⏸️ Smart Idle Protection**: Pauses automatically after 5 minutes of inactivity so you never log ghost time.
- **🔒 Freelancer Control**: Turn off client-facing presence per project anytime in Project Settings.

---

## Quick Setup

### 1. Get your Extension Token
1. Go to your Frevio account: **Settings** > **Editor Extension**.
2. Click **Generate Extension Token** and copy the key (`frev_live_...`).

### 2. Configure the Extension in VS Code / Antigravity
1. Open the Command Palette (`Cmd+Shift+P` on Mac or `Ctrl+Shift+P` on Windows/Linux).
2. Type and run:
   ```text
   Frevio: Set API Token
   ```
3. Paste your token and press Enter. It is stored securely in your OS credential store.

### 3. Link your Workspace to a Project
1. In your project's repository, open the Command Palette.
2. Run:
   ```text
   Frevio: Link Workspace to Project
   ```
3. Select your active client project from the dropdown.
4. That's it! A `.frevio.json` file is saved in your workspace root.

---

## Commands

| Command | Action |
|---|---|
| `Frevio: Set API Token` | Sets or updates your Frevio authentication token. |
| `Frevio: Link Workspace to Project` | Links the current workspace to a Frevio project. |
| `Frevio: Unlink Workspace from Project` | Disconnects the workspace from tracking. |
| `Frevio: Pause / Resume Tracking` | Temporarily pause tracking for this session. |
| `Frevio: Open Project in Browser` | Opens the project dashboard on Frevio in your browser. |

---

## Configuration Settings

You can customize the extension via VS Code Settings (`settings.json`):

```json
{
  "frevio.apiBaseUrl": "https://www.frevio.cloud",
  "frevio.heartbeatIntervalSeconds": 120,
  "frevio.idleTimeoutMinutes": 5
}
```

---

## Developing & Building from Source

To compile the extension:

```bash
cd extension
npm install
npm run build
```
