const UPLOAD_STORAGE_KEY = "mememaker.upload";

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Shuffles the *content* of the fixed-position hero background slots on load. */
function shuffleHeroSlots() {
	const slots = Array.from(document.querySelectorAll<HTMLAnchorElement>(".hero-slot"));
	if (slots.length === 0) return;

	const entries = slots.map((slot) => ({
		href: slot.getAttribute("href") ?? "",
		src: slot.querySelector("img")?.getAttribute("src") ?? "",
		alt: slot.querySelector("img")?.getAttribute("alt") ?? "",
	}));

	const shuffled = shuffle(entries);

	slots.forEach((slot, i) => {
		const entry = shuffled[i];
		slot.setAttribute("href", entry.href);
		const img = slot.querySelector("img");
		if (img) {
			img.setAttribute("src", entry.src);
			img.setAttribute("alt", entry.alt);
		}
	});
}

/** Re-orders the template grid DOM nodes and wires up the Shuffle button. */
function initTemplatesGrid() {
	const gridEl = document.querySelector<HTMLElement>("[data-template-grid]");
	const shuffleBtn = document.querySelector<HTMLButtonElement>("[data-shuffle-btn]");
	if (!gridEl) return;

	function reshuffle(grid: HTMLElement) {
		const cards = Array.from(grid.children);
		const shuffled = shuffle(cards);
		shuffled.forEach((card) => grid.appendChild(card));
	}

	reshuffle(gridEl);
	shuffleBtn?.addEventListener("click", () => reshuffle(gridEl));
}

/** Wires up the hero upload dropzone: FileReader -> sessionStorage -> redirect to /edit. */
function initUploadDropzone() {
	const dropzone = document.querySelector<HTMLElement>("[data-dropzone]");
	const input = document.querySelector<HTMLInputElement>("[data-dropzone-input]");
	if (!dropzone || !input) return;

	function handleFile(file: File | undefined | null) {
		if (!file || !file.type.startsWith("image/")) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				sessionStorage.setItem(UPLOAD_STORAGE_KEY, String(reader.result));
			} catch {
				// sessionStorage may be unavailable (e.g. private mode quota); fall back silently.
			}
			window.location.href = "/edit?upload=1";
		};
		reader.readAsDataURL(file);
	}

	input.addEventListener("change", () => handleFile(input.files?.[0]));

	dropzone.addEventListener("click", () => input.click());

	dropzone.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			input.click();
		}
	});

	dropzone.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropzone.classList.add("border-ink", "bg-canvas-soft-2");
	});

	dropzone.addEventListener("dragleave", () => {
		dropzone.classList.remove("border-ink", "bg-canvas-soft-2");
	});

	dropzone.addEventListener("drop", (e) => {
		e.preventDefault();
		dropzone.classList.remove("border-ink", "bg-canvas-soft-2");
		handleFile(e.dataTransfer?.files?.[0]);
	});
}

/** Dynamically ensures latest templates from /api/templates are rendered on the landing page. */
async function fetchTemplatesForLanding() {
	try {
		const res = await fetch("/api/templates");
		if (!res.ok) return;
		const data = await res.json();
		if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
			const gridEl = document.querySelector<HTMLElement>("[data-template-grid]");
			if (!gridEl) return;
			const existingCards = gridEl.querySelectorAll("a[href^='/edit?template=']");
			if (existingCards.length === data.templates.length) return;

			gridEl.innerHTML = "";
			data.templates.forEach((t: any) => {
				const a = document.createElement("a");
				a.href = `/edit?template=${encodeURIComponent(t.id)}`;
				a.className =
					"group relative flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/70 p-1.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:border-black/20 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-link focus-visible:outline-none";
				a.setAttribute("aria-label", `Use ${t.name} meme template`);

				const wrap = document.createElement("div");
				wrap.className = "relative aspect-4/3 w-full overflow-hidden rounded-xl bg-canvas-soft-2";

				const img = document.createElement("img");
				img.src = t.thumbnailUrl || t.originalUrl || t.src || "";
				img.alt = t.name;
				img.width = t.width || 900;
				img.height = t.height || 675;
				img.className = "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105";
				img.loading = "lazy";

				const overlay = document.createElement("div");
				overlay.className =
					"absolute inset-0 flex items-center justify-center bg-ink/35 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100";
				overlay.innerHTML = `<span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">Use</span>`;

				wrap.appendChild(img);
				wrap.appendChild(overlay);

				const titleDiv = document.createElement("div");
				titleDiv.className = "px-1 pt-1.5 pb-0.5 text-center";
				titleDiv.innerHTML = `<p class="truncate text-[11.5px] font-semibold text-ink/90 group-hover:text-ink">${t.name}</p>`;

				a.appendChild(wrap);
				a.appendChild(titleDiv);
				gridEl.appendChild(a);
			});
		}
	} catch (err) {
		console.warn("Could not fetch /api/templates for landing page:", err);
	}
}

shuffleHeroSlots();
initTemplatesGrid();
initUploadDropzone();
fetchTemplatesForLanding();
