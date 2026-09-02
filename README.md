# Developer Project Management System

A full-stack project and task management application for teams. DPMS provides project workspaces, task tracking, a list and Kanban view, role-based access control, comments and mentions, activity history, notifications, and dashboard reporting.

## What It Includes

- Email/password registration and login with bcrypt password hashing.
- Seven-day server-side sessions stored in PostgreSQL.
- Projects with `ACTIVE`, `COMPLETED`, and `ARCHIVED` statuses.
- Tasks with `TODO`, `IN_PROGRESS`, and `DONE` workflow states.
- Task priorities: `LOW`, `MEDIUM`, `HIGH`, and `URGENT`.
- Task search, project and assignee filters, sorting, and Kanban status changes.
- Project membership management and user directory.
- Task comments, comment editing/deletion, and user mentions.
- Activity timelines for projects and tasks.
- Read and unread notification views, including mark-all-as-read.
- Dashboard statistics, charts, productivity metrics, deadline filters, and recent activity.
- Health endpoint for deployment checks.

## Tech Stack

- Next.js `16.3.3` with the App Router
- React `19.2.8` and TypeScript
- Tailwind CSS `4`
- PostgreSQL `15+` (the Docker setup uses PostgreSQL `16`)
- Prisma Next `8.0.0-rc` contract-first ORM
- Zod `4` for request validation
- bcryptjs for password hashing
- Recharts for dashboard visualizations

## Requirements

- Node.js `22` LTS is recommended and used by the Docker image.
- npm (the repository includes `package-lock.json`).
- PostgreSQL `15` or newer, unless you use Docker Compose.

## Local Setup

1. Install dependencies:

	```bash
	npm ci
	```

2. Create `.env` from `.env.example` and set `DATABASE_URL`:

	```env
	DATABASE_URL="postgresql://user:password@localhost:5432/dpms"
	```

3. Generate the Prisma contract artifacts and create the database schema:

	```bash
	npm run contract:emit
	npx prisma db init
	```

	`db init` is the Prisma Next command used by this project to create the tables described by `src/prisma/contract.prisma`. Check the current database state with:

	```bash
	npx prisma migration status
	```

4. Start the development server:

	```bash
	npm run dev
	```

	Open [http://localhost:3000](http://localhost:3000). Register an account at `/register`, then sign in at `/login`.

## Docker Compose

Docker Compose starts PostgreSQL and the production Next.js container:

```bash
docker compose up --build
```

The application is available at [http://localhost:3001](http://localhost:3001), and PostgreSQL is exposed on port `5432` with these development credentials:

```text
Database: dpms
User:     postgres
Password: postgres
Host:     localhost
Port:     5432
```

The Compose app container does not run schema initialization automatically. After the database is healthy, initialize the schema from the project directory with a local `.env` pointing to the Compose database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dpms"
```

```bash
npx prisma db init
```

Stop the stack with `docker compose down`. Add `-v` only when you intentionally want to remove the `dpms_pgdata` database volume.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run contract:emit` | Emit `src/prisma/contract.json` and `src/prisma/contract.d.ts` from the contract |
| `npx prisma db init` | Create/update the database schema through Prisma Next |
| `npx prisma migration status` | Show migration status |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Default Next.js landing page |
| `/register` | Create an account |
| `/login` | Sign in |
| `/dashboard` | Project, task, team, and productivity reporting |
| `/projects` | Browse and manage projects |
| `/projects/:id` | View a project and its tasks |
| `/tasks` | Search, filter, sort, and view tasks as a list or Kanban board |
| `/tasks/new` | Create a task |
| `/tasks/:id` | View and collaborate on a task |
| `/users` | Browse users |

Dashboard, project, task, and user pages require authentication and redirect unauthenticated visitors to `/login`.

## API Reference

All application API responses use this shape on success:

```json
{ "success": true, "data": {} }
```

Errors use `success: false` and an `error` message; validation errors may also include `details`.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Health check |
| `/api/auth/register` | `POST` | Register a user |
| `/api/auth/login` | `POST` | Authenticate and set `session_token` |
| `/api/auth/logout` | `POST` | Log out the current session |
| `/api/users` | `GET` | List users |
| `/api/projects` | `GET`, `POST` | List and create projects |
| `/api/projects/:id` | `GET`, `PUT`, `DELETE` | Read, update, and delete a project |
| `/api/projects/:id/activities` | `GET` | List project activity |
| `/api/tasks` | `GET`, `POST` | List and create tasks |
| `/api/tasks/:id` | `GET`, `PUT`, `PATCH`, `DELETE` | Read, update, move, assign, prioritize, and delete a task |
| `/api/tasks/:id/activities` | `GET` | List task activity |
| `/api/tasks/:id/comments` | `GET`, `POST` | List and add task comments |
| `/api/tasks/:id/labels` | `GET`, `POST`, `DELETE` | Manage task labels |
| `/api/comments` | `GET` | List comments |
| `/api/comments/:id` | `PUT`, `DELETE` | Edit or delete a comment |
| `/api/comments/:id/mentions` | `GET`, `POST` | Read and create comment mentions |
| `/api/project-members` | `GET`, `POST`, `DELETE` | Manage project membership |
| `/api/labels` | `GET`, `POST` | List and create labels |
| `/api/activities` | `GET`, `POST` | Read and record activities |
| `/api/notifications` | `GET`, `POST` | Read and create notifications |
| `/api/notifications/unread` | `GET` | List unread notifications |
| `/api/notifications/read-all` | `PATCH` | Mark all notifications as read |
| `/api/notifications/:id` | `PATCH`, `DELETE` | Update or delete a notification |

Task listing supports `search`, `projectId`, `assigneeId`, `sortBy` (`title`, `priority`, `status`, `dueDate`), and `sortOrder` (`asc`, `desc`) query parameters.

## Authentication and Permissions

API routes accept either an `Authorization: Bearer <token>` header or the `session_token` cookie set by the login endpoint. Sessions last seven days. Passwords are never stored directly; registration hashes them with bcrypt.

| Role | Capabilities |
| --- | --- |
| `ADMIN` | Full project, membership, task, comment, reporting, and user-management permissions |
| `MANAGER` | Create/update projects, manage members, create/update/delete tasks, manage comments, and view reports |
| `STAFF` | Create/update tasks and create/update comments |

Authorization is enforced in the API layer with `401 Unauthorized` for missing/invalid sessions and `403 Forbidden` for insufficient permissions.

## Project Structure

```text
app/                    Next.js pages and API route handlers
src/auth/               Roles, permissions, session guards, and route protection
src/components/         Dashboard, Kanban, task, and notification UI
src/repositories/       Database access and domain queries
src/services/           Authentication, session, and API services
src/validations/        Zod request schemas
src/prisma/             Prisma Next contract, generated artifacts, and database client
migrations/             Prisma migration references and snapshots
public/                 Static assets
```

The source of truth for the database is [`src/prisma/contract.prisma`](src/prisma/contract.prisma). The generated `contract.json` and `contract.d.ts` should be regenerated with `npm run contract:emit` whenever the contract changes.

## Validation Before Opening a PR

Run the project checks locally:

```bash
npm run lint
npm run build
```

There is currently no automated test script in `package.json`; manually verify registration, login/logout, protected-route redirects, project and task CRUD, Kanban status changes, comments, notifications, and role restrictions when changing those areas.

## Further Documentation

- [Prisma Next project notes](prisma-next.md)
- [Prisma data contract](src/prisma/contract.prisma)
- [Environment template](.env.example)
- [Docker Compose configuration](docker-compose.yml)
