import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import {
	S3Client,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand,
	HeadObjectCommand,
	type _Object,
} from "@aws-sdk/client-s3";

// Ensure environment variables are loaded across all runtime contexts
try {
	dotenv.config();
	dotenv.config({ path: path.resolve(process.cwd(), ".env") });
	dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
} catch {
	// ignore
}

export interface SpacesConfig {
	accessKeyId: string;
	secretAccessKey: string;
	endpoint: string;
	region: string;
	bucket: string;
	cdnUrl?: string;
}

/**
 * Retrieves Spaces configuration from environment variables.
 * Checks DO_SPACES_*, SPACES_*, and standard AWS_* variable names.
 */
export function getSpacesConfig(): SpacesConfig {
	const getVal = (...keys: string[]): string => {
		for (const k of keys) {
			if (typeof process !== "undefined" && process.env && process.env[k]) {
				return process.env[k]!;
			}
			try {
				if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env[k]) {
					return (import.meta as any).env[k];
				}
			} catch {
				// ignore
			}
		}
		return "";
	};

	const accessKeyId = getVal("DO_SPACES_KEY", "SPACES_KEY", "AWS_ACCESS_KEY_ID");
	const secretAccessKey = getVal("DO_SPACES_SECRET", "SPACES_SECRET", "AWS_SECRET_ACCESS_KEY");
	const endpoint = getVal("DO_SPACES_ENDPOINT", "SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
	const region = getVal("DO_SPACES_REGION", "SPACES_REGION", "AWS_REGION") || "nyc3";
	const bucket = getVal("DO_SPACES_BUCKET", "SPACES_BUCKET") || "mememaker-templates";
	const cdnUrl = getVal("DO_SPACES_CDN_URL", "SPACES_CDN_URL");

	return {
		accessKeyId,
		secretAccessKey,
		endpoint,
		region,
		bucket,
		cdnUrl: cdnUrl ? cdnUrl.replace(/\/+$/, "") : undefined,
	};
}

/**
 * Prints clear server-side diagnostic information for the Spaces configuration
 * WITHOUT exposing the raw secret key.
 */
export function logSpacesDiagnostics(): void {
	const config = getSpacesConfig();
	const keyPresent = Boolean(config.accessKeyId && config.accessKeyId.trim().length > 0);
	const secretPresent = Boolean(config.secretAccessKey && config.secretAccessKey.trim().length > 0);

	console.log("========================================");
	console.log("[DigitalOcean Spaces Diagnostics]");
	console.log(`Bucket:      ${config.bucket}`);
	console.log(`Region:      ${config.region}`);
	console.log(`Endpoint:    ${config.endpoint}`);
	console.log(`CDN URL:     ${config.cdnUrl || "(none)"}`);
	console.log(`Access Key:  ${keyPresent ? `SET (length: ${config.accessKeyId.length})` : "MISSING (DO_SPACES_KEY)"}`);
	console.log(`Secret Key:  ${secretPresent ? `SET (length: ${config.secretAccessKey.length})` : "MISSING (DO_SPACES_SECRET)"}`);
	console.log("========================================");
}

let s3ClientInstance: S3Client | null = null;

/**
 * Returns a singleton S3 client configured for DigitalOcean Spaces.
 */
export function getS3Client(): S3Client {
	if (!s3ClientInstance) {
		const config = getSpacesConfig();
		s3ClientInstance = new S3Client({
			endpoint: config.endpoint,
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
			forcePathStyle: false,
		});
	}
	return s3ClientInstance;
}

/**
 * Constructs the public URL for a given object key in DigitalOcean Spaces.
 */
export function getPublicUrl(key: string): string {
	if (!key) return "";
	if (key.startsWith("http://") || key.startsWith("https://")) {
		return key;
	}
	const config = getSpacesConfig();
	const sanitizedKey = key.replace(/^\/+/, "");

	if (config.cdnUrl) {
		return `${config.cdnUrl}/${sanitizedKey}`;
	}

	// DigitalOcean Spaces URL format: https://<bucket>.<region>.digitaloceanspaces.com/<key>
	try {
		const endpointUrl = new URL(config.endpoint);
		return `https://${config.bucket}.${endpointUrl.host}/${sanitizedKey}`;
	} catch {
		return `https://${config.bucket}.${config.region}.digitaloceanspaces.com/${sanitizedKey}`;
	}
}

/**
 * Generates a presigned URL for private/authenticated Spaces objects.
 * Valid for up to 7 days (604800 seconds).
 */
export async function getPresignedUrl(key: string, expiresIn = 604800): Promise<string> {
	if (!key) return "";
	if (key.startsWith("http://") || key.startsWith("https://")) {
		return key;
	}
	try {
		const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
		const client = getS3Client();
		const config = getSpacesConfig();
		const sanitizedKey = key.replace(/^\/+/, "");
		const command = new GetObjectCommand({
			Bucket: config.bucket,
			Key: sanitizedKey,
		});
		return await getSignedUrl(client, command, { expiresIn });
	} catch (err: any) {
		console.warn(`[Spaces] Failed to sign URL for ${key}:`, err.message);
		return getPublicUrl(key);
	}
}

/**
 * Lists all template image files under the templates/ folder.
 * Automatically paginates using ContinuationToken so it discovers ALL images dynamically.
 * Excludes objects in the thumbnails/ subfolder, directory markers, or non-image files.
 */
export async function listTemplateImages(
	folderPrefix = "templates/"
): Promise<{ key: string; size: number; lastModified?: Date }[]> {
	logSpacesDiagnostics();

	const config = getSpacesConfig();
	if (!config.accessKeyId || !config.secretAccessKey) {
		throw new Error(
			`[DigitalOcean Spaces] Missing credentials: DO_SPACES_KEY and/or DO_SPACES_SECRET are not set in environment or .env file.`
		);
	}

	const client = getS3Client();
	const sanitizedPrefix = folderPrefix.endsWith("/")
		? folderPrefix
		: `${folderPrefix}/`;

	const validImageExtensions = new Set([
		".jpg",
		".jpeg",
		".png",
		".webp",
		".svg",
		".gif",
		".avif",
		".bmp",
		".tiff",
	]);

	const images: { key: string; size: number; lastModified?: Date }[] = [];
	let continuationToken: string | undefined = undefined;

	try {
		do {
			const response = await client.send(
				new ListObjectsV2Command({
					Bucket: config.bucket,
					Prefix: sanitizedPrefix,
					ContinuationToken: continuationToken,
				})
			);

			const contents = response.Contents ?? [];
			for (const item of contents) {
				const key = item.Key;
				if (!key) continue;

				// Skip directory markers or the prefix itself
				if (key === sanitizedPrefix || key.endsWith("/")) continue;

				// Skip thumbnail folder items (e.g. templates/thumbnails/...)
				if (key.startsWith(`${sanitizedPrefix}thumbnails/`)) continue;

				// Check if file is an image by extension
				const extIndex = key.lastIndexOf(".");
				if (extIndex === -1) continue;
				const ext = key.slice(extIndex).toLowerCase();

				if (validImageExtensions.has(ext)) {
					images.push({
						key,
						size: item.Size ?? 0,
						lastModified: item.LastModified,
					});
				}
			}

			continuationToken = response.IsTruncated
				? response.NextContinuationToken
				: undefined;
		} while (continuationToken);

		console.log(
			`[Spaces] Found ${images.length} template image(s) in bucket "${config.bucket}" under prefix "${sanitizedPrefix}".`
		);
		return images;
	} catch (err: any) {
		console.error(`[Spaces] S3 ListObjectsV2 failed for bucket "${config.bucket}":`, err.message);
		throw new Error(`[Spaces] Failed to list templates from DigitalOcean Spaces: ${err.message}`);
	}
}

/**
 * Downloads an object buffer from DigitalOcean Spaces.
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
	const client = getS3Client();
	const config = getSpacesConfig();

	const response = await client.send(
		new GetObjectCommand({
			Bucket: config.bucket,
			Key: key,
		})
	);

	if (!response.Body) {
		throw new Error(`Empty body returned for key: ${key}`);
	}

	const byteArray = await response.Body.transformToByteArray();
	return Buffer.from(byteArray);
}

/**
 * Uploads a buffer to DigitalOcean Spaces with public-read ACL.
 */
export async function uploadBuffer(
	key: string,
	buffer: Buffer,
	contentType = "image/webp",
	isPublic = true
): Promise<{ key: string; publicUrl: string; size: number }> {
	const client = getS3Client();
	const config = getSpacesConfig();
	const sanitizedKey = key.replace(/^\/+/, "");

	await client.send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: sanitizedKey,
			Body: buffer,
			ContentType: contentType,
			ACL: isPublic ? "public-read" : "private",
			CacheControl: "public, max-age=31536000, immutable",
		})
	);

	return {
		key: sanitizedKey,
		publicUrl: getPublicUrl(sanitizedKey),
		size: buffer.length,
	};
}

/**
 * Checks if an object already exists in the Spaces bucket.
 */
export async function checkObjectExists(key: string): Promise<boolean> {
	const client = getS3Client();
	const config = getSpacesConfig();

	try {
		await client.send(
			new HeadObjectCommand({
				Bucket: config.bucket,
				Key: key.replace(/^\/+/, ""),
			})
		);
		return true;
	} catch (err: any) {
		if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
			return false;
		}
		throw err;
	}
}
