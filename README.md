# Mini Kanban Task Manager (Assessment Submission)

This project is a complete full-stack **React + Node.js/Express** Kanban app built to satisfy the given assessment brief.

## 1) Objective implemented

The application implements a two-column task board:

- **To Do**
- **Done**

Users can:

- create tasks
- view all tasks grouped by status
- move tasks between columns (To Do ↔ Done)
- delete tasks

It also satisfies all required technical constraints:

- frontend: React (Vite)
- backend: Node.js + Express
- data model: in-memory array (no database)

## 2) Tech stack

- Backend: `backend/server.js` (Express)
- Frontend: `frontend/src/App.jsx` (React)
- Styling/components: Tailwind CSS + shadcn/ui style components
- E2E validation: Playwright (`frontend/e2e/kanban.spec.js`)
- Unit/integration API validation: Jest + Supertest (`backend/tests/tasks.test.js`)

## 3) Backend implementation details

### Data structure

Each task uses:

```json
{
  "id": number,
  "title": "string",
  "status": "todo" | "done"
}
```

Storage is an in-memory array (`tasks`) so data resets on server restart.

### Endpoints implemented

#### `GET /tasks`

- Returns all tasks
- Method: `GET`
- Response: `200` + JSON array

#### `POST /tasks`

- Method: `POST`
- Body:
  ```json
  { "title": "Buy milk" }
  ```
- Behavior:
  - trims the title
  - creates a new task with default `status: "todo"`
- Validation:
  - title must be non-empty string
- Response:
  - success: `201` + created task JSON
  - error: `400` + `{ "error": "Title is required and must be a non-empty string." }`

#### `PUT /tasks/:id`

- Method: `PUT`
- Body:
  ```json
  { "status": "done" }
  ```
- Validation:
  - `status` must be `"todo"` or `"done"`
  - `:id` must be numeric
- Response:
  - success: `200` + updated task JSON
  - invalid status: `400`
  - task not found: `404`
  - invalid id: `400`

#### `DELETE /tasks/:id`

- Method: `DELETE`
- Deletes matching task by id
- Response:
  - success: `204` (no body)
  - task not found: `404`
  - invalid id: `400`

### Backend requirements check

- proper status codes: implemented (`200`, `201`, `204`, `400`, `404`)
- JSON responses: implemented on all routes/bodies
- validations:
  - title non-empty for create
  - status is either `"todo"` or `"done"` for updates

## 4) Frontend implementation details

The UI is in `frontend/src/App.jsx` and uses:

- `useState` for tasks, input, loading, error, and drag state
- `useEffect` for initial task fetch
- `fetch` for API calls

Features implemented:

- **View tasks**
  - fetches from backend on initial render
  - derives:
    - `todoTasks` (`status === 'todo'`)
    - `doneTasks` (`status === 'done'`)
- **Add task**
  - input + button
  - new tasks appear in **To Do**
- **Move task**
  - button controls:
    - `Mark as Done` (todo → done)
    - `Move to To Do` (done → todo)
  - drag-and-drop support:
    - drag task card
    - drop into the opposite column
- **Delete task**
  - delete button on each card

UI states:

- loading indicator during initial fetch
- error message display for API failures

## 5) Run instructions

From repo root:

```bash
npm run dev:all
```

This starts:

- backend on `http://localhost:4000`
- frontend on `http://127.0.0.1:4173`

Optional overrides:

```bash
FRONTEND_HOST=127.0.0.1 FRONTEND_PORT=4173 npm run dev:all
```

Manual (separate terminals):

```bash
cd "backend"
npm run dev
```

```bash
cd "frontend"
npm run dev
```

## 6) Test commands

Backend API tests:

```bash
cd backend
npm test
```

E2E UI tests:

```bash
cd frontend
npm run test:e2e
```

## 7) Assessment checklist

- [x] API contract implemented exactly as specified
- [x] In-memory task storage, no DB
- [x] Proper status codes and JSON responses
- [x] Validation for title and status
- [x] React hooks (`useState`, `useEffect`) used
- [x] Two-column Kanban UI (To Do / Done)
- [x] Create + move + delete task flows
- [x] Drag-and-drop support for moving tasks
- [x] Loading and error states shown
- [x] Clean, minimal, black-and-white style
