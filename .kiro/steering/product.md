# Job Genie — Product Overview

Job Genie is a mobile-first gig worker platform (Android app via Capacitor) that connects blue-collar workers with short-term industrial jobs (logistics, warehousing, delivery, security, etc.) across Indian cities.

## User Roles

- **Worker** — finds gigs, applies, checks in/out, tracks earnings, accesses benefits
- **Admin** (Genie Partner) — posts jobs, manages applications, tracks attendance, views reports
- **Super Admin** — platform-wide oversight, fraud detection, AI configuration

## Core Features

- Job discovery and application with AI-powered matching
- Geofenced attendance check-in/check-out with biometric proof
- XP/gamification system (levels, badges, skill tree, leaderboard)
- AI chatbot ("Genie AI" for workers, "Genie Ops" for admins) powered by Gemini
- Voice assistant for hands-free job search and check-in
- Earnings tracking, planner, and instant withdrawal
- Micro-loans (Genie Credit Line) and worker benefits/insurance
- Multi-language support: English + 9 Indian languages (Hindi, Tamil, Malayalam, Bengali, Telugu, Kannada, Marathi, Gujarati, Odia)
- RTL support for Urdu

## Key Business Concepts

- **Trust Score** — worker reliability metric (0–100), increases on job completion (+2), decreases on absence (−15)
- **XP Levels** — Beginner → Apprentice → Operator → Specialist → Expert → Lead → Master → Elite → Grandmaster → Genie Prime
- **MockFirestore** — currently forced on (`isMockEnabled()` returns `true`) for all Firestore operations; real Firestore is bypassed
- **Geofencing** — 500m radius check enforced on attendance check-in
