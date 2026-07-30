import React, { useState } from 'react';
import {
  Image as ImageIcon,
  X,
  Shuffle,
  Check,
  Copy,
  Sparkles,
  Sliders,
  Maximize2,
  Code2,
  Layers,
  Wand2,
  ExternalLink,
} from 'lucide-react';
import {
  CURATED_UNSPLASH_IMAGES,
  ImageOptions,
  PlaceholderImage,
  generateImageSnippet,
  getUnsplashUrl,
} from '../utils/imageApi';

interface ImageInsertionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (snippet: string) => void;
}

export const ImageInsertionModal: React.FC<ImageInsertionModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
}) => {
  const [provider, setProvider] = useState<'unsplash' | 'picsum'>('unsplash');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUnsplashId, setSelectedUnsplashId] = useState<string>(
    CURATED_UNSPLASH_IMAGES[0].unsplashId
  );
  const [altText, setAltText] = useState<string>('Modern Workspace');
  const [caption, setCaption] = useState<string>('High resolution photography via Unsplash');
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(675);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [blur, setBlur] = useState<number>(0);
  const [format, setFormat] = useState<'markdown' | 'html' | 'figure'>('markdown');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter gallery
  const filteredImages =
    selectedCategory === 'all'
      ? CURATED_UNSPLASH_IMAGES
      : CURATED_UNSPLASH_IMAGES.filter((img) => img.category === selectedCategory);

  // Current active image object
  const activeUnsplashImage =
    CURATED_UNSPLASH_IMAGES.find((img) => img.unsplashId === selectedUnsplashId) ||
    CURATED_UNSPLASH_IMAGES[0];

  const currentOpts: ImageOptions = {
    provider,
    category: selectedCategory,
    width,
    height,
    altText,
    caption,
    grayscale,
    blur,
    format,
    specificUnsplashId: provider === 'unsplash' ? selectedUnsplashId : undefined,
  };

  const { url: previewUrl, snippet: generatedSnippet } = generateImageSnippet(currentOpts);

  const handleRandomize = () => {
    const pool = filteredImages.length > 0 ? filteredImages : CURATED_UNSPLASH_IMAGES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    setSelectedUnsplashId(chosen.unsplashId);
    setAltText(chosen.title);
  };

  const handleApplyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsertImage(`\n\n${generatedSnippet}\n\n`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-800 dark:text-zinc-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <ImageIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                Placeholder Image Utility
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono border border-zinc-300 dark:border-zinc-700">
                  Unsplash & Picsum API
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Insert responsive high-resolution placeholder images directly into your Markdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Shuffle image choice"
            >
              <Shuffle className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>Shuffle Random</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
          {/* Provider & Format Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span>Image Provider Service</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setProvider('unsplash')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    provider === 'unsplash'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unsplash (HD Photos)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('picsum')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    provider === 'picsum'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Picsum Photos</span>
                </button>
              </div>
            </div>

            {/* Output Syntax Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Syntax Format</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormat('markdown')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    format === 'markdown'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('html')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    format === 'html'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  HTML Tag
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('figure')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    format === 'figure'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Figure + Caption
                </button>
              </div>
            </div>
          </div>

          {/* Unsplash Category Filter & Curated Thumbnail Grid */}
          {provider === 'unsplash' && (
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select High-Res Unsplash Theme:
                </span>

                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                  {['all', 'technology', 'nature', 'workspace', 'architecture', 'abstract', 'business'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Photo Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {filteredImages.map((img) => {
                  const isSelected = selectedUnsplashId === img.unsplashId;
                  const thumbUrl = getUnsplashUrl(img.unsplashId, 300, 200);

                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnsplashId(img.unsplashId);
                        setAltText(img.title);
                      }}
                      className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer aspect-video text-left ${
                        isSelected
                          ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900 dark:ring-white/80 shadow-md scale-[1.02]'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] text-white font-medium truncate">
                          {img.title}
                        </span>
                        <span className="text-[9px] text-zinc-300 font-mono truncate">
                          By {img.author}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dimension Controls & Preset Buttons */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Dimensions & Aspect Ratio Presets:</span>
              </span>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(1200, 675)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  16:9 Banner (1200x675)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(800, 600)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  4:3 Card (800x600)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(500, 500)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  1:1 Square (500x500)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(1200, 400)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                >
                  21:9 Wide Hero (1200x400)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value) || 800)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value) || 500)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Alt Text / Description
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Alt description..."
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Image Caption / Title
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption text..."
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Picsum Filters */}
            {provider === 'picsum' && (
              <div className="flex items-center gap-6 pt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(e) => setGrayscale(e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 cursor-pointer"
                  />
                  <span>Grayscale Filter</span>
                </label>

                <div className="flex items-center gap-2">
                  <span>Blur Amount ({blur}):</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-28 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                <span>Live Rendered Image & Code Output</span>
              </span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
              >
                <span>Open direct API URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Load Frame */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-48 overflow-hidden relative group">
                <img
                  src={previewUrl}
                  alt={altText}
                  className="max-h-44 w-auto object-contain rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <span className="mt-2 text-[10px] font-mono text-zinc-500">
                  {width} × {height} px • {provider.toUpperCase()} API
                </span>
              </div>

              {/* Code Snippet Box */}
              <div className="flex flex-col justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex-1 overflow-y-auto max-h-36 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed custom-scrollbar p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {generatedSnippet}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-zinc-100" />
                        <span>Copied Snippet!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInsert}
              className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ImageIcon className="w-4 h-4 text-white dark:text-zinc-950" />
              <span>Insert Image into Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
