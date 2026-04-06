<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

# FreelanceOS — AI-Powered Freelancer Operating System

> A production-ready, full-stack SaaS platform that consolidates client management, project tracking, task planning, invoicing, proposal management, and AI-powered automation into a single, premium dark-mode interface.

**FreelanceOS** replaces the 5+ tools freelancers typically juggle — CRM, project management, invoicing, proposal writing, and client communication — with one unified system enhanced by AI.

---

## Key Highlights

- **5 AI Tools** powered by Google Gemini with structured output parsing
- **BYOK Architecture** — Users bring their own API key (encrypted with AES-256-CBC at rest)
- **Server-side PDF Generation** for invoices and proposals
- **Real-time Analytics Dashboard** with revenue charts and pipeline tracking
- **Premium Dark-Mode UI** with custom component library
- **Enterprise-grade Security** — JWT auth, Helmet, rate limiting, bcrypt

---

## Project Structure

```
freelance-os-mern/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile, API key mgmt
│   │   ├── clientController.js      # Client CRUD + notes + pipeline stats
│   │   ├── projectController.js     # Project CRUD + requirement versioning
│   │   ├── taskController.js        # Task CRUD + kanban reorder + bulk create
│   │   ├── invoiceController.js     # Invoice CRUD + PDF export + stats
│   │   ├── aiController.js          # 5 AI endpoints + proposal CRUD
│   │   └── dashboardController.js   # Aggregated analytics
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + role-based authorize
│   │   ├── errorHandler.js          # Global async error handler
│   │   └── validate.js              # express-validator middleware
│   ├── models/
│   │   ├── User.js                  # User schema + AES-256 key encryption
│   │   ├── Client.js                # Client + notes + sales pipeline
│   │   ├── Project.js               # Project + structured requirements
│   │   ├── Task.js                  # Task + kanban position + auto-complete
│   │   ├── Proposal.js              # AI-generated proposal sections
│   │   ├── Invoice.js               # Invoice + line items + auto-totals
│   │   └── AILog.js                 # AI usage tracking per user
│   ├── routes/
│   │   ├── auth.js                  # Auth + API key routes
│   │   ├── clients.js               # Client routes
│   │   └── index.js                 # Project/Task/Invoice/AI/Proposal routes
│   ├── services/
│   │   ├── aiService.js             # Centralized Gemini AI service (BYOK)
│   │   └── pdfService.js            # PDFKit generation engine
│   ├── utils/
│   │   └── seeder.js                # Demo data seeder
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Server entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── index.js             # Axios client + all API modules
        ├── components/
        │   ├── ui/
        │   │   └── index.jsx        # Custom component library
        │   └── layout/
        │       └── Sidebar.jsx      # App navigation sidebar
        ├── layouts/
        │   └── AppLayout.jsx        # Protected app shell
        ├── pages/
        │   ├── Dashboard.jsx        # Revenue charts, pipeline, deadlines
        │   ├── Clients.jsx          # Client grid with CRM pipeline
        │   ├── ClientDetail.jsx     # Client profile + notes + projects
        │   ├── Projects.jsx         # Project cards with progress bars
        │   ├── Tasks.jsx            # Kanban drag-and-drop board
        │   ├── Invoices.jsx         # Invoice list + create + PDF export
        │   ├── Proposals.jsx        # Proposal management + win-rate
        │   ├── Settings.jsx         # Profile, business info, API key mgmt
        │   ├── AIPages.jsx          # All 5 AI tool interfaces
        │   └── Auth.jsx             # Login + Register
        └── store/
            ├── authStore.js         # Zustand auth (persisted)
            └── index.js             # All feature stores
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone and Install

```bash
git clone https://github.com/DarshRajput87/Freelancer-Operating-System-.git
cd Freelancer-Operating-System-

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/freelance_os

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Google Gemini AI (fallback key — users can add their own in Settings)
GEMINI_API_KEY=your-gemini-api-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

Creates a demo account: `demo@freelanceos.com` / `password123` with sample clients, projects, tasks, and invoices.

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Features Overview

### Dashboard
Real-time analytics with monthly revenue charts, client pipeline visualization, active project progress, conversion rates, and upcoming deadline alerts.

### Client CRM
Full sales pipeline (Lead - Contacted - Proposal Sent - Won - Lost), tagging, notes timeline, source tracking (Upwork, LinkedIn, Referral, etc.), and full-text search.

### Project Management
Status lifecycle (Planning - In Progress - Review - Completed), budget and deadline tracking, tech stack tags, and AI-powered structured requirement analysis with version history.

### Kanban Task Board
Drag-and-drop task management with 4 columns (Todo, In Progress, Review, Done), priority levels, time estimation vs actuals, and AI-generated task breakdowns.

### Invoicing
Line item builder with auto-calculated subtotals, tax, and discounts. Auto-incrementing invoice numbers, status workflow (Draft - Sent - Paid - Overdue), and PDF export.

### Proposal Management
AI-generated proposals with section-level content (Intro, Scope, Timeline, Pricing, Terms), status lifecycle with win-rate analytics, detail viewer, and PDF export.

### Settings and BYOK
Users add their own Gemini API key — encrypted with AES-256-CBC at rest. All AI billing goes to their Google Cloud account. Profile customization, business info, and currency/timezone settings.

---

## AI Tools (Powered by Google Gemini)

| Tool | Description |
|------|-------------|
| **Requirement Analyzer** | Extracts features, identifies gaps, flags risks, suggests architecture, and estimates hours |
| **Proposal Generator** | Creates 8-section professional proposals with auto-save and PDF export |
| **Freelance Proposal Writer** | Generates 150-250 word Upwork/Fiverr-optimized proposals with tone selection |
| **Task Breakdown** | Produces 10-20 prioritized tasks with hour estimates, auto-saved to Kanban board |
| **Reply Assistant** | Drafts tone-aware client replies (Professional, Friendly, Confident, Concise) |

### BYOK (Bring Your Own Key) Architecture

```
User enters API key  -->  AES-256-CBC encryption  -->  MongoDB storage
                                                            |
AI request triggered  -->  Decrypt user key  -->  Per-request Gemini client  -->  Response
                                                            |
                                 No user key?  -->  Fallback to server env key
```

All AI calls are logged to the `AILog` collection with token usage, duration, and input/output for analytics.

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile and settings |
| PUT | `/api/auth/api-key` | Save/update Gemini API key |
| DELETE | `/api/auth/api-key` | Remove API key |
| POST | `/api/auth/logout` | Logout |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List clients (filter by status/search) |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/:id` | Get client details |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Archive client |
| POST | `/api/clients/:id/notes` | Add note |
| GET | `/api/clients/stats` | Pipeline statistics |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + tasks |
| PUT | `/api/projects/:id` | Update (saves requirement history) |
| DELETE | `/api/projects/:id` | Archive project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List + kanban grouped |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/bulk` | Bulk create (from AI) |
| PUT | `/api/tasks/reorder` | Drag-drop reorder |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update / mark paid |
| DELETE | `/api/invoices/:id` | Delete |
| GET | `/api/invoices/:id/pdf` | Download PDF |
| GET | `/api/invoices/stats` | Financial summary |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proposals` | List all proposals |
| GET | `/api/proposals/:id` | Get proposal details |
| PUT | `/api/proposals/:id` | Update proposal |
| DELETE | `/api/proposals/:id` | Delete proposal |
| GET | `/api/proposals/:id/pdf` | Download PDF |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Analyze requirements into structured JSON |
| POST | `/api/ai/proposal` | Generate full proposal + auto-save |
| POST | `/api/ai/freelance-proposal` | Upwork/Fiverr-style short proposal |
| POST | `/api/ai/tasks` | Task breakdown + auto-save to board |
| POST | `/api/ai/reply` | Client reply generator |
| GET | `/api/ai/logs` | AI usage history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full analytics payload |

---

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT with Bearer tokens + HTTP-only cookies |
| Password Hashing | bcrypt with 12 salt rounds |
| API Key Storage | AES-256-CBC encryption at rest |
| HTTP Headers | Helmet.js security headers |
| Rate Limiting | 200 req/15min (API), 20 req/min (AI endpoints) |
| CORS | Origin whitelist from CLIENT_URL env var |
| Input Validation | express-validator on all auth endpoints |
| User Isolation | All DB queries scoped to req.user.id |

---

## Production Deployment

### Backend (Railway / Render / EC2)
```bash
NODE_ENV=production
# Set all env vars on hosting platform
npm start
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL if backend is on a different domain
```

### Database
Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production. Update `MONGO_URI` to your Atlas connection string.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand |
| **Routing** | React Router v6 |
| **Drag and Drop** | @hello-pangea/dnd |
| **Icons** | Lucide React |
| **Dates** | date-fns |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT + bcryptjs |
| **AI** | Google Gemini AI (BYOK model) |
| **PDF** | PDFKit |
| **Validation** | express-validator |
| **Security** | Helmet, cors, express-rate-limit |

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with care by <a href="https://github.com/DarshRajput87">Darsh Rajput</a>
</p>