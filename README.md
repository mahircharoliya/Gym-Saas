# Gym Management SaaS

A comprehensive gym management platform built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

**Option A: Use Neon (Recommended - Free)**
1. Go to https://neon.tech and create account
2. Create a new project
3. Copy the connection string

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL
2. Create database: `CREATE DATABASE gym_saas;`

### 3. Configure Environment
```bash
# Generate secrets
node generate-secrets.js

# Add to .env:
DATABASE_URL="your_database_url_here"
JWT_SECRET="generated_secret"
NEXTAUTH_SECRET="generated_secret"
```

### 4. Set Up Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[SIGNUP_FLOW.md](./SIGNUP_FLOW.md)** - Signup flow documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

## ✨ Features

### Three User Roles

#### 🏢 Gym Owner/Admin
- Create and manage gym
- Full administrative control
- Manage members and trainers
- Analytics and reporting
- Billing management

#### 👤 Member
- Join existing gyms
- Book unlimited classes
- Track attendance
- Manage membership
- Connect with trainers

#### 💪 Trainer
- Join existing gyms
- Create and manage classes
- Track member progress
- Schedule sessions
- Store specialization and certifications

### Core Features
- ✅ Multi-tenant architecture
- ✅ Role-based access control (SUPER_ADMIN, ADMIN, MANAGER, TRAINER, MEMBER)
- ✅ Class management and booking system
- ✅ Check-in system with QR codes
- ✅ Payment integration (Authorize.net)
- ✅ Membership management
- ✅ Analytics dashboard
- ✅ Waivers system
- ✅ Invite system
- ✅ Public signup forms

## 🎨 Signup Flows

### 1. Gym Owner Signup (`/signup/owner`)
- Creates a new gym (tenant)
- Becomes the admin
- Blue/Cyan theme

### 2. Member Signup (`/signup/member`)
- Joins an existing gym
- Searchable gym selection
- Emerald/Teal theme

### 3. Trainer Signup (`/signup/trainer`)
- Joins an existing gym
- Includes specialization & certifications
- Violet/Purple theme

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT
- **Styling:** Tailwind CSS
- **Payment:** Authorize.net
- **Email:** SMTP
- **SMS:** Twilio

## 📦 Project Structure

```
gym-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages (login, signup)
│   │   ├── (marketing)/     # Landing page
│   │   ├── api/             # API routes
│   │   └── dashboard/       # Dashboard pages
│   ├── components/          # React components
│   ├── context/            # React context
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Static files
└── ...config files
```

## 🔧 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Open Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy
5. Run migrations

## 🔐 Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `NEXT_PUBLIC_APP_URL` - Your app URL

Optional:
- `AUTHORIZENET_API_LOGIN_ID` - Payment gateway
- `AUTHORIZENET_TRANSACTION_KEY` - Payment gateway
- `SMTP_*` - Email configuration
- `TWILIO_*` - SMS configuration

## 📝 License

MIT
