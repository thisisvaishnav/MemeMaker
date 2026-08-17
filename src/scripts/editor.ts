import { TEMPLATES, shuffle, type MemeTemplate } from "../lib/templates";

const UPLOAD_STORAGE_KEY = "mememaker.upload";
const MAX_CANVAS_DIMENSION = 1400;

interface CaptionState {
	text: string;
	yPercent: number; // vertical center of the caption block, 0-100
}

const state = {
	image: null as HTMLImageElement | null,
	activeTemplateId: null as string | null,
	fontSizePercent: 10,
	textColor: "#ffffff",
	outlineColor: "#000000",
	top: { text: "", yPercent: 8 } satisfies CaptionState,
	bottom: { text: "", yPercent: 92 } satisfies CaptionState,
};

let templatesList: MemeTemplate[] = [];

const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]");
const canvasWrap = document.querySelector<HTMLElement>("[data-canvas-wrap]");
const ctx = canvas?.getContext("2d") ?? null;

const topTextInput = document.querySelector<HTMLInputElement>("[data-top-text]");
const bottomTextInput = document.querySelector<HTMLInputElement>("[data-bottom-text]");
const sizeSlider = document.querySelector<HTMLInputElement>("[data-size-slider]");
const textColorInput = document.querySelector<HTMLInputElement>("[data-text-color]");
const outlineColorInput = document.querySelector<HTMLInputElement>("[data-outline-color]");
const clearBtn = document.querySelector<HTMLButtonElement>("[data-clear-text]");
const downloadBtn = document.querySelector<HTMLButtonElement>("[data-download]");
const uploadBtn = document.querySelector<HTMLButtonElement>("[data-upload-btn]");
const sidebarUploadInput = document.querySelector<HTMLInputElement>("[data-sidebar-upload-input]");
const randomBtn = document.querySelector<HTMLButtonElement>("[data-random-btn]");
const sidebarGrid = document.querySelector<HTMLElement>("[data-sidebar-grid]");

function getTemplatesFromDOM(): MemeTemplate[] {
	if (!sidebarGrid) return [];
	const buttons = Array.from(sidebarGrid.querySelectorAll<HTMLButtonElement>("[data-template-id]"));
	return buttons
		.map((btn) => ({
			id: btn.dataset.templateId || "",
			name: btn.querySelector("img")?.alt || btn.dataset.templateId || "",
			originalUrl: btn.dataset.templateSrc || "",
			thumbnailUrl: btn.dataset.templateThumb || btn.dataset.templateSrc || "",
			src: btn.dataset.templateSrc || "",
			width: Number(btn.dataset.templateWidth) || 900,
			height: Number(btn.dataset.templateHeight) || 675,
		}))
		.filter((t) => t.id && (t.originalUrl || t.src));
}

function renderSidebarTemplates(templates: MemeTemplate[]) {
	if (!sidebarGrid) return;
	const existingButtons = sidebarGrid.querySelectorAll<HTMLButtonElement>("[data-template-id]");
	if (existingButtons.length === templates.length && existingButtons.length > 0) {
		updateActiveThumb();
		return;
	}

	sidebarGrid.innerHTML = "";
	templates.forEach((t) => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.dataset.templateId = t.id;
		btn.dataset.templateSrc = t.originalUrl || t.src || "";
		btn.dataset.templateThumb = t.thumbnailUrl || t.src || "";
		btn.dataset.templateWidth = String(t.width || 900);
		btn.dataset.templateHeight = String(t.height || 675);
		btn.className =
			"template-thumb overflow-hidden rounded-md shadow-level-1 ring-2 ring-transparent transition-[box-shadow,transform] outline-none hover:shadow-level-2 focus-visible:ring-link";
		btn.setAttribute("aria-label", `Use ${t.name} template`);

		const img = document.createElement("img");
		img.src = t.thumbnailUrl || t.src || "";
		img.alt = t.name;
		img.width = t.width || 900;
		img.height = t.height || 675;
		img.className = "aspect-4/3 w-full object-cover";
		img.loading = "lazy";

		btn.appendChild(img);
		sidebarGrid.appendChild(btn);
	});

	updateActiveThumb();
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => {
			// If crossOrigin fails, retry without crossOrigin
			const fallbackImg = new Image();
			fallbackImg.onload = () => resolve(fallbackImg);
			fallbackImg.onerror = reject;
			fallbackImg.src = src;
		};
		img.src = src;
	});
}

async function setImage(src: string, templateId: string | null) {
	try {
		const img = await loadImage(src);
		state.image = img;
		state.activeTemplateId = templateId;

		let width = img.naturalWidth;
		let height = img.naturalHeight;
		if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
			const scale = MAX_CANVAS_DIMENSION / Math.max(width, height);
			width = Math.round(width * scale);
			height = Math.round(height * scale);
		}

		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}

		updateActiveThumb();
		draw();
		syncUrl();
	} catch (err) {
		console.error("Failed to load image into editor:", src, err);
	}
}

function syncUrl() {
	const url = state.activeTemplateId ? `/edit?template=${state.activeTemplateId}` : "/edit?upload=1";
	window.history.replaceState(null, "", url);
}

function updateActiveThumb() {
	const thumbs = sidebarGrid?.querySelectorAll<HTMLButtonElement>("[data-template-id]");
	thumbs?.forEach((thumb) => {
		const isActive = thumb.dataset.templateId === state.activeTemplateId;
		thumb.classList.toggle("ring-ink", isActive);
		thumb.classList.toggle("ring-transparent", !isActive);
	});
}

/** Greedily wraps `text` into lines that fit within `maxWidth` at the given font size. */
function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];

	const lines: string[] = [];
	let current = words[0];

	for (let i = 1; i < words.length; i++) {
		const candidate = `${current} ${words[i]}`;
		if (context.measureText(candidate).width <= maxWidth) {
			current = candidate;
		} else {
			lines.push(current);
			current = words[i];
		}
	}
	lines.push(current);
	return lines;
}

/** Finds the largest font size (down to a floor) at which the text fits within the given box. */
function fitCaption(
	context: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxFontPx: number,
	minFontPx: number,
): { fontSize: number; lines: string[]; lineHeight: number } {
	let fontSize = maxFontPx;

	while (fontSize > minFontPx) {
		context.font = `700 ${fontSize}px Impact, "Arial Narrow Bold", Haettenschweiler, sans-serif`;
		const lines = wrapLines(context, text, maxWidth);
		const lineHeight = fontSize * 1.15;
		const totalHeight = lines.length * lineHeight;
		const widestLine = Math.max(...lines.map((l) => context.measureText(l).width), 0);

		if (totalHeight <= maxFontPx * 3.4 && widestLine <= maxWidth) {
			return { fontSize, lines, lineHeight };
		}
		fontSize -= 2;
	}

	context.font = `700 ${minFontPx}px Impact, "Arial Narrow Bold", Haettenschweiler, sans-serif`;
	return { fontSize: minFontPx, lines: wrapLines(context, text, maxWidth), lineHeight: minFontPx * 1.15 };
}

function drawCaption(context: CanvasRenderingContext2D, caption: CaptionState) {
	const text = caption.text.trim().toUpperCase();
	if (!text || !canvas) return;

	const maxWidth = canvas.width * 0.9;
	const maxFontPx = canvas.height * (state.fontSizePercent / 100);
	const minFontPx = Math.max(canvas.height * 0.03, 12);

	const { lines, lineHeight, fontSize } = fitCaption(context, text, maxWidth, maxFontPx, minFontPx);
	context.font = `700 ${fontSize}px Impact, "Arial Narrow Bold", Haettenschweiler, sans-serif`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.lineJoin = "round";
	context.miterLimit = 2;

	const centerY = canvas.height * (caption.yPercent / 100);
	const totalHeight = lines.length * lineHeight;
	const startY = centerY - totalHeight / 2 + lineHeight / 2;

	lines.forEach((line, i) => {
		const y = startY + i * lineHeight;
		context.lineWidth = Math.max(fontSize / 9, 2);
		context.strokeStyle = state.outlineColor;
		context.strokeText(line, canvas.width / 2, y);
		context.fillStyle = state.textColor;
		context.fillText(line, canvas.width / 2, y);
	});
}

function draw() {
	if (!ctx || !canvas || !state.image) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);
	drawCaption(ctx, state.top);
	drawCaption(ctx, state.bottom);
	syncHandlePositions();
}

function syncHandlePositions() {
	const topHandle = document.querySelector<HTMLElement>('[data-handle="top"]');
	const bottomHandle = document.querySelector<HTMLElement>('[data-handle="bottom"]');
	if (topHandle) {
		topHandle.style.top = `${state.top.yPercent}%`;
		topHandle.setAttribute("aria-valuenow", String(Math.round(state.top.yPercent)));
	}
	if (bottomHandle) {
		bottomHandle.style.top = `${state.bottom.yPercent}%`;
		bottomHandle.setAttribute("aria-valuenow", String(Math.round(state.bottom.yPercent)));
	}
}

// ---- Text + control inputs ----

topTextInput?.addEventListener("input", () => {
	state.top.text = topTextInput.value;
	draw();
});

bottomTextInput?.addEventListener("input", () => {
	state.bottom.text = bottomTextInput.value;
	draw();
});

sizeSlider?.addEventListener("input", () => {
	state.fontSizePercent = Number(sizeSlider.value);
	draw();
});

textColorInput?.addEventListener("input", () => {
	state.textColor = textColorInput.value;
	draw();
});

outlineColorInput?.addEventListener("input", () => {
	state.outlineColor = outlineColorInput.value;
	draw();
});

clearBtn?.addEventListener("click", () => {
	state.top.text = "";
	state.bottom.text = "";
	if (topTextInput) topTextInput.value = "";
	if (bottomTextInput) bottomTextInput.value = "";
	draw();
});

downloadBtn?.addEventListener("click", () => {
	if (!canvas) return;
	canvas.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${state.activeTemplateId ?? "meme"}.png`;
		a.click();
		URL.revokeObjectURL(url);
	}, "image/png");
});

// ---- Draggable caption handles (pointer + keyboard) ----

function clampPercent(value: number) {
	return Math.min(96, Math.max(4, value));
}

function attachHandleDrag(handle: HTMLElement, caption: CaptionState) {
	let dragging = false;

	function moveTo(clientY: number) {
		if (!canvasWrap) return;
		const rect = canvasWrap.getBoundingClientRect();
		const percent = ((clientY - rect.top) / rect.height) * 100;
		caption.yPercent = clampPercent(percent);
		draw();
	}

	handle.addEventListener("pointerdown", (e) => {
		dragging = true;
		handle.setPointerCapture(e.pointerId);
		handle.classList.add("cursor-grabbing");
		moveTo(e.clientY);
	});

	handle.addEventListener("pointermove", (e) => {
		if (!dragging) return;
		moveTo(e.clientY);
	});

	function stopDrag() {
		dragging = false;
		handle.classList.remove("cursor-grabbing");
	}

	handle.addEventListener("pointerup", stopDrag);
	handle.addEventListener("pointercancel", stopDrag);

	handle.addEventListener("keydown", (e) => {
		const step = e.shiftKey ? 5 : 1.5;
		if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
			e.preventDefault();
			caption.yPercent = clampPercent(caption.yPercent - step);
			draw();
		} else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
			e.preventDefault();
			caption.yPercent = clampPercent(caption.yPercent + step);
			draw();
		}
	});
}

const topHandleEl = document.querySelector<HTMLElement>('[data-handle="top"]');
const bottomHandleEl = document.querySelector<HTMLElement>('[data-handle="bottom"]');
if (topHandleEl) attachHandleDrag(topHandleEl, state.top);
if (bottomHandleEl) attachHandleDrag(bottomHandleEl, state.bottom);

// ---- Sidebar: template grid, upload, random ----

sidebarGrid?.addEventListener("click", (e) => {
	const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-template-id]");
	if (!btn) return;
	const src = btn.dataset.templateSrc;
	const id = btn.dataset.templateId;
	if (src && id) setImage(src, id);
});

function handleUploadedFile(file: File | undefined | null) {
	if (!file || !file.type.startsWith("image/")) return;
	const reader = new FileReader();
	reader.onload = () => {
		const result = String(reader.result);
		setImage(result, null);
	};
	reader.readAsDataURL(file);
}

uploadBtn?.addEventListener("click", () => sidebarUploadInput?.click());
sidebarUploadInput?.addEventListener("change", () => handleUploadedFile(sidebarUploadInput.files?.[0]));

randomBtn?.addEventListener("click", () => {
	if (templatesList.length === 0) templatesList = getTemplatesFromDOM();
	const pool = templatesList.filter((t) => t.id !== state.activeTemplateId);
	const pick = shuffle(pool)[0] ?? templatesList[0] ?? TEMPLATES[0];
	if (pick) {
		setImage(pick.originalUrl || pick.src || "", pick.id);
	}
});

async function fetchTemplatesFromApi(requestedTemplateId?: string | null) {
	try {
		const res = await fetch("/api/templates");
		if (!res.ok) return;
		const data = await res.json();
		if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
			const previousCount = templatesList.length;
			templatesList = data.templates;

			if (previousCount !== templatesList.length || previousCount === 0) {
				renderSidebarTemplates(templatesList);
			}

			if (requestedTemplateId && state.activeTemplateId !== requestedTemplateId) {
				const match = templatesList.find((t) => t.id === requestedTemplateId);
				if (match) {
					await setImage(match.originalUrl || match.src || "", match.id);
				}
			} else if (!state.image && templatesList.length > 0) {
				const first = templatesList[0];
				await setImage(first.originalUrl || first.src || "", first.id);
			}
		}
	} catch (err) {
		console.warn("Could not fetch /api/templates:", err);
	}
}

// ---- Initial load: from ?template=, ?upload=1, or default ----

async function init() {
	// First initialize templates from rendered DOM
	templatesList = getTemplatesFromDOM();
	if (templatesList.length === 0) {
		templatesList = [...TEMPLATES];
	}

	const params = new URLSearchParams(window.location.search);
	const templateId = params.get("template");
	const isUpload = params.get("upload") === "1";

	if (isUpload) {
		let stored: string | null = null;
		try {
			stored = sessionStorage.getItem(UPLOAD_STORAGE_KEY);
		} catch {
			stored = null;
		}
		if (stored) {
			await setImage(stored, null);
			fetchTemplatesFromApi();
			return;
		}
	}

	// Shuffle the sidebar grid order on load if elements are already in DOM
	if (sidebarGrid) {
		const cards = Array.from(sidebarGrid.children);
		shuffle(cards).forEach((card) => sidebarGrid.appendChild(card));
	}

	const match = (templateId ? templatesList.find((t) => t.id === templateId) : null) ?? templatesList[0];
	if (match) {
		await setImage(match.originalUrl || match.src || "", match.id);
	}

	// Asynchronously ensure fresh templates from Spaces/API
	await fetchTemplatesFromApi(templateId);
}

init();

