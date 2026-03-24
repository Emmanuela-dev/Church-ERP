-- ============================================================
-- Church ERP — Supabase Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Church Info ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_info (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  motto       text,
  vision      text,
  mission     text,
  address     text,
  city        text,
  country     text,
  phone       text,
  email       text,
  website     text,
  founding_year integer,
  pastor      text,
  created_at  timestamptz DEFAULT now()
);

-- ── 2. Church Services ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   uuid REFERENCES church_info(id) ON DELETE CASCADE,
  name        text NOT NULL,
  day         text,
  time        text,
  order_of_service text[],
  created_at  timestamptz DEFAULT now()
);

-- ── 3. Families ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ── 4. Members ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  gender            text,
  date_of_birth     date,
  phone             text,
  email             text,
  address           text,
  occupation        text,
  role              text DEFAULT 'Member',
  membership_status text DEFAULT 'Active',
  membership_date   date,
  family_id         uuid REFERENCES families(id) ON DELETE SET NULL,
  family_role       text,  -- Head | Spouse | Child
  created_at        timestamptz DEFAULT now()
);

-- ── 5. Activities ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text,
  date        date,
  time        text,
  venue       text,
  organizer   text,
  status      text DEFAULT 'Upcoming',
  created_at  timestamptz DEFAULT now()
);

-- ── 6. Finance ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL,   -- Tithe | Offering | Donation | Pledge
  amount       numeric NOT NULL,
  currency     text DEFAULT 'GHS',
  contributor_name text,
  date         date DEFAULT CURRENT_DATE,
  recorded_by  text,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- ── Disable RLS (dev/hackathon mode) ─────────────────────────
ALTER TABLE church_info      DISABLE ROW LEVEL SECURITY;
ALTER TABLE church_services   DISABLE ROW LEVEL SECURITY;
ALTER TABLE families          DISABLE ROW LEVEL SECURITY;
ALTER TABLE members           DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities        DISABLE ROW LEVEL SECURITY;
ALTER TABLE finance           DISABLE ROW LEVEL SECURITY;
