# MemeMaker (Astro)

Astro project scaffolded with the `minimal` template.

## 🚀 Project Structure

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where Astro/React/Vue/Svelte/Preact components typically live.

Any static assets, like images, can be placed in the `public/` directory.

## 🛠️ Tech Stack & Integrations

- **Framework**: [Astro v5+](https://astro.build)
- **UI & Components**: [React 19](https://react.dev) + [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)

## 🧩 Using shadcn/ui Components

shadcn components are located in `src/components/ui/`. 

To use existing components in your React components or Astro pages:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
```

To add new shadcn components, run:
```bash
npx shadcn@latest add <component-name>
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

See `AGENTS.md` for development workflow notes (e.g. running the dev server in background mode).

## 👀 Want to learn more?

Feel free to check [the Astro documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).

