import type { APIRoute } from "astro";
import { uploadNewTemplate } from "../../../lib/template-service";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const contentType = request.headers.get("content-type") || "";

		let fileBuffer: Buffer;
		let originalFilename = "template.png";
		let customName: string | undefined = undefined;
		let mimeType = "image/png";

		if (contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			const file = formData.get("file");
			customName = (formData.get("name") as string) || undefined;

			if (!file || !(file instanceof Blob)) {
				return new Response(
					JSON.stringify({ success: false, error: "No file provided in 'file' field." }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			if ("name" in file && typeof file.name === "string") {
				originalFilename = file.name;
			}
			mimeType = file.type || "image/png";
			const arrayBuffer = await file.arrayBuffer();
			fileBuffer = Buffer.from(arrayBuffer);
		} else if (contentType.includes("application/json")) {
			const body = await request.json();
			if (!body.imageBase64) {
				return new Response(
					JSON.stringify({ success: false, error: "Missing 'imageBase64' in JSON body." }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			customName = body.name;
			originalFilename = body.filename || "template.png";
			mimeType = body.mimeType || "image/png";

			// Strip potential data URL header
			const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
			fileBuffer = Buffer.from(base64Data, "base64");
		} else {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Unsupported content type. Send multipart/form-data or application/json.",
				}),
				{ status: 415, headers: { "Content-Type": "application/json" } }
			);
		}

		// Perform upload to Spaces and automatic Sharp WebP thumbnail generation
		const result = await uploadNewTemplate({
			fileBuffer,
			originalFilename,
			customName,
			contentType: mimeType,
		});

		return new Response(
			JSON.stringify({
				success: true,
				message: "Template uploaded and thumbnail generated successfully.",
				template: result,
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error: any) {
		console.error("[Template Upload Error]:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message || "Failed to upload template and generate thumbnail.",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};
