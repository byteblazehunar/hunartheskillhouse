# HUNAR — The Skill House (Web Application & Institute ERP)

A full-stack institute portal, learning management system (LMS), and educational ERP built with **React 19**, **Node.js/Express**, and **MongoDB**.

---

## 🚀 Key Features

* **Public Web Application:**
  * Modern, responsive design with Framer Motion animations & dark/light theme switching.
  * Course catalog with syllabus breakdown, tools covered, and mentor directory.
  * Lead capture inquiries, admission booking, and student project showcase.

* **Unified Portals:**
  * **Admin Control Center:** Complete 15-module ERP (Students, Staff, Courses, Batches, Timetables, Fee Records & Invoicing, Announcements, Attendance, Assignments, Audit Logs).
  * **Student Portal:** Personalized dashboard, timetable, fee receipts, and learning resources.
  * **Staff Portal:** Batch attendance, class schedules, and student management.

* **Enterprise Backend:**
  * RESTful Express API with JWT authentication and bcrypt password hashing.
  * MongoDB-backed storage for authenticated users and LMS/ERP records. MongoDB must be available for the backend to start; database errors are reported rather than hidden by stale JSON fallback data.
  * Role-based access control (`admin`, `teacher`, `student`).

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Framer Motion, Lucide React, Lenis Smooth Scroll
* **Backend:** Node.js, Express 5, Mongoose, JWT, Bcrypt
* **Database:** MongoDB (`mongodb://localhost:27017/hunar_db`)

---

## 📦 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) or a MongoDB Atlas connection URI

### 2. Installation
Open a terminal in the project directory:
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and replace all placeholders with private values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hunar_db
JWT_SECRET=replace-with-a-unique-random-secret
FRONTEND_URL=https://hunar.courses/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-account@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM="Hunar The Skill House <your-gmail-account@gmail.com>"
INQUIRY_NOTIFICATION_EMAIL=admissions@hunar.courses
INITIAL_ADMIN_NAME=Your Name
INITIAL_ADMIN_EMAIL=you@example.com
INITIAL_ADMIN_PASSWORD=replace-with-a-unique-admin-password
INVITATION_EXPIRY_HOURS=72
NODE_ENV=production
ALLOWED_ORIGINS=https://hunar.courses,https://www.hunar.courses
API_BASE_URL=https://hunar.courses/api
FRONTEND_URL=https://hunar.courses/
```
Set `JWT_SECRET` and the one-time initial admin password to unique private values. The initial admin is created only when the connected MongoDB database has no admin account. Create other staff and student accounts from the authenticated admin panel; the application must use MongoDB-backed live data only. Local JSON files and demo records are disabled in production and are not used as a fallback. Keep `.env` private; it is excluded from Git.

For MongoDB Atlas, use the URI from **Connect → Drivers** and URL-encode reserved characters in the username or password (`@` becomes `%40`). Confirm the deployment's outbound IP access is allowed in Atlas Network Access and the database user has access to the selected database. MongoDB connection errors stop startup instead of silently switching to stale JSON data.

Website enquiry, contact, and enrollment submissions are stored in the MongoDB `leads` collection. Set `INQUIRY_NOTIFICATION_EMAIL` to the inbox that should receive each new inquiry. SMTP settings send inquiry notifications and student/staff account activation or password-reset links; for Gmail, enable 2-Step Verification and create a Google App Password for `SMTP_PASS` (do not use the normal Gmail password). Set these variables in the deployment's private environment settings as well as local `.env`. `FRONTEND_URL` is the public site root used to create working activation links. Without valid SMTP settings, submissions are still stored and the API/UI reports that email delivery failed; account invites can still be copied and shared by an administrator.

API authentication, password-reset, account-activation, and public inquiry endpoints have per-IP request limits; JSON request bodies are capped at 32 KB, and Helmet sets standard security headers. The current rate-limit store is in-memory per server process, so deployments that scale across multiple serverless instances should add a shared rate-limit store for aggregate enforcement. The existing fee workflow records payments entered by authorized staff; it does not charge cards or verify external gateway transactions. Unmatched frontend routes show a 404 page and unknown API routes return JSON 404 responses.

The public website provides route-specific titles, descriptions, canonical URLs, social preview tags, and structured data. `npm run build` prerenders these tags into HTML for public pages, course details, and articles; the generated sitemap includes the current course and article slugs. `public/robots.txt` excludes portal paths from crawling, and `public/llms.txt` summarizes public institute information for AI-assisted discovery. Robots directives are not access control: LMS and operations data must be accessed through authenticated API routes with the required role permissions. Search placement is determined by search engines and cannot be guaranteed by metadata alone.

### 4. Running the Application
Start the development server (the Vite plugin mounts the API on the same origin):
```bash
npm run dev
```
Open your browser at **http://localhost:5173**

For production, build the frontend and run the Express server, which serves both the API and the built React app:
```bash
npm run build
npm start
```
The API health check is available at `/api/health`; it returns HTTP 200 only when MongoDB is connected, and HTTP 503 while the database is unavailable. The backend uses the same origin as the frontend, so page routes and API requests work together without a separate proxy.

### Deploying to Vercel
Import the GitHub repository into Vercel and add the following Environment Variables for Production (and Preview if needed): `MONGODB_URI`, `JWT_SECRET`, `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, `ALLOWED_ORIGINS`, `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `INQUIRY_NOTIFICATION_EMAIL`. Set `ALLOWED_ORIGINS` to `https://hunar.courses,https://www.hunar.courses`. Never put real credentials in GitHub or `vercel.json`. Vercel serves the built React app and routes `/api/*` to the Express function; frontend routes such as `/portal/admin`, `/portal/student`, and `/portal/staff` are served by the SPA fallback.

The MongoDB URI must be the Atlas connection string with the database name (for example, `/hunar_db`) and URL-encoded credentials. If a database password has been exposed, rotate it in Atlas before setting the replacement as a Vercel Environment Variable.

---

## Resetting the Admin Password
If you ever need to reset the admin password from the command line:
```bash
npm run reset-password
```
Run this in an interactive terminal and enter the new password at the hidden prompts; do not put passwords in shell commands, scripts, or chat.

---

## 🏗️ Production Build

To build the optimized static bundle for deployment:
```bash
npm run build
```
The compiled assets will be created in the `dist/` directory, ready to deploy to any modern web hosting service.
