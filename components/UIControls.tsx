'use client';

import React from 'react';
import { useCustomizerStore, BagModelType } from '@/store/useCustomizerStore';
import { Plus, Minus, ShoppingBag, Check, Download } from 'lucide-react';

const PALETTE = [
  '#F5F5DC', '#D2B48C', '#8B4513', '#A0522D', '#5C4033', '#000000', '#2F4F4F', '#800000',
  '#FFFFFF', '#E8E8E8', '#C0C0C0', '#808080', '#000080', '#4B0082', '#556B2F', '#8B0000'
];

const MODELS = [
  { id: 'tote', label: 'Tote' },
  { id: 'backpack', label: 'Backpack' },
  { id: 'messenger', label: 'Messenger' },
  { id: 'bauletto', label: 'Bauletto' },
  { id: 'cassiopea', label: 'Cassiopea' },
];

export function UIControls() {
  const {
    model, setModel,
    colors, setColors,
    activeColorPart, setActiveColorPart,
    activeMenu, setActiveMenu,
    logo, setLogo,
    logoScale, setLogoScale,
    logoPosition, setLogoPosition,
    isConfigOpen, setIsConfigOpen,
    cart, addToCart
  } = useCustomizerStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogo(url);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: Math.random().toString(36).substr(2, 9),
      model,
      colors,
      price: 2450
    });
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `gucci-${model}-design.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start p-4 md:p-8">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="text-2xl md:text-4xl font-serif tracking-widest cursor-pointer uppercase">
            Gucci
          </div>
          {/* Model Selection Circles */}
          <div className="flex items-center gap-3">
            {MODELS.map((m) => (
              <div 
                key={m.id}
                onClick={() => setModel(m.id as BagModelType)}
                className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-500 ${model === m.id ? 'border-black bg-black text-white' : 'border-gray-300 bg-white/50 text-black hover:border-black'}`}
              >
                <span className="text-xs font-medium tracking-wider">{m.label[0]}</span>
                {/* Tooltip */}
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
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            Configuration
          </div>
          <button onClick={handleDownload} className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="Download Design">
            <Download size={20} strokeWidth={1.5} />
          </button>
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity p-2">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex justify-between items-center px-4 md:px-8 relative">
        
        {/* Right Vertical Menu (Accordion) */}
        <div className={`w-[calc(100%-2rem)] md:w-80 pointer-events-auto absolute right-4 md:right-8 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-2xl border border-white/20 max-h-[45vh] md:max-h-[80vh] overflow-y-auto transition-all duration-500 ${isConfigOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
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
                
                {/* Color Palette */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">Select {activeColorPart === 'zippers' ? 'Hardware' : activeColorPart} Color</div>
                  <div className="flex gap-2 overflow-x-auto py-2 px-2 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {PALETTE.map((color, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setColors({ [activeColorPart]: color })}
                        className={`shrink-0 w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ${colors[activeColorPart] === color ? 'scale-110 ring-2 ring-offset-2 ring-black' : 'hover:scale-110 shadow-sm'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
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

          {/* Options Accordion */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between font-serif text-xl cursor-pointer mb-4 hover:opacity-70 transition-opacity"
              onClick={() => setActiveMenu(activeMenu === 'options' ? null : 'options')}
            >
              <span>Details</span>
              {activeMenu === 'options' ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
            </div>
            {activeMenu === 'options' && (
              <div className="flex flex-col gap-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="cursor-pointer text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Standard Size</div>
                <div className="cursor-pointer text-xs uppercase tracking-widest font-bold text-black flex items-center justify-between">
                  <span>Large Size</span>
                  <Check size={14} />
                </div>
                <div className="cursor-pointer text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Premium Leather</div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
              <span className="font-serif text-2xl">$2,450</span>
            </div>
            <button onClick={handleAddToCart} className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={16} strokeWidth={1.5} />
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
