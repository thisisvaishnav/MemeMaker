import React, { useState, useEffect, useRef } from "react";
import {
  fetchAllAdminTemplates,
  saveTemplate,
  createTemplate,
  uploadTemplateImage,
  type DbTemplate,
} from "../../lib/templatesDb";
import { getAdminSession, adminSignOut, type AdminUser } from "../../lib/adminAuth";
import type { TemplateTextBox } from "../../lib/templateBoxes";

export default function AdminStudio() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DbTemplate | null>(null);
  const [boxes, setBoxes] = useState<TemplateTextBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Template Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Dragging state
  const [draggingBoxId, setDraggingBoxId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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
  const handleAddBox = () => {
    const nextNum = boxes.length + 1;
    const newBox: TemplateTextBox = {
      id: `zone-${Date.now()}`,
      label: `Text Zone ${nextNum}`,
      placeholder: `Placeholder ${nextNum}...`,
      x: 0.5,
      y: Math.min(0.9, 0.15 * nextNum),
      textAlign: "center",
      maxWidthRatio: 0.5,
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

  // Drag pointer handlers
  const handlePointerDown = (e: React.PointerEvent, boxId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBoxId(boxId);
    setDraggingBoxId(boxId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBoxId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.round(Math.max(0.05, Math.min(0.95, relX)) * 100) / 100;
    const clampedY = Math.round(Math.max(0.05, Math.min(0.95, relY)) * 100) / 100;

    handleUpdateBox(draggingBoxId, "x", clampedX);
    handleUpdateBox(draggingBoxId, "y", clampedY);
  };

  const handlePointerUp = () => {
    setDraggingBoxId(null);
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
          { id: "top", label: "Top Text", placeholder: "Top Text", x: 0.5, y: 0.12, textAlign: "center" },
          { id: "bottom", label: "Bottom Text", placeholder: "Bottom Text", x: 0.5, y: 0.88, textAlign: "center" },
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
              <p className="text-xs text-gray-400">Drag any text box to reposition its default location</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBox}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                + Add Text Zone
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={saving}
                className="rounded-lg bg-[#19bde7] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#15a8cf] transition disabled:opacity-50"
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
            className="relative w-full max-w-[550px] aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/15 flex items-center justify-center select-none"
          >
            {selectedTemplate && (
              <img
                src={selectedTemplate.image_url}
                alt={selectedTemplate.name}
                className="w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* DRAGGABLE TEXT BOX OVERLAYS */}
            {boxes.map((box, idx) => {
              const isSelected = selectedBoxId === box.id;
              const isDragging = draggingBoxId === box.id;

              return (
                <div
                  key={box.id}
                  onPointerDown={(e) => handlePointerDown(e, box.id)}
                  style={{
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute z-10 cursor-grab active:cursor-grabbing p-1 rounded-md transition-shadow ${
                    isSelected
                      ? "ring-2 ring-[#19bde7] bg-[#19bde7]/20 shadow-lg shadow-[#19bde7]/20"
                      : "border border-white/40 bg-black/50 hover:border-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/80 backdrop-blur-sm">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#19bde7] text-[9px] font-black text-black">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-white whitespace-nowrap">
                      {box.label || `Box ${idx + 1}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Tip: Click any box to edit its parameters in the right panel.</span>
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
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Text Alignment
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdateBox(selectedBox.id, "textAlign", align)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        selectedBox.textAlign === align
                          ? "bg-[#19bde7] text-black"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Max Width Ratio: {Math.round((selectedBox.maxWidthRatio || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={selectedBox.maxWidthRatio || 0.5}
                  onChange={(e) => handleUpdateBox(selectedBox.id, "maxWidthRatio", parseFloat(e.target.value))}
                  className="w-full accent-[#19bde7]"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleDeleteBox(selectedBox.id)}
                  className="w-full rounded-lg bg-red-500/10 border border-red-500/20 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
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
