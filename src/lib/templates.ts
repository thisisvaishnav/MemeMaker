import rawManifest from "./templates.json";
export { getTemplates } from "./template-service";

export interface MemeTemplate {
	id: string;
	name: string;
	originalUrl: string;
	thumbnailUrl: string;
	src?: string; // backwards compatibility
	width: number;
	height: number;
}

const DEFAULT_FALLBACK_TEMPLATES: MemeTemplate[] = [
	{
		id: "drake",
		name: "Drake",
		originalUrl: "/templates/drake.svg",
		thumbnailUrl: "/templates/drake.svg",
		src: "/templates/drake.svg",
		width: 900,
		height: 675,
	},
	{
		id: "distracted-boyfriend",
		name: "Distracted Boyfriend",
		originalUrl: "/templates/distracted-boyfriend.svg",
		thumbnailUrl: "/templates/distracted-boyfriend.svg",
		src: "/templates/distracted-boyfriend.svg",
		width: 900,
		height: 675,
	},
	{
		id: "two-buttons",
		name: "Two Buttons",
		originalUrl: "/templates/two-buttons.svg",
		thumbnailUrl: "/templates/two-buttons.svg",
		src: "/templates/two-buttons.svg",
		width: 900,
		height: 675,
	},
	{
		id: "this-is-fine",
		name: "This Is Fine",
		originalUrl: "/templates/this-is-fine.svg",
		thumbnailUrl: "/templates/this-is-fine.svg",
		src: "/templates/this-is-fine.svg",
		width: 900,
		height: 675,
	},
	{
		id: "doge",
		name: "Doge",
		originalUrl: "/templates/doge.svg",
		thumbnailUrl: "/templates/doge.svg",
		src: "/templates/doge.svg",
		width: 900,
		height: 675,
	},
	{
		id: "change-my-mind",
		name: "Change My Mind",
		originalUrl: "/templates/change-my-mind.svg",
		thumbnailUrl: "/templates/change-my-mind.svg",
		src: "/templates/change-my-mind.svg",
		width: 900,
		height: 675,
	},
	{
		id: "buff-doge",
		name: "Buff Doge vs. Cheems",
		originalUrl: "/templates/buff-doge.svg",
		thumbnailUrl: "/templates/buff-doge.svg",
		src: "/templates/buff-doge.svg",
		width: 900,
		height: 675,
	},
	{
		id: "cat-at-table",
		name: "Cat at the Table",
		originalUrl: "/templates/cat-at-table.svg",
		thumbnailUrl: "/templates/cat-at-table.svg",
		src: "/templates/cat-at-table.svg",
		width: 900,
		height: 675,
	},
	{
		id: "trollface",
		name: "Trollface",
		originalUrl: "/templates/trollface.svg",
		thumbnailUrl: "/templates/trollface.svg",
		src: "/templates/trollface.svg",
		width: 900,
		height: 675,
	},
	{
		id: "expanding-brain",
		name: "Expanding Brain",
		originalUrl: "/templates/expanding-brain.svg",
		thumbnailUrl: "/templates/expanding-brain.svg",
		src: "/templates/expanding-brain.svg",
		width: 900,
		height: 675,
	},
	{
		id: "is-this-a-pigeon",
		name: "Is This a Pigeon?",
		originalUrl: "/templates/is-this-a-pigeon.svg",
		thumbnailUrl: "/templates/is-this-a-pigeon.svg",
		src: "/templates/is-this-a-pigeon.svg",
		width: 900,
		height: 675,
	},
	{
		id: "woman-yelling",
		name: "Woman Yelling at Cat",
		originalUrl: "/templates/woman-yelling.svg",
		thumbnailUrl: "/templates/woman-yelling.svg",
		src: "/templates/woman-yelling.svg",
		width: 900,
		height: 675,
	},
	{
		id: "gru-plan",
		name: "Gru's Plan",
		originalUrl: "/templates/gru-plan.svg",
		thumbnailUrl: "/templates/gru-plan.svg",
		src: "/templates/gru-plan.svg",
		width: 900,
		height: 675,
	},
	{
		id: "trade-offer",
		name: "Trade Offer",
		originalUrl: "/templates/trade-offer.svg",
		thumbnailUrl: "/templates/trade-offer.svg",
		src: "/templates/trade-offer.svg",
		width: 900,
		height: 675,
	},
	{
		id: "roll-safe",
		name: "Roll Safe",
		originalUrl: "/templates/roll-safe.svg",
		thumbnailUrl: "/templates/roll-safe.svg",
		src: "/templates/roll-safe.svg",
		width: 900,
		height: 675,
	},
	{
		id: "sponge-mock",
		name: "Mocking Spongebob",
		originalUrl: "/templates/sponge-mock.svg",
		thumbnailUrl: "/templates/sponge-mock.svg",
		src: "/templates/sponge-mock.svg",
		width: 900,
		height: 675,
	},
	{
		id: "success-kid",
		name: "Success Kid",
		originalUrl: "/templates/success-kid.svg",
		thumbnailUrl: "/templates/success-kid.svg",
		src: "/templates/success-kid.svg",
		width: 900,
		height: 675,
	},
	{
		id: "uno-draw-25",
		name: "Uno Draw 25",
		originalUrl: "/templates/uno-draw-25.svg",
		thumbnailUrl: "/templates/uno-draw-25.svg",
		src: "/templates/uno-draw-25.svg",
		width: 900,
		height: 675,
	},
	{
		id: "clown-makeup",
		name: "Clown Makeup",
		originalUrl: "/templates/clown-makeup.svg",
		thumbnailUrl: "/templates/clown-makeup.svg",
		src: "/templates/clown-makeup.svg",
		width: 900,
		height: 675,
	},
	{
		id: "epic-handshake",
		name: "Epic Handshake",
		originalUrl: "/templates/epic-handshake.svg",
		thumbnailUrl: "/templates/epic-handshake.svg",
		src: "/templates/epic-handshake.svg",
		width: 900,
		height: 675,
	},
];

/**
 * Normalizes a template object to ensure both originalUrl and thumbnailUrl are defined.
 */
export function normalizeTemplate(t: any): MemeTemplate {
	const original = t.originalUrl || t.src || "";
	const thumb = t.thumbnailUrl || t.src || original;
	return {
		id: t.id,
		name: t.name,
		originalUrl: original,
		thumbnailUrl: thumb,
		src: original,
		width: t.width || 900,
		height: t.height || 675,
	};
}

export const TEMPLATES: MemeTemplate[] = (
	Array.isArray(rawManifest) && rawManifest.length > 0
		? rawManifest.map(normalizeTemplate)
		: DEFAULT_FALLBACK_TEMPLATES
);

/** Deterministic-enough shuffle for client-side re-mixing. Fisher–Yates. */
export function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
