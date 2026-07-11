# LearnSphere SaaS Learning Management System

LearnSphere is a premium, production-quality Single Page SaaS Learning Management System (LMS) designed with a breathtaking dark/light theme, interactive SVG charts, fully autograded quiz assessments, and comprehensive instructor-grading dashboards.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Vanilla CSS variable mapping
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form, Zod

### Backend
- **Runtime**: Node.js, Express, TypeScript, tsx
- **Database ORM**: Prisma ORM
- **Database Engine**: Neon Serverless PostgreSQL
- **Security**: JWT Authentication, bcrypt password hashing
- **File Uploads**: Local Multipart uploads (abstracted storage service structure)

---

## 🛠️ Project Architecture

```
LearnSphere/
├── frontend/             # Single Page Application client
│   ├── src/
│   │   ├── components/   # UI components (Button, Input, Logo, Avatar, Progress)
│   │   ├── context/      # React contexts (AuthContext, ThemeContext)
│   │   ├── hooks/        # Hooks (useAuth, useSEO)
│   │   ├── layouts/      # Dashboard and public view frames
│   │   ├── pages/        # Views (LandingPage, ExplorePage, LessonViewer)
│   │   └── services/     # Axios client instances
├── backend/              # Node.js/Express server
│   ├── src/
│   │   ├── controllers/  # Route handler callbacks
│   │   ├── middleware/   # JWT verification guards
│   │   ├── prisma/       # Prisma schema and seed scripts
│   │   └── routes/       # API endpoints
```

---

## 🔐 Seeding & Demo Accounts

Pre-load the Neon cloud database with complete mock curriculum files:
```bash
cd backend
npm run seed
```

Once seeded, the following three main accounts can be accessed using their respective credentials:

- **Admin Account**:
  - Email: `admin@learnsphere.com`
  - Password: `Admin@123`
- **Instructor Account**:
  - Email: `instructor@learnsphere.com`
  - Password: `Instructor@123`
- **Student Account**:
  - Email: `student@learnsphere.com`
  - Password: `Student@123`

---

## 🚀 Getting Started

### 1. Clone & Configure Environments
Copy backend configuration settings:
```bash
cd backend
# Create a .env file and add:
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_SECRET="your-jwt-auth-token-hash-key"
PORT=5000
```

### 2. Startup Server & Client
Launch the backend:
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Launch the frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
