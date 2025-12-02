# Press Directory Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/press-directory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Directory Admin Default Credentials
DIRECTORY_ADMIN_USERNAME=admin
DIRECTORY_ADMIN_PASSWORD=admin123
DIRECTORY_ADMIN_EMAIL=admin@pressmark.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Seed Initial Data
```bash
# Create directory admin
npm run seed:dir-admin

# Create subscription plans
node --env-file=.env seedPlans.js
```

### 4. Start Server
```bash
npm start
```

## API Endpoints

### Public Endpoints

#### Get All Listings
- **GET** `/api/directory/listings?search=term&city=cityname`
- Returns all active listings and tenants

#### Get Business by Slug
- **GET** `/api/directory/listings/:slug`
- Returns business details by slug

#### Get Tenant Price List
- **GET** `/api/price-list/:tenantId`
- Returns price list for a tenant

### Admin Endpoints (Protected)

#### Login
- **POST** `/api/directory-admins/login`
- Body: `{ username, password }`
- Returns: `{ token, admin }`

#### Listings Management
- **GET** `/api/directory-admins/listings` - Get all listings
- **POST** `/api/directory-admins/listings` - Create listing
- **PUT** `/api/directory-admins/listings/:id` - Update listing
- **DELETE** `/api/directory-admins/listings/:id` - Delete listing

#### Tenants Management
- **GET** `/api/directory-admins/tenants` - Get all tenants
- **PUT** `/api/directory-admins/tenants/:id` - Update tenant

#### Plans Management
- **GET** `/api/plans` - Get all plans
- **PUT** `/api/plans/:id` - Update plan prices

#### Uploads
- **POST** `/api/uploads/tenant-logo` - Upload tenant logo
- **POST** `/api/uploads/listing-logo` - Upload listing logo

## Authentication

All admin endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Models

- **DirectoryAdmin**: Admin users for directory management
- **DirectoryListing**: Manual directory listings
- **Tenant**: Software customers (businesses using PressMark)
- **PriceList**: Pricing data for tenants
- **Plan**: Subscription plans with multi-currency pricing


