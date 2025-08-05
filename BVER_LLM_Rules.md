# BVER Development Rules for LLM Assistance

## Overview
This document contains rules and guidelines for LLMs (Language Learning Models) when assisting with the BVER Property Tax Appeal Service Platform development. Follow these rules to ensure consistent, high-quality code and maintain project standards.

---

## 1. Code Quality Rules

### 1.1 Testing Requirements
- **MUST** create comprehensive unit tests for every new function, method, or component
- **MUST** ensure test coverage of at least 80% for critical business logic (assessment calculations, form generation)
- **MUST** write integration tests for all API endpoints
- **MUST** include edge case testing (null values, empty strings, boundary conditions)
- **MUST** test error handling paths explicitly

### 1.2 Code Review Standards
- **MUST** review every code change for:
  - Security vulnerabilities (SQL injection, XSS, authentication bypass)
  - Performance implications (N+1 queries, unnecessary loops, memory leaks)
  - Error handling completeness
  - Input validation and sanitization
  - Compliance with project coding standards
- **MUST** ensure no hardcoded credentials or API keys
- **MUST** verify proper logging without exposing sensitive data

### 1.3 Documentation Requirements
- **MUST** add JSDoc/Python docstrings for all public functions and classes
- **MUST** include parameter descriptions and return types
- **MUST** document complex algorithms with inline comments
- **MUST** maintain README files for each module
- **MUST** update API documentation when endpoints change

---

## 2. Architecture Rules

### 2.1 Design Patterns
- **MUST** follow Next.js App Router conventions
- **MUST** separate Server Components from Client Components appropriately
- **MUST** keep API routes focused - business logic in separate services
- **MUST** use server actions for form submissions where applicable
- **MUST** implement proper data fetching patterns (avoid waterfalls)

### 2.2 Database Rules
- **MUST** use Supabase migrations for all schema changes
- **MUST** never modify production database directly
- **MUST** implement Row Level Security (RLS) policies
- **MUST** use Supabase realtime features judiciously (connection limits)
- **MUST** optimize queries to work within Supabase limits

### 2.3 API Design
- **MUST** use Next.js API routes with proper method handling
- **MUST** implement route handlers in app/api structure
- **MUST** return consistent error response format
- **MUST** implement pagination for list endpoints
- **MUST** use appropriate HTTP status codes
- **MUST** consider Edge Runtime for simple, fast APIs

---

## 3. Security Rules

### 3.1 Authentication & Authorization
- **MUST** use JWT tokens with appropriate expiration
- **MUST** implement refresh token rotation
- **MUST** validate all user inputs
- **MUST** use parameterized queries to prevent SQL injection
- **MUST** implement rate limiting on all public endpoints

### 3.2 Data Protection
- **MUST** use HTTPS for all communications
- **MUST** store passwords using bcrypt or similar (min 10 rounds)
- **MUST** never log sensitive information (passwords, API keys, PII)
- **MUST** implement CORS properly - no wildcard origins in production
- **MUST** sanitize file uploads and limit file types/sizes

### 3.3 Compliance
- **MUST** ensure CCPA compliance for California users
- **MUST** provide data export and deletion capabilities
- **MUST** obtain user consent before processing personal data
- **MUST** maintain audit logs for sensitive operations

---

## 4. Assessment Module Rules

### 4.1 Model Development
- **MUST** validate model accuracy against known county assessments
- **MUST** provide confidence intervals for all predictions
- **MUST** make predictions explainable (feature importance)
- **MUST** test models on holdout dataset before deployment
- **MUST** version all models and maintain rollback capability

### 4.2 Data Quality
- **MUST** validate incoming property data for completeness
- **MUST** handle missing data gracefully with appropriate defaults
- **MUST** cross-reference multiple data sources when available
- **MUST** flag suspicious or inconsistent data for review
- **MUST** maintain data lineage for audit purposes

---

## 5. Frontend Rules

### 5.1 User Experience
- **MUST** provide real-time feedback for user actions
- **MUST** show loading states for all async operations
- **MUST** handle errors gracefully with user-friendly messages
- **MUST** ensure mobile responsiveness for all features
- **MUST** support keyboard navigation for accessibility

### 5.2 Performance
- **MUST** lazy load components and routes
- **MUST** optimize images (WebP format, appropriate sizes)
- **MUST** implement caching strategies for static content
- **MUST** minimize bundle size (code splitting, tree shaking)
- **MUST** achieve Lighthouse performance score > 85

### 5.3 State Management
- **MUST** use consistent state management pattern (Redux/Context)
- **MUST** avoid prop drilling beyond 2 levels
- **MUST** normalize complex state structures
- **MUST** implement optimistic updates for better UX
- **MUST** handle race conditions in async operations

---

## 6. Integration Rules

### 6.1 Third-Party APIs
- **MUST** implement retry logic with exponential backoff
- **MUST** cache API responses when appropriate
- **MUST** handle API rate limits gracefully
- **MUST** provide fallback when external services are down
- **MUST** monitor API usage and costs

### 6.2 Error Handling
- **MUST** never expose internal errors to users
- **MUST** log all integration failures with context
- **MUST** implement circuit breakers for failing services
- **MUST** notify administrators of critical failures
- **MUST** maintain service health dashboards

---

## 7. Deployment Rules

### 7.1 CI/CD Pipeline
- **MUST** run all tests before deployment
- **MUST** ensure build passes linting and type checking
- **MUST** utilize Vercel preview deployments for PR review
- **MUST** maintain rollback capability via Vercel deployments
- **MUST** tag releases with semantic versioning

### 7.2 Environment Management
- **MUST** use Vercel environment variables for configuration
- **MUST** never commit .env files to version control
- **MUST** use separate environment variables for preview/production
- **MUST** document all environment dependencies
- **MUST** implement health check API routes

### 7.3 Serverless Best Practices
- **MUST** keep Vercel Functions under 50MB compressed
- **MUST** optimize cold start times (minimize dependencies)
- **MUST** handle function timeouts gracefully (10s default, 60s max)
- **MUST** use Edge Functions for low-latency operations
- **MUST** implement proper error boundaries in serverless functions
- **MUST** avoid storing state in serverless functions
- **MUST** use Vercel Blob or external storage for files
- **MUST** consider splitting large operations into multiple functions

---

## 8. Code Style Rules

### 8.1 General Principles
- **MUST** follow project's established style guide (ESLint/Prettier config)
- **MUST** use meaningful variable and function names
- **MUST** keep functions small and focused (< 50 lines ideally)
- **MUST** avoid deep nesting (max 3 levels)
- **MUST** remove commented-out code before committing

### 8.2 Language-Specific

#### JavaScript/TypeScript
- **MUST** use TypeScript for all new code
- **MUST** define explicit types (no 'any' without justification)
- **MUST** use async/await over callbacks
- **MUST** handle Promise rejections
- **MUST** use const by default, let when needed, never var

#### Python
- **MUST** follow PEP 8 style guide
- **MUST** use type hints for function signatures
- **MUST** use context managers for resource management
- **MUST** prefer list comprehensions for simple transformations
- **MUST** use virtual environments for dependencies

---

## 9. Performance Rules

### 9.1 Database Performance
- **MUST** analyze query execution plans for slow queries
- **MUST** avoid N+1 query problems
- **MUST** use database connection pooling
- **MUST** implement query result caching where appropriate
- **MUST** batch database operations when possible

### 9.2 Application Performance
- **MUST** profile code to identify bottlenecks
- **MUST** leverage Vercel's automatic compression and CDN
- **MUST** use Next.js Image Optimization for images
- **MUST** implement proper caching headers with Edge Config
- **MUST** monitor function execution time and memory usage
- **MUST** use ISR (Incremental Static Regeneration) where applicable
- **MUST** optimize bundle size with Next.js dynamic imports

---

## 10. Monitoring & Logging Rules

### 10.1 Logging Standards
- **MUST** use structured logging (JSON format)
- **MUST** include correlation IDs for request tracing
- **MUST** log at appropriate levels (ERROR, WARN, INFO, DEBUG)
- **MUST** avoid excessive logging in production
- **MUST** rotate logs and implement retention policies

### 10.2 Monitoring Requirements
- **MUST** monitor application health metrics
- **MUST** set up alerts for critical errors
- **MUST** track business metrics (conversion, success rates)
- **MUST** monitor third-party service availability
- **MUST** implement SLO/SLA tracking

---

## 11. Special Considerations for BVER

### 11.1 Property Tax Domain
- **MUST** validate jurisdiction-specific rules before processing
- **MUST** check appeal deadlines before allowing form generation
- **MUST** ensure generated forms match official templates exactly
- **MUST** maintain accuracy in financial calculations
- **MUST** provide clear disclaimers about legal advice

### 11.2 User Trust
- **MUST** be transparent about data sources and calculations
- **MUST** provide explanations for assessment recommendations
- **MUST** clearly indicate what actions are automated vs manual
- **MUST** maintain user data privacy and confidentiality
- **MUST** provide clear success/failure feedback

### 11.3 Scalability Considerations
- **MUST** design for multi-tenancy using Supabase RLS
- **MUST** implement proper data isolation between users
- **MUST** plan for geographic expansion (multiple jurisdictions)
- **MUST** consider bulk operations within serverless constraints
- **MUST** optimize for peak usage periods (leverage auto-scaling)
- **MUST** plan migration path if serverless limits are exceeded
- **MUST** use background jobs wisely (Vercel Cron or external queues)

---

## 12. Development Workflow Rules

### 12.1 Version Control
- **MUST** create feature branches from main/develop
- **MUST** write descriptive commit messages
- **MUST** squash commits before merging to main
- **MUST** never force push to shared branches
- **MUST** resolve conflicts locally before pushing

### 12.2 Code Review Process
- **MUST** require at least one approval before merging
- **MUST** address all review comments
- **MUST** run tests locally before creating PR
- **MUST** update relevant documentation in same PR
- **MUST** link PR to issue/ticket number

### 12.3 Bug Fixes
- **MUST** write a test that reproduces the bug first
- **MUST** fix the bug with minimal code changes
- **MUST** verify fix doesn't break existing functionality
- **MUST** document the root cause in commit message
- **MUST** consider if similar bugs exist elsewhere

---

## 13. Emergency Response Rules

### 13.1 Production Issues
- **MUST** follow incident response procedures
- **MUST** communicate status to stakeholders
- **MUST** prioritize data integrity over availability
- **MUST** document post-mortem for major incidents
- **MUST** implement preventive measures from learnings

### 13.2 Security Incidents
- **MUST** immediately isolate affected systems
- **MUST** preserve evidence for investigation
- **MUST** notify users if data breach occurred
- **MUST** reset all potentially compromised credentials
- **MUST** conduct thorough security audit post-incident

---

## Usage Instructions for LLMs

When assisting with BVER development:

1. **Always check these rules before generating code**
2. **Prioritize security and data protection**
3. **Ensure all code includes appropriate tests**
4. **Validate against jurisdiction-specific requirements**
5. **Consider performance implications of solutions**
6. **Maintain consistency with existing codebase**
7. **Document any assumptions made**
8. **Flag any potential compliance issues**
9. **Suggest improvements when you see violations**
10. **Ask for clarification when requirements are ambiguous**

Remember: The goal is to build a reliable, secure, and user-friendly platform that helps people save money on property taxes while maintaining full legal compliance.