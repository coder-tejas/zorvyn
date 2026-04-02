# Zorvyn RBAC Service

A Node.js implementation of scalable role-based access control with explicit permissions.

## Highlights

- User lifecycle management (`active`/`inactive`)
- Role assignment (`viewer`, `analyst`, `admin`)
- Permission-based route protection
- Clear separation between authentication and authorization middleware
- Ready to swap in a persistent repository (PostgreSQL/Redis) behind the store interface

## Quick start

```bash
npm install
npm test
npm start
```

## Auth model

For simplicity, requests authenticate with `x-user-id`.
In production, replace this with JWT/session middleware and preserve the same permission guard interface.

## Role behavior

- `viewer`: `dashboard:read`
- `analyst`: viewer + `records:read`, `insights:read`
- `admin`: analyst + `records:write`, `users:manage`, `roles:assign`

## Routes

All routes except `/health` require authentication via `x-user-id`.

- `GET /dashboard`
- `GET /records`
- `POST /records`
- `PATCH /records/:id`
- `GET /users`
- `POST /users`
- `PATCH /users/:id/status`
- `PATCH /users/:id/roles`

## Scalability path

- Replace `src/services/store.js` with PostgreSQL repositories.
- Add Redis for permission caching keyed by user/version.
- Add audit logging and event emission on role/status changes.
