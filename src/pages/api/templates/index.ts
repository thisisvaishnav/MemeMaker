import type { APIRoute } from "astro";
import { getTemplates } from "../../../lib/template-service";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	try {
		const refresh = url.searchParams.get("refresh") === "1";
		const templates = await getTemplates({ forceRefresh: refresh, allowFallback: false });
		return new Response(
			JSON.stringify({
				success: true,
				count: templates.length,
				source: "digitalocean-spaces",
				templates,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
				},
			}
		);
	} catch (error: any) {
		console.error("[API /api/templates Error]:", error.message);
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message,
				templates: [],
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};

