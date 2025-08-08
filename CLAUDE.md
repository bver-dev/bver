# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BVER (Business Venture Evaluation Report) is a property tax appeal service platform that automates assessment challenges and form generation. The platform uses Next.js 15 with App Router, Supabase for backend, and is deployed on Vercel.

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting across all workspaces
npm run lint

# Run tests across all workspaces
npm run test

# Database operations (requires Supabase setup)
npm run db:push      # Push migrations to database
npm run db:migrate   # Create new migration
npm run db:studio    # Open Supabase Studio
```

### Testing Individual Components
```bash
# Run tests for specific workspace
npm run test --workspace=packages/assessment
npm run test --workspace=packages/pdf-generator

# Build specific package
npm run build --workspace=packages/assessment
```

## Architecture Overview

### Monorepo Structure
The project uses npm workspaces with the following packages:
- **app/**: Next.js 15 application with App Router
- **packages/database**: Supabase client and database types
- **packages/assessment**: Property assessment logic for appeal viability
- **packages/pdf-generator**: PDF generation for appeal forms

### Database Architecture
- PostgreSQL via Supabase with Row Level Security (RLS)
- Core tables: users, properties, appeals, assessment_history, documents
- All tables have RLS policies ensuring users only access their own data
- Automatic updated_at triggers on all main tables

### Assessment Module Design
The assessment module follows a two-tier approach:
1. **Baseline Model**: Reproduces county assessment methodology
2. **Advanced Model**: Incorporates additional data sources not used by counties
   - Must include at least 2 new feature types
   - All predictions must be explainable with confidence intervals

### Key Technical Decisions

#### Serverless Architecture (Vercel)
- API routes use Vercel Functions (10s default timeout, 60s max)
- Keep functions under 50MB compressed
- Use Edge Functions for low-latency operations
- Store files in Vercel Blob Storage, not in functions
- For compute-intensive ML operations, consider external APIs

#### Real-Time Feedback
- Implement optimistic UI updates
- Show loading states for all async operations
- Provide instant viability assessment (< 2 seconds response time)
- Use visual indicators (color-coded meter) with text explanations

#### Third-Party Integrations
Primary data sources:
- Zillow API for Zestimates
- RentCast/RealtyMole API for property records
- Google Maps/Mapbox for geocoding
- ATTOM Data API for comprehensive property data (when budget allows)

## Critical Implementation Rules

### Security Requirements
- Never store API keys or credentials in code
- Use Supabase RLS policies for data isolation
- Implement input validation and sanitization on all endpoints
- Use parameterized queries to prevent SQL injection
- Ensure HTTPS for all communications
- Store passwords using bcrypt or similar (min 10 rounds)
- Never log sensitive information (passwords, API keys, PII)
- Implement CORS properly - no wildcard origins in production
- Implement rate limiting on all public endpoints
- Use JWT tokens with appropriate expiration and refresh token rotation

### Compliance & Property Tax Domain
- **MUST** validate jurisdiction-specific rules before processing
- **MUST** check appeal deadlines before allowing form generation
- **MUST** ensure generated forms match official templates exactly
- **MUST** maintain accuracy in financial calculations
- Include legal disclaimers ("This is not legal advice")
- Ensure CCPA compliance for California users
- Provide data export and deletion capabilities
- Maintain audit logs for sensitive operations
- Never modify production database directly

### Assessment Module Requirements
- **MUST** validate model accuracy against known county assessments
- **MUST** provide confidence intervals for all predictions
- **MUST** make predictions explainable (feature importance)
- **MUST** test models on holdout dataset before deployment
- **MUST** version all models and maintain rollback capability
- **MUST** validate incoming property data for completeness
- **MUST** cross-reference multiple data sources when available
- **MUST** flag suspicious or inconsistent data for review
- **MUST** maintain data lineage for audit purposes

### Frontend & UX Requirements
- **MUST** provide real-time feedback for user actions
- **MUST** show loading states for all async operations
- **MUST** handle errors gracefully with user-friendly messages
- **MUST** ensure mobile responsiveness for all features
- **MUST** support keyboard navigation for accessibility
- **MUST** implement optimistic updates for better UX
- **MUST** handle race conditions in async operations
- Never expose internal errors to users
- Be transparent about data sources and calculations
- Clearly indicate what actions are automated vs manual

### Performance Guidelines
- Lazy load components and routes
- Optimize images using Next.js Image component (WebP format)
- Implement caching for third-party API responses
- Use ISR (Incremental Static Regeneration) where applicable
- Target Lighthouse performance score > 85
- Minimize bundle size (code splitting, tree shaking)
- Avoid N+1 query problems
- Batch database operations when possible
- Optimize cold start times for serverless functions

### Testing Requirements
- **MUST** ensure test coverage of at least 80% for critical business logic
- Write unit tests for all assessment calculations
- Test PDF generation with known inputs
- Implement integration tests for all API endpoints
- Include edge case testing (null values, empty strings, boundary conditions)
- Test error handling paths explicitly
- Write a test that reproduces bugs before fixing them
- Run `npm run lint` and `npm run test` before committing code

### Third-Party Integration Rules
- **MUST** implement retry logic with exponential backoff
- **MUST** cache API responses when appropriate
- **MUST** handle API rate limits gracefully
- **MUST** provide fallback when external services are down
- **MUST** monitor API usage and costs
- **MUST** log all integration failures with context
- **MUST** implement circuit breakers for failing services

### Language-Specific Code Standards

#### TypeScript (Web Development)
- Use TypeScript for all Next.js/React code
- Define explicit types (no 'any' without justification)
- Use async/await over callbacks
- Handle Promise rejections
- Use const by default, let when needed, never var
- Add JSDoc comments for public functions

#### Python (ML/Assessment Module)
- Use Python for assessment models and data processing
- Follow PEP 8 style guide
- Use type hints for function signatures
- Use context managers for resource management
- Use virtual environments for dependencies
- Add docstrings for all public functions and classes

#### Flutter/Dart (Mobile App)
- Use Flutter for iOS and Android mobile apps
- Follow Dart effective style guide
- Implement proper state management (Provider/Riverpod/Bloc)
- Handle platform-specific differences appropriately
- Ensure consistent UI/UX with web platform

### General Code Quality
- Keep functions small and focused (< 50 lines ideally)
- Avoid deep nesting (max 3 levels)
- Follow project's established linting config
- Document complex algorithms with inline comments
- Remove commented-out code before committing

## Supabase MCP Integration

The project has Supabase MCP server configured. When working with database:
1. Use `mcp__supabase__*` commands for database operations
2. Project reference: `cdicvsssvgbuddbxycuj`
3. Database schema is in `supabase/migrations/001_initial_schema.sql`
4. RLS policies are enforced - all operations require authentication

## Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Implement changes following existing patterns
   - Write tests for new functionality
   - Run linting and tests locally

2. **Before Committing**:
   - Run `npm run lint` to check code style
   - Run `npm run test` to ensure tests pass
   - Verify no hardcoded credentials or API keys

3. **Deployment**:
   - Vercel automatically creates preview deployments for PRs
   - Production deployment happens on merge to main
   - Environment variables must be configured in Vercel dashboard

## Current Project Status

- Foundation setup is partially complete (Week 1)
- Next.js app initialized with TypeScript and Tailwind CSS
- Database schema designed and migrations created
- Supabase configuration needs to be connected
- API routes and assessment module implementation pending

## Important File Locations

- Database schema: `supabase/migrations/001_initial_schema.sql`
- Environment variables: `.env.example` (copy to `.env` and fill values)
- Next.js app entry: `app/src/app/layout.tsx`
- API routes: `app/src/app/api/` (to be created)
- Assessment logic: `packages/assessment/` (to be implemented)
- PDF generation: `packages/pdf-generator/` (to be implemented)