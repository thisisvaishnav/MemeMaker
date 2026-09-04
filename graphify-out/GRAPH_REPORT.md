# Graph Report - MemeMaker  (2026-09-04)

## Corpus Check
- 234 files · ~265,807 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1785 nodes · 1642 edges · 237 communities (216 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea9f890d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Header.astro
- Changes from v3
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
- Pseudo-class reference
- @fontsource/jetbrains-mono
- lucide-react
- MemeMaker — Design & Architecture Specification
- react
- Functional utilities
- @supabase/supabase-js
- tailwindcss
- Thinking in utility classes
- Customizing your theme
- @types/react
- @types/react-dom
- Container queries
- Tailwind Engineering Playbook
- Examples
- Pseudo-classes
- Examples
- Examples
- Examples
- Sass, Less, and Stylus
- Explicitly registering sources
- Examples
- Examples
- Media and feature queries
- Examples
- Customizing your colors
- Examples
- Overview
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Tailwind 4 Docs
- Examples
- Examples
- hover-focus-and-other-states.mdx
- Examples
- Examples
- Examples
- Examples
- MemeMaker (Astro)
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Pseudo-elements
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- editor-setup.mdx
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- scripts
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Attribute selectors
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Toggling dark mode manually
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- functions-and-directives.mdx
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Web Interface Guidelines
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- Examples
- AGENTS.md
- rules/graphify.md
- gotchas.md
- workflows/graphify.md
- tailwind-merge
- tw-animate
- imageStore.ts

## God Nodes (most connected - your core abstractions)
1. `Pseudo-class reference` - 38 edges
2. `Changes from v3` - 27 edges
3. `Tailwind Engineering Playbook` - 19 edges
4. `Examples` - 13 edges
5. `Media and feature queries` - 13 edges
6. `Examples` - 12 edges
7. `Examples` - 12 edges
8. `openDB()` - 11 edges
9. `Examples` - 11 edges
10. `cn()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `updateUserUI()` --calls--> `getUserAvatarUrl()`  [EXTRACTED]
  src/components/Header.astro → src/lib/avatar.ts
- `MemeMaker()` --calls--> `clearImage()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts
- `MemeMaker()` --calls--> `clearTemplateUrl()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts
- `MemeMaker()` --calls--> `getCustomTemplateById()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts
- `MemeMaker()` --calls--> `loadImage()`  [EXTRACTED]
  src/components/MemeMaker.tsx → src/lib/imageStore.ts

## Import Cycles
- None detected.

## Communities (237 total, 18 thin omitted)

### Community 0 - "Header.astro"
Cohesion: 0.08
Nodes (24): alertBox, clearAlert(), closeBtn, googleBtn, modal, nameField, setMode(), submitText (+16 more)

### Community 1 - "Changes from v3"
Cohesion: 0.05
Nodes (41): Adding custom utilities, Arbitrary values in grid and object-position utilities, Browser requirements, Buttons use the default cursor, Changes from v3, Container configuration, Default border color, Default ring width and color (+33 more)

### Community 2 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+8 more)

### Community 3 - "package.json"
Cohesion: 0.22
Nodes (8): devDependencies, playwright, engines, node, name, type, version, playwright

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
Cohesion: 0.15
Nodes (13): astro, @fontsource/inter, dependencies, astro, @fontsource/inter, @radix-ui/react-slot, react-dom, @tailwindcss/vite (+5 more)

### Community 13 - "Pseudo-class reference"
Cohesion: 0.05
Nodes (34): :active, :autofill, :checked, :default, :details-content, :disabled, :empty, :enabled (+26 more)

### Community 16 - "MemeMaker — Design & Architecture Specification"
Cohesion: 0.08
Nodes (23): 1. Product Vision & UX Principles, 2.1 Color Palette & Theme Tokens, 2.2 Atmospheric Brand Mesh Gradient, 2.3 Typography Matrix, 2. Visual Design System, 3.1 Stack Breakdown, 3. Architecture & Technical Stack, 4.1 Global Navigation Header (`src/components/Header.astro`) (+15 more)

### Community 18 - "Functional utilities"
Cohesion: 0.08
Nodes (24): Adding base styles, Adding component classes, Adding custom utilities, Adding custom variants, Arbitrary properties, Arbitrary values, Arbitrary variants, Bare values (+16 more)

### Community 21 - "Thinking in utility classes"
Cohesion: 0.09
Nodes (21): Complex selectors, Conflicting utility classes, How does this even work?, Managing duplication, Managing style conflicts, Media queries and breakpoints, Overview, Styling hover and focus states (+13 more)

### Community 22 - "Customizing your theme"
Cohesion: 0.10
Nodes (20): Customizing your theme, Default theme variable reference, Default theme variables, Defining animation keyframes, Extending the default theme, Generating all CSS variables, Overriding the default theme, Overview (+12 more)

### Community 28 - "Container queries"
Cohesion: 0.10
Nodes (19): Basic example, Container queries, Container query ranges, Container size reference, Customizing your theme, Max-width container queries, Named containers, Overview (+11 more)

### Community 29 - "Tailwind Engineering Playbook"
Cohesion: 0.10
Nodes (19): `@apply`, Arbitrary values, Component classes, Core mindset, Custom utilities, Custom variants, Default workflow, File organization (+11 more)

### Community 30 - "Examples"
Cohesion: 0.11
Nodes (17): Adding a ring, Adding an inset ring, Adding an inset shadow, Basic example, Changing the opacity, Customizing inset shadows, Customizing shadow colors, Customizing shadows (+9 more)

### Community 31 - "Pseudo-classes"
Cohesion: 0.13
Nodes (14): Arbitrary groups, Arbitrary peers, Differentiating nested groups, Differentiating peers, :first, :last, :odd, and :even, :has(), :hover, :focus, and :active, Implicit groups (+6 more)

### Community 32 - "Examples"
Cohesion: 0.14
Nodes (13): Adding horizontal margin, Adding margin to a single side, Adding space between children, Adding vertical margin, Basic example, Customizing your theme, Examples, Limitations (+5 more)

### Community 33 - "Examples"
Cohesion: 0.14
Nodes (13): Adding a conic mask, Adding a radial mask, Adding an angled linear mask, Combining masks, Customizing your theme, Examples, Masking edges, Removing mask images (+5 more)

### Community 34 - "Examples"
Cohesion: 0.15
Nodes (12): Adding a conic gradient, Adding a linear gradient, Adding a radial gradient, Basic example, Changing interpolation mode, Customizing your theme, Examples, Removing background images (+4 more)

### Community 35 - "Sass, Less, and Stylus"
Cohesion: 0.15
Nodes (12): Browser support, Build-time imports, Color and math functions, CSS modules, Explicit context sharing, Loops, Nesting, Performance (+4 more)

### Community 36 - "Explicitly registering sources"
Cohesion: 0.15
Nodes (12): Disabling automatic detection, Dynamic class names, Explicitly excluding classes, Explicitly registering sources, How classes are detected, Ignoring specific paths, Overview, Safelisting specific utilities (+4 more)

### Community 37 - "Examples"
Cohesion: 0.15
Nodes (12): Block and Inline, Contents, Examples, Flex, Flow Root, Grid, Hidden, Inline Flex (+4 more)

### Community 38 - "Examples"
Cohesion: 0.15
Nodes (12): Examples, Resetting numeric font variants, Responsive design, Stacking multiple utilities, Using diagonal fractions, Using lining figures, Using oldstyle figures, Using ordinal glyphs (+4 more)

### Community 39 - "Media and feature queries"
Cohesion: 0.15
Nodes (13): forced-colors, inverted-colors, Media and feature queries, orientation, pointer and any-pointer, prefers-color-scheme, prefers-contrast, prefers-reduced-motion (+5 more)

### Community 40 - "Examples"
Cohesion: 0.17
Nodes (11): Applying on focus, Basic example, Changing the opacity, Customizing your theme, Divider between children, Examples, Horizontal and vertical sides, Individual sides (+3 more)

### Community 41 - "Customizing your colors"
Cohesion: 0.17
Nodes (11): Adjusting opacity, Customizing your colors, Default color palette reference, Disabling default colors, Overriding default colors, Referencing in CSS, Referencing other variables, Targeting dark mode (+3 more)

### Community 42 - "Examples"
Cohesion: 0.17
Nodes (11): Basic example, Customizing your theme, Examples, Matching dynamic viewport, Matching large viewport, Matching small viewport, Matching viewport, Responsive design (+3 more)

### Community 43 - "Overview"
Cohesion: 0.17
Nodes (11): Accessibility considerations, Border styles are reset, Disabling Preflight, Elements with a `hidden` attribute stay hidden, Extending Preflight, Headings are unstyled, Images are block-level, Images are constrained (+3 more)

### Community 44 - "Examples"
Cohesion: 0.18
Nodes (10): Center, End, Examples, Normal, Responsive design, Space around, Space between, Space evenly (+2 more)

### Community 45 - "Examples"
Cohesion: 0.18
Nodes (10): Basic example, Customizing your theme, Examples, Matching dynamic viewport, Matching large viewport, Matching small viewport, Matching viewport, Responsive design (+2 more)

### Community 46 - "Examples"
Cohesion: 0.18
Nodes (10): Basic example, Creating pill buttons, Customizing your theme, Examples, Removing the border radius, Responsive design, Rounding corners separately, Rounding sides separately (+2 more)

### Community 47 - "Examples"
Cohesion: 0.18
Nodes (10): Basic example, Changing the opacity, Customizing drop shadows, Customizing shadow colors, Customizing your theme, Examples, Removing a drop shadow, Responsive design (+2 more)

### Community 48 - "Examples"
Cohesion: 0.18
Nodes (10): Center, End, Examples, Normal, Responsive design, Space around, Space between, Space evenly (+2 more)

### Community 49 - "Examples"
Cohesion: 0.18
Nodes (10): Examples, Hiding content that overflows, Responsive design, Scrolling horizontally always, Scrolling horizontally if needed, Scrolling if needed, Scrolling in all directions, Scrolling vertically always (+2 more)

### Community 50 - "Examples"
Cohesion: 0.18
Nodes (10): Basic example, Changing the opacity, Customizing shadow colors, Customizing text shadows, Customizing your theme, Examples, Removing a text shadow, Responsive design (+2 more)

### Community 51 - "Examples"
Cohesion: 0.18
Nodes (10): Basic example, Customizing your theme, Examples, Matching the viewport, Resetting the width, Responsive design, Setting both width and height, Using a custom value (+2 more)

### Community 52 - "Examples"
Cohesion: 0.20
Nodes (9): Auto, Baseline, Center, End, Examples, Last baseline, Responsive design, Start (+1 more)

### Community 53 - "Examples"
Cohesion: 0.20
Nodes (9): Adding a bounce animation, Adding a ping animation, Adding a pulse animation, Adding a spin animation, Customizing your theme, Examples, Responsive design, Supporting reduced motion (+1 more)

### Community 54 - "Examples"
Cohesion: 0.20
Nodes (9): Basic example, Between children, Examples, Horizontal and vertical sides, Individual sides, Responsive design, Reversing children order, Using a custom value (+1 more)

### Community 55 - "Examples"
Cohesion: 0.20
Nodes (9): Basic example, Customizing your theme, Examples, Matching the viewport, Resetting the inline size, Responsive design, Using a custom value, Using a percentage (+1 more)

### Community 56 - "Examples"
Cohesion: 0.20
Nodes (9): Adding horizontal padding, Adding padding to one side, Adding vertical padding, Basic example, Customizing your theme, Examples, Responsive design, Using a custom value (+1 more)

### Community 57 - "Examples"
Cohesion: 0.20
Nodes (9): Center, End, Examples, Responsive design, Space around, Space between, Space evenly, Start (+1 more)

### Community 58 - "Examples"
Cohesion: 0.20
Nodes (9): Aligning to baseline, Aligning to bottom, Aligning to middle, Aligning to parent bottom, Aligning to parent top, Aligning to top, Examples, Responsive design (+1 more)

### Community 59 - "Tailwind 4 Docs"
Cohesion: 0.20
Nodes (9): Common entry points, Initialization (required once per install), MDX handling, Migration checklist, Overview, Quick start, References map, Tailwind 4 Docs (+1 more)

### Community 60 - "Examples"
Cohesion: 0.22
Nodes (8): Baseline, Center, End, Examples, Last baseline, Responsive design, Start, Stretch

### Community 61 - "Examples"
Cohesion: 0.22
Nodes (8): Basic example, Disabling repeating, Examples, Preventing clipping, Preventing clipping and gaps, Repeating horizontally, Repeating vertically, Responsive design

### Community 62 - "hover-focus-and-other-states.mdx"
Cohesion: 0.22
Nodes (8): Appendix, Child selectors, Custom variants, Quick reference, Registering a custom variant, Styling all descendants, Styling direct children, Using arbitrary variants

### Community 63 - "Examples"
Cohesion: 0.22
Nodes (8): Basic example, Disabling repeating, Examples, Preventing clipping, Preventing clipping and gaps, Repeating horizontally, Repeating vertically, Responsive design

### Community 64 - "Examples"
Cohesion: 0.22
Nodes (8): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage, Using breakpoints container, Using the container scale

### Community 65 - "Examples"
Cohesion: 0.22
Nodes (8): Examples, Responsive design, Translating on the x-axis, Translating on the y-axis, Translating on the z-axis, Using a custom value, Using a percentage, Using the spacing scale

### Community 66 - "Examples"
Cohesion: 0.22
Nodes (8): Break Spaces, Examples, No Wrap, Normal, Pre, Pre Line, Pre Wrap, Responsive design

### Community 67 - "MemeMaker (Astro)"
Cohesion: 0.22
Nodes (8): 🧠 Codebase Knowledge Graph (Graphify), 🧞 Commands, Graphify Commands, MemeMaker (Astro), 🚀 Project Structure, 🛠️ Tech Stack & Integrations, 🧩 Using shadcn/ui Components, 👀 Want to learn more?

### Community 68 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Changing the opacity, Customizing your theme, Examples, Responsive design, Setting the accent color, Using a custom value

### Community 69 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Basic example, Changing the opacity, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 70 - "Examples"
Cohesion: 0.25
Nodes (7): Clearing all, Clearing left, Clearing right, Disabling clears, Examples, Responsive design, Using logical properties

### Community 71 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Basic example, Changing the opacity, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 72 - "Examples"
Cohesion: 0.25
Nodes (7): Customizing your theme, Examples, Responsive design, Setting by number, Setting by width, Setting the column gap, Using a custom value

### Community 73 - "Examples"
Cohesion: 0.25
Nodes (7): Auto, Basic example, Examples, Initial, None, Responsive design, Using a custom value

### Community 74 - "Examples"
Cohesion: 0.25
Nodes (7): Customizing your theme, Examples, Responsive design, Using a custom value, Using percentages, Using the container scale, Using the spacing scale

### Community 75 - "Pseudo-elements"
Cohesion: 0.25
Nodes (8): ::backdrop, ::before and ::after, ::file, ::first-line and ::first-letter, ::marker, ::placeholder, Pseudo-elements, ::selection

### Community 76 - "Examples"
Cohesion: 0.25
Nodes (7): Auto, Center, End, Examples, Responsive design, Start, Stretch

### Community 77 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Removing the leading, Responsive design, Setting independently, Using a custom value

### Community 78 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage, Using the container scale

### Community 79 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage, Using the container scale

### Community 80 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage, Using the container scale

### Community 81 - "Examples"
Cohesion: 0.25
Nodes (7): Containing within, Examples, Resizing to cover, Responsive design, Scaling down, Stretching to fit, Using the original size

### Community 82 - "Examples"
Cohesion: 0.25
Nodes (7): Auto, Center, End, Examples, Responsive design, Start, Stretch

### Community 83 - "Examples"
Cohesion: 0.25
Nodes (7): Absolutely positioning elements, Examples, Fixed positioning elements, Relatively positioning elements, Responsive design, Statically positioning elements, Sticky positioning elements

### Community 84 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Basic example, Examples, Scaling on the x-axis, Scaling on the y-axis, Using a custom value, Using negative values

### Community 85 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using logical properties, Using negative values

### Community 86 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Changing the opacity, Customizing your theme, Examples, Responsive design, Setting the scrollbar color, Using a custom value

### Community 87 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Examples, Responsive design, Skewing on the x-axis, Skewing on the y-axis, Using a custom value, Using negative values

### Community 88 - "Examples"
Cohesion: 0.25
Nodes (7): Centering text, Examples, Justifying text, Left aligning text, Responsive design, Right aligning text, Using logical properties

### Community 89 - "Examples"
Cohesion: 0.25
Nodes (7): Applying on hover, Basic example, Changing the opacity, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 90 - "Examples"
Cohesion: 0.25
Nodes (7): Adding a line through text, Adding an overline to text, Applying on hover, Examples, Removing a line from text, Responsive design, Underling text

### Community 91 - "Examples"
Cohesion: 0.25
Nodes (7): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using logical properties, Using negative values

### Community 92 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a video aspect ratio

### Community 93 - "Examples"
Cohesion: 0.29
Nodes (6): Applying on hover, Basic example, Examples, Removing filters, Responsive design, Using a custom value

### Community 94 - "Examples"
Cohesion: 0.29
Nodes (6): Examples, Filling the container, Filling without cropping, Responsive design, Using a custom value, Using the default size

### Community 95 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Examples, Referencing an attribute value, Responsive design, Using a CSS variable, Using spaces and underscores

### Community 96 - "editor-setup.mdx"
Cohesion: 0.29
Nodes (6): Class sorting with Prettier, Cursor, IntelliSense for VS Code, JetBrains IDEs, Syntax support, Zed

### Community 97 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using the current color

### Community 98 - "Examples"
Cohesion: 0.29
Nodes (6): Applying on hover, Basic example, Examples, Removing filters, Responsive design, Using a custom value

### Community 99 - "Examples"
Cohesion: 0.29
Nodes (6): Column, Column reversed, Examples, Responsive design, Row, Row reversed

### Community 100 - "Examples"
Cohesion: 0.29
Nodes (6): Allowing items to grow, Examples, Growing items based on factor, Preventing items from growing, Responsive design, Using a custom value

### Community 101 - "Examples"
Cohesion: 0.29
Nodes (6): Disabling a float, Examples, Floating elements to the left, Floating elements to the right, Responsive design, Using logical properties

### Community 102 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Setting the line-height, Using a custom value

### Community 103 - "Examples"
Cohesion: 0.29
Nodes (6): Center, End, Examples, Responsive design, Start, Stretch

### Community 104 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using negative values

### Community 105 - "Examples"
Cohesion: 0.29
Nodes (6): Examples, Filling the container, Filling without cropping, Responsive design, Using a custom value, Using the default size

### Community 106 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage

### Community 107 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage

### Community 108 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage

### Community 109 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using a percentage

### Community 110 - "Examples"
Cohesion: 0.29
Nodes (6): Examples, Explicitly setting a sort order, Ordering items first or last, Responsive design, Using a custom value, Using negative values

### Community 111 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Changing the opacity, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 112 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Removing a perspective, Responsive design, Using a custom value

### Community 113 - "Examples"
Cohesion: 0.29
Nodes (6): Center, End, Examples, Responsive design, Start, Stretch

### Community 114 - "Examples"
Cohesion: 0.29
Nodes (6): Examples, Prevent resizing, Resizing horizontally, Resizing in all directions, Resizing vertically, Responsive design

### Community 115 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Examples, Responsive design, Rotating in 3D space, Using a custom value, Using negative values

### Community 116 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using logical properties

### Community 117 - "Examples"
Cohesion: 0.29
Nodes (6): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value, Using the current color

### Community 118 - "Examples"
Cohesion: 0.29
Nodes (6): Capitalizing text, Examples, Lowercasing text, Resetting text casing, Responsive design, Uppercasing text

### Community 119 - "Examples"
Cohesion: 0.29
Nodes (6): Allowing text to wrap, Balanced text wrapping, Examples, Pretty text wrapping, Preventing text from wrapping, Responsive design

### Community 120 - "Examples"
Cohesion: 0.29
Nodes (6): Allowing text selection, Disabling text selection, Examples, Responsive design, Selecting all text in one click, Using auto select behavior

### Community 121 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, astro, build, dev, graphify, graphify:export, preview

### Community 122 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 123 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Using a custom value, Using negative values

### Community 124 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Fixing the background image, Responsive design, Scrolling with the container, Scrolling with the viewport

### Community 125 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 126 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Removing a border, Responsive design, Setting the divider style

### Community 127 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 128 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 129 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Using a custom value, Using negative values

### Community 130 - "Examples"
Cohesion: 0.33
Nodes (5): Allowing flex items to shrink, Examples, Preventing items from shrinking, Responsive design, Using a custom value

### Community 131 - "Examples"
Cohesion: 0.33
Nodes (5): Don't wrap, Examples, Responsive design, Wrap normally, Wrap reversed

### Community 132 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 133 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Enabling multiple features, Examples, Responsive design, Using CSS variables

### Community 134 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Using a custom value, Using percentages

### Community 135 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 136 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Changing row and column gaps independently, Examples, Responsive design, Using a custom value

### Community 137 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Responsive design, Spanning columns, Starting and ending lines, Using a custom value

### Community 138 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Responsive design, Spanning rows, Starting and ending lines, Using a custom value

### Community 139 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Implementing a subgrid, Responsive design, Specifying the grid columns, Using a custom value

### Community 140 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Implementing a subgrid, Responsive design, Specifying the grid rows, Using a custom value

### Community 141 - "Attribute selectors"
Cohesion: 0.33
Nodes (6): ARIA states, Attribute selectors, Data attributes, Open/closed state, RTL support, Styling inert elements

### Community 142 - "Examples"
Cohesion: 0.33
Nodes (5): Automatic hyphenation, Examples, Manual hyphenation, Preventing hyphenation, Responsive design

### Community 143 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Undoing line clamping, Using a custom value

### Community 144 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Removing a marker image, Responsive design, Using a CSS variable

### Community 145 - "Examples"
Cohesion: 0.33
Nodes (5): Applying conditionally, Basic example, Examples, Responsive design, Using a custom value

### Community 146 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Hiding an outline, Removing outlines, Responsive design

### Community 147 - "Examples"
Cohesion: 0.33
Nodes (5): Applying on focus, Basic example, Examples, Responsive design, Using a custom value

### Community 148 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Responsive design, Wrapping anywhere, Wrapping mid-word, Wrapping normally

### Community 149 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Preventing overscroll bouncing, Preventing parent overscrolling, Responsive design, Using the default overscroll behavior

### Community 150 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Responsive design, Snapping to the center, Snapping to the end, Snapping to the start

### Community 151 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Horizontal scroll snapping, Mandatory scroll snapping, Proximity scroll snapping, Responsive design

### Community 152 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Reserving space for the scrollbar, Reserving space on both sides, Responsive design, Using the default gutter

### Community 153 - "Examples"
Cohesion: 0.33
Nodes (5): Examples, Hiding scrollbars, Responsive design, Using a thin scrollbar, Using the default scrollbar width

### Community 154 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Using a custom value, Using negative values

### Community 155 - "Examples"
Cohesion: 0.33
Nodes (5): Adding an ellipsis, Clipping text, Examples, Responsive design, Truncating text

### Community 156 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Supporting reduced motion, Using a custom value

### Community 157 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Supporting reduced motion, Using a custom value

### Community 158 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Supporting reduced motion, Using a custom value

### Community 159 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Customizing your theme, Examples, Responsive design, Using a custom value

### Community 160 - "Examples"
Cohesion: 0.33
Nodes (5): Collapsing elements, Examples, Making elements invisible, Making elements visible, Responsive design

### Community 161 - "Examples"
Cohesion: 0.33
Nodes (5): Break All, Break Keep, Examples, Normal, Responsive design

### Community 162 - "Examples"
Cohesion: 0.33
Nodes (5): Basic example, Examples, Responsive design, Using a custom value, Using negative values

### Community 163 - "Examples"
Cohesion: 0.33
Nodes (5): Applying on hover, Basic example, Examples, Responsive design, Using a custom value

### Community 164 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Removing default appearance, Responsive design, Restoring default appearance

### Community 165 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 166 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 167 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 168 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 169 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 170 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 171 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 172 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Cropping to text, Examples, Responsive design

### Community 173 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 174 - "Examples"
Cohesion: 0.40
Nodes (4): Collapsing table borders, Examples, Responsive design, Separating table borders

### Community 175 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Excluding borders and padding, Including borders and padding, Responsive design

### Community 176 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Placing at bottom of table, Placing at top of table, Responsive design

### Community 177 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 178 - "Toggling dark mode manually"
Cohesion: 0.40
Nodes (4): Overview, Toggling dark mode manually, Using a data attribute, With system theme support

### Community 179 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Responsive design, Sizing based on content, Using a fixed size

### Community 180 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 181 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 182 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 183 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 184 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 185 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 186 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Grayscale antialiasing, Responsive design, Subpixel antialiasing

### Community 187 - "Examples"
Cohesion: 0.40
Nodes (4): Displaying text normally, Examples, Italicizing text, Responsive design

### Community 188 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Opting out of forced colors, Responsive design, Restoring forced colors

### Community 189 - "functions-and-directives.mdx"
Cohesion: 0.40
Nodes (4): Compatibility, Directives, Functions, Subpath Imports

### Community 190 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 191 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 192 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 193 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 194 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Isolating blending, Responsive design

### Community 195 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 196 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 197 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 198 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Forcing snap position stops, Responsive design, Skipping snap position stops

### Community 199 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 200 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 201 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Responsive design, Sizing columns automatically, Using fixed column widths

### Community 202 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 203 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 204 - "Examples"
Cohesion: 0.40
Nodes (4): Examples, Hardware acceleration, Removing transforms, Using a custom value

### Community 205 - "Examples"
Cohesion: 0.40
Nodes (4): Basic example, Examples, Responsive design, Using a custom value

### Community 206 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

### Community 207 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 208 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 209 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 210 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 211 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 212 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 213 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 214 - "Examples"
Cohesion: 0.50
Nodes (3): Applying in dark mode, Basic example, Examples

### Community 215 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 216 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 217 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 218 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 219 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 220 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 221 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 222 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 223 - "Examples"
Cohesion: 0.50
Nodes (3): Examples, Ignoring pointer events, Restoring pointer events

### Community 224 - "Examples"
Cohesion: 0.50
Nodes (3): Examples, Using normal scrolling, Using smooth scrolling

### Community 225 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 226 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 227 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 228 - "Examples"
Cohesion: 0.50
Nodes (3): Basic example, Examples, Responsive design

### Community 229 - "Examples"
Cohesion: 0.50
Nodes (3): Examples, Optimizing with will change, Using a custom value

### Community 236 - "imageStore.ts"
Cohesion: 0.09
Nodes (30): MemeMaker(), templates, TextLayer, clearImage(), clearTemplateUrl(), CustomTemplate, deleteCustomTemplate(), getCustomTemplateById() (+22 more)

## Knowledge Gaps
- **1226 isolated node(s):** `colors`, `$schema`, `style`, `rsc`, `tsx` (+1221 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1386 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pseudo-class reference` connect `Pseudo-class reference` to `hover-focus-and-other-states.mdx`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `Pseudo-classes` connect `Pseudo-classes` to `hover-focus-and-other-states.mdx`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `Appendix` connect `hover-focus-and-other-states.mdx` to `Pseudo-class reference`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `colors`, `$schema`, `style` to the rest of the system?**
  _1226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Header.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.08374384236453201 - nodes in this community are weakly interconnected._
- **Should `Changes from v3` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._