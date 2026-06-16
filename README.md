# InterviewIQ! 🎯

> **AI-Powered Placement Interview Preparation Platform**

InterviewIQ helps students prepare for company-specific placement interviews by collecting, analyzing, and organizing interview questions using AI.

## 🚀 Features

- **Company Analysis** — Search any company, get AI-generated interview analysis
- **200+ Interview Questions** — Pre-loaded for TCS, Infosys, Amazon, Google, and more
- **AI Integration** — Google Gemini AI generates questions, roadmaps, and summaries
- **Mock Interviews** — Timed mock tests with company-specific questions
- **Charts & Analytics** — Visual analysis of topics, difficulty, and frequency
- **Dark Mode** — Premium dark/light theme with glassmorphism design
- **Bookmarks & Saved Questions** — Track your preparation progress
- **Admin Panel** — Manage users, companies, and view analytics

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| AI | Google Gemini API |
| Scraping | Puppeteer, Cheerio |
| Charts | Chart.js |

## 📁 Project Structure

```
InterviewIQ/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # 8 controllers (MVC)
│   ├── middleware/                # auth, admin, errorHandler
│   ├── models/                   # 8 Mongoose schemas
│   ├── routes/                   # 8 REST API route files
│   ├── services/                 # AI, scraper, cache services
│   ├── utils/                    # seedData, helpers
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables
├── frontend/
│   ├── css/styles.css            # Complete design system
│   ├── js/                       # 9 JavaScript modules
│   └── pages/                    # 10 HTML pages
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas)

### 1. Clone and Install
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/interviewiq
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key  # Optional
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```

### 4. Start the Server
```bash
npm run dev
```

### 5. Open in Browser
```
http://localhost:5000/pages/index.html
```

### Demo Credentials
- **Admin**: admin@interviewiq.com / admin123
- **Student**: student@interviewiq.com / student123

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/companies/search?q=` | Search companies |
| GET | `/api/companies/:slug` | Company details + AI analysis |
| GET | `/api/questions/company/:id` | Company questions |
| POST | `/api/mock-tests/generate` | Generate mock test |
| GET | `/api/dashboard/stats` | User dashboard |
| GET | `/api/admin/stats` | Admin analytics |

## 🗄 Database Collections

- **users** — Authentication, profiles
- **companies** — Company info, hiring process, AI analysis
- **interviewQuestions** — Categorized questions with difficulty
- **interviewExperiences** — Round-wise experiences with AI summaries
- **savedQuestions** — User progress tracking
- **searchHistory** — 90-day TTL auto-cleanup
- **mockTests** — Test scores and answers
- **bookmarks** — Polymorphic bookmarks

## 🎨 UI Pages

1. Landing Page — Features, stats, popular companies
2. Login/Register — Glassmorphism auth cards
3. Dashboard — Stats, recent searches, quick actions
4. Search Page — Autocomplete, company grids
5. Analysis Page — Tabs: Overview, Questions, Experiences, Roadmap, Analytics
6. Mock Interview — Timer, progress, results review
7. Saved Questions — Status tracking, bookmarks
8. Profile — Edit profile, change password
9. Admin Panel — User management, company CRUD, analytics

## 📜 License

MIT
