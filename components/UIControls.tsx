'use client';

import React, { useRef, useEffect } from 'react';
import { useCustomizerStore, BagModelType, BagPattern, computePrice } from '@/store/useCustomizerStore';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Minus, ShoppingBag, Check, Download, X, Pipette } from 'lucide-react';

const PATTERNS: { id: BagPattern; label: string }[] = [
  { id: 'plain', label: 'Plain' },
  { id: 'monogram', label: 'Monogram' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'dots', label: 'Dots' },
  { id: 'checker', label: 'Checker' },
];

const PALETTE = [
  '#F5F5DC', '#D2B48C', '#8B4513', '#A0522D', '#5C4033', '#000000', '#2F4F4F', '#800000',
  '#FFFFFF', '#E8E8E8', '#C0C0C0', '#808080', '#000080', '#4B0082', '#556B2F', '#8B0000'
];

const MODELS: { id: BagModelType; label: string; short: string }[] = [
  { id: 'tote', label: 'Tote', short: 'To' },
  { id: 'backpack', label: 'Backpack', short: 'Bp' },
  { id: 'messenger', label: 'Messenger', short: 'Ms' },
  { id: 'bauletto', label: 'Bauletto', short: 'Ba' },
  { id: 'cassiopea', label: 'Cassiopea', short: 'Ca' },
];

export function UIControls() {
  const {
    model, setModel,
    size, setSize,
    material, setMaterial,
    pattern, setPattern,
    colors, setColors,
    activeColorPart, setActiveColorPart,
    activeMenu, setActiveMenu,
    logo, setLogo,
    logoScale, setLogoScale,
    logoPosition, setLogoPosition,
    isConfigOpen, setIsConfigOpen,
    isCartOpen, setIsCartOpen,
    cart, addToCart, removeFromCart,
  } = useCustomizerStore(
    useShallow((s) => ({
      model: s.model, setModel: s.setModel,
      size: s.size, setSize: s.setSize,
      material: s.material, setMaterial: s.setMaterial,
      pattern: s.pattern, setPattern: s.setPattern,
      colors: s.colors, setColors: s.setColors,
      activeColorPart: s.activeColorPart, setActiveColorPart: s.setActiveColorPart,
      activeMenu: s.activeMenu, setActiveMenu: s.setActiveMenu,
      logo: s.logo, setLogo: s.setLogo,
      logoScale: s.logoScale, setLogoScale: s.setLogoScale,
      logoPosition: s.logoPosition, setLogoPosition: s.setLogoPosition,
      isConfigOpen: s.isConfigOpen, setIsConfigOpen: s.setIsConfigOpen,
      isCartOpen: s.isCartOpen, setIsCartOpen: s.setIsCartOpen,
      cart: s.cart, addToCart: s.addToCart, removeFromCart: s.removeFromCart,
    }))
  );

  const prevLogoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevLogoUrlRef.current) {
        URL.revokeObjectURL(prevLogoUrlRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (prevLogoUrlRef.current) {
        URL.revokeObjectURL(prevLogoUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      prevLogoUrlRef.current = url;
      setLogo(url);
    }
  };

  const currentPrice = computePrice(model, size, material);

  const handleAddToCart = () => {
    addToCart({
      id: crypto.randomUUID(),
      model,
      size,
      material,
      colors,
      price: currentPrice,
    });
  };

  const handleDownload = () => {
    const canvas = document.querySelector('[data-scene] canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `atelier3d-${model}-${size}-design.png`;
      link.href = url;
      link.click();
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start p-4 md:p-8">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="font-serif cursor-pointer hidden md:flex items-baseline gap-3">
            <span className="text-3xl tracking-[0.25em] uppercase">Atelier</span>
            <span className="w-px h-5 bg-black/30 inline-block translate-y-[-1px]"></span>
            <span className="text-sm tracking-[0.3em] uppercase opacity-50">3D</span>
          </div>
          {/* Model Selection Circles */}
          <div className="flex items-center gap-3">
            {MODELS.map((m) => (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-500 ${model === m.id ? 'border-black bg-black text-white' : 'border-gray-300 bg-white/50 text-black hover:border-black'}`}
              >
                <span className="text-[10px] md:text-xs font-medium tracking-wider">{m.short}</span>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded whitespace-nowrap">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
          <div
            className="text-sm tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => { setIsConfigOpen(!isConfigOpen); setIsCartOpen(false); }}
          >
            Configuration
          </div>
          <button onClick={handleDownload} className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="Download Design">
            <Download size={20} strokeWidth={1.5} />
          </button>
          <div
            className="relative cursor-pointer hover:opacity-70 transition-opacity p-2"
            onClick={() => { setIsCartOpen(!isCartOpen); setIsConfigOpen(false); }}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className={`w-[calc(100%-2rem)] md:w-80 pointer-events-auto absolute right-4 md:right-8 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-2xl border border-white/20 max-h-[60vh] md:max-h-[80vh] overflow-y-auto transition-all duration-500 ${isConfigOpen ? 'opacity-100 translate-y-0 md:translate-x-0' : 'opacity-0 translate-y-8 md:translate-y-0 md:translate-x-8 pointer-events-none'}`}>
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-4 md:mb-6">Configuration</div>

          {/* Colors Accordion */}
          <div className="mb-6">
            <div
              className="flex items-center justify-between font-serif text-xl cursor-pointer mb-4 hover:opacity-70 transition-opacity"
              onClick={() => setActiveMenu(activeMenu === 'colors' ? null : 'colors')}
            >
              <span>Materials & Colors</span>
              {activeMenu === 'colors' ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
            </div>
            {activeMenu === 'colors' && (
              <div className="flex flex-col gap-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {(['body', 'straps', 'zippers'] as const).map((part) => (
                  <div
                    key={part}
                    className={`cursor-pointer uppercase text-xs tracking-widest flex items-center justify-between p-3 rounded-lg transition-all ${activeColorPart === part ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    onClick={() => setActiveColorPart(part)}
                  >
                    <span>{part === 'zippers' ? 'Hardware' : part}</span>
                    <div className="w-4 h-4 rounded-full border border-current" style={{ backgroundColor: colors[part] }}></div>
                  </div>
                ))}

                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">Select {activeColorPart === 'zippers' ? 'Hardware' : activeColorPart} Color</div>
                  <div className="flex gap-2 items-center overflow-x-auto py-2 px-2 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {PALETTE.map((color, idx) => (
                      <div
                        key={idx}
                        onClick={() => setColors({ [activeColorPart]: color })}
                        className={`shrink-0 w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ${colors[activeColorPart] === color ? 'scale-110 ring-2 ring-offset-2 ring-black' : 'hover:scale-110 shadow-sm'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {/* Color wheel picker */}
                    <label className="shrink-0 w-8 h-8 rounded-full cursor-pointer border-2 border-dashed border-gray-300 hover:border-black transition-colors flex items-center justify-center relative overflow-hidden" title="Custom color">
                      <Pipette size={14} className="text-gray-400" />
                      <input
                        type="color"
                        value={colors[activeColorPart]}
                        onChange={(e) => setColors({ [activeColorPart]: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Pattern selector (body only) */}
                {activeColorPart === 'body' && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500">Pattern</div>
                    <div className="grid grid-cols-3 gap-2">
                      {PATTERNS.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setPattern(p.id)}
                          className={`cursor-pointer text-[10px] uppercase tracking-widest text-center py-2 px-1 rounded-lg transition-all ${pattern === p.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {p.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Logos Accordion */}
          <div className="mb-6">
            <div
              className="flex items-center justify-between font-serif text-xl cursor-pointer mb-4 hover:opacity-70 transition-opacity"
              onClick={() => setActiveMenu(activeMenu === 'logos' ? null : 'logos')}
            >
              <span>Monogram & Decals</span>
              {activeMenu === 'logos' ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
            </div>
            {activeMenu === 'logos' && (
              <div className="flex flex-col gap-4 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="border border-black text-black text-center py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer">
                    {logo ? 'Change Monogram' : 'Upload Monogram'}
                  </div>
                </div>
                {logo && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                        <span>Scale</span>
                        <span>{Math.round(logoScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1" max="1" step="0.05"
                        value={logoScale}
                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                        className="w-full accent-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                        <span>Horizontal Pos</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={logoPosition.x}
                        onChange={(e) => setLogoPosition({ ...logoPosition, x: parseFloat(e.target.value) })}
                        className="w-full accent-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                        <span>Vertical Pos</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={logoPosition.y}
                        onChange={(e) => setLogoPosition({ ...logoPosition, y: parseFloat(e.target.value) })}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Details Accordion */}
          <div className="mb-6">
            <div
              className="flex items-center justify-between font-serif text-xl cursor-pointer mb-4 hover:opacity-70 transition-opacity"
              onClick={() => setActiveMenu(activeMenu === 'options' ? null : 'options')}
            >
              <span>Details</span>
              {activeMenu === 'options' ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
            </div>
            {activeMenu === 'options' && (
              <div className="flex flex-col gap-2 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Size</div>
                <div
                  onClick={() => setSize('standard')}
                  className={`cursor-pointer text-xs uppercase tracking-widest flex items-center justify-between p-3 rounded-lg transition-all ${size === 'standard' ? 'font-bold text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                >
                  <span>Standard Size</span>
                  {size === 'standard' && <Check size={14} />}
                </div>
                <div
                  onClick={() => setSize('large')}
                  className={`cursor-pointer text-xs uppercase tracking-widest flex items-center justify-between p-3 rounded-lg transition-all ${size === 'large' ? 'font-bold text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                >
                  <span>Large Size</span>
                  <span className="flex items-center gap-2">
                    {size !== 'large' && <span className="text-[10px] text-gray-400">+$350</span>}
                    {size === 'large' && <Check size={14} />}
                  </span>
                </div>

                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 mt-3">Material</div>
                <div
                  onClick={() => setMaterial('standard')}
                  className={`cursor-pointer text-xs uppercase tracking-widest flex items-center justify-between p-3 rounded-lg transition-all ${material === 'standard' ? 'font-bold text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                >
                  <span>Standard Leather</span>
                  {material === 'standard' && <Check size={14} />}
                </div>
                <div
                  onClick={() => setMaterial('premium')}
                  className={`cursor-pointer text-xs uppercase tracking-widest flex items-center justify-between p-3 rounded-lg transition-all ${material === 'premium' ? 'font-bold text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                >
                  <span>Premium Leather</span>
                  <span className="flex items-center gap-2">
                    {material !== 'premium' && <span className="text-[10px] text-gray-400">+$500</span>}
                    {material === 'premium' && <Check size={14} />}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Price + Add to Cart */}
          <div className="mt-8">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
              <span className="font-serif text-2xl">${currentPrice.toLocaleString()}</span>
            </div>
            <button onClick={handleAddToCart} className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={16} strokeWidth={1.5} />
              Add to Bag
            </button>
          </div>
        </div>

      {/* Cart Panel */}
      <div className={`w-[calc(100%-2rem)] md:w-80 pointer-events-auto absolute right-4 md:right-8 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-2xl border border-white/20 max-h-[60vh] md:max-h-[80vh] overflow-y-auto transition-all duration-500 ${isCartOpen ? 'opacity-100 translate-y-0 md:translate-x-0' : 'opacity-0 translate-y-8 md:translate-y-0 md:translate-x-8 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500">
              Shopping Bag ({cart.length})
            </div>
            <button onClick={() => setIsCartOpen(false)} className="hover:opacity-70 transition-opacity">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={32} strokeWidth={1} className="mx-auto mb-3 text-gray-300" />
              <p className="text-xs uppercase tracking-widest text-gray-400">Your bag is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-serif capitalize">{item.model}</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                      {item.size} / {item.material === 'premium' ? 'Premium' : 'Standard'}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.colors.body }} title="Body" />
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.colors.straps }} title="Straps" />
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.colors.zippers }} title="Hardware" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-sm">${item.price.toLocaleString()}</div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-end pt-2">
                <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
                <span className="font-serif text-xl">${cartTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
