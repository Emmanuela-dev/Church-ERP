# Church Management System

A full-stack church management system built with React, Flask, and PostgreSQL.

Supabase is now supported as the primary managed PostgreSQL option.

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Configure `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/church_db
# or use Supabase instead of DATABASE_URL
# SUPABASE_DB_URL=postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres?sslmode=require
SECRET_KEY=your-secret-key
```

Run backend:
```bash
python run.py
```

### Supabase Setup
1. Create a new Supabase project.
2. Open SQL Editor in Supabase and run [backend/supabase/schema.sql](backend/supabase/schema.sql).
3. Copy your Supabase Postgres connection string.
4. In [backend/.env](backend/.env), set `SUPABASE_DB_URL` (or `DATABASE_URL`) to that connection string.
5. Keep `SECRET_KEY` set.
6. Start backend with `python run.py`.

Use [backend/.env.example](backend/.env.example) as reference.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- Church Info: name, location, vision, mission, pastor, services & order of service
- Members: individual members + family units (head, spouse, children)
- Activities: events with categories, dates, status tracking
- Finance: tithe, offering, donations, pledges with charts and summaries

## API Endpoints

| Module     | Endpoint                        | Methods          |
|------------|---------------------------------|------------------|
| Church     | /api/church/                    | GET, POST        |
| Church     | /api/church/:id                 | PUT              |
| Church     | /api/church/:id/services        | POST             |
| Church     | /api/church/services/:id        | PUT, DELETE      |
| Members    | /api/members/                   | GET, POST        |
| Members    | /api/members/:id                | GET, PUT, DELETE |
| Members    | /api/members/families           | GET, POST        |
| Members    | /api/members/families/:id       | GET, DELETE      |
| Activities | /api/activities/                | GET, POST        |
| Activities | /api/activities/:id             | GET, PUT, DELETE |
| Finance    | /api/finance/                   | GET, POST        |
| Finance    | /api/finance/:id                | GET, PUT, DELETE |
| Finance    | /api/finance/summary            | GET              |
