# DevSync — Collaborative Engineering Workspace
DEPLOYED LINK:https://github.com/adhvithikomireddy/devsync.git
**Tagline:** *Build Together. Code Together. Ship Together.*

DevSync is a full-stack real-time collaborative development platform that empowers software engineering teams to write, run, debug, and communicate in a single shared workspace.

---

## 🌟 Core Features

- **Real-Time Monaco Code Editor**: Sub-millisecond synchronized typing, syntax highlighting, bracket colorization, multi-tab file management.
- **Collaborator Presence & Remote Cursors**: Live coloured cursor carets, floating author nametags, and active selection overlays.
- **"Who's Working On What?" & Active Files**: Real-time awareness of what files teammates are currently editing or viewing.
- **Who Edited What? (Attribution Engine)**: Automatic line-level attribution tracking, line change summaries (+/-), and side-by-side / inline visual diff inspection.
- **Isolated Multi-Language Sandbox Runner**: Execute JavaScript, Python, C, C++, and Java in resource-isolated processes with execution time tracking and stdout/stderr capture.
- **Crystal-Clear WebRTC Audio/Video & Screen Sharing**: Native browser mesh audio/video calls and display sharing directly in workspace.
- **Context-Aware AI Pair Programmer**: Explain code, debug runtime errors, optimize performance, and generate unit tests / docstrings.
- **Project-Wide Team Chat with Code Deep Links**: Share file and line range references directly in chat with 1-click editor navigation.
- **Role-Based Access Control (RBAC)**: Strict permission enforcement on Owner, Admin, Editor, and Viewer roles.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python 3 / GCC / G++ / Java (optional, for code execution sandboxes)

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/devsync
JWT_SECRET=devsync_jwt_super_secret_key_2026_collaborative_workspace_token
CLIENT_URL=http://localhost:5173

# Optional Gemini API key for external AI models (built-in intelligent contextual engine is active by default)
GEMINI_API_KEY=
```
> **Note on MongoDB**: If a local or remote MongoDB instance is not detected, DevSync automatically boots an in-memory MongoDB engine with zero configuration required.

### 3. Run the Application
To run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually:
- **Backend**: `npm run server` (Runs on `http://localhost:5000`)
- **Frontend**: `npm run client` (Runs on `http://localhost:5173`)

---

## 🧪 Testing Real-Time Collaboration Between Two Users

1. Open `http://localhost:5173` in a standard browser window (User A) and click **Get Started** to sign up (e.g. `adhvithi@example.com`).
2. Create a new project (e.g., *Realtime Service* with the JavaScript template).
3. Open an Incognito window or a second browser (User B) and sign up (e.g. `rahul@example.com`).
4. In User A's workspace, open **Team > Members**, click **Invite**, and enter `rahul@example.com` with role **Editor**.
5. User B navigates to `/dashboard` and opens the shared workspace.
6. Open the same file (e.g. `index.js` or `src/auth.js`) in both windows:
   - Type in User A's window — User B sees live changes with sub-millisecond latency.
   - Move cursors or select code — User B sees User A's cursor caret and nametag badge.
   - Click **Run** to execute code in the cloud sandbox and inspect the terminal output.
   - Click **Meeting** to test WebRTC audio, video, and screen sharing.
   - Open **Changes** in the bottom console to inspect line attribution diffs.
