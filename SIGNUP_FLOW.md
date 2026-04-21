# Signup Flow Documentation

## Overview
The application has three distinct signup flows based on user roles:
1. **Gym Owner/Admin** - Creates a new gym and becomes the admin
2. **Member** - Joins an existing gym as a member
3. **Trainer** - Joins an existing gym as a trainer

## Routes

### 1. Role Selection Page
**URL:** `/signup`
- Landing page where users choose their role
- Three options: Gym Owner, Member, or Trainer
- Clean, modern UI with feature highlights for each role

### 2. Gym Owner Signup
**URL:** `/signup/owner`
- **Theme:** Blue/Cyan gradient
- **Purpose:** Create a new gym and admin account
- **Fields:**
  - Gym Name (required) - Creates new tenant
  - First Name (required)
  - Last Name (required)
  - Email Address (required)
  - Phone Number (optional)
  - Password (required, min 8 characters)
- **Role:** Automatically set to `ADMIN`
- **Creates:** New Tenant + Admin User

### 3. Member Signup
**URL:** `/signup/member`
- **Theme:** Emerald/Teal gradient
- **Purpose:** Join an existing gym as a member
- **Fields:**
  - Select Gym (required) - Searchable dropdown of existing gyms
  - First Name (required)
  - Last Name (required)
  - Email Address (required)
  - Phone Number (optional)
  - Password (required, min 8 characters)
- **Role:** Automatically set to `MEMBER`
- **Joins:** Existing Tenant

### 4. Trainer Signup
**URL:** `/signup/trainer`
- **Theme:** Violet/Purple gradient
- **Purpose:** Join an existing gym as a trainer
- **Fields:**
  - Select Gym (required) - Searchable dropdown of existing gyms
  - First Name (required)
  - Last Name (required)
  - Email Address (required)
  - Phone Number (optional)
  - Specialization (optional) - e.g., "Yoga, CrossFit, Personal Training"
  - Certifications (optional) - e.g., "ACE, NASM, ISSA"
  - Password (required, min 8 characters)
- **Role:** Automatically set to `TRAINER`
- **Joins:** Existing Tenant

## API Endpoints

### 1. Signup Endpoint
**Endpoint:** `POST /api/auth/signup`

**Request Body (Gym Owner):**
```json
{
  "gymName": "FitZone Gym",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 555 000 0000",
  "password": "securepass123",
  "createNewGym": true,
  "role": "ADMIN"
}
```

**Request Body (Member/Trainer):**
```json
{
  "gymSlug": "fitzone-gym",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1 555 000 0001",
  "password": "securepass123",
  "role": "MEMBER",  // or "TRAINER"
  "createNewGym": false,
  "specialization": "Yoga, Pilates",  // Optional, for trainers only
  "certifications": "ACE, NASM"       // Optional, for trainers only
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    },
    "tenant": {
      "id": "tenant_id",
      "name": "FitZone Gym",
      "slug": "fitzone-gym"
    }
  }
}
```

### 2. Gyms List Endpoint
**Endpoint:** `GET /api/gyms?search={query}`

**Purpose:** Fetch available gyms for member/trainer signup

**Query Parameters:**
- `search` (optional) - Search term to filter gyms by name or slug

**Response:**
```json
{
  "success": true,
  "data": {
    "gyms": [
      {
        "id": "gym_id",
        "name": "FitZone Gym",
        "slug": "fitzone-gym",
        "logoUrl": "https://...",
        "address": "123 Main St, City, State"
      }
    ]
  }
}
```

## Database Schema

### User Model
```prisma
model User {
  id             String   @id @default(cuid())
  tenantId       String
  email          String
  hashedPassword String?
  firstName      String
  lastName       String
  phone          String?
  role           Role     @default(MEMBER)
  specialization String?  // For trainers
  certifications String?  // For trainers
  // ... other fields
}
```

### Tenant Model
```prisma
model Tenant {
  id     String @id @default(cuid())
  name   String
  slug   String @unique
  // ... other fields
}
```

## User Flows

### Flow 1: Gym Owner Creates New Gym
1. User visits `/signup`
2. User clicks "Create Your Gym"
3. User is redirected to `/signup/owner`
4. User fills out gym name and personal details
5. Form submits to `/api/auth/signup` with `createNewGym: true`
6. API creates:
   - New Tenant with unique slug
   - New User with role `ADMIN`
7. User is logged in and redirected to `/dashboard`

### Flow 2: Member Joins Existing Gym
1. User visits `/signup`
2. User clicks "Join as Member"
3. User is redirected to `/signup/member`
4. User searches and selects their gym from the list
5. User fills out personal details
6. Form submits to `/api/auth/signup` with `createNewGym: false` and `gymSlug`
7. API creates:
   - New User linked to existing Tenant with role `MEMBER`
8. User is logged in and redirected to `/dashboard`

### Flow 3: Trainer Joins Existing Gym
1. User visits `/signup`
2. User clicks "Join as Trainer"
3. User is redirected to `/signup/trainer`
4. User searches and selects their gym from the list
5. User fills out personal details + specialization/certifications
6. Form submits to `/api/auth/signup` with `createNewGym: false` and `gymSlug`
7. API creates:
   - New User linked to existing Tenant with role `TRAINER`
8. User is logged in and redirected to `/dashboard`

## Features by Role

### Gym Owner/Admin Features
- Create and manage gym
- Full admin control
- Manage members & trainers
- Analytics & reporting
- Billing management

### Member Features
- Book unlimited classes
- Track attendance
- Manage membership
- Connect with trainers
- View class schedules

### Trainer Features
- Create and manage classes
- Track member progress
- Schedule sessions
- Build reputation
- Store specialization and certifications

## Security

- Passwords must be at least 8 characters
- Passwords are hashed using bcrypt before storage
- JWT tokens are signed with `JWT_SECRET`
- Email uniqueness is enforced per tenant (members/trainers can have same email in different gyms)
- Gym slug uniqueness is enforced globally
- Only gym owners can create new tenants

## Gym Selection UI

The member and trainer signup pages feature:
- **Search functionality** - Real-time search as user types
- **Scrollable list** - Shows up to 50 gyms, scrollable if more
- **Visual selection** - Selected gym is highlighted with emerald/violet accent
- **Gym details** - Shows gym name and address (if available)
- **Confirmation** - Shows selected gym name below the list

## Testing

### Test Gym Owner Signup:
1. Visit `http://localhost:3000/signup`
2. Click "Create Your Gym"
3. Fill out form with gym name "Test Gym"
4. Submit and verify:
   - New tenant created with slug "test-gym"
   - User created with role ADMIN
   - User logged in and redirected to dashboard

### Test Member Signup:
1. Visit `http://localhost:3000/signup`
2. Click "Join as Member"
3. Search for and select "Test Gym"
4. Fill out personal details
5. Submit and verify:
   - User created linked to "Test Gym" tenant
   - User has role MEMBER
   - User logged in and redirected to dashboard

### Test Trainer Signup:
1. Visit `http://localhost:3000/signup`
2. Click "Join as Trainer"
3. Search for and select "Test Gym"
4. Fill out personal details + specialization/certifications
5. Submit and verify:
   - User created linked to "Test Gym" tenant
   - User has role TRAINER
   - Specialization and certifications saved
   - User logged in and redirected to dashboard

## Deployment Notes

When deploying to production:

1. **Database Migration:**
   ```sql
   ALTER TABLE "User" ADD COLUMN "specialization" TEXT;
   ALTER TABLE "User" ADD COLUMN "certifications" TEXT;
   ```
   Or use Prisma migrate:
   ```bash
   npx prisma migrate deploy
   ```

2. **Environment Variables:**
   Ensure all required variables are set in Vercel (see DEPLOYMENT.md)

3. **Test All Flows:**
   - Create a test gym as owner
   - Join as member
   - Join as trainer
   - Verify role-based dashboard access

## Future Enhancements

Potential improvements:
- Email verification after signup
- Invite-only gym option (require invite code)
- Gym approval process for trainers
- Profile photo upload during signup
- Multi-step form for better UX
- Social login integration
- Password strength indicator
- Gym discovery page with filters
- Gym ratings and reviews
