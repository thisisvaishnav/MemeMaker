import React, { useEffect, useRef, useState } from "react";
import "./MemeMaker.css";
import {
  loadImage,
  clearImage,
  loadTemplateUrl,
  clearTemplateUrl,
} from "../lib/imageStore";

type TextLayer = {
  id: number;
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80";

const DO_SPACES_BASE_URL =
  "https://mememaker-templates.nyc3.cdn.digitaloceanspaces.com";

const templates = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  thumbnail: `${DO_SPACES_BASE_URL}/thumbnails/${i + 1}.webp`,
  full: `${DO_SPACES_BASE_URL}/full/${i + 1}.webp`,
}));

export default function MemeMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");

  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(52);

  const [watermark, setWatermark] = useState(true);
  const [privateMeme, setPrivateMeme] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [layers, setLayers] = useState<TextLayer[]>([]);

  const [generated, setGenerated] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [search, setSearch] = useState("");

  const drawMeme = (includeLayers = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    if (!image.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      const maxWidth = 1000;
      const scale = Math.min(1, maxWidth / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number = fontSize,
        color: string = textColor
      ) => {
        if (!text.trim()) return;

        ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = Math.max(4, size / 10);

        const px = canvas.width * x;
        const py = canvas.height * y;

        ctx.strokeText(text, px, py);
        ctx.fillText(text, px, py);
      };

      drawText(topText, 0.5, 0.12, fontSize, textColor);
      drawText(bottomText, 0.5, 0.88, fontSize, textColor);

      if (includeLayers) {
        layers.forEach((layer) => {
          drawText(layer.text, layer.x, layer.y, layer.fontSize, layer.color);
        });
      }

      if (watermark) {
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText("MemeForge", 12, canvas.height - 12);
      }
    };

    img.src = image;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get("template");

    if (templateId) {
      const fullImageUrl = `${DO_SPACES_BASE_URL}/full/${templateId}.webp`;
      setImage(fullImageUrl);
      window.history.replaceState({}, "", "/edit");
    } else {
      loadTemplateUrl().then((pendingTemplate) => {
        if (pendingTemplate) {
          setImage(pendingTemplate);
          clearTemplateUrl();
        } else {
          loadImage().then((pending) => {
            if (pending) {
              setImage(pending);
              clearImage();
            }
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    drawMeme();
  }, [
    image,
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

    const url = URL.createObjectURL(file);

    setImage(url);
    setGenerated(null);
  };

  const generateMeme = () => {
    drawMeme(true);

    setTimeout(() => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const output = canvas.toDataURL("image/png");
      setGenerated(output);
    }, 100);
  };

  const downloadMeme = () => {
    if (!generated) return;

    const link = document.createElement("a");
    link.download = "memeforge-meme.png";
    link.href = generated;
    link.click();
  };

  const shareMeme = async () => {
    if (!generated) return;

    try {
      const response = await fetch(generated);
      const blob = await response.blob();

      const file = new File([blob], "memeforge.png", {
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
          text: "Created with MemeForge",
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText("My Meme created with MemeForge");
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
  };

  const [dragging, setDragging] = useState<{
    id: number;
    offsetX: number;
    offsetY: number;
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
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging({
      id: layer.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;

    const wrapper = canvasRef.current?.parentElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    const relX =
      (e.clientX - wrapperRect.left - dragging.offsetX) /
      canvasRect.width;
    const relY =
      (e.clientY - wrapperRect.top - dragging.offsetY) /
      canvasRect.height;

    const clampedX = Math.max(0, Math.min(1, relX));
    const clampedY = Math.max(0, Math.min(1, relY));

    setLayers((current) =>
      current.map((layer) =>
        layer.id === dragging.id
          ? { ...layer, x: clampedX, y: clampedY }
          : layer
      )
    );
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  return (
    <div className="meme-app">
      <main className="page">
        {/* PAGE TITLE */}
        <section className="page-heading">
          <h1>whiplash rushing or dragging Meme Generator</h1>
          <p>
            The fastest meme generator. Easily add text to images or memes.
          </p>
        </section>

        {/* EDITOR */}
        <section className="editor">
          {/* PREVIEW */}
          <div className="preview-section">
            <div className="preview-toolbar">
              <button>↶</button>
              <button>Spacing</button>

              <button onClick={triggerUpload}>
                + Add Image
              </button>

              <button>Draw</button>
            </div>

            <div
              className="canvas-wrapper"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
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
                placeholder="Search all memes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="template-title">
              <span>whiplash rushing or dragging</span>

              <div className="template-tabs">
                <button>My</button>
                <button>Hot</button>
                <button>Top</button>
              </div>
            </div>

            {/* TEMPLATES */}
            <div className="template-list">
              <button className="blank-template">Blank</button>

              {templates
                .filter((item) =>
                  search
                    ? String(item.id).includes(search) ||
                      item.thumbnail.toLowerCase().includes(search.toLowerCase())
                    : true
                )
                .map((template) => (
                  <button
                    className="template"
                    key={template.id}
                    onClick={() => setImage(template.full)}
                  >
                    <img
                      src={template.thumbnail}
                      alt={`Template ${template.id}`}
                    />
                  </button>
                ))}
            </div>

            {/* TEXT INPUTS */}
            <TextInput
              placeholder="Top Text"
              value={topText}
              onChange={setTopText}
              color={textColor}
              setColor={setTextColor}
            />

            <TextInput
              placeholder="Bottom Text"
              value={bottomText}
              onChange={setBottomText}
              color={textColor}
              setColor={setTextColor}
            />

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
                <button>AI</button>
                <button>Effects</button>
                <button onClick={addTextLayer}>+ Add Text</button>
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
          <strong>MemeForge AI</strong>
        </section>

        {/* FEATURED */}
        <section className="featured">
          <div className="featured-header">
            <h2>Featured Meme Templates</h2>
            <button>See All →</button>
          </div>

          <div className="featured-grid">
            {templates.map((template) => (
              <div className="featured-card" key={template.id}>
                <img
                  src={template.thumbnail}
                  alt={`Featured meme ${template.id}`}
                />

                <div className="featured-info">
                  <span>Popular Meme</span>
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
  placeholder,
  value,
  onChange,
  color,
  setColor,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
}) {
  return (
    <div className="text-row">
      <input
        className="text-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <input
        className="color-picker"
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <button className="settings-btn">⚙</button>
    </div>
  );
}
