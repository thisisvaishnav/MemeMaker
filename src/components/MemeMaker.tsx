import React, { useEffect, useRef, useState } from "react";
import "./MemeMaker.css";
import {
  loadImage,
  saveImage,
  clearImage,
  loadTemplateUrl,
  saveTemplateUrl,
  clearTemplateUrl,
  getCustomTemplateById,
} from "../lib/imageStore";
import {
  TEMPLATE_BOXES,
  DEFAULT_BOXES,
  getTemplateBoxes,
  calculateHandlePlacement,
  calculateClampedCoordinate,
  type TemplateTextBox,
  type HandlePlacement,
} from "../lib/templateBoxes";
import {
  fetchTemplates,
  saveTemplate,
  type DbTemplate,
} from "../lib/templatesDb";
import { getAdminSession } from "../lib/adminAuth";

export {
  TEMPLATE_BOXES,
  DEFAULT_BOXES,
  getTemplateBoxes,
  calculateHandlePlacement,
  calculateClampedCoordinate,
};
export type { TemplateTextBox };

type TextLayer = {
  id: number;
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
};

const DEFAULT_IMAGE = "/templates/cdn/1.webp";

const DO_SPACES_BASE_URL =
  "https://mememaker-templates.nyc3.cdn.digitaloceanspaces.com";

const templates = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  thumbnail: `/templates/cdn/${i + 1}.webp`,
  full: `/templates/cdn/${i + 1}.webp`,
}));

export const TEMPLATE_ALIAS_MAP: Record<string, number> = {
  "confused-nick": 1,
  "nick-young": 1,
  "left-exit": 2,
  "left-exit-12": 2,
  "car-swerving": 2,
  "two-buttons": 3,
  "epic-handshake": 4,
  "handshake": 4,
  "change-my-mind": 5,
  "crowder": 5,
  "distracted-boyfriend": 6,
  "distracted": 6,
  "woman-yelling-at-cat": 7,
  "yelling-cat": 7,
  "smudge": 7,
  "doge": 8,
  "buff-doge": 8,
  "cheems": 8,
  "buff-doge-vs-cheems": 8,
  "bernie": 9,
  "bernie-sanders": 9,
  "once-again-asking": 9,
  "always-has-been": 10,
  "astronaut": 10,
  "jim-halpert": 11,
  "whiteboard": 11,
  "the-office": 11,
  "leo-dicaprio": 12,
  "laughing-leo": 12,
  "anakin-and-padme": 13,
  "anakin": 13,
  "padme": 13,
  "trade-offer": 14,
  "panik-kalm-panik": 15,
  "panik": 15,
  "expanding-brain": 16,
  "brain": 16,
  "is-this-a-pigeon": 17,
  "pigeon": 17,
  "disaster-girl": 18,
  "theyre-the-same-picture": 19,
  "same-picture": 19,
  "harold": 20,
  "hide-the-pain-harold": 20,
};

export const TEMPLATE_NAMES: Record<number, string> = {
  1: "Confused Nick Young",
  2: "Left Exit 12 - Car Swerving",
  3: "Two Buttons",
  4: "Epic Handshake",
  5: "Change My Mind",
  6: "Distracted Boyfriend",
  7: "Woman Yelling at Cat",
  8: "Buff Doge vs. Cheems",
  9: "Bernie I Am Once Again Asking",
  10: "Always Has Been",
  11: "Jim Halpert Explaining to Whiteboard",
  12: "Leonardo DiCaprio Laughing",
  13: "Anakin and Padme",
  14: "Trade Offer",
  15: "Panik Kalm Panik",
  16: "Expanding Brain",
  17: "Is This a Pigeon?",
  18: "Disaster Girl",
  19: "They're the Same Picture",
  20: "Hide the Pain Harold",
};

export default function MemeMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedImageRef = useRef<{ src: string; img: HTMLImageElement } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingDragCoordsRef = useRef<{
    id: string | number;
    isLayer: boolean;
    x: number;
    y: number;
  } | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(1);
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [templateTitle, setTemplateTitle] = useState(TEMPLATE_NAMES[1]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [boxTexts, setBoxTexts] = useState<Record<string, string>>({});
  const [boxColors, setBoxColors] = useState<Record<string, string>>({});
  const [boxPositions, setBoxPositions] = useState<Record<string, { x: number; y: number }>>({});

  const [isAdmin, setIsAdmin] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null);

  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(52);

  const [watermark, setWatermark] = useState(true);
  const [privateMeme, setPrivateMeme] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [layers, setLayers] = useState<TextLayer[]>([]);

  const [generated, setGenerated] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [search, setSearch] = useState("");
  const [focusedBoxId, setFocusedBoxId] = useState<string | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  const currentDbTemplate = dbTemplates.find((t) => t.id === selectedTemplateId);
  const baseBoxes = currentDbTemplate?.boxes || getTemplateBoxes(selectedTemplateId);

  const activeBoxes = baseBoxes.map((box) => ({
    ...box,
    x: boxPositions[box.id]?.x ?? box.x,
    y: boxPositions[box.id]?.y ?? box.y,
  }));

  const drawMeme = (includeLayers = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderOnImage = (img: HTMLImageElement) => {
      const maxWidth = 1000;
      const scale = Math.min(1, maxWidth / img.width);
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      // Only reallocate canvas buffer if dimensions actually changed
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number = fontSize,
        color: string = textColor,
        align: CanvasTextAlign = "center",
        maxWidthPx?: number
      ) => {
        if (!text || !text.trim()) return;

        ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = Math.max(4, size / 10);
        ctx.textAlign = align;
        ctx.textBaseline = "middle";

        const px = canvas.width * x;
        const py = canvas.height * y;

        // Word-wrap and newline handling
        const lines: string[] = [];
        const rawLines = text.split("\n");

        if (maxWidthPx) {
          for (const rawLine of rawLines) {
            const words = rawLine.split(" ");
            let currentLine = "";
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const testWidth = ctx.measureText(testLine).width;
              if (testWidth > maxWidthPx && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
          }
        } else {
          lines.push(...rawLines);
        }

        const lineHeight = size * 1.15;
        const startY = py - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, idx) => {
          const lineY = startY + idx * lineHeight;
          ctx.strokeText(line, px, lineY);
          ctx.fillText(line, px, lineY);
        });
      };

      if (includeLayers) {
        // Draw template specific boxes
        activeBoxes.forEach((box) => {
          const text =
            boxTexts[box.id] ??
            (box.id === "top" ? topText : box.id === "bottom" ? bottomText : "");
          const color = boxColors[box.id] || textColor;
          const size = Math.round(fontSize * (box.fontSizeRatio || 1));
          const maxW = box.maxWidthRatio ? canvas.width * box.maxWidthRatio : undefined;
          drawText(text, box.x, box.y, size, color, box.textAlign || "center", maxW);
        });

        layers.forEach((layer) => {
          drawText(layer.text, layer.x, layer.y, layer.fontSize, layer.color, "center");
        });
      }

      if (watermark) {
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText("MemeMaker", 12, canvas.height - 12);
      }
    };

    // Fast synchronous path: reuse already decoded image without re-allocation
    if (loadedImageRef.current && loadedImageRef.current.src === image) {
      renderOnImage(loadedImageRef.current.img);
      return;
    }

    const img = new Image();
    const isDataOrBlob = image.startsWith("data:") || image.startsWith("blob:");
    const isLocal = image.startsWith("/") || (typeof window !== "undefined" && image.startsWith(window.location.origin));
    if (!isDataOrBlob && !isLocal) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      loadedImageRef.current = { src: image, img };
      renderOnImage(img);
    };

    img.onerror = (e) => {
      console.error("Failed to load image in MemeMaker canvas:", e);
      if (img.crossOrigin) {
        img.removeAttribute("crossorigin");
        img.src = image;
      }
    };

    img.src = image;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get("template");
    const customId = urlParams.get("custom");
    const isUpload = urlParams.get("upload");

    if (isUpload) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
    }

    if (customId) {
      getCustomTemplateById(customId).then((tpl) => {
        if (tpl) {
          setSelectedTemplateId(null);
          setImage(tpl.dataUrl);
          setTemplateTitle(tpl.name || "Custom Template");
          saveImage(tpl.dataUrl);
          clearTemplateUrl();
        } else {
          loadImage().then((pending) => {
            if (pending) {
              setSelectedTemplateId(null);
              setImage(pending);
              setTemplateTitle("Custom Template");
              saveImage(pending);
              clearTemplateUrl();
            }
          });
        }
      });
      window.history.replaceState({}, "", "/edit");
      return;
    }

    if (templateId) {
      const aliasId = TEMPLATE_ALIAS_MAP[templateId.toLowerCase()];
      const parsedNum = parseInt(templateId, 10);
      const resolvedId = aliasId ?? (parsedNum >= 1 && parsedNum <= 20 ? parsedNum : 1);
      const fullImageUrl = `/templates/cdn/${resolvedId}.webp`;
      setSelectedTemplateId(resolvedId);
      setImage(fullImageUrl);
      setTemplateTitle(TEMPLATE_NAMES[resolvedId] || `Template ${resolvedId}`);
      saveTemplateUrl(fullImageUrl);
      saveImage(fullImageUrl);
      window.history.replaceState({}, "", "/edit");
      return;
    }

    // Restore persisted template/image across page changes
    loadImage().then((pendingImage) => {
      if (pendingImage && (pendingImage.startsWith("data:") || pendingImage.startsWith("blob:"))) {
        setSelectedTemplateId(null);
        setImage(pendingImage);
        setTemplateTitle("Custom Template");
        return;
      }
      loadTemplateUrl().then((pendingTemplate) => {
        if (pendingTemplate) {
          setImage(pendingTemplate);
          const match = pendingTemplate.match(/\/templates\/cdn\/(\d+)\.webp/);
          if (match) {
            const id = parseInt(match[1], 10);
            setSelectedTemplateId(id);
            setTemplateTitle(TEMPLATE_NAMES[id] || `Template ${id}`);
          }
        } else if (pendingImage) {
          setSelectedTemplateId(null);
          setImage(pendingImage);
          setTemplateTitle("Custom Template");
        }
      });
    });

    getAdminSession().then((session) => {
      setIsAdmin(Boolean(session));
    });

    fetchTemplates().then((tpls) => {
      if (tpls && tpls.length > 0) {
        setDbTemplates(tpls);
      }
    });
  }, []);

  useEffect(() => {
    drawMeme();
  }, [
    image,
    selectedTemplateId,
    boxPositions,
    boxTexts,
    boxColors,
    topText,
    bottomText,
    textColor,
    fontSize,
    watermark,
    layers,
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedTemplateId(null);
        setImage(reader.result);
        setTemplateTitle(file.name.replace(/\.[^/.]+$/, "") || "Custom Upload");
        saveImage(reader.result);
        clearTemplateUrl();
        setGenerated(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateMeme = () => {
    drawMeme(true);

    setTimeout(() => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const output = canvas.toDataURL("image/png");
      setGenerated(output);
      drawMeme(false);
    }, 100);
  };

  const downloadMeme = () => {
    if (!generated) return;

    const link = document.createElement("a");
    link.download = "mememaker-meme.png";
    link.href = generated;
    link.click();
  };

  const shareMeme = async () => {
    if (!generated) return;

    try {
      const response = await fetch(generated);
      const blob = await response.blob();

      const file = new File([blob], "mememaker.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title: "My Meme",
          text: "Created with MemeMaker",
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText("My Meme created with MemeMaker");
        alert("Share is not supported. Meme link copied.");
      }
    } catch {
      console.log("Share cancelled");
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setSelectedTemplateId(1);
    setBoxPositions({});
    setBoxTexts({});
    setBoxColors({});
    setTopText("");
    setBottomText("");
    setTextColor("#ffffff");
    setFontSize(52);
    setWatermark(true);
    setPrivateMeme(false);
    setAnonymous(false);
    setLayers([]);
    setGenerated(null);
    setImage(DEFAULT_IMAGE);
    setTemplateTitle(TEMPLATE_NAMES[1]);
    clearImage();
    clearTemplateUrl();
  };

  const [dragging, setDragging] = useState<{
    id: number | string;
    isLayer: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const addTextLayer = () => {
    setLayers((current) => [
      ...current,
      {
        id: Date.now(),
        text: "New Text",
        color: "#ffffff",
        fontSize: 40,
        x: 0.5,
        y: 0.5,
      },
    ]);
  };

  const updateLayer = (
    id: number,
    field: keyof TextLayer,
    value: string | number
  ) => {
    setLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              [field]:
                field === "fontSize" || field === "y" || field === "x"
                  ? Number(value)
                  : value,
            }
          : layer
      )
    );
  };

  const removeLayer = (id: number) => {
    setLayers((current) => current.filter((layer) => layer.id !== id));
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    layer: TextLayer
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({
      id: layer.id,
      isLayer: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: layer.x,
      initialY: layer.y,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBoxPointerDown = (
    e: React.PointerEvent,
    box: { id: string; x: number; y: number }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedBoxId(box.id);
    document.getElementById(`input-box-${box.id}`)?.focus();
    setDragging({
      id: box.id,
      isLayer: false,
      startX: e.clientX,
      startY: e.clientY,
      initialX: box.x,
      initialY: box.y,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const resetBoxPosition = (boxId: string) => {
    setBoxPositions((prev) => {
      const next = { ...prev };
      delete next[boxId];
      return next;
    });
  };

  const handleAdminSavePositions = async () => {
    if (!selectedTemplateId) return;
    const updatedBoxes = activeBoxes.map((b) => ({
      id: b.id,
      label: b.label,
      placeholder: b.placeholder,
      x: Math.round(b.x * 100) / 100,
      y: Math.round(b.y * 100) / 100,
      textAlign: b.textAlign,
      maxWidthRatio: b.maxWidthRatio,
      fontSizeRatio: b.fontSizeRatio,
    }));

    const res = await saveTemplate({
      id: selectedTemplateId,
      name: templateTitle,
      image_url: image,
      boxes: updatedBoxes,
    });

    if (res.success) {
      setAdminSaveMessage("✅ Positions saved to database for all users!");
      setDbTemplates((prev) =>
        prev.map((t) => (t.id === selectedTemplateId ? { ...t, boxes: updatedBoxes } : t))
      );
      setTimeout(() => setAdminSaveMessage(null), 4000);
    } else if (res.savedLocally) {
      setAdminSaveMessage("💾 Saved to your browser! (Run Supabase SQL to sync globally)");
      setDbTemplates((prev) =>
        prev.map((t) => (t.id === selectedTemplateId ? { ...t, boxes: updatedBoxes } : t))
      );
      setTimeout(() => setAdminSaveMessage(null), 5000);
    } else {
      setAdminSaveMessage("❌ Error: " + (res.error || "Save failed"));
      setTimeout(() => setAdminSaveMessage(null), 5000);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return;

    const deltaX = e.clientX - dragging.startX;
    const deltaY = e.clientY - dragging.startY;

    const clampedX = calculateClampedCoordinate(
      dragging.initialX,
      deltaX,
      canvasRect.width
    );
    const clampedY = calculateClampedCoordinate(
      dragging.initialY,
      deltaY,
      canvasRect.height
    );

    pendingDragCoordsRef.current = {
      id: dragging.id,
      isLayer: dragging.isLayer,
      x: clampedX,
      y: clampedY,
    };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const coords = pendingDragCoordsRef.current;
        if (!coords) return;
        if (coords.isLayer) {
          setLayers((current) =>
            current.map((layer) =>
              layer.id === coords.id ? { ...layer, x: coords.x, y: coords.y } : layer
            )
          );
        } else {
          setBoxPositions((prev) => ({
            ...prev,
            [coords.id]: { x: coords.x, y: coords.y },
          }));
        }
      });
    }
  };

  const handlePointerUp = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const coords = pendingDragCoordsRef.current;
    if (coords) {
      if (coords.isLayer) {
        setLayers((current) =>
          current.map((layer) =>
            layer.id === coords.id ? { ...layer, x: coords.x, y: coords.y } : layer
          )
        );
      } else {
        setBoxPositions((prev) => ({
          ...prev,
          [coords.id]: { x: coords.x, y: coords.y },
        }));
      }
      pendingDragCoordsRef.current = null;
    }
    setDragging(null);
  };

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (id: number) => {
    if (!searchLower) return true;
    if (String(id).includes(searchLower)) return true;
    const name = TEMPLATE_NAMES[id]?.toLowerCase() || "";
    if (name.includes(searchLower)) return true;
    return Object.entries(TEMPLATE_ALIAS_MAP).some(
      ([alias, aliasId]) => aliasId === id && alias.includes(searchLower)
    );
  };

  return (
    <div className="meme-app">
      <main className="page">
        {/* PAGE TITLE */}
        <section className="page-heading">
          <h1>{templateTitle} Meme Generator</h1>
          <p>
            The fastest meme generator. Easily add text to images or memes.
          </p>
        </section>

        {/* EDITOR */}
        <section className="editor">
          {/* PREVIEW */}
          <div className="preview-section">
            <div className="preview-toolbar">
              <button type="button" title="Reset" onClick={reset}>↶</button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(100, f + 4))}
                title="Increase Font Size"
              >
                Size +
              </button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(20, f - 4))}
                title="Decrease Font Size"
              >
                Size -
              </button>

              <button type="button" onClick={triggerUpload}>
                + Add Image
              </button>
            </div>

            <div
              className="canvas-wrapper"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="canvas-stage">
                <canvas ref={canvasRef} />

                {layers.map((layer) => {
                  const canvas = canvasRef.current;
                  const canvasWidth = canvas?.width ?? 1000;
                  const canvasHeight = canvas?.height ?? 600;

                  const displayWidth =
                    canvas?.getBoundingClientRect().width ?? canvasWidth;
                  const displayHeight =
                    canvas?.getBoundingClientRect().height ?? canvasHeight;

                  const px = layer.x * displayWidth;
                  const py = layer.y * displayHeight;

                  const scaleFactor = displayWidth / canvasWidth;
                  const displayFontSize = layer.fontSize * scaleFactor;

                  return (
                    <div
                      key={layer.id}
                      className="text-overlay"
                      style={{
                        left: px,
                        top: py,
                        color: layer.color,
                        fontSize: displayFontSize,
                        fontWeight: 900,
                        fontFamily: 'Impact, "Arial Black", sans-serif',
                        textShadow:
                          "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                        whiteSpace: "nowrap",
                        transform: "translate(-50%, -50%)",
                        cursor:
                          dragging?.id === layer.id ? "grabbing" : "grab",
                      }}
                      onPointerDown={(e) => handlePointerDown(e, layer)}
                    >
                      {layer.text}
                    </div>
                  );
                })}

                {/* TEMPLATE BOXES: DIRECT DRAGGABLE TEXT OVERLAYS */}
                {activeBoxes.map((box) => {
                  const canvas = canvasRef.current;
                  const canvasWidth = canvas?.width ?? 1000;
                  const canvasHeight = canvas?.height ?? 600;

                  const displayWidth =
                    canvas?.getBoundingClientRect().width ?? canvasWidth;
                  const displayHeight =
                    canvas?.getBoundingClientRect().height ?? canvasHeight;

                  const px = box.x * displayWidth;
                  const py = box.y * displayHeight;
                  const text =
                    boxTexts[box.id] ??
                    (box.id === "top" ? topText : box.id === "bottom" ? bottomText : "");
                  const hasText = Boolean(text && text.trim().length > 0);
                  const displayText = hasText ? text : box.placeholder.toUpperCase();
                  const isDraggingThis = dragging?.id === box.id;
                  const isFocused = focusedBoxId === box.id;
                  const isHovered = hoveredBoxId === box.id;
                  const scaleFactor = displayWidth / canvasWidth;
                  const effectiveFontSize = Math.max(
                    12,
                    Math.round(fontSize * (box.fontSizeRatio || 1) * scaleFactor)
                  );
                  const color = boxColors[box.id] || textColor;
                  const maxWidthPx = box.maxWidthRatio ? displayWidth * box.maxWidthRatio : undefined;

                  return (
                    <div
                      key={`box-overlay-${box.id}`}
                      className={`box-text-overlay ${!hasText ? "is-placeholder" : ""} ${isDraggingThis ? "is-dragging" : ""} ${isFocused ? "is-focused" : ""} ${isHovered ? "is-hovered" : ""}`}
                      style={{
                        left: px,
                        top: py,
                        color: hasText ? color : "rgba(255, 255, 255, 0.45)",
                        fontSize: `${effectiveFontSize}px`,
                        maxWidth: maxWidthPx ? `${maxWidthPx}px` : "90%",
                        textAlign: box.textAlign || "center",
                        cursor: isDraggingThis ? "grabbing" : "grab",
                      }}
                      title={`Touch & hold to drag ${box.label}`}
                      onPointerDown={(e) => handleBoxPointerDown(e, box)}
                      onClick={() => {
                        setFocusedBoxId(box.id);
                        document.getElementById(`input-box-${box.id}`)?.focus();
                      }}
                      onMouseEnter={() => setHoveredBoxId(box.id)}
                      onMouseLeave={() => setHoveredBoxId(null)}
                    >
                      {displayText}
                    </div>
                  );
                })}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />

            {generated && (
              <div className="generated-actions">
                <button className="download-btn" onClick={downloadMeme}>
                  Download
                </button>

                <button className="share-btn" onClick={shareMeme}>
                  Share
                </button>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <aside className="controls">
            <div className="control-top">
              <button
                onClick={triggerUpload}
                className="upload-btn"
              >
                Upload new template
              </button>

              <input
                className="template-search"
                placeholder="Search templates (e.g. harold, drake)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ADMIN BAR (Visible if Admin logged in) */}
            {isAdmin && selectedTemplateId && (
              <div className="admin-editor-bar">
                <div className="admin-bar-header">
                  <span className="admin-badge">⚡ Admin Mode Active</span>
                  <a href="/admin/templates" className="admin-link">Open Studio ↗</a>
                </div>
                <button
                  type="button"
                  className="admin-save-pos-btn"
                  onClick={handleAdminSavePositions}
                >
                  💾 Save Current Positions as Default
                </button>
                {adminSaveMessage && (
                  <span className="admin-save-msg">{adminSaveMessage}</span>
                )}
              </div>
            )}

            <div className="template-title">
              <span>{templateTitle}</span>

              <div className="template-tabs">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/templates";
                  }}
                >
                  Templates →
                </button>
              </div>
            </div>

            {/* TEMPLATES */}
            <div className="template-list">
              <button
                className="blank-template"
                onClick={() => {
                  setSelectedTemplateId(null);
                  setBoxPositions({});
                  setImage(DEFAULT_IMAGE);
                  setTemplateTitle("Blank Template");
                  saveImage(DEFAULT_IMAGE);
                  clearTemplateUrl();
                }}
              >
                Blank
              </button>

              {(dbTemplates.length > 0
                ? dbTemplates
                : templates.map((t) => ({
                    id: t.id,
                    name: TEMPLATE_NAMES[t.id] || `Template ${t.id}`,
                    image_url: t.full,
                  }))
              )
                .filter((item) => matchesSearch(item.id))
                .map((template) => (
                  <button
                    className="template"
                    key={template.id}
                    title={template.name}
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setBoxPositions({});
                      setImage(template.image_url);
                      setTemplateTitle(template.name);
                      saveTemplateUrl(template.image_url);
                      saveImage(template.image_url);
                    }}
                  >
                    <img
                      src={template.image_url}
                      alt={template.name}
                    />
                  </button>
                ))}
            </div>

            {/* TEXT INPUTS */}
            <div className="template-text-boxes">
              {activeBoxes.map((box) => {
                const val =
                  boxTexts[box.id] ??
                  (box.id === "top" ? topText : box.id === "bottom" ? bottomText : "");
                const col = boxColors[box.id] || textColor;
                return (
                  <TextInput
                    key={box.id}
                    id={`input-box-${box.id}`}
                    label={box.label}
                    placeholder={box.placeholder}
                    value={val}
                    onChange={(text) => {
                      setBoxTexts((prev) => ({ ...prev, [box.id]: text }));
                      if (box.id === "top") setTopText(text);
                      if (box.id === "bottom") setBottomText(text);
                    }}
                    color={col}
                    setColor={(newColor) => {
                      setBoxColors((prev) => ({ ...prev, [box.id]: newColor }));
                    }}
                    onResetPosition={
                      boxPositions[box.id]
                        ? () => resetBoxPosition(box.id)
                        : undefined
                    }
                    onFocus={() => setFocusedBoxId(box.id)}
                    onBlur={() => setFocusedBoxId(null)}
                    onMouseEnter={() => setHoveredBoxId(box.id)}
                    onMouseLeave={() => setHoveredBoxId(null)}
                  />
                );
              })}
            </div>

            {/* FONT CONTROLS */}
            <div className="font-controls">
              <label>
                Font size
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </label>

              <span>{fontSize}px</span>
            </div>

            {/* EXTRA LAYERS */}
            {layers.map((layer) => (
              <div className="extra-layer" key={layer.id}>
                <input
                  value={layer.text}
                  onChange={(e) =>
                    updateLayer(layer.id, "text", e.target.value)
                  }
                />

                <input
                  type="color"
                  value={layer.color}
                  onChange={(e) =>
                    updateLayer(layer.id, "color", e.target.value)
                  }
                />

                <button onClick={() => removeLayer(layer.id)}>×</button>
              </div>
            ))}

            {/* OPTIONS */}
            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                />
                Use watermark
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={privateMeme}
                  onChange={(e) => setPrivateMeme(e.target.checked)}
                />
                Private
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                Create Anonymously
              </label>
            </div>

            {/* MOBILE COLLAPSE */}
            <button
              className="options-toggle"
              onClick={() => setShowOptions(!showOptions)}
            >
              Advanced Options {showOptions ? "▲" : "▼"}
            </button>

            {showOptions && (
              <div className="advanced-options">
                <button type="button" onClick={addTextLayer}>+ Add Text</button>
              </div>
            )}

            {/* DESKTOP ADD TEXT */}
            <button className="add-text-btn" onClick={addTextLayer}>
              + Add Text
            </button>

            {/* ACTIONS */}
            <div className="main-actions">
              <button className="generate-btn" onClick={generateMeme}>
                Generate
              </button>

              <button className="reset-btn" onClick={reset}>
                Reset
              </button>
            </div>
          </aside>
        </section>

        {/* AI BANNER */}
        <section className="ai-banner">
          Instant memes with one prompt:
          <strong>MemeMaker AI</strong>
        </section>

        {/* FEATURED */}
        <section className="featured">
          <div className="featured-header">
            <h2>Featured Meme Templates</h2>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/templates";
              }}
            >
              See All →
            </button>
          </div>

          <div className="featured-grid">
            {(dbTemplates.length > 0
              ? dbTemplates
              : templates.map((t) => ({
                  id: t.id,
                  name: TEMPLATE_NAMES[t.id] || `Template ${t.id}`,
                  image_url: t.full,
                }))
            ).slice(0, 20).map((template) => (
              <div
                className="featured-card"
                key={template.id}
                onClick={() => {
                  setSelectedTemplateId(template.id);
                  setBoxPositions({});
                  setImage(template.image_url);
                  setTemplateTitle(template.name);
                  saveTemplateUrl(template.image_url);
                  saveImage(template.image_url);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={template.image_url}
                  alt={template.name}
                />

                <div className="featured-info">
                  <span>{template.name}</span>
                  <small>🔥 Trending</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* TEXT INPUT COMPONENT */

function TextInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  color,
  setColor,
  onResetPosition,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}: {
  id?: string;
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  onResetPosition?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      className="box-input-wrapper"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="box-label-row">
        {label && <label className="box-label" htmlFor={id}>{label}</label>}
        {onResetPosition && (
          <button
            type="button"
            className="box-reset-pos-btn"
            onClick={onResetPosition}
            title="Reset to default position"
          >
            Reset pos
          </button>
        )}
      </div>
      <div className="text-row">
        <input
          id={id}
          className="text-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        <input
          className="color-picker"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <button className="settings-btn" type="button" title="Text settings">⚙</button>
      </div>
    </div>
  );
}
