# Notely — MERN Note-Taking App

A full-stack note-taking application built with the MERN stack (MongoDB, Express, React, Node.js). Users can register, sign in, and manage personal notes with pinning, trash/restore, search, filtering, sorting, import/export, and a customizable profile — all behind authenticated routes.

## Features

### Authentication
- Register / login / logout with JWT-based auth stored in an HTTP-only cookie
- Protected routes — signed-out users are redirected to login
- Session persistence across page reloads

### Notes
- Create, edit, and delete notes with a rich text editor
- Pin/unpin important notes
- Soft-delete to Trash, with restore or permanent delete
- Search notes by title/content
- Filter and sort (newest, oldest, title A–Z, title Z–A)
- Import notes from file, export notes (Text / Excel)

### Profile & Settings
- Profile modal (avatar, bio, contact info, quick note stats) accessible from the header
- Dedicated Settings page with tabs for Profile, Notes overview, and Account
- Avatar upload, bio, phone, and location fields
- Logout with confirmation dialog and error handling

### UI/UX
- Responsive layout with a collapsible mobile sidebar drawer
- Dark-themed dashboard with gradient accents
- Inline confirmation dialogs for destructive actions

## Tech Stack

**Frontend:** React, React Router, Tailwind CSS, lucide-react, Vite
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
**Testing:** Jest (frontend), Mocha + Chai + Supertest + nyc (backend)
**Code Quality:** SonarQube (Community Edition) — see the [SonarQube Analysis](#sonarqube-analysis) section below

## Project Structure

```
cohort-9-mern-6825-syeda/
├── backend/                 # Express API, MongoDB models, auth, notes controllers
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── tests/
├── frontend/
│   └── Note-Taking-App/     # React app (Vite)
│       └── src/
│           ├── components/
│           ├── context/
│           ├── hooks/
│           ├── pages/
│           └── tests/
├── docs/
│   └── sonarqube-report/    # Static analysis screenshots
└── sonar-project.properties
```

## Getting Started

### Prerequisites
- Node.js (v18 recommended)
- MongoDB (local or Atlas connection string)

### Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB URI and JWT secret
npm start
```

### Frontend setup
```bash
cd frontend/Note-Taking-App
npm install
cp .env.example .env   # point this at your backend API URL
npm run dev
```

The frontend runs on `http://localhost:5173` by default; the backend port is set in your `.env`.

## Running Tests

**Frontend:**
```bash
cd frontend/Note-Taking-App
npm test -- --coverage
```

**Backend:**
```bash
cd backend
npx nyc --reporter=lcov --reporter=text mocha tests/**/*.test.js --timeout 10000 --exit
```

---

## SonarQube Analysis

This project has been analyzed with **SonarQube Community Edition**, run locally via Docker. Full screenshots are in [`docs/sonarqube-report`](./docs/sonarqube-report).

### How the scan was run

1. **SonarQube server** started locally via Docker:
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
   ```
2. **Test coverage** generated separately for each side of the app:
   - Frontend (Jest, built-in lcov reporter): `npm test -- --coverage`
   - Backend (Mocha + nyc, since the backend uses Mocha rather than Jest):
     ```bash
     npx nyc --reporter=lcov --reporter=text mocha tests/**/*.test.js --timeout 10000 --exit
     ```
3. **Scan executed** via the Dockerized SonarScanner CLI, using [`sonar-project.properties`](./sonar-project.properties) at the repo root:
   ```bash
   docker run --rm \
     -e SONAR_HOST_URL="http://host.docker.internal:9000" \
     -e SONAR_TOKEN="<project token>" \
     -v "${PWD}:/usr/src" \
     sonarsource/sonar-scanner-cli
   ```

### Results summary

| Metric | Result |
|---|---|
| Quality Gate | **Passed** |
| Bugs | 0 (Rating: A) |
| Vulnerabilities | 0 (Rating: A) |
| Code Smells | 24 (Maintainability Rating: A) |
| Coverage | 13.3% |
| Duplications | 1.4% |
| Technical Debt | ~1h 9min |

### Screenshots

| File | Description |
|---|---|
| `01-overview-quality-gate(a/b).png` | Project overview — Quality Gate status, bugs, vulnerabilities, code smells |
| `02-measures(a/b).png` | Detailed coverage and duplication metrics |
| `03-issues-list-1/2/3.png` | Full list of flagged code smells (24 total, no bugs or vulnerabilities) |

### Notes on the findings

All 24 flagged issues are **Code Smells** — maintainability suggestions, not defects. Common patterns flagged:
- Redundant `await` on values that aren't Promises
- Using array index as a React `key` prop
- Nested ternary expressions that could be simplified
- A couple of functions with cognitive complexity slightly above the recommended threshold

None of these are blocking; the project's Maintainability Rating remains **A** despite them. Coverage (13.3%) reflects that automated tests currently focus on authentication flows (`AuthContext`, `ProtectedRoute`, backend `auth.js`) rather than the full app surface.

## License

This project was built as part of a MERN stack cohort assignment.
