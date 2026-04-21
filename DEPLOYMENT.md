# Deployment Guide

## Vercel Deployment

### Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

#### Essential Variables:
```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Payment Gateway (Authorize.net):
```
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox
```

#### Optional Services:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+15550000000

CRON_SECRET=your_cron_secret
```

### Build Configuration

Vercel will automatically:
1. Run `npm install`
2. Run `prisma generate` (via postinstall script)
3. Run `npm run build`

### Database Setup

1. Create a Neon database at https://neon.tech
2. Copy the connection string
3. Add it to Vercel environment variables as `DATABASE_URL`
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Schema Updates (Latest)

The User model now includes trainer-specific fields:
- `specialization` (String, optional) - Trainer's area of expertise
- `certifications` (String, optional) - Trainer's certifications

If you have an existing database, run this SQL to add the new columns:
```sql
ALTER TABLE "User" ADD COLUMN "specialization" TEXT;
ALTER TABLE "User" ADD COLUMN "certifications" TEXT;
```

Or use Prisma migrations:
```bash
npx prisma migrate deploy
```

### Troubleshooting

#### Login Error: "Something went wrong"
- Check that `DATABASE_URL` is set in Vercel
- Check that `JWT_SECRET` is set in Vercel
- Check Vercel function logs for detailed errors

#### Build Failures
- Ensure all environment variables are set
- Check that Prisma client is generated during build
- Verify Node.js version compatibility (requires Node 18+)

#### Database Connection Issues
- Verify DATABASE_URL format includes `?sslmode=require`
- Check Neon database is active and accessible
- Ensure connection pooling is enabled in Neon

### Post-Deployment

1. Create a super admin user via database:
   ```sql
   INSERT INTO "Tenant" (id, name, slug) 
   VALUES ('tenant-1', 'My Gym', 'my-gym');
   
   INSERT INTO "User" (id, "tenantId", email, "hashedPassword", "firstName", "lastName", role)
   VALUES ('user-1', 'tenant-1', 'admin@gym.com', '$2a$12$...', 'Admin', 'User', 'SUPER_ADMIN');
   ```

2. Test login at your deployment URL

3. Configure custom domain (optional) in Vercel settings
