# Frevio — Design Presence & Client Approvals (Figma Plugin)

The official Frevio Figma Plugin bridges your design workflow directly with your client status portal. Track design hours, stream real-time presence, submit frames for client sign-off with 1 click, and pin client revision requests right onto your canvas.

---

## 🚀 Key Features

1. **Live Design Telemetry & Time Tracking**:
   - Streams active presence to your client's portal (e.g. `🟢 Designing UI: Mobile Checkout`).
   - Automatically tracks design time into Frevio timesheets and displays today's billable earnings in real time.
2. **1-Click Frame Deliverable Sign-Off**:
   - Select any frame, group, or component on the Figma canvas.
   - Click **"Send Deliverable to Client"** — Frevio exports retina previews, generates prototype links, creates an approval deliverable in the client portal, and emails the client.
3. **Client Feedback Pins on Canvas**:
   - Pulls recent client comments and approval revision requests from the Frevio portal.
   - Click **"Pin Feedback onto Canvas"** to place color-coded sticky feedback cards right next to your active design.
4. **Interactive Canvas Embed Sync**:
   - 1-Click sync to embed your active Figma board into the client portal's interactive canvas viewer.

---

## 🛠 Installation in Figma

1. Open Figma (Desktop App or Browser).
2. Go to **Plugins** &rarr; **Development** &rarr; **Import plugin from manifest...**
3. Select the `manifest.json` file inside the `figma-plugin/` directory of this repo.
4. Run the plugin from **Plugins** &rarr; **Development** &rarr; **Frevio — Design Presence & Client Approvals**.
5. Paste your API token from Frevio (**Settings** &rarr; **Editor Extension**) and choose your project!

---

## 📦 Development & Build

```bash
# Build TypeScript & prepare dist/
npm --prefix figma-plugin run build

# Watch mode
npm --prefix figma-plugin run watch
```

