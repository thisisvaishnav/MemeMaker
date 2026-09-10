import React, { useState, useEffect, useRef } from "react";
import "../MemeMaker.css";
import {
  fetchAllAdminTemplates,
  saveTemplate,
  createTemplate,
  uploadTemplateImage,
  type DbTemplate,
} from "../../lib/templatesDb";
import { getAdminSession, adminSignOut, type AdminUser } from "../../lib/adminAuth";
import {
  type TemplateTextBox,
  AVAILABLE_MEME_FONTS,
  type MemeFontOption,
} from "../../lib/templateBoxes";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface TransformState {
  mode: "drag" | "rotate" | "resize";
  id: string;
  startX: number;
  startY: number;
  initialX?: number;
  initialY?: number;
  centerX?: number;
  centerY?: number;
  initialRotation?: number;
  startAngle?: number;
  handle?: ResizeHandle;
  initialWidthRatio?: number;
  initialFontSizeRatio?: number;
  initialFontSize?: number;
}

export default function AdminStudio() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DbTemplate | null>(null);
  const [boxes, setBoxes] = useState<TemplateTextBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [transformState, setTransformState] = useState<TransformState | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Template Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getAdminSession().then((session) => {
      if (!session) {
        window.location.href = "/admin/login";
        return;
      }
      setAdmin(session);
      loadTemplates();
    });
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await fetchAllAdminTemplates();
    setTemplates(data);
    if (data.length > 0) {
      setSelectedTemplate(data[0]);
      setBoxes(data[0].boxes || []);
      setSelectedBoxId(data[0].boxes?.[0]?.id || null);
    }
    setLoading(false);
  };

  const handleSelectTemplate = (tpl: DbTemplate) => {
    setSelectedTemplate(tpl);
    setBoxes(tpl.boxes || []);
    setSelectedBoxId(tpl.boxes?.[0]?.id || null);
    setMessage(null);
  };

  // Add new box to current template
  const handleAddBox = (isPlain = false) => {
    const nextNum = boxes.length + 1;
    const isPlainStyle = Boolean(isPlain);
    const newBox: TemplateTextBox = {
      id: `zone-${Date.now()}`,
      label: `Text #${nextNum}`,
      placeholder: `Text #${nextNum}`,
      x: 0.5,
      y: Math.min(0.9, 0.15 * nextNum),
      textAlign: "center",
      maxWidthRatio: 0.5,
      fontSize: isPlainStyle ? 28 : 36,
      fontSizeRatio: 1.0,
      rotation: 0,
      fontFamily: isPlainStyle
        ? "Inter, system-ui, -apple-system, sans-serif"
        : (boxes[0]?.fontFamily || AVAILABLE_MEME_FONTS[0].family),
      isPlain: isPlainStyle,
      color: isPlainStyle ? "#000000" : "#ffffff",
    };
    const updated = [...boxes, newBox];
    setBoxes(updated);
    setSelectedBoxId(newBox.id);
  };

  // Delete selected box
  const handleDeleteBox = (id: string) => {
    const updated = boxes.filter((b) => b.id !== id);
    setBoxes(updated);
    if (selectedBoxId === id) {
      setSelectedBoxId(updated[0]?.id || null);
    }
  };

  // Update field of selected box
  const handleUpdateBox = (id: string, field: keyof TemplateTextBox, value: any) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Apply chosen font and style to all boxes in the current template
  const handleApplyFontToAllBoxes = (fontFamily: string, isPlain = false) => {
    setBoxes((prev) =>
      prev.map((b) => ({
        ...b,
        fontFamily,
        isPlain,
        color: isPlain ? "#000000" : (b.color || "#ffffff"),
      }))
    );
  };

  // Drag pointer handler for box
  const handleBoxPointerDown = (e: React.PointerEvent, box: TemplateTextBox) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBoxId(box.id);
    setTransformState({
      mode: "drag",
      id: box.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: box.x,
      initialY: box.y,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Rotate pointer handler
  const handleRotatePointerDown = (
    e: React.PointerEvent,
    boxId: string,
    currentRotation: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBoxId(boxId);
    const parentBox = (e.currentTarget as HTMLElement).closest(".transform-box");
    if (!parentBox) return;
    const rect = parentBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    setTransformState({
      mode: "rotate",
      id: boxId,
      centerX,
      centerY,
      initialRotation: currentRotation || 0,
      startAngle,
      startX: e.clientX,
      startY: e.clientY,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Resize pointer handler
  const handleResizePointerDown = (
    e: React.PointerEvent,
    boxId: string,
    handle: ResizeHandle,
    currentWidthRatio: number,
    currentFontSize: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBoxId(boxId);
    const parentBox = (e.currentTarget as HTMLElement).closest(".transform-box");
    if (!parentBox) return;
    const rect = parentBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setTransformState({
      mode: "resize",
      id: boxId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialWidthRatio: currentWidthRatio || 0.5,
      initialFontSize: currentFontSize || 36,
      initialFontSizeRatio: Math.round(((currentFontSize || 36) / 36) * 100) / 100,
      centerX,
      centerY,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!transformState || !canvasRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (transformState.mode === "drag") {
        const deltaX = (clientX - transformState.startX) / rect.width;
        const deltaY = (clientY - transformState.startY) / rect.height;

        const nextX = Math.round(Math.max(0.05, Math.min(0.95, (transformState.initialX ?? 0.5) + deltaX)) * 100) / 100;
        const nextY = Math.round(Math.max(0.05, Math.min(0.95, (transformState.initialY ?? 0.5) + deltaY)) * 100) / 100;

        setBoxes((prev) =>
          prev.map((b) => (b.id === transformState.id ? { ...b, x: nextX, y: nextY } : b))
        );
      } else if (
        transformState.mode === "rotate" &&
        transformState.centerX !== undefined &&
        transformState.centerY !== undefined &&
        transformState.startAngle !== undefined
      ) {
        const currentAngle =
          Math.atan2(clientY - transformState.centerY, clientX - transformState.centerX) *
          (180 / Math.PI);
        const diff = currentAngle - transformState.startAngle;
        let angle = Math.round(((transformState.initialRotation ?? 0) + diff) % 360);
        if (angle < 0) angle += 360;

        // Cardinal angle snapping within +/- 4 degrees
        const cardinals = [0, 90, 180, 270, 360];
        for (const card of cardinals) {
          if (Math.abs(angle - card) <= 4) {
            angle = card % 360;
            break;
          }
        }

        setBoxes((prev) =>
          prev.map((b) => (b.id === transformState.id ? { ...b, rotation: angle } : b))
        );
      } else if (
        transformState.mode === "resize" &&
        transformState.centerX !== undefined &&
        transformState.centerY !== undefined &&
        transformState.handle
      ) {
        const { handle, centerX, centerY, initialWidthRatio = 0.5, initialFontSize = 36 } = transformState;

        if (handle === "e" || handle === "w") {
          const distX = Math.abs(clientX - centerX);
          const newRatio = Math.round(Math.max(0.15, Math.min(0.95, (distX * 2) / rect.width)) * 100) / 100;
          setBoxes((prev) =>
            prev.map((b) => (b.id === transformState.id ? { ...b, maxWidthRatio: newRatio } : b))
          );
        } else if (handle === "n" || handle === "s") {
          const distY = Math.abs(clientY - centerY);
          const initialHalfH = Math.max(12, initialFontSize * 0.65);
          const ratio = distY / initialHalfH;
          const newFontSize = Math.max(14, Math.min(120, Math.round(initialFontSize * ratio)));
          const newFontRatio = Math.round((newFontSize / 36) * 100) / 100;
          setBoxes((prev) =>
            prev.map((b) =>
              b.id === transformState.id
                ? { ...b, fontSize: newFontSize, fontSizeRatio: newFontRatio }
                : b
            )
          );
        } else {
          // Corners: nw, ne, se, sw
          const dist = Math.hypot(clientX - centerX, clientY - centerY);
          const initialDist = Math.hypot(
            transformState.startX - centerX,
            transformState.startY - centerY
          );
          const ratio = dist / Math.max(10, initialDist);
          const newWidthRatio = Math.round(Math.max(0.15, Math.min(0.95, initialWidthRatio * ratio)) * 100) / 100;
          const newFontSize = Math.max(14, Math.min(120, Math.round(initialFontSize * ratio)));
          const newFontRatio = Math.round((newFontSize / 36) * 100) / 100;
          setBoxes((prev) =>
            prev.map((b) =>
              b.id === transformState.id
                ? { ...b, maxWidthRatio: newWidthRatio, fontSize: newFontSize, fontSizeRatio: newFontRatio }
                : b
            )
          );
        }
      }
    });
  };

  const handlePointerUp = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setTransformState(null);
  };

  // Save changes to database
  const handleSaveLayout = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    setMessage(null);

    const res = await saveTemplate({
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      slug: selectedTemplate.slug,
      image_url: selectedTemplate.image_url,
      boxes,
      is_active: selectedTemplate.is_active,
    });

    if (res.success) {
      setMessage({ type: "success", text: "✅ Template layout saved to database! Changes are live for all users." });
      setTemplates((prev) =>
        prev.map((t) => (t.id === selectedTemplate.id ? { ...t, boxes } : t))
      );
    } else if (res.savedLocally) {
      setMessage({
        type: "success",
        text: "💾 Layout saved to your browser! (To sync across all visitors, run the SQL script in your Supabase SQL editor).",
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === selectedTemplate.id ? { ...t, boxes } : t))
      );
    } else {
      setMessage({
        type: "error",
        text: `Error saving: ${res.error || "Please ensure the templates migration is executed in Supabase."}`,
      });
    }
    setSaving(false);
  };

  // Create new template
  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newName.trim()) return;

    setUploading(true);
    setMessage(null);

    try {
      const uploadRes = await uploadTemplateImage(newFile);
      if (!uploadRes.url) {
        throw new Error(uploadRes.error || "Failed to upload image");
      }

      const cleanSlug =
        newSlug.trim() ||
        newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const createRes = await createTemplate({
        name: newName.trim(),
        slug: cleanSlug,
        image_url: uploadRes.url,
        boxes: [
          { id: "top", label: "Text #1", placeholder: "Text #1", x: 0.5, y: 0.12, textAlign: "center", rotation: 0, maxWidthRatio: 0.85, fontSizeRatio: 1.0 },
          { id: "bottom", label: "Text #2", placeholder: "Text #2", x: 0.5, y: 0.88, textAlign: "center", rotation: 0, maxWidthRatio: 0.85, fontSizeRatio: 1.0 },
        ],
        is_active: true,
        display_order: templates.length + 1,
      });

      if (createRes.success && createRes.template) {
        setTemplates((prev) => [...prev, createRes.template!]);
        handleSelectTemplate(createRes.template!);
        setShowNewModal(false);
        setNewName("");
        setNewSlug("");
        setNewFile(null);
        setMessage({ type: "success", text: "✨ New template created successfully!" });
      } else {
        throw new Error(createRes.error || "Could not save template to database");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to create template" });
    } finally {
      setUploading(false);
    }
  };

  const selectedBox = boxes.find((b) => b.id === selectedBoxId) || null;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#19bde7] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* ADMIN HEADER */}
      <header className="border-b border-white/10 bg-[#1e1e1e] px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#19bde7] font-black text-black text-sm">
            M
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Admin Template Studio</span>
            <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] text-gray-300">
              {admin?.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="rounded-lg bg-[#19bde7] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#15a8cf] transition"
          >
            + New Template
          </button>
          <a
            href="/edit"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 transition"
          >
            Go to Editor
          </a>
          <button
            onClick={async () => {
              await adminSignOut();
              window.location.href = "/admin/login";
            }}
            className="rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/15 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 p-6 min-h-[calc(100vh-65px)]">
        {/* TEMPLATE SIDEBAR (Cols 3) */}
        <aside className="col-span-12 md:col-span-3 rounded-2xl border border-white/10 bg-[#1c1c1c] p-4 flex flex-col h-[750px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            All Templates ({templates.length})
          </h2>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                  selectedTemplate?.id === tpl.id
                    ? "bg-[#19bde7]/15 border border-[#19bde7]/40 text-white"
                    : "border border-transparent hover:bg-white/5 text-gray-300"
                }`}
              >
                <img
                  src={tpl.image_url}
                  alt={tpl.name}
                  className="h-10 w-10 rounded-lg object-cover bg-black/40 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{tpl.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {tpl.boxes?.length || 0} text zones
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* VISUAL STUDIO CANVAS (Cols 6) */}
        <main className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">{selectedTemplate?.name}</h2>
              <p className="text-xs text-gray-400">Drag to reposition, rotate with handle, and resize with corner & edge handles</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddBox(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                title="Add a classic outlined all-caps meme text zone"
              >
                + Add Outlined Zone
              </button>
              <button
                type="button"
                onClick={() => handleAddBox(true)}
                className="rounded-lg border border-[#19bde7]/40 bg-[#19bde7]/10 px-3 py-1.5 text-xs font-semibold text-[#19bde7] hover:bg-[#19bde7]/20 transition cursor-pointer"
                title="Add a plain black slim text zone that fits anywhere"
              >
                + Add Plain Black Zone
              </button>
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={saving}
                className="rounded-lg bg-[#19bde7] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#15a8cf] transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "💾 Save Layout"}
              </button>
            </div>
          </div>

          {/* INTERACTIVE WORKSPACE CANVAS */}
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full max-w-[550px] aspect-square rounded-xl bg-black/50 border border-white/15 flex items-center justify-center select-none"
            style={{ touchAction: "none" }}
          >
            {selectedTemplate && (
              <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center pointer-events-none">
                <img
                  src={selectedTemplate.image_url}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
            )}

            {/* DRAGGABLE, RESIZABLE, AND ROTATABLE TEXT BOX OVERLAYS */}
            {boxes.map((box, idx) => {
              const isSelected = selectedBoxId === box.id;
              const isHovered = hoveredBoxId === box.id;
              const isTransformingThis = transformState?.id === box.id;
              const rotation = box.rotation || 0;
              const fontSizeRatio = box.fontSizeRatio || 1;
              const maxWidthRatio = box.maxWidthRatio || 0.5;
              const currentFontSize = box.fontSize || Math.round(36 * fontSizeRatio);
              const isPlain = Boolean(
                box.isPlain ||
                box.fontFamily === "Inter, system-ui, -apple-system, sans-serif" ||
                box.fontFamily?.includes("Inter") ||
                box.fontFamily === "plain-black"
              );

              return (
                <div
                  key={box.id}
                  className={`transform-box ${isSelected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""} ${isTransformingThis ? "is-transforming" : ""}`}
                  style={{
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${maxWidthRatio * 100}%`,
                    maxWidth: "95%",
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  }}
                  title={`Text #${idx + 1} (${currentFontSize}px) - Touch & hold to drag, use handles to resize or rotate`}
                  onPointerDown={(e) => handleBoxPointerDown(e, box)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBoxId(box.id);
                  }}
                  onMouseEnter={() => setHoveredBoxId(box.id)}
                  onMouseLeave={() => setHoveredBoxId(null)}
                >
                  <div
                    className={`box-text-content ${isPlain ? "is-plain" : ""}`}
                    style={{
                      fontSize: `${currentFontSize}px`,
                      textAlign: box.textAlign || "center",
                      fontFamily: box.fontFamily || (isPlain ? "Inter, system-ui, -apple-system, sans-serif" : "Impact, 'Arial Black', sans-serif"),
                      color: isPlain ? (box.color || "#000000") : (box.color || "#ffffff"),
                      cursor: isTransformingThis ? "grabbing" : "grab",
                    }}
                  >
                    {box.placeholder || box.label || `Text #${idx + 1}`}
                  </div>

                  {(isSelected || isHovered) && (
                    <>
                      <div className="rotate-stem" />
                      <button
                        type="button"
                        className="rotate-handle"
                        title="Drag to rotate"
                        onPointerDown={(e) => handleRotatePointerDown(e, box.id, rotation)}
                      >
                        ↺
                      </button>

                      {/* Floating Font & Size Tag */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-sm border border-[#19bde7]/40 text-[#19bde7] text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                        {isPlain ? "Plain Black • " : box.fontFamily ? `${AVAILABLE_MEME_FONTS.find((f) => f.family === box.fontFamily)?.name || "Font"} • ` : ""}{currentFontSize}px
                      </div>

                      <div
                        className="resize-handle handle-nw"
                        title="Resize corner & font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "nw", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-n"
                        title="Resize font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "n", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-ne"
                        title="Resize corner & font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "ne", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-e"
                        title="Resize width"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "e", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-se"
                        title="Resize corner & font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "se", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-s"
                        title="Resize font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "s", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-sw"
                        title="Resize corner & font size"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "sw", maxWidthRatio, currentFontSize)
                        }
                      />
                      <div
                        className="resize-handle handle-w"
                        title="Resize width"
                        onPointerDown={(e) =>
                          handleResizePointerDown(e, box.id, "w", maxWidthRatio, currentFontSize)
                        }
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-full mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Tip: Drag text to reposition, use ↺ to rotate, and corner/edge handles to resize.</span>
            <span>Positions saved in real-time percentage (X: 0–100%, Y: 0–100%)</span>
          </div>
        </main>

        {/* BOX INSPECTOR (Cols 3) */}
        <aside className="col-span-12 md:col-span-3 rounded-2xl border border-white/10 bg-[#1c1c1c] p-4 flex flex-col h-[750px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Zone Inspector
          </h2>

          {selectedBox ? (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Zone Label
                </label>
                <input
                  type="text"
                  value={selectedBox.label}
                  onChange={(e) => handleUpdateBox(selectedBox.id, "label", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#19bde7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Default Placeholder
                </label>
                <input
                  type="text"
                  value={selectedBox.placeholder}
                  onChange={(e) => handleUpdateBox(selectedBox.id, "placeholder", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#19bde7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    X Position: {Math.round(selectedBox.x * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.01"
                    value={selectedBox.x}
                    onChange={(e) => handleUpdateBox(selectedBox.id, "x", parseFloat(e.target.value))}
                    className="w-full accent-[#19bde7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Y Position: {Math.round(selectedBox.y * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.01"
                    value={selectedBox.y}
                    onChange={(e) => handleUpdateBox(selectedBox.id, "y", parseFloat(e.target.value))}
                    className="w-full accent-[#19bde7]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Rotation: {selectedBox.rotation || 0}°
                  </label>
                  {(selectedBox.rotation || 0) !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleUpdateBox(selectedBox.id, "rotation", 0)}
                      className="text-[10px] text-[#19bde7] hover:underline cursor-pointer"
                    >
                      Reset (0°)
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={selectedBox.rotation || 0}
                  onChange={(e) => handleUpdateBox(selectedBox.id, "rotation", parseInt(e.target.value, 10))}
                  className="w-full accent-[#19bde7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Max Width: {Math.round((selectedBox.maxWidthRatio || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.15"
                  max="0.95"
                  step="0.05"
                  value={selectedBox.maxWidthRatio || 0.5}
                  onChange={(e) => handleUpdateBox(selectedBox.id, "maxWidthRatio", parseFloat(e.target.value))}
                  className="w-full accent-[#19bde7]"
                />
              </div>

              {/* FONT SIZE CONTROLS */}
              <div className="rounded-xl border border-white/10 bg-[#161616] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
                    Font Size:
                    <span className="text-[#19bde7] font-bold text-xs">
                      {selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1))}px
                    </span>
                  </label>

                  {/* Stepper buttons & number input */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Decrease by 2px"
                      onClick={() => {
                        const cur = selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1));
                        const next = Math.max(12, cur - 2);
                        handleUpdateBox(selectedBox.id, "fontSize", next);
                        handleUpdateBox(selectedBox.id, "fontSizeRatio", Math.round((next / 36) * 100) / 100);
                      }}
                      className="h-6 w-6 rounded bg-white/5 hover:bg-white/15 text-xs font-bold text-gray-300 flex items-center justify-center transition cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="12"
                      max="120"
                      value={selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1))}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 10 && val <= 140) {
                          handleUpdateBox(selectedBox.id, "fontSize", val);
                          handleUpdateBox(selectedBox.id, "fontSizeRatio", Math.round((val / 36) * 100) / 100);
                        }
                      }}
                      className="w-12 h-6 text-center text-xs font-bold bg-[#141414] border border-white/20 rounded text-white outline-none focus:border-[#19bde7]"
                    />
                    <button
                      type="button"
                      title="Increase by 2px"
                      onClick={() => {
                        const cur = selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1));
                        const next = Math.min(120, cur + 2);
                        handleUpdateBox(selectedBox.id, "fontSize", next);
                        handleUpdateBox(selectedBox.id, "fontSizeRatio", Math.round((next / 36) * 100) / 100);
                      }}
                      className="h-6 w-6 rounded bg-white/5 hover:bg-white/15 text-xs font-bold text-gray-300 flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Range Slider for Font Size */}
                <input
                  type="range"
                  min="14"
                  max="100"
                  step="1"
                  value={selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1))}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    handleUpdateBox(selectedBox.id, "fontSize", next);
                    handleUpdateBox(selectedBox.id, "fontSizeRatio", Math.round((next / 36) * 100) / 100);
                  }}
                  className="w-full accent-[#19bde7]"
                />

                {/* Quick Presets */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[
                    { label: "S", size: 24 },
                    { label: "M", size: 32 },
                    { label: "L", size: 42 },
                    { label: "XL", size: 54 },
                    { label: "XXL", size: 68 },
                  ].map((preset) => {
                    const cur = selectedBox.fontSize || Math.round(36 * (selectedBox.fontSizeRatio || 1));
                    const isActive = cur === preset.size;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          handleUpdateBox(selectedBox.id, "fontSize", preset.size);
                          handleUpdateBox(selectedBox.id, "fontSizeRatio", Math.round((preset.size / 36) * 100) / 100);
                        }}
                        className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isActive
                            ? "bg-[#19bde7] text-black font-bold"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                        title={`Set font size to ${preset.size}px`}
                      >
                        {preset.label} ({preset.size})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TEXT STYLE & FONT CONTROLS */}
              <div className="rounded-xl border border-white/10 bg-[#161616] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Text Format & Style:
                  </label>
                  {boxes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleApplyFontToAllBoxes(
                        selectedBox.fontFamily || AVAILABLE_MEME_FONTS[0].family,
                        Boolean(selectedBox.isPlain)
                      )}
                      className="text-[10px] text-[#19bde7] hover:underline font-semibold cursor-pointer"
                      title="Apply this text format to all text zones on this template"
                    >
                      Apply format to all
                    </button>
                  )}
                </div>

                {/* Style Format Pill Buttons */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#121212] rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateBox(selectedBox.id, "isPlain", false);
                      handleUpdateBox(selectedBox.id, "color", "#ffffff");
                      if (selectedBox.fontFamily === "Inter, system-ui, -apple-system, sans-serif") {
                        handleUpdateBox(selectedBox.id, "fontFamily", AVAILABLE_MEME_FONTS[0].family);
                      }
                    }}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold transition cursor-pointer text-center ${
                      !selectedBox.isPlain && selectedBox.fontFamily !== "Inter, system-ui, -apple-system, sans-serif"
                        ? "bg-[#19bde7] text-black font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🏷️ Classic Outlined
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateBox(selectedBox.id, "isPlain", true);
                      handleUpdateBox(selectedBox.id, "color", "#000000");
                      handleUpdateBox(selectedBox.id, "fontFamily", "Inter, system-ui, -apple-system, sans-serif");
                    }}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold transition cursor-pointer text-center ${
                      selectedBox.isPlain || selectedBox.fontFamily === "Inter, system-ui, -apple-system, sans-serif"
                        ? "bg-[#19bde7] text-black font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    📝 Plain Black (Slim)
                  </button>
                </div>

                {/* Dropdown selector */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Font Family</label>
                  <select
                    value={selectedBox.fontFamily || (selectedBox.isPlain ? "Inter, system-ui, -apple-system, sans-serif" : AVAILABLE_MEME_FONTS[0].family)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isPlainFont = val.includes("Inter") || val === "plain-black";
                      handleUpdateBox(selectedBox.id, "fontFamily", val);
                      if (isPlainFont) {
                        handleUpdateBox(selectedBox.id, "isPlain", true);
                        handleUpdateBox(selectedBox.id, "color", "#000000");
                      }
                    }}
                    className="w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#19bde7] cursor-pointer"
                  >
                    {AVAILABLE_MEME_FONTS.map((f) => (
                      <option key={f.id} value={f.family}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick preset buttons */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {AVAILABLE_MEME_FONTS.slice(0, 6).map((f) => {
                    const currentFont = selectedBox.fontFamily || (selectedBox.isPlain ? "Inter, system-ui, -apple-system, sans-serif" : AVAILABLE_MEME_FONTS[0].family);
                    const isSelected = currentFont === f.family;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          handleUpdateBox(selectedBox.id, "fontFamily", f.family);
                          if (f.id === "plain-black" || f.family.includes("Inter")) {
                            handleUpdateBox(selectedBox.id, "isPlain", true);
                            handleUpdateBox(selectedBox.id, "color", "#000000");
                          } else {
                            handleUpdateBox(selectedBox.id, "isPlain", false);
                          }
                        }}
                        className={`py-1 px-1 rounded text-[10px] font-semibold truncate transition cursor-pointer ${
                          isSelected
                            ? "bg-[#19bde7] text-black font-bold"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                        style={{ fontFamily: f.family }}
                        title={`Set font to ${f.name}`}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Text Alignment
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdateBox(selectedBox.id, "textAlign", align)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                        (selectedBox.textAlign || "center") === align
                          ? "bg-[#19bde7] text-black"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleDeleteBox(selectedBox.id)}
                  className="w-full rounded-lg bg-red-500/10 border border-red-500/20 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                >
                  Delete This Text Zone
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-500 text-xs">
              <p>No zone selected.</p>
              <p className="mt-1">Click on any text zone on the canvas or click "+ Add Text Zone".</p>
            </div>
          )}
        </aside>
      </div>

      {/* CREATE NEW TEMPLATE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1c1c] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add New Meme Template</h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload an image and assign default text positions for users
            </p>

            <form onSubmit={handleCreateNewTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drake Hotline Bling"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#19bde7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Slug (Optional URL identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. drake-hotline-bling"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#19bde7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Image File * (PNG, JPG, WEBP)
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-white/15 bg-[#141414] p-2 text-xs text-gray-300 file:mr-2 file:rounded file:border-0 file:bg-[#19bde7] file:px-2 file:py-1 file:text-xs file:font-bold file:text-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !newName || !newFile}
                  className="rounded-lg bg-[#19bde7] px-4 py-2 text-xs font-bold text-black hover:bg-[#15a8cf] disabled:opacity-50"
                >
                  {uploading ? "Uploading & Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
