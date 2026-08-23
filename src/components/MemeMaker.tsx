import React, { useEffect, useRef, useState } from "react";
import "./MemeMaker.css";

type TextLayer = {
  id: number;
  text: string;
  color: string;
  fontSize: number;
  y: number;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80";

const templates = [
  DEFAULT_IMAGE,
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80",
];

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

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

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
        y: number,
        size: number = fontSize
      ) => {
        if (!text.trim()) return;

        ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = Math.max(4, size / 10);

        ctx.strokeText(text, canvas.width / 2, y);
        ctx.fillText(text, canvas.width / 2, y);
      };

      drawText(topText, canvas.height * 0.12);
      drawText(bottomText, canvas.height * 0.88);

      layers.forEach((layer) => {
        drawText(layer.text, canvas.height * layer.y, layer.fontSize);
      });

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
    drawMeme();

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

  const addTextLayer = () => {
    setLayers((current) => [
      ...current,
      {
        id: Date.now(),
        text: "New Text",
        color: "#ffffff",
        fontSize: 40,
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
                field === "fontSize" || field === "y"
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

  return (
    <div className="meme-app">
      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <span>MemeForge</span>
        </div>

        <button className="create-btn">
          Create <span>⌄</span>
        </button>

        <button className="header-search">⌕</button>

        <div className="header-spacer" />

        <button className="notification">◉</button>

        <button className="profile">
          <span className="avatar">V</span>
          <span className="profile-name">Vaishnav</span>
          <span>⌄</span>
        </button>
      </header>

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

              <button onClick={() => fileInputRef.current?.click()}>
                + Add Image
              </button>

              <button>Draw</button>
            </div>

            <div className="canvas-wrapper">
              <canvas ref={canvasRef} />
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
                onClick={() => fileInputRef.current?.click()}
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
                    ? item.toLowerCase().includes(search.toLowerCase())
                    : true
                )
                .map((template, index) => (
                  <button
                    className="template"
                    key={template}
                    onClick={() => setImage(template)}
                  >
                    <img src={template} alt={`Template ${index + 1}`} />
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
            {templates.map((template, index) => (
              <div className="featured-card" key={template}>
                <img src={template} alt={`Featured meme ${index}`} />

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
