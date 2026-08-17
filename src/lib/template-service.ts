import {
	uploadBuffer,
	getObjectBuffer,
	getPublicUrl,
	getPresignedUrl,
	checkObjectExists,
	listTemplateImages,
} from "./spaces";
import {
	createThumbnail,
	getImageMetadata,
	getThumbnailKeyFromOriginal,
} from "./thumbnail";
import { getTemplatesFromDb, saveTemplateMetadata, type TemplateDocument } from "./db";
import { TEMPLATES, type MemeTemplate } from "./templates";

let cachedTemplates: MemeTemplate[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds in-memory cache

export function clearTemplateCache(): void {
	cachedTemplates = null;
	lastCacheTime = 0;
}

export interface TemplateResult {
	id: string;
	name: string;
	originalKey: string;
	originalUrl: string;
	thumbnailKey: string;
	thumbnailUrl: string;
	width: number;
	height: number;
	originalSize: number;
	thumbnailSize: number;
	skipped?: boolean;
}

/**
 * Retrieves all available meme templates:
 * 1. Checks in-memory cache if still valid.
 * 2. Checks MongoDB if configured and populated with template metadata.
 * 3. Lists all template images directly from DigitalOcean Spaces (templates/ folder).
 * 4. Falls back to static fallback templates if Spaces and DB are not reachable.
 */
export async function getTemplates(
	options: { forceRefresh?: boolean; allowFallback?: boolean } = {}
): Promise<MemeTemplate[]> {
	const now = Date.now();
	if (
		!options.forceRefresh &&
		cachedTemplates &&
		cachedTemplates.length > 0 &&
		now - lastCacheTime < CACHE_TTL_MS
	) {
		return cachedTemplates;
	}

	// 1. Try fetching from MongoDB if available
	try {
		const dbDocs = await getTemplatesFromDb();
		if (dbDocs && dbDocs.length > 0) {
			const templates: MemeTemplate[] = dbDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				originalUrl: doc.originalUrl,
				thumbnailUrl: doc.thumbnailUrl,
				src: doc.originalUrl,
				width: doc.width || 900,
				height: doc.height || 675,
			}));
			cachedTemplates = templates;
			lastCacheTime = now;
			return templates;
		}
	} catch (dbErr) {
		console.warn("[TemplateService] MongoDB query warning:", (dbErr as Error).message);
	}

	// 2. Fetch directly from DigitalOcean Spaces
	try {
		const spacesImages = await listTemplateImages("templates/");
		if (spacesImages && spacesImages.length > 0) {
			const idCounts: Record<string, number> = {};
			const templates: MemeTemplate[] = await Promise.all(
				spacesImages.map(async (img) => {
					const lastSlash = img.key.lastIndexOf("/");
					const filename = lastSlash !== -1 ? img.key.slice(lastSlash + 1) : img.key;
					const lastDot = filename.lastIndexOf(".");
					const baseName = lastDot !== -1 ? filename.slice(0, lastDot) : filename;
					let id = slugify(baseName);
					if (idCounts[id]) {
						idCounts[id]++;
						id = `${id}-${idCounts[id]}`;
					} else {
						idCounts[id] = 1;
					}
					const name = formatTemplateName(baseName);
					const signedUrl = await getPresignedUrl(img.key);

					return {
						id,
						name,
						originalUrl: signedUrl,
						thumbnailUrl: signedUrl,
						src: signedUrl,
						width: 900,
						height: 675,
					};
				})
			);

			cachedTemplates = templates;
			lastCacheTime = now;
			return templates;
		}
	} catch (spacesErr: any) {
		console.error("[TemplateService] Spaces listing error:", spacesErr.message);
		if (!options.allowFallback) {
			throw spacesErr;
		}
	}

	if (options.allowFallback) {
		return TEMPLATES;
	}

	throw new Error(`[TemplateService] No template images found in DigitalOcean Spaces bucket.`);
}

export async function getTemplateById(id: string): Promise<MemeTemplate | null> {
	const all = await getTemplates({ allowFallback: true });
	return all.find((t) => t.id === id) || null;
}

/**
 * Converts a filename or title into a clean URL-safe slug ID.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[\s_]+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

/**
 * Derives a human-friendly template name from a filename or key.
 */
export function formatTemplateName(filenameOrKey: string): string {
	const lastSlash = filenameOrKey.lastIndexOf("/");
	const filename = lastSlash !== -1 ? filenameOrKey.slice(lastSlash + 1) : filenameOrKey;
	const lastDot = filename.lastIndexOf(".");
	const base = lastDot !== -1 ? filename.slice(0, lastDot) : filename;

	return base
		.split(/[-_]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Processes a single existing template image in DigitalOcean Spaces:
 * 1. Checks if the thumbnail already exists (skips if force is false).
 * 2. Downloads the original image buffer without modifying the original.
 * 3. Generates an optimized WebP thumbnail via Sharp (max 500x500, aspect-ratio preserved).
 * 4. Uploads thumbnail to templates/thumbnails/<name>.webp in Spaces.
 * 5. Saves metadata to MongoDB (if configured).
 */
export async function processExistingTemplate(
	originalKey: string,
	options: { force?: boolean } = {}
): Promise<TemplateResult> {
	const thumbnailKey = getThumbnailKeyFromOriginal(originalKey);
	const originalUrl = getPublicUrl(originalKey);
	const thumbnailUrl = getPublicUrl(thumbnailKey);

	const lastSlash = originalKey.lastIndexOf("/");
	const filename = lastSlash !== -1 ? originalKey.slice(lastSlash + 1) : originalKey;
	const lastDot = filename.lastIndexOf(".");
	const baseName = lastDot !== -1 ? filename.slice(0, lastDot) : filename;
	const id = slugify(baseName);
	const name = formatTemplateName(baseName);

	// Check if thumbnail already exists unless force overwrite is requested
	if (!options.force) {
		const exists = await checkObjectExists(thumbnailKey);
		if (exists) {
			return {
				id,
				name,
				originalKey,
				originalUrl,
				thumbnailKey,
				thumbnailUrl,
				width: 500,
				height: 500,
				originalSize: 0,
				thumbnailSize: 0,
				skipped: true,
			};
		}
	}

	// Fetch original buffer (DO NOT modify or delete the original)
	const originalBuffer = await getObjectBuffer(originalKey);
	const metadata = await getImageMetadata(originalBuffer);

	// Generate optimized WebP thumbnail with Sharp
	const thumb = await createThumbnail(originalBuffer);

	// Upload thumbnail to DigitalOcean Spaces
	await uploadBuffer(thumbnailKey, thumb.buffer, "image/webp", true);

	const result: TemplateResult = {
		id,
		name,
		originalKey,
		originalUrl,
		thumbnailKey,
		thumbnailUrl,
		width: metadata.width || thumb.width,
		height: metadata.height || thumb.height,
		originalSize: originalBuffer.length,
		thumbnailSize: thumb.size,
		skipped: false,
	};

	// Store metadata in MongoDB (no images in MongoDB)
	await saveTemplateMetadata(result);

	clearTemplateCache();

	return result;
}

/**
 * Handles future template uploads:
 * 1. Uploads original image to templates/<filename>
 * 2. Generates WebP thumbnail using Sharp (max 500x500)
 * 3. Uploads thumbnail to templates/thumbnails/<baseName>.webp
 * 4. Saves metadata in MongoDB (metadata/URLs only)
 * 5. Returns template data with originalUrl and thumbnailUrl
 */
export async function uploadNewTemplate({
	fileBuffer,
	originalFilename,
	customName,
	contentType = "image/png",
}: {
	fileBuffer: Buffer;
	originalFilename: string;
	customName?: string;
	contentType?: string;
}): Promise<TemplateResult> {
	const lastDot = originalFilename.lastIndexOf(".");
	const ext = lastDot !== -1 ? originalFilename.slice(lastDot).toLowerCase() : ".png";
	const rawBaseName = lastDot !== -1 ? originalFilename.slice(0, lastDot) : originalFilename;
	const id = slugify(customName || rawBaseName);
	const name = customName || formatTemplateName(rawBaseName);

	const originalKey = `templates/${id}${ext}`;
	const thumbnailKey = `templates/thumbnails/${id}.webp`;

	// 1. Upload original unmodified image
	await uploadBuffer(originalKey, fileBuffer, contentType, true);

	// 2. Extract original metadata
	const metadata = await getImageMetadata(fileBuffer);

	// 3. Generate optimized Sharp WebP thumbnail
	const thumb = await createThumbnail(fileBuffer);

	// 4. Upload thumbnail to DigitalOcean Spaces
	await uploadBuffer(thumbnailKey, thumb.buffer, "image/webp", true);

	const originalUrl = getPublicUrl(originalKey);
	const thumbnailUrl = getPublicUrl(thumbnailKey);

	const result: TemplateResult = {
		id,
		name,
		originalKey,
		originalUrl,
		thumbnailKey,
		thumbnailUrl,
		width: metadata.width || thumb.width,
		height: metadata.height || thumb.height,
		originalSize: fileBuffer.length,
		thumbnailSize: thumb.size,
	};

	// 5. Store metadata in MongoDB (metadata only)
	await saveTemplateMetadata(result);

	clearTemplateCache();

	return result;
}
