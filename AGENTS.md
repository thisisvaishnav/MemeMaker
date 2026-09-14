## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project Architecture & Tech Stack (MemeMaker)

- **Production Domain**: [`realmememaker.com`](https://realmememaker.com)
- **Hosting & Deployments**: Vercel (static deployments with `@vercel/speed-insights`).
- **Framework**: Astro 7 (`astro.config.mjs`).
- **UI & Islands**: React 19 (`@astrojs/react`) with Lucide icons (`lucide-react`) and Tailwind CSS v4 (`@tailwindcss/vite`).
- **Database & Auth**: Supabase (`@supabase/supabase-js`, migrations in `supabase/migrations/`).
- **MCP Integrations**:
  - **Supabase MCP**: Active via `~/.gemini/config/mcp_config.json` (`project_ref=xmlcrgqhyxzmxwzuyaum`) for database inspection, docs, migrations, and SQL execution.
  - **Vercel MCP**: Not currently configured in `mcp_config.json`. Use the Vercel dashboard or CLI for deployment workflows.
- **Test Suite**: Vitest 5 (`vitest.config.ts`, test files in `tests/`).
- **Knowledge Graph**: Graphify (`graphify extract . --code-only`, graph in `graphify-out/`).

## DNS & Hosting Configuration

| Record | Type | Value | Managed In |
|--------|------|-------|-----------|
| `@` (root) | `A` | `76.76.21.21` | GoDaddy |
| `www` | `CNAME` | `cname.vercel-dns.com` | GoDaddy |

- **Registrar**: GoDaddy (`ns59.domaincontrol.com`, `ns60.domaincontrol.com`)
- **SSL**: Auto-provisioned by Vercel via Let's Encrypt
- **HSTS**: Enabled (`max-age=63072000; includeSubDomains; preload`) in `vercel.json`

> If `ERR_CERT_COMMON_NAME_INVALID` appears: check GoDaddy → DNS → `A` record for `@` is `76.76.21.21`. See `DEPLOYMENT.md` for the full runbook.

## Project-Specific Commands & Verification Workflow

Project requirements take precedence over generic global rules:

1. **Development Server**: Use `astro dev --background` (managed via `astro dev stop|status|logs`).
2. **Mandatory Test Verification**:
   Before marking any feature, refactor, or bug fix complete:
   ```bash
   npm test
   ```
   All tests in `tests/` must pass cleanly without regressions.
3. **Build & Typecheck Verification**:
   ```bash
   npm run build
   ```
   Ensure Astro static/SSR compilation and TypeScript type checking succeed without errors.
4. **Knowledge Graph Sync**:
   After modifying code files, update the graph:
   ```bash
   graphify update .
   ```

