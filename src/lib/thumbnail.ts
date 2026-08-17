import sharp from "sharp";

export interface ThumbnailResult {
	buffer: Buffer;
	width: number;
	height: number;
	size: number;
	format: "webp";
}

export interface ThumbnailOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	effort?: number;
}

const DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
	maxWidth: 500,
	maxHeight: 500,
	quality: 82,
	effort: 6,
};

/**
 * Derives the thumbnail key from the original template key.
 * Example:
 * "templates/drake.png" -> "templates/thumbnails/drake.webp"
 * "templates/nested/my-meme.jpeg" -> "templates/thumbnails/nested/my-meme.webp"
 */
export function getThumbnailKeyFromOriginal(
	originalKey: string,
	folderPrefix = "templates/"
): string {
	let pathPart = originalKey;
	try {
		if (originalKey.startsWith("http://") || originalKey.startsWith("https://")) {
			const parsed = new URL(originalKey);
			pathPart = parsed.pathname.replace(/^\/+/, "");
		}
	} catch {
		// not a URL, use originalKey as path
	}

	const sanitized = pathPart.replace(/^\/+/, "");
	const prefix = folderPrefix.endsWith("/") ? folderPrefix : `${folderPrefix}/`;

	// Extract the relative path after "templates/"
	let relativePath = sanitized;
	if (sanitized.startsWith(prefix)) {
		relativePath = sanitized.slice(prefix.length);
	}

	// Replace extension with .webp
	const lastDot = relativePath.lastIndexOf(".");
	const baseName = lastDot !== -1 ? relativePath.slice(0, lastDot) : relativePath;

	return `${prefix}thumbnails/${baseName}.webp`;
}

/**
 * Generates an optimized WebP thumbnail from an image buffer using Sharp.
 * - Maximum dimensions: 500x500px
 * - Maintains original aspect ratio
 * - Highly optimized WebP compression for web delivery (target 50–200 KB)
 */
export async function createThumbnail(
	inputBuffer: Buffer,
	options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Process image with Sharp
	const transformer = sharp(inputBuffer, { animated: false })
		.rotate() // auto-orient based on EXIF
		.resize({
			width: opts.maxWidth,
			height: opts.maxHeight,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({
			quality: opts.quality,
			effort: opts.effort,
			smartSubsample: true,
		});

	const { data, info } = await transformer.toBuffer({ resolveWithObject: true });

	return {
		buffer: data,
		width: info.width,
		height: info.height,
		size: data.length,
		format: "webp",
	};
}

/**
 * Gets dimensions and format of an original image buffer.
 */
export async function getImageMetadata(
	inputBuffer: Buffer
): Promise<{ width: number; height: number; format?: string; size: number }> {
	const metadata = await sharp(inputBuffer).metadata();
	return {
		width: metadata.width ?? 0,
		height: metadata.height ?? 0,
		format: metadata.format,
		size: inputBuffer.length,
	};
}
