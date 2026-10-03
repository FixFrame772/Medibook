# 🏥 MediBook - Healthcare & Doctor Appointment Management System

MediBook is a full-stack doctor appointment booking and patient management platform built with React 19, TypeScript, Vite, Tailwind CSS v4, Express, and Supabase.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun** / **yarn** / **pnpm**
- **Git** installed on your system

### 2. Installation

Clone or download the project, navigate to the folder, and install dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Email Service for OTP verification (Gmail / SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
```

### 4. Running the Development Server

Start the full-stack server (runs Express API + Vite frontend on port 3000):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

- `npm run dev` - Starts the development server with Hot Module Replacement & Express backend API.
- `npm run build` - Builds the optimized production frontend bundle in `dist/`.
- `npm run lint` - Runs TypeScript type checking (`tsc --noEmit`) to ensure zero errors.
- `npm start` - Starts the production Node.js server.
- `npm run clean` - Cleans build output.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Routing**: React Router v7
- **Backend**: Node.js & Express (`server.ts`)
- **Database & Auth**: Supabase (`@supabase/supabase-js`) & JWT/Bcrypt authentication
- **Mailing**: Nodemailer (OTP verification for sign-up & password recovery)

---

## 📤 How to Push to GitHub (Step-by-Step)

Follow these exact steps in your terminal to push this project to your GitHub repository without any errors:

### Step 1: Open Terminal in the project root
Make sure you are in the project folder.

### Step 2: Initialize Git (if not already initialized)
```bash
git init
```

### Step 3: Set default branch to main
```bash
git branch -M main
```

### Step 4: Stage all project files
```bash
git add .
```
*(Notice that `node_modules`, `dist`, and `.env` are automatically ignored by `.gitignore` to keep your push fast and secure)*

### Step 5: Commit your files
```bash
git commit -m "feat: complete MediBook doctor appointment system"
```

### Step 6: Link your GitHub repository
Create a new empty repository on [GitHub](https://github.com/new) (do **not** check "Initialize with README", "Add .gitignore", or "Choose a license" since we already have them).

Copy your repository URL and run:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
```

### Step 7: Push to GitHub
```bash
git push -u origin main
```

*(If prompted, enter your GitHub username and Personal Access Token / sign in via browser).*

---

## 💡 Troubleshooting & Notes

- **Never commit `.env`**: Your `.gitignore` is already configured to keep your secrets private.
- **Lockfile included**: Both `package-lock.json` and `bun.lock` are configured so you or your team won't face dependency conflicts (`ERESOLVE`).
- **TypeScript passing**: Run `npm run lint` anytime before pushing to ensure 100% type safety.
