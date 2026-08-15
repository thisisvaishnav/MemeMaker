import { TEMPLATES, shuffle } from "../lib/templates";

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
const sidebarGrid = document.querySelector<HTMLElement>("[data-sidebar-grid]");

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

async function setImage(src: string, templateId: string | null) {
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

// ---- Sidebar: template grid, upload ----

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

// ---- Shuffle the sidebar grid order on load ----
if (sidebarGrid) {
	const cards = Array.from(sidebarGrid.children);
	shuffle(cards).forEach((card) => sidebarGrid.appendChild(card));
}

// ---- Initial load: from ?template=, ?upload=1, or default ----

async function init() {
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
			return;
		}
	}

	const match = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
	await setImage(match.src, match.id);
}

init();
