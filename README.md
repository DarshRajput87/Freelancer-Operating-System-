# FreelanceOS — AI-Powered Freelancer Operating System

A production-ready SaaS application built with the MERN stack + AI. Manage clients, projects, tasks, invoices, and leverage AI to analyze requirements, generate proposals, break down tasks, and draft client replies.

---

## 🏗️ Project Structure

```
freelance-os/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── clientController.js      # Client CRUD + notes + stats
│   │   ├── projectController.js     # Project CRUD + requirement history
│   │   ├── taskController.js        # Task CRUD + kanban reorder + bulk create
│   │   ├── invoiceController.js     # Invoice CRUD + PDF export
│   │   ├── aiController.js          # All 4 AI endpoints + proposals
│   │   └── dashboardController.js   # Aggregated dashboard stats
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + authorize
│   │   ├── errorHandler.js          # Global error handler
│   │   └── validate.js              # express-validator middleware
│   ├── models/
│   │   ├── User.js                  # User schema + JWT methods
│   │   ├── Client.js                # Client + notes + pipeline
│   │   ├── Project.js               # Project + requirement versions
│   │   ├── Task.js                  # Task + kanban position
│   │   ├── Proposal.js              # AI-generated proposals
│   │   ├── Invoice.js               # Invoice + line items + PDF
│   │   └── AILog.js                 # AI usage tracking
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── clients.js               # Client routes
│   │   └── index.js                 # Project/Task/Invoice/AI/Dashboard routes
│   ├── services/
│   │   ├── aiService.js             # Centralized OpenAI service layer
│   │   └── pdfService.js            # PDF generation (proposals + invoices)
│   ├── utils/
│   │   └── seeder.js                # Demo data seeder
│   ├── app.js                       # Express app config
│   └── server.js                    # Server entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── index.js             # Axios client + all API modules
        ├── components/
        │   ├── ui/
        │   │   └── index.jsx        # Button, Input, Modal, Badge, Card, etc.
        │   └── layout/
        │       └── Sidebar.jsx      # App sidebar navigation
        ├── layouts/
        │   └── AppLayout.jsx        # Protected app shell
        ├── pages/
        │   ├── Dashboard.jsx        # Revenue, pipeline, stats
        │   ├── Clients.jsx          # Client grid with CRM pipeline
        │   ├── ClientDetail.jsx     # Single client + notes + projects
        │   ├── Projects.jsx         # Project cards with progress
        │   ├── Tasks.jsx            # Kanban drag-and-drop board
        │   ├── Invoices.jsx         # Invoice list + PDF download
        │   ├── AIPages.jsx          # All 4 AI tool pages
        │   └── Auth.jsx             # Login + Register
        └── store/
            ├── authStore.js         # Zustand auth store (persisted)
            └── index.js             # Client/Project/Task/Invoice/Dashboard stores
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API Key

---

### 1. Clone & Install

```bash
# Clone the repo
git clone <repo-url>
cd freelance-os

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

```bash
# In backend/
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/freelance_os
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
```

---

### 3. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

This creates:
- **Demo user**: `demo@freelanceos.com` / `password123`
- 4 clients with different pipeline stages
- 3 projects (1 active, 1 planning, 1 completed)
- 10 tasks in Kanban board
- 4 invoices (paid, pending, overdue)

---

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update profile |
| POST | /api/auth/logout | Logout |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | List clients (filter by status/search) |
| POST | /api/clients | Create client |
| GET | /api/clients/:id | Get client details |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Archive client |
| POST | /api/clients/:id/notes | Add note |
| GET | /api/clients/stats | Pipeline statistics |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project + tasks |
| PUT | /api/projects/:id | Update (saves req. history) |
| DELETE | /api/projects/:id | Archive project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List + kanban grouped |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/bulk | Bulk create (AI) |
| PUT | /api/tasks/reorder | Drag-drop reorder |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/invoices | List invoices |
| POST | /api/invoices | Create invoice |
| PUT | /api/invoices/:id | Update / mark paid |
| DELETE | /api/invoices/:id | Delete |
| GET | /api/invoices/:id/pdf | Download PDF |
| GET | /api/invoices/stats | Financial summary |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/analyze | Analyze requirements |
| POST | /api/ai/proposal | Generate proposal |
| POST | /api/ai/tasks | Task breakdown + auto-save |
| POST | /api/ai/reply | Client reply generator |
| GET | /api/ai/logs | AI usage history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Full dashboard stats |

---

## 🔐 Security Features
- JWT authentication with httpOnly cookies
- Helmet.js for HTTP security headers
- Rate limiting (200 req/15min global, 20 req/min for AI)
- CORS with origin whitelist
- Input validation with express-validator
- Password hashing with bcrypt (salt rounds: 12)
- User isolation — all queries scoped to `req.user.id`

---

## 🤖 AI Features

All AI features use GPT-4o with prompt engineering optimized for freelance workflows:

1. **Requirement Analyzer** — Extracts features, identifies gaps, flags risks, suggests architecture
2. **Proposal Generator** — 8-section professional proposal with PDF export
3. **Task Breakdown** — 10-20 tasks with hours, priorities, phases, auto-saved to Kanban
4. **Reply Assistant** — Tone-controlled client replies (professional/friendly/assertive/concise)

All AI calls are logged to the `AILog` collection with token usage, duration, and input/output.

---

## 🚢 Production Deployment

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
# Set VITE_API_URL if backend is on different domain
```

### MongoDB
Use MongoDB Atlas for production. Update `MONGO_URI` to Atlas connection string.

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Routing | React Router v6 |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| AI | OpenAI GPT-4o |
| PDF | PDFKit |
| Validation | express-validator |
| Security | Helmet, cors, express-rate-limit |
#   F r e e l a n c e r - O p e r a t i n g - S y s t e m -  
 