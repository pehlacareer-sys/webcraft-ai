# 🌿 WebCraft AI - AI-Powered Website Builder

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase)

**WebCraft AI** is a modern, AI-powered website builder that lets you create production-ready websites using natural language descriptions. No coding required!

## ✨ Features

### 🤖 AI-Powered Generation
- Generate complete websites from natural language prompts
- Multi-provider AI support (Z.AI, OpenRouter, Groq) with automatic fallback
- Session-based conversation context for better code generation

### 🎨 Beautiful Design System
- Clean white theme with emerald/teal accent colors
- Shadcn/ui components for consistent UI
- Fully responsive design for all devices
- Smooth animations with Framer Motion

### 🔐 Authentication & Security
- Supabase authentication with email/password
- OAuth providers (Google, GitHub)
- Role-based access control (User/Admin)
- Protected routes and API endpoints

### 📊 Admin Dashboard
- API key management (CRUD operations)
- Usage statistics and monitoring
- Multi-provider API pool management
- Session-based API locking

### 🚀 Pages Included
- **Landing Page** - Hero section with chat box, testimonials, stats
- **Dashboard** - Project management, stats cards, user profile
- **Builder** - Dark theme editor with device previews
- **Templates** - Template gallery with categories
- **Pricing** - Three-tier pricing with FAQ
- **Settings** - User profile, notifications, security
- **Documentation** - API guides and code examples

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM (SQLite dev / Supabase PostgreSQL prod) |
| Auth | Supabase Auth |
| State | Zustand |
| Animations | Framer Motion |
| AI APIs | Z.AI, OpenRouter, Groq |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/webcraft-ai.git
cd webcraft-ai

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Set up database
bun run db:push

# Start development server
bun run dev
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# AI API Keys
ZAI_API_KEY=your_zai_api_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

## 🎯 Usage

1. **Visit the landing page** at `http://localhost:3000`
2. **Sign up** for a new account or sign in with Google/GitHub
3. **Describe your website** in the chat box on the landing page
4. **View generated code** in the builder with live preview
5. **Manage projects** from your dashboard

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── dashboard/         # User dashboard
│   ├── builder/           # Website builder
│   ├── admin/             # Admin panel
│   ├── templates/         # Template gallery
│   ├── pricing/           # Pricing page
│   ├── settings/          # User settings
│   ├── docs/              # Documentation
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── api-pool.ts        # API key pool manager
│   └── session-manager.ts # Session management
├── hooks/
│   └── useAuth.ts         # Authentication hook
└── store/
    └── index.ts           # Zustand store
```

## 🎨 Color Theme

The application uses a calming green theme:

- **Primary Accent**: `#6a8d73` (Emerald green)
- **Gradients**: Emerald to Teal
- **Background**: Clean white with subtle patterns
- **Dark Mode**: Builder page uses dark theme

## 📜 Scripts

```bash
bun run dev        # Start development server
bun run build      # Build for production
bun run lint       # Run ESLint
bun run db:push    # Push database schema
bun run db:generate # Generate Prisma client
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js and AI**
