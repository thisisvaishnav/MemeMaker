import { n as __exportAll, t as createComponent } from "./compiler_BSRKz0BZ.mjs";
import { i as renderComponent, u as renderTemplate, w as createAstro } from "./server_DKvTTH34.mjs";
import { t as $$Layout } from "./Layout_Cyzszunp.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/pages/admin/templates.astro
var templates_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Templates,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://realmememaker.com");
var $$Templates = createComponent(async ($$result, $$props, $$slots) => {
	const Astro2 = $$result.createAstro($$props, $$slots);
	Astro2.self = $$Templates;
	const supabaseUrl = "https://xmlcrgqhyxzmxwzuyaum.supabase.co";
	const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGNyZ3FoeXh6bXh3enV5YXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTk1NjIsImV4cCI6MjEwMjYzNTU2Mn0.vS4sKB2zk_ouaqm8ef_haigZEhvJ04fmcs3r6gMEwWs";
	if (!supabaseUrl.includes("placeholder")) {
		const supabase = createClient(supabaseUrl, supabaseKey);
		Astro2.request.headers.get("cookie");
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) return Astro2.redirect("/admin/login");
	}
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Admin Template Studio — MemeMaker",
		"showFooter": false
	}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminStudio", null, {
		"client:only": "react",
		"client:component-hydration": "only",
		"client:component-path": "/Users/bombermac/projectVAS/MemeMaker/src/components/admin/AdminStudio.tsx",
		"client:component-export": "default"
	})}` })}`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/templates.astro", void 0);
var $$file = "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/templates.astro";
var $$url = "/admin/templates";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/templates@_@astro
var page = () => templates_exports;
//#endregion
export { page };
