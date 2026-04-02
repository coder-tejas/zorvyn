# Financial Records API (Feature 1)

This iteration implements **Financial Records Management** using:

- **Node.js + Express** for HTTP APIs
- **Prisma** for persistence access
- **SQLite** as the current database (via Prisma)
- **Redis** for caching list/detail record responses

> Note: SQLite is used for simplicity in this phase. Prisma makes it straightforward to move to PostgreSQL later.

## Implemented Scope

### Financial record fields
Each financial record supports:

- `amount`
- `type` (`income` or `expense`)
- `category`
- `recordDate`
- `notes` (optional)

### Supported operations

- Create record
- View records
- View record by id
- Update record
- Delete record
- Filter records by:
  - `type`
  - `category`
  - `startDate` / `endDate`
  - plus pagination (`page`, `pageSize`)

## Endpoints

Base path: `/api/financial-records`

- `POST /` create record
- `GET /` list/filter records
- `GET /:id` get one record
- `PATCH /:id` update record
- `DELETE /:id` delete record

## Validation and errors

- Input validation is handled with **Zod**.
- Validation errors return `400` with issue details.
- Not found operations return `404`.
- Unexpected errors return `500`.

## Environment

Create a `.env` file:

```bash
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"
PORT=3000
```

`REDIS_URL` is optional. If omitted, the service runs without cache.

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm start
```
