# AGENTS.md

## Required Reading

Always read the following documentation files before starting any task:
- [Cloud Architecture](ai/architecture/cloud-architecture.md) - AWS infrastructure and deployment architecture

## API Calls
All API calls must be made in `src/api/routes.tsx`. Do not make direct fetch/axios calls in components or other files.

## Logging
Do not use console.log in any implementation unless explicitly requested.

## Modals
Every modal should be a new component.

## Input Styling
Never use white backgrounds on input fields. Use transparent or dark backgrounds to ensure text visibility, especially for password fields.

## Date Formatting
All date dropdowns and date fields should follow the Brazilian date pattern: `dd/mm/yyyy`.

## Page Layout Consistency
All new pages should follow the same header padding and button padding used by the existing pages.

## Sensitive Information
All sensitive information such as API keys, secrets, and credentials must be stored in environment variables. Never hardcode keys or secrets directly in the source code.

## Environment Variables
When adding a new environment variable, it must also be added to the CI pipeline configuration.

## Build Commands
Never run `npm run build`.
