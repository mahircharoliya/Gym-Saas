# Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Database

### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't already
2. Create a database:
   ```sql
   CREATE DATABASE gym_saas;
   ```

3. Add to `.env`:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/gym_saas?schema=public"
   ```

### Option B: Neon (Cloud - Recommended)

1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Add to `.env`:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Required for basic functionality
DATABASE_URL="your_database_url_here"
JWT_SECRET="your-random-secret-key-here"
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional - Payment Gateway
AUTHORIZENET_API_LOGIN_ID="your-api-login-id"
AUTHORIZENET_TRANSACTION_KEY="your-transaction-key"
AUTHORIZENET_ENVIRONMENT="sandbox"

# Optional - Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your_app_password"

# Optional - SMS
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+15550000000"
```

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

Or if using Neon/production:
```bash
npx prisma migrate deploy
```

## Step 6: (Optional) Seed Database

Create a test gym and admin user:

```bash
npx prisma studio
```

Or manually via SQL:
```sql
-- Insert a test gym
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES ('test-gym-1', 'Test Gym', 'test-gym', NOW(), NOW());

-- Insert an admin user (password: password123)
INSERT INTO "User" (id, "tenantId", email, "hashedPassword", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  'admin-1',
  'test-gym-1',
  'admin@testgym.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLHJ4tXu',
  'Admin',
  'User',
  'ADMIN',
  NOW(),
  NOW()
);
```

## Step 7: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 8: Test Signup Flows

1. **Create a Gym (Owner)**
   - Go to http://localhost:3000/signup
   - Click "Create Your Gym"
   - Fill out the form
   - This creates a new gym and admin account

2. **Join as Member**
   - Go to http://localhost:3000/signup
   - Click "Join as Member"
   - Select a gym from the list
   - Fill out the form

3. **Join as Trainer**
   - Go to http://localhost:3000/signup
   - Click "Join as Trainer"
   - Select a gym from the list
   - Fill out the form with specialization

## Troubleshooting

### Error: "No database URL found"
- Make sure `DATABASE_URL` is set in your `.env` file
- Restart your dev server after adding it

### Error: "Cannot read properties of undefined (reading 'bind')"
- Run `npx prisma generate` to regenerate the Prisma client
- Make sure you're using Prisma v7.7.0 or higher

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- This means the API route is failing
- Check that your database is connected
- Check the console for detailed error messages
- Make sure Prisma client is generated

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- For Neon, make sure it includes `?sslmode=require`
- Check that your database is accessible

## Production Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - Other optional variables

4. Deploy
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Generate JWT Secrets

You can generate random secrets using:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Next Steps

1. Configure payment gateway (Authorize.net)
2. Set up email notifications (SMTP)
3. Set up SMS notifications (Twilio)
4. Customize branding and colors
5. Add custom domain
6. Set up analytics

## Support

For issues or questions:
- Check `DEPLOYMENT.md` for deployment help
- Check `SIGNUP_FLOW.md` for signup flow documentation
- Review error logs in console
