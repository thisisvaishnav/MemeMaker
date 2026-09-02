# Graph Report - MemeMaker  (2026-09-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 154 nodes · 183 edges · 28 communities (8 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f9958de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthModal.astro
- index.astro
- components.json
- package.json
- ShadcnDemo.tsx
- tsconfig.json
- main
- dependencies
- colors.ts
- @astrojs/react
- @aws-sdk/client-s3
- class-variance-authority
- clsx
- @fontsource/inter
- @fontsource/jetbrains-mono
- lucide-react
- @radix-ui/react-slot
- react
- react-dom
- @supabase/supabase-js
- tailwindcss
- @tailwindcss/vite
- tw-colors
- @types/react
- @types/react-dom

## God Nodes (most connected - your core abstractions)
1. `cn()` - 10 edges
2. `scripts` - 7 edges
3. `main()` - 6 edges
4. `aliases` - 6 edges
5. `run()` - 5 edges
6. `tailwind` - 5 edges
7. `compilerOptions` - 5 edges
8. `clearImage()` - 4 edges
9. `loadImage()` - 4 edges
10. `openDB()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `MemeMaker()` --calls--> `clearImage()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts
- `MemeMaker()` --calls--> `loadImage()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts
- `Button` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/button.tsx → src/lib/utils.ts
- `Card` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `CardContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (28 total, 17 thin omitted)

### Community 0 - "AuthModal.astro"
Cohesion: 0.10
Nodes (17): alertBox, clearAlert(), closeBtn, googleBtn, modal, nameField, setMode(), submitText (+9 more)

### Community 1 - "index.astro"
Cohesion: 0.15
Nodes (11): MemeMaker(), templates, TextLayer, clearImage(), loadImage(), openDB(), saveImage(), acceptedImageTypes (+3 more)

### Community 2 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+8 more)

### Community 3 - "package.json"
Cohesion: 0.12
Nodes (15): devDependencies, playwright, engines, node, name, scripts, astro, build (+7 more)

### Community 4 - "ShadcnDemo.tsx"
Cohesion: 0.30
Nodes (10): Button, ButtonProps, buttonVariants, Card, CardContent, CardDescription, CardFooter, CardHeader (+2 more)

### Community 5 - "tsconfig.json"
Cohesion: 0.15
Nodes (12): **/*, astro/tsconfigs/strict, .astro/types.d.ts, dist, compilerOptions, baseUrl, jsx, jsxImportSource (+4 more)

### Community 6 - "main"
Cohesion: 0.76
Nodes (6): clone_repo(), main(), run(), update_repo(), write_source_file(), Path

### Community 7 - "dependencies"
Cohesion: 0.29
Nodes (7): astro, dependencies, astro, tailwind-merge, tw-animate, tailwind-merge, tw-animate

## Knowledge Gaps
- **76 isolated node(s):** `TextLayer`, `ButtonProps`, `alertBox`, `closeBtn`, `googleBtn` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 87 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `@astrojs/react`, `@aws-sdk/client-s3`, `class-variance-authority`, `clsx`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, `lucide-react`, `@radix-ui/react-slot`, `react`, `react-dom`, `@supabase/supabase-js`, `tailwindcss`, `@tailwindcss/vite`, `tw-colors`, `@types/react`, `@types/react-dom`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `TextLayer`, `ButtonProps`, `alertBox` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthModal.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.09956709956709957 - nodes in this community are weakly interconnected._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._