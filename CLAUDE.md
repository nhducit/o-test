# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal E2E test suite for the O2O platform using Playwright. Tests HQ Admin application functionality.

## Commands

```bash
# Install dependencies
pnpm install

# Install Playwright browsers (required first time)
pnpm run install-browsers

# Run all tests
pnpm test

# Run tests with UI mode (interactive)
pnpm run test:ui

# Run tests in headed mode (visible browser)
pnpm run test:headed

# Run tests in debug mode
pnpm run test:debug

# Run a single test file
pnpm playwright test tests/hq-admin/storyboard-and-copy/storyboard-and-copy.spec.ts

# Run tests matching a pattern
pnpm playwright test -g "should load the page"

# View HTML test report
pnpm run show-report
```

## Architecture

### Configuration
- `env.ts` - Environment validation using Zod. Loads `.env.local` (local overrides) then `.env`. Required vars: `HQ_ADMIN_AUTH_EMAIL`, `HQ_ADMIN_AUTH_PASSWORD`
- `config.ts` - Application URLs and auth file paths. Uses `localDomain.hqAdmin` (`http://hqadmin.localhost:8087`)
- `playwright.config.ts` - Test configuration with setup project for authentication

### Test Structure
- `tests/auth.setup.ts` - Authentication setup that runs before all tests. Saves session to `playwright/.auth/hq-admin-user.json`
- `tests/hq-admin/` - Tests organized by HQ Admin feature area
- Page Object pattern: Each feature has a `page-objects/` directory with page classes

### Key Patterns
- Tests use Page Object Model - create page object instances in `beforeEach`
- Authentication state is reused via Playwright storage state (no login per test)
- Feature flags are set in localStorage during auth setup (e.g., `hq-admin.campaignAi`)
- Use `data-testid` attributes for element selection
- Variant operations (add/delete) check button visibility before acting

## Environment Setup

Copy `.env.example` to `.env.local` and fill in credentials:
```
HQ_ADMIN_AUTH_EMAIL=your-email@example.com
HQ_ADMIN_AUTH_PASSWORD=your-password
```
