#!/usr/bin/env node

/**
 * Migration Script: Generate Optimized WebP Thumbnails for DigitalOcean Spaces Templates
 *
 * Usage:
 *   node scripts/generate-thumbnails.mjs
 *   node scripts/generate-thumbnails.mjs --force
 *   npm run generate-thumbnails
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	S3Client,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand,
	HeadObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Environment & S3 configuration
const accessKeyId =
	process.env.DO_SPACES_KEY ||
	process.env.SPACES_KEY ||
	process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
	process.env.DO_SPACES_SECRET ||
	process.env.SPACES_SECRET ||
	process.env.AWS_SECRET_ACCESS_KEY;

const endpoint =
	process.env.DO_SPACES_ENDPOINT ||
	process.env.SPACES_ENDPOINT ||
	"https://nyc3.digitaloceanspaces.com";

const region =
	process.env.DO_SPACES_REGION ||
	process.env.SPACES_REGION ||
	process.env.AWS_REGION ||
	"nyc3";

const bucket =
	process.env.DO_SPACES_BUCKET ||
	process.env.SPACES_BUCKET ||
	"mememaker-templates";

const cdnUrl =
	process.env.DO_SPACES_CDN_URL ||
	process.env.SPACES_CDN_URL ||
	"";

// Parse CLI flags
const args = process.argv.slice(2);
const forceOverwrite = args.includes("--force") || args.includes("-f");
const prefixArg = args.find((a) => a.startsWith("--prefix="))?.split("=")[1] || "templates/";
const sanitizedPrefix = prefixArg.endsWith("/") ? prefixArg : `${prefixArg}/`;

function formatBytes(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getPublicUrl(key) {
	const sanitizedKey = key.replace(/^\/+/, "");
	if (cdnUrl) {
		return `${cdnUrl.replace(/\/+$/, "")}/${sanitizedKey}`;
	}
	try {
		const endpointUrl = new URL(endpoint);
		return `https://${bucket}.${endpointUrl.host}/${sanitizedKey}`;
	} catch {
		return `https://${bucket}.${region}.digitaloceanspaces.com/${sanitizedKey}`;
	}
}

function getThumbnailKey(originalKey) {
	const sanitized = originalKey.replace(/^\/+/, "");
	let relativePath = sanitized;
	if (sanitized.startsWith(sanitizedPrefix)) {
		relativePath = sanitized.slice(sanitizedPrefix.length);
	}
	const lastDot = relativePath.lastIndexOf(".");
	const baseName = lastDot !== -1 ? relativePath.slice(0, lastDot) : relativePath;
	return `${sanitizedPrefix}thumbnails/${baseName}.webp`;
}

function formatName(key) {
	const filename = key.split("/").pop() || key;
	const base = filename.substring(0, filename.lastIndexOf(".")) || filename;
	return base
		.split(/[-_]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

function slugify(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/[\s_]+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

async function main() {
	console.log("=================================================");
	console.log("  MemeMaker — DigitalOcean Spaces Thumbnail Migration");
	console.log("=================================================");
	console.log(`Bucket:      ${bucket}`);
	console.log(`Endpoint:    ${endpoint}`);
	console.log(`Prefix:      ${sanitizedPrefix}`);
	console.log(`Target:      ${sanitizedPrefix}thumbnails/`);
	console.log(`Force Mode:  ${forceOverwrite ? "YES (overwriting existing)" : "NO (skipping existing)"}`);
	console.log("-------------------------------------------------");

	if (!accessKeyId || !secretAccessKey) {
		console.error("\n❌ Error: Missing DigitalOcean Spaces credentials!");
		console.error("Please ensure the following environment variables are set in your .env file or environment:");
		console.error("  - DO_SPACES_KEY (or SPACES_KEY / AWS_ACCESS_KEY_ID)");
		console.error("  - DO_SPACES_SECRET (or SPACES_SECRET / AWS_SECRET_ACCESS_KEY)");
		console.error("  - DO_SPACES_ENDPOINT (default: https://nyc3.digitaloceanspaces.com)");
		console.error("  - DO_SPACES_BUCKET (default: mememaker-templates)");
		process.exit(1);
	}

	const s3 = new S3Client({
		endpoint,
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		forcePathStyle: false,
	});

	// Step 1: Discover all images dynamically using ListObjectsV2 pagination
	console.log("\n[1/4] Discovering images in DigitalOcean Spaces...");
	const validExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif", ".bmp", ".tiff"]);
	const originalImages = [];
	let continuationToken = undefined;

	try {
		do {
			const response = await s3.send(
				new ListObjectsV2Command({
					Bucket: bucket,
					Prefix: sanitizedPrefix,
					ContinuationToken: continuationToken,
				})
			);

			for (const item of response.Contents ?? []) {
				const key = item.Key;
				if (!key || key === sanitizedPrefix || key.endsWith("/")) continue;

				// Skip files in the thumbnails subfolder
				if (key.startsWith(`${sanitizedPrefix}thumbnails/`)) continue;

				const ext = path.extname(key).toLowerCase();
				if (validExts.has(ext)) {
					originalImages.push({
						key,
						size: item.Size ?? 0,
						lastModified: item.LastModified,
					});
				}
			}

			continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
		} while (continuationToken);
	} catch (err) {
		console.error(`\n❌ Failed to list objects from Spaces bucket "${bucket}":`, err.message);
		process.exit(1);
	}

	console.log(`✓ Found ${originalImages.length} template image(s) in "${sanitizedPrefix}".`);

	if (originalImages.length === 0) {
		console.log("\nNo template images found to process. Exiting.");
		return;
	}

	// Step 2: Process each image
	console.log("\n[2/4] Processing and generating optimized WebP thumbnails...");
	let processedCount = 0;
	let skippedCount = 0;
	let errorCount = 0;
	let totalOriginalBytes = 0;
	let totalThumbnailBytes = 0;
	const templateRecords = [];

	for (let i = 0; i < originalImages.length; i++) {
		const img = originalImages[i];
		const thumbKey = getThumbnailKey(img.key);
		const progress = `[${i + 1}/${originalImages.length}]`;
		const filename = path.basename(img.key);
		const id = slugify(path.parse(filename).name);
		const name = formatName(filename);

		// Check if thumbnail exists
		if (!forceOverwrite) {
			try {
				const head = await s3.send(
					new HeadObjectCommand({
						Bucket: bucket,
						Key: thumbKey,
					})
				);
				console.log(`${progress} ⏩ Skipped (exists): ${thumbKey}`);
				skippedCount++;
				templateRecords.push({
					id,
					name,
					originalUrl: getPublicUrl(img.key),
					thumbnailUrl: getPublicUrl(thumbKey),
					width: 500,
					height: 500,
				});
				continue;
			} catch (err) {
				// Not found, proceed with generation
			}
		}

		try {
			// Download original (NEVER modify/delete original)
			const getObj = await s3.send(
				new GetObjectCommand({
					Bucket: bucket,
					Key: img.key,
				})
			);
			const originalBytes = await getObj.Body.transformToByteArray();
			const originalBuffer = Buffer.from(originalBytes);
			const origSize = originalBuffer.length;
			totalOriginalBytes += origSize;

			// Get metadata & dimensions
			const metadata = await sharp(originalBuffer).metadata();

			// Generate optimized WebP thumbnail:
			// Max 500x500, maintain aspect ratio, quality 82, effort 6
			const thumbBuffer = await sharp(originalBuffer, { animated: false })
				.rotate()
				.resize({
					width: 500,
					height: 500,
					fit: "inside",
					withoutEnlargement: true,
				})
				.webp({
					quality: 82,
					effort: 6,
					smartSubsample: true,
				})
				.toBuffer();

			const thumbSize = thumbBuffer.length;
			totalThumbnailBytes += thumbSize;

			// Upload thumbnail to Spaces
			await s3.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: thumbKey,
					Body: thumbBuffer,
					ContentType: "image/webp",
					ACL: "public-read",
					CacheControl: "public, max-age=31536000, immutable",
				})
			);

			const ratio = ((1 - thumbSize / origSize) * 100).toFixed(1);
			console.log(
				`${progress} ✓ Created: ${thumbKey} | ${formatBytes(origSize)} → ${formatBytes(thumbSize)} (${ratio}% reduction)`
			);
			processedCount++;

			templateRecords.push({
				id,
				name,
				originalUrl: getPublicUrl(img.key),
				thumbnailUrl: getPublicUrl(thumbKey),
				width: metadata.width || 500,
				height: metadata.height || 500,
			});
		} catch (err) {
			console.error(`${progress} ❌ Error processing ${img.key}:`, err.message);
			errorCount++;
		}
	}

	// Step 3: Save manifest for frontend static / hydration use
	console.log("\n[3/4] Writing template manifest for frontend...");
	const manifestPath = path.resolve(rootDir, "src/lib/templates.json");
	try {
		await fs.writeFile(manifestPath, JSON.stringify(templateRecords, null, 2), "utf8");
		console.log(`✓ Saved ${templateRecords.length} template definitions to ${manifestPath}`);
	} catch (err) {
		console.warn("⚠️ Warning: Could not write templates.json manifest:", err.message);
	}

	// Step 4: Summary report
	console.log("\n=================================================");
	console.log("  Migration Summary");
	console.log("=================================================");
	console.log(`Total discovered:  ${originalImages.length}`);
	console.log(`Generated/Updated: ${processedCount}`);
	console.log(`Skipped:           ${skippedCount}`);
	console.log(`Errors:            ${errorCount}`);
	if (processedCount > 0) {
		console.log(`Original data:     ${formatBytes(totalOriginalBytes)}`);
		console.log(`Thumbnail data:    ${formatBytes(totalThumbnailBytes)}`);
		const overallReduction = ((1 - totalThumbnailBytes / totalOriginalBytes) * 100).toFixed(1);
		console.log(`Bandwidth saved:   ${overallReduction}%`);
	}
	console.log("=================================================\n");
}

main().catch((err) => {
	console.error("\nUnexpected error during migration:", err);
	process.exit(1);
});
