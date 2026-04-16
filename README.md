# Database

An in-memory database written in C++ with a SQL-like query language, HTTP API, and JSON persistence. Comes with an Electron desktop app for running queries.

## Stack

- **Backend** — C++ (HTTP server on `localhost:4000`, JSON persistence)
- **Frontend** — Electron + React + TypeScript

## Query Language

```sql
CREATE TABLE users (id, name, email)
INSERT INTO users (id, name) VALUES ('1', 'alice')
SELECT * FROM users
SELECT * FROM users WHERE id = '1'
UPDATE users SET name = 'bob' WHERE id = '1'
DELETE FROM users WHERE id = '1'
```

## Running

**Backend** — open the Visual Studio solution in `/Database` and build. The server starts on `http://localhost:4000`.

**Frontend** — from `/Database-Manager`:
```bash
npm install
npm run dev
```

## Project Structure

```
/Database           — C++ source (db_main, table, row, query parser)
/Database-Manager   — Electron desktop app
```
