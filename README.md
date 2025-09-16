# Elite Cards - Shopify App

A Next.js application that allows merchants to manage and add premium trading cards to their Shopify stores.

## Features

- **Shopify OAuth Integration**: Secure authentication with Shopify stores
- **Role-based Access**: Admin users can manage products, end users can add products to their stores
- **Product Management**: Create and organize products by sets
- **One-click Integration**: Add products directly to Shopify stores
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Shopify OAuth with JWT sessions
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Shopify Partner account

### Environment Setup

1. Copy the environment file:
```bash
cp env.example .env.local
```

2. Fill in your environment variables:
```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/elite_cards"

# JWT Secret for session management
JWT_SECRET=your_jwt_secret_key_here

# App URL (update when deploying to Vercel)
APP_URL=http://localhost:3000
```

### Database Setup

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shopify App Setup

1. Create a new app in your Shopify Partner dashboard
2. Set the app URL to your Vercel deployment URL
3. Configure the following URLs:
   - App URL: `https://your-app.vercel.app`
   - Allowed redirection URLs: `https://your-app.vercel.app/api/auth/callback`
4. Copy the API key and secret to your environment variables

## User Roles

### Admin Users
- Access the admin dashboard at `/admin`
- Add and manage products
- Organize products by sets
- View all products in the system

### End Users
- Access the product catalog at `/catalog`
- Browse products by sets
- One-click add products to their Shopify store
- View product details and pricing

## API Endpoints

### Authentication
- `GET /api/auth/install` - Start Shopify OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback

### Products
- `POST /api/products/add` - Add new product (Admin only)
- `GET /api/products/list` - List all products
- `POST /api/products/push` - Push product to Shopify store

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_SCOPES`
- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL` (your Vercel app URL)

## Security Features

- HMAC validation for Shopify webhooks
- JWT-based session management
- Role-based access control
- Encrypted access token storage
- CSRF protection via SameSite cookies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details