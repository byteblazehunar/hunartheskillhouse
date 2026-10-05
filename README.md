# HUNAR — The Skill House (Web Application & Institute ERP)

A full-stack institute portal, learning management system (LMS), and educational ERP built with **React 19**, **Node.js/Express**, and **MongoDB** (with atomic offline JSON dual-write persistence).

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
  * Dual-layer storage: Native MongoDB with automatic fallback to JSON persistence.
  * Role-based access control (`admin`, `teacher`, `student`).

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Framer Motion, Lucide React, Lenis Smooth Scroll
* **Backend:** Node.js, Express 5, Mongoose, JWT, Bcrypt
* **Database:** MongoDB (`mongodb://localhost:27017/hunar_db`) + JSON fallback

---

## 📦 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (Optional - runs with local JSON database if MongoDB is offline)

### 2. Installation
Open a terminal in the project directory:
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and replace all placeholders with private values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hunar_db
JWT_SECRET=replace-with-a-unique-random-secret
INITIAL_ADMIN_PASSWORD=replace-with-a-unique-admin-password
INITIAL_TEACHER_PASSWORD=replace-with-a-unique-teacher-password
INITIAL_RECEPTIONIST_PASSWORD=replace-with-a-unique-receptionist-password
INITIAL_ACCOUNTANT_PASSWORD=replace-with-a-unique-accountant-password
INVITATION_EXPIRY_HOURS=72
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```
Set `JWT_SECRET` to a unique random value and configure a unique initial password for each account before starting a fresh installation. Keep `.env` private; it is excluded from Git.

### 4. Running the Application
Start the development server:
```bash
npm run dev
```
Open your browser at **http://localhost:5173**

---

## Resetting the Admin Password
If you ever need to reset the admin password from the command line:
```bash
npm run reset-password your_new_password
```

---

## 🏗️ Production Build

To build the optimized static bundle for deployment:
```bash
npm run build
```
The compiled assets will be created in the `dist/` directory, ready to deploy to any modern web hosting service.
