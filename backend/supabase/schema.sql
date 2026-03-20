-- Church Management schema for Supabase Postgres
-- Run in Supabase SQL Editor.

create table if not exists church (
  id bigserial primary key,
  name varchar(200) not null,
  motto varchar(300),
  vision text,
  mission text,
  address varchar(300),
  city varchar(100),
  country varchar(100),
  phone varchar(20),
  email varchar(120),
  website varchar(200),
  founded_year integer,
  pastor varchar(150)
);

create table if not exists service (
  id bigserial primary key,
  church_id bigint not null references church(id) on delete cascade,
  name varchar(150) not null,
  day varchar(20),
  time varchar(20),
  description text
);

create table if not exists service_order (
  id bigserial primary key,
  service_id bigint not null references service(id) on delete cascade,
  position integer not null,
  item varchar(200) not null
);

create table if not exists family (
  id bigserial primary key,
  family_name varchar(150) not null
);

create table if not exists member (
  id bigserial primary key,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  gender varchar(10),
  date_of_birth date,
  phone varchar(20),
  email varchar(120),
  address varchar(300),
  occupation varchar(150),
  membership_date date,
  membership_status varchar(20) default 'Active',
  role varchar(50) default 'Member',
  photo_url varchar(300),
  family_id bigint references family(id) on delete set null,
  family_role varchar(20)
);

create table if not exists activity (
  id bigserial primary key,
  title varchar(200) not null,
  description text,
  category varchar(100),
  date date not null,
  start_time varchar(20),
  end_time varchar(20),
  venue varchar(200),
  organizer varchar(150),
  status varchar(20) default 'Upcoming',
  created_at timestamptz default now()
);

create table if not exists finance_record (
  id bigserial primary key,
  member_id bigint references member(id) on delete set null,
  type varchar(50) not null,
  amount numeric(12,2) not null,
  currency varchar(10) default 'USD',
  date date not null,
  description varchar(300),
  recorded_by varchar(150),
  created_at timestamptz default now()
);

create index if not exists idx_member_family_id on member(family_id);
create index if not exists idx_service_church_id on service(church_id);
create index if not exists idx_service_order_service_id on service_order(service_id);
create index if not exists idx_finance_record_member_id on finance_record(member_id);
create index if not exists idx_finance_record_date on finance_record(date);
create index if not exists idx_activity_date on activity(date);
