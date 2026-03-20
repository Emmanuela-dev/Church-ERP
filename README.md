# ⛪ Church Management System

A full-stack web application designed to help churches efficiently manage their congregation, activities, and finances — all in one place.

---

## 📖 About

The Church Management System (ChurchMS) is built to simplify the day-to-day administrative work of a church. Whether you're tracking member attendance, organizing events, recording tithes and offerings, or maintaining church information, ChurchMS provides a clean and intuitive interface to handle it all.

It is built with a modern tech stack:
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Python Flask (REST API)
- **Database:** PostgreSQL

---

## ✨ Features

### 🏛️ Church Information
- Store and display the church's name, motto, vision, and mission statement
- Record the church's location (address, city, country), contact details, website, and founding year
- Track the lead pastor's name
- Define multiple church services (e.g. Sunday Service, Bible Study, Prayer Meeting)
- Set the **order of service** for each service (e.g. Opening Prayer → Worship → Sermon → Offering → Benediction)

### 👥 Member Management
- Add and manage individual church members with full personal details:
  - Name, gender, date of birth, phone, email, address, occupation
  - Church role (Member, Deacon, Elder, Pastor, Usher, Choir, etc.)
  - Membership status (Active, Inactive, Transferred)
  - Membership date
- Organize members into **family units**:
  - Assign a **Head of Family**, **Spouse**, and **Children**
  - View the full family profile in one place
- Search members by name

### 📅 Activities & Events
- Create and manage church activities and events
- Categorize events (Outreach, Conference, Youth, Prayer, Worship, Bible Study, etc.)
- Track event details: date, time, venue, organizer, and description
- Monitor event status: **Upcoming**, **Ongoing**, **Completed**, or **Cancelled**
- Filter activities by status

### 💰 Finance Management
- Record all financial contributions:
  - **Tithe** — regular 10% contributions from members
  - **Offering** — general weekly/service offerings
  - **Donations** — special one-time gifts
  - **Pledges** — committed future contributions
- Link contributions to specific members or record as anonymous
- Track the date, currency, amount, and who recorded the entry
- View a **finance summary** with totals per contribution type
- Visual charts (bar chart and pie chart) for financial overview

### 📊 Dashboard
- At-a-glance overview of the entire church:
  - Total members, families, and activities
  - Church name, motto, pastor, and location
  - Finance summary chart

