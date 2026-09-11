import { t as createComponent } from "./compiler_BSRKz0BZ.mjs";
import { _ as createRenderInstruction, g as addAttribute, h as renderHead, i as renderComponent, m as maybeRenderHead, s as renderSlot, u as renderTemplate, w as createAstro } from "./server_DKvTTH34.mjs";
//#region node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/components/AuthModal.astro
var $$AuthModal = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<div id="auth-modal" class="fixed inset-0 z-100 hidden items-center justify-center p-4 backdrop-blur-md bg-black/60 transition-opacity duration-200" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"><div class="relative w-full max-w-md rounded-2xl border border-white/10 bg-canvas p-6 shadow-2xl transition-all sm:p-8"><!-- Close Button --><button id="close-auth-modal" type="button" class="absolute right-4 top-4 rounded-full p-2 text-mute transition-colors hover:bg-white/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Close modal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><!-- Header --><div class="mb-6 text-center"><h2 id="auth-modal-title" class="text-xl font-bold tracking-tight text-ink">Welcome to MemeMaker</h2><p class="mt-1 text-sm text-body" id="auth-modal-subtitle">Sign in to save, publish, and manage your custom memes</p></div><!-- Mode Toggle (Sign In / Sign Up) --><div class="mb-5 flex rounded-lg bg-black/40 p-1 border border-white/5"><button type="button" id="tab-signin" class="flex-1 rounded-md py-1.5 text-xs font-semibold text-ink bg-white/10 shadow-sm transition-all">Sign In</button><button type="button" id="tab-signup" class="flex-1 rounded-md py-1.5 text-xs font-semibold text-mute hover:text-ink transition-all">Create Account</button></div><!-- Google OAuth Button --><button type="button" id="btn-google-auth" class="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"><svg id="google-icon" class="h-4 w-4 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path></svg><svg id="google-spinner" class="hidden h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span id="btn-google-text">Continue with Google</span></button><!-- Divider --><div class="my-5 flex items-center gap-3"><div class="h-px flex-1 bg-white/10"></div><span class="font-mono text-xs text-mute uppercase">or with email</span><div class="h-px flex-1 bg-white/10"></div></div><!-- Form Message / Alert --><div id="auth-alert" class="mb-4 hidden rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"></div><!-- Email & Password Form --><form id="auth-form" class="space-y-3.5"><div id="auth-name-field" class="hidden"><label for="auth-name" class="mb-1 block text-xs font-medium text-body">Your name</label><input type="text" id="auth-name" autocomplete="name" placeholder="Your name" class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"></div><div><label for="auth-email" class="mb-1 block text-xs font-medium text-body">Email address</label><input type="email" id="auth-email" required placeholder="you@example.com" class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"></div><div><label for="auth-password" class="mb-1 block text-xs font-medium text-body">Password</label><input type="password" id="auth-password" required minlength="6" placeholder="••••••••" class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"></div><button type="submit" id="btn-auth-submit" class="mt-2 flex w-full items-center justify-center rounded-pill bg-primary py-2.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-50"><span id="btn-auth-text">Sign In</span></button></form></div></div>${renderScript($$result, "/Users/bombermac/projectVAS/MemeMaker/src/components/AuthModal.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/components/AuthModal.astro", void 0);
//#endregion
//#region src/components/Header.astro
createAstro("https://realmememaker.com");
var $$Header = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Header;
	const pathname = Astro.url.pathname;
	const isDiscover = pathname === "/";
	const isTemplates = pathname.startsWith("/templates");
	const isCreate = pathname.startsWith("/edit");
	return renderTemplate`${maybeRenderHead($$result)}<header class="sticky top-0 z-50 px-2 pt-2.5 sm:px-5 sm:pt-4"><div class="relative mx-auto flex h-14 max-w-350 items-center justify-between gap-1.5 rounded-full border border-white/10 bg-[#1b1b1b]/95 px-2.5 shadow-[0_14px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:gap-4 sm:px-4"><a href="/" class="relative z-10 flex shrink-0 items-center gap-2 rounded-full text-sm font-semibold tracking-tight text-[#ededed] outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="MemeMaker home"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#ededed] text-black"><svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 14.5V4.25L9 10l6-5.75V14.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span><span class="hidden sm:inline">MemeMaker</span></a><!-- Centre nav --><nav class="pointer-events-auto flex flex-1 min-w-0 items-center justify-center gap-1 mx-0.5 sm:mx-2 md:mx-0 md:flex-initial md:absolute md:left-1/2 md:-translate-x-1/2" aria-label="Main navigation"><a href="/"${addAttribute(`inline-flex h-8 flex-1 sm:flex-initial items-center justify-center rounded-full px-2 sm:px-3.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${isDiscover ? "bg-white/10 text-white" : "text-[#9b9b9b] hover:text-white hover:bg-white/8"}`, "class")}>Discover</a><a href="/templates"${addAttribute(`inline-flex h-8 flex-1 sm:flex-initial items-center justify-center rounded-full px-2 sm:px-3.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${isTemplates ? "bg-white/10 text-white" : "text-[#9b9b9b] hover:text-white hover:bg-white/8"}`, "class")}>Templates</a><a href="/edit"${addAttribute(`inline-flex h-8 flex-1 sm:flex-initial items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${isCreate ? "bg-primary text-on-primary" : "bg-primary/15 text-primary hover:bg-primary/25"}`, "class")}><svg class="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M2 14l1.5-4.5L11 2l3 3-7.5 7.5L2 14z"></path></svg><span>Create</span></a></nav><!-- Slogan — hidden until xl --><p class="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9b9b] xl:hidden">Make memes, not meetings.</p><div class="relative z-10 flex shrink-0 items-center"><div id="auth-unauthenticated" class="flex items-center"><button type="button" id="btn-header-login" class="inline-flex h-8 sm:h-9 items-center rounded-full bg-[#ededed] px-3 sm:px-4 text-xs font-semibold text-black outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1b1b] whitespace-nowrap">Sign up</button></div><div id="auth-authenticated" class="hidden items-center gap-1 sm:gap-1.5"><div class="flex h-8 sm:h-9 min-w-0 items-center gap-1.5 sm:gap-2 rounded-full bg-[#ededed] py-0.5 sm:py-1 pl-1 pr-2.5 sm:pr-3 text-black"><div id="user-avatar-container" class="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#333] text-[10px] font-bold text-white"><span id="user-avatar-initial">?</span><img id="user-avatar-img" src="" alt="" class="hidden h-full w-full object-cover" onerror="this.classList.add('hidden'); document.getElementById('user-avatar-initial')?.classList.remove('hidden')"></div><span id="user-display-name" class="hidden max-w-20 truncate text-xs font-semibold min-[420px]:inline sm:max-w-36">User</span></div><button type="button" id="btn-header-logout" class="rounded-full p-1.5 sm:p-2 text-[#999] outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white" aria-label="Sign out" title="Sign out"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"></path></svg></button></div></div></div></header>${renderComponent($$result, "AuthModal", $$AuthModal, {})}${renderScript($$result, "/Users/bombermac/projectVAS/MemeMaker/src/components/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/components/Header.astro", void 0);
//#endregion
//#region src/components/Footer.astro
var $$Footer = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<footer class="border-t border-hairline bg-canvas px-4 py-16 sm:px-6 sm:py-20"><div class="mx-auto max-w-350"><div class="grid grid-cols-2 gap-10 sm:grid-cols-4">${[
		{
			title: "Product",
			links: [
				{
					label: "Meme Editor",
					href: "/edit"
				},
				{
					label: "Browse Templates",
					href: "/templates"
				},
				{
					label: "Trending Memes",
					href: "/#trending-title"
				},
				{
					label: "Upload Image",
					href: "/edit?upload=1"
				}
			]
		},
		{
			title: "Company",
			links: [
				{
					label: "About Us",
					href: "/about"
				},
				{
					label: "Contact Us",
					href: "/contact"
				},
				{
					label: "FAQ",
					href: "/#faq"
				},
				{
					label: "Why Free?",
					href: "/#why-free"
				}
			]
		},
		{
			title: "Legal",
			links: [
				{
					label: "Privacy Policy",
					href: "/privacy"
				},
				{
					label: "Terms & Conditions",
					href: "/terms"
				},
				{
					label: "No Watermark Policy",
					href: "/#no-watermark"
				},
				{
					label: "No Sign-up Policy",
					href: "/#no-signup"
				}
			]
		},
		{
			title: "Community & Account",
			links: [
				{
					label: "Create Account / Sign In",
					id: "footer-btn-auth",
					action: "auth"
				},
				{
					label: "My Custom Templates",
					href: "/templates#upload-zone"
				},
				{
					label: "GitHub Repository",
					href: "https://github.com/thisisvaishnav/MemeMaker",
					external: true
				}
			]
		}
	].map((col) => renderTemplate`<div><p class="mb-3 font-mono text-xs uppercase tracking-wide text-mute">${col.title}</p><ul class="flex flex-col gap-2.5">${col.links.map((link) => renderTemplate`<li>${link.action === "auth" ? renderTemplate`<button type="button"${addAttribute(link.id, "id")} class="text-left text-sm text-body transition-colors hover:text-ink cursor-pointer outline-none focus-visible:underline">${link.label}</button>` : renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(link.external ? "_blank" : void 0, "target")}${addAttribute(link.external ? "noopener noreferrer" : void 0, "rel")} class="inline-flex items-center gap-1 text-sm text-body transition-colors hover:text-ink outline-none focus-visible:underline">${link.label}${link.external && renderTemplate`<svg class="h-3 w-3 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h7v7M13 3L7 9"></path></svg>`}</a>`}</li>`)}</ul></div>`)}</div><div class="mt-14 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center"><p class="flex items-center gap-2 text-sm text-mute"><span class="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-on-primary"><svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1L15 14H1L8 1Z" fill="currentColor"></path></svg></span>MemeMaker — free, no sign-up, no watermark.</p><a href="/" class="font-mono text-xs text-mute transition-colors hover:text-ink">realmememaker.com</a></div></div></footer>${renderScript($$result, "/Users/bombermac/projectVAS/MemeMaker/src/components/Footer.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/components/Footer.astro", void 0);
//#endregion
//#region node_modules/@vercel/speed-insights/dist/astro/index.astro
createAstro("https://realmememaker.com");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const propsStr = JSON.stringify(Astro.props);
	const paramsStr = JSON.stringify(Astro.params);
	return renderTemplate`${renderComponent($$result, "vercel-speed-insights", "vercel-speed-insights", {
		"data-props": propsStr,
		"data-params": paramsStr,
		"data-pathname": Astro.url.pathname
	})}${renderScript($$result, "/Users/bombermac/projectVAS/MemeMaker/node_modules/@vercel/speed-insights/dist/astro/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bombermac/projectVAS/MemeMaker/node_modules/@vercel/speed-insights/dist/astro/index.astro", void 0);
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://realmememaker.com");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro2 = $$result.createAstro($$props, $$slots);
	Astro2.self = $$Layout;
	const { title, description = "Free online meme generator. Pick a template or upload your own image, add captions, and download instantly. No sign-up, no watermark.", image = "/android-chrome-512x512.png", showHeader = true, showFooter = true, canonical } = Astro2.props;
	const siteUrl = Astro2.site?.toString() || "https://realmememaker.com";
	const canonicalURL = canonical ? new URL(canonical, siteUrl) : new URL(Astro2.url.pathname, siteUrl);
	const ogImageURL = new URL(image, siteUrl);
	return renderTemplate`<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonicalURL, "href")}><!-- Favicons & App Icons --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><link rel="shortcut icon" href="/favicon.ico"><meta name="theme-color" content="#0a0a0c"><meta name="apple-mobile-web-app-title" content="MemeMaker"><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonicalURL, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageURL, "content")}><meta property="og:site_name" content="MemeMaker"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:url"${addAttribute(canonicalURL, "content")}><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImageURL, "content")}>${void 0}<!-- Structured Data --><script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "MemeMaker",
                "url": "https://realmememaker.com",
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "All",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "description": "Free online meme generator. Pick a template or upload your own image, customize text and fonts, and download watermark-free.",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            }
        <\/script>${renderComponent($$result, "SpeedInsights", $$Index, {})}${renderHead($$result)}</head><body class="min-h-dvh bg-canvas-soft text-ink antialiased">${showHeader && renderTemplate`${renderComponent($$result, "Header", $$Header, {})}`}${renderSlot($$result, $$slots["default"])}${showFooter && renderTemplate`${renderComponent($$result, "Footer", $$Footer, {})}`}</body></html>`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/layouts/Layout.astro", void 0);
//#endregion
export { $$Layout as t };
