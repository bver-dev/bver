# BVER - Property Tax Appeal Service Platform

A comprehensive platform for automating property tax appeal assessments and form generation.

## Project Structure

```
bver/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages and API routes
│   │   │   ├── (marketing)/    # Public pages
│   │   │   ├── (dashboard)/    # Protected app pages
│   │   │   ├── api/           # API routes
│   │   │   └── components/    # Shared React components
│   │   └── ...
│   └── package.json
├── packages/              # Shared packages
│   ├── database/         # Supabase client & database types
│   ├── assessment/       # Property assessment logic
│   └── pdf-generator/    # PDF generation utilities
├── supabase/            # Database migrations and configuration
├── docs/                # Documentation
└── scripts/             # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd bver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp app/.env.local.example app/.env.local
   ```
   Fill in your actual API keys and configuration values.

4. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and keys to `.env`
   - Run migrations:
     ```bash
     cd supabase
     npx supabase db push
     ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npm run test` - Run tests
- `npm run db:push` - Push database migrations
- `npm run db:studio` - Open Supabase Studio

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Vercel Functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Vercel Blob Storage
- **PDF Generation**: PDFKit / React PDF
- **Deployment**: Vercel

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- Various API keys for third-party services (Zillow, Google Maps, etc.)

## Development Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Create pull request with description
4. Vercel will create preview deployment
5. After review, merge to `main` for production deployment

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

Proprietary - All rights reserved