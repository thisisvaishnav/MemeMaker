import { MongoClient, type Db, type Collection } from "mongodb";

export interface TemplateDocument {
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
	createdAt: Date;
	updatedAt: Date;
}

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;

/**
 * Returns a connected MongoDB database instance if MONGODB_URI is provided.
 * Returns null if MongoDB is not configured or connection fails.
 */
export async function getMongoDb(): Promise<Db | null> {
	const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
	if (!uri) return null;

	if (!dbInstance) {
		try {
			mongoClient = new MongoClient(uri);
			await mongoClient.connect();
			const dbName = process.env.MONGODB_DB || "mememaker";
			dbInstance = mongoClient.db(dbName);
		} catch (error) {
			console.warn("[MongoDB] Warning: Could not connect to MongoDB:", (error as Error).message);
			return null;
		}
	}
	return dbInstance;
}

/**
 * Returns the templates collection if MongoDB is available.
 */
export async function getTemplatesCollection(): Promise<Collection<TemplateDocument> | null> {
	const db = await getMongoDb();
	if (!db) return null;
	return db.collection<TemplateDocument>("templates");
}

/**
 * Saves or updates a template's metadata in MongoDB.
 * Images are NEVER stored in MongoDB - only metadata and URLs.
 */
export async function saveTemplateMetadata(
	template: Omit<TemplateDocument, "createdAt" | "updatedAt">
): Promise<void> {
	const collection = await getTemplatesCollection();
	if (!collection) return;

	const now = new Date();
	await collection.updateOne(
		{ id: template.id },
		{
			$set: {
				...template,
				updatedAt: now,
			},
			$setOnInsert: {
				createdAt: now,
			},
		},
		{ upsert: true }
	);
}

/**
 * Fetches all template metadata from MongoDB.
 */
export async function getTemplatesFromDb(): Promise<TemplateDocument[]> {
	const collection = await getTemplatesCollection();
	if (!collection) return [];

	return collection.find({}).sort({ name: 1 }).toArray();
}
