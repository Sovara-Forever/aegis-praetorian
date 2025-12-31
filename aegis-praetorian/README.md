# Aegis Praetorian

**Production-ready Next.js 14+ automotive inventory intelligence platform**

A full-stack application for automotive inventory management, market analysis, and competitive intelligence powered by AI.

## 🚀 Features

- **Authentication & Authorization**: Full Clerk integration with admin approval workflow
- **Market Dashboard**: Real-time inventory analytics with dealer performance metrics
- **CSV Upload**: Intelligent data import with automatic schema detection
- **AI Insights**: Claude-powered market analysis and strategic recommendations
- **Admin Panel**: User management and access control
- **Dark Mode**: Modern, clean UI with Tailwind CSS
- **Database**: Neon serverless PostgreSQL with Drizzle ORM

## 📋 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS + Shadcn/UI
- **CSV Parsing**: PapaParse
- **Deployment**: Vercel

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL database
- Clerk account
- Anthropic API key

### 1. Clone and Install

```bash
cd aegis-praetorian
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/pending-approval

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Push the schema to your Neon database:

```bash
npm run db:push
```

### 4. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Email authentication
4. Add social providers (optional)
5. Copy your API keys to `.env`
6. Configure public metadata fields:
   - `role` (string): "admin" or "user"
   - `isApproved` (boolean): true or false

### 5. Create First Admin User

After signing up your first user:

1. Go to Clerk Dashboard → Users
2. Select your user
3. Edit Metadata → Public Metadata
4. Add:
   ```json
   {
     "role": "admin",
     "isApproved": true
   }
   ```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application includes comprehensive schemas for:

- **Vehicles**: Inventory data (VIN, make, model, price, dealer, etc.)
- **Ads Daily**: Google Ads performance metrics
- **Geo Sales**: Geographic sales distribution
- **Sales Total**: Brand/model sales data
- **SpyFu Tables**: Competitor analysis, keywords, backlinks
- **SEO Data**: Top pages, search terms
- **Market Insights**: AI-generated insights cache

## 🔐 User Approval Flow

1. User signs up via Clerk
2. User is redirected to "Pending Approval" page
3. Admin receives notification (configure in Clerk webhooks)
4. Admin approves user in Admin Panel
5. User gains access to dashboard

## 📤 CSV Upload

Supported data types (auto-detected):

- Inventory Vehicles
- Geographic Sales
- Ads Daily Performance
- SpyFu Competitor Data
- Sales Total
- Campaign Summary
- Google Search Terms

## 🤖 AI Insights

Powered by Claude 3.5 Sonnet:

- Market trend analysis
- Pricing optimization
- Competitive intelligence
- Inventory strategy recommendations
- Geographic insights

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (same as `.env`)
4. Deploy

### 3. Configure Neon Branching (Optional)

Enable database branching for preview deployments:

```bash
npm run db:push
```

## 📁 Project Structure

```
aegis-praetorian/
├── app/
│   ├── dashboard/          # Main dashboard
│   ├── upload/             # CSV upload page
│   ├── insights/           # AI insights panel
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   │   ├── insights/       # Claude API integration
│   │   ├── upload/         # CSV processing
│   │   └── admin/          # User management
│   ├── sign-in/            # Clerk sign-in
│   ├── sign-up/            # Clerk sign-up
│   └── pending-approval/   # Approval waiting page
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── dashboard-nav.tsx   # Navigation component
├── lib/
│   ├── db/                 # Database schema & connection
│   ├── utils.ts            # Utility functions
│   ├── queries.ts          # Database queries
│   └── csv-parser.ts       # CSV parsing logic
├── middleware.ts           # Clerk authentication middleware
└── drizzle.config.ts       # Drizzle ORM configuration
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🎨 Customization

### Branding

Update colors in `tailwind.config.ts` and `app/globals.css`

### Navigation

Edit `components/dashboard-nav.tsx` to add/remove menu items

### Database Schema

Modify `lib/db/schema.ts` and run:

```bash
npm run db:push
```

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure Neon database is active
- Check SSL mode is set to `require`

### Clerk Authentication Issues

- Verify all Clerk environment variables are set
- Check public metadata is configured correctly
- Ensure redirect URLs match your domain

### Build Errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📝 License

MIT

## 🤝 Support

For issues and questions, please open a GitHub issue.

---

**Built with ⚡ by Aegis Praetorian Team**
