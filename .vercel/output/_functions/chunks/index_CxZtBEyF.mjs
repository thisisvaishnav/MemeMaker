import { n as __exportAll, t as createComponent } from "./compiler_BSRKz0BZ.mjs";
import { w as createAstro } from "./server_DKvTTH34.mjs";
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://realmememaker.com");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	return Astro.redirect("/admin/templates");
}, "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/index.astro", void 0);
var $$file = "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/index.astro";
var $$url = "/admin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };
