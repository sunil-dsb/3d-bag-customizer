import { create } from 'zustand';

export type BagModelType = 'backpack' | 'tote' | 'messenger' | 'bauletto' | 'cassiopea';
export type BagSize = 'standard' | 'large';
export type BagMaterial = 'standard' | 'premium';
export type BagPattern = 'plain' | 'monogram' | 'stripes' | 'diamond' | 'dots' | 'checker';

export const BASE_PRICES: Record<BagModelType, number> = {
  tote: 1850,
  backpack: 2150,
  messenger: 1950,
  bauletto: 2450,
  cassiopea: 2750,
};

export const SIZE_UPCHARGE: Record<BagSize, number> = {
  standard: 0,
  large: 350,
};

export const MATERIAL_UPCHARGE: Record<BagMaterial, number> = {
  standard: 0,
  premium: 500,
};

export function computePrice(model: BagModelType, size: BagSize, material: BagMaterial): number {
  return BASE_PRICES[model] + SIZE_UPCHARGE[size] + MATERIAL_UPCHARGE[material];
}

export interface CartItem {
  id: string;
  model: BagModelType;
  size: BagSize;
  material: BagMaterial;
  colors: {
    body: string;
    straps: string;
    zippers: string;
  };
  price: number;
}

interface CustomizerState {
  model: BagModelType;
  size: BagSize;
  material: BagMaterial;
  pattern: BagPattern;
  colors: {
    body: string;
    straps: string;
    zippers: string;
  };
  logo: string | null;
  logoPosition: { x: number; y: number };
  logoScale: number;

  activeColorPart: keyof CustomizerState['colors'];
  activeMenu: 'colors' | 'logos' | 'options' | null;
  isConfigOpen: boolean;
  isCartOpen: boolean;
  cart: CartItem[];

  setModel: (model: BagModelType) => void;
  setSize: (size: BagSize) => void;
  setMaterial: (material: BagMaterial) => void;
  setPattern: (pattern: BagPattern) => void;
  setColors: (colors: Partial<CustomizerState['colors']>) => void;
  setLogo: (logo: string | null) => void;
  setLogoPosition: (pos: { x: number; y: number }) => void;
  setLogoScale: (scale: number) => void;
  setActiveColorPart: (part: keyof CustomizerState['colors']) => void;
  setActiveMenu: (menu: 'colors' | 'logos' | 'options' | null) => void;
  setIsConfigOpen: (isOpen: boolean) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  model: 'backpack',
  size: 'standard',
  material: 'standard',
  pattern: 'monogram',
  colors: {
    body: '#d2b897',
    straps: '#4a2c11',
    zippers: '#d4af37',
  },
  logo: null,
  logoPosition: { x: 0.5, y: 0.5 },
  logoScale: 0.5,

  activeColorPart: 'body',
  activeMenu: 'colors',
  isConfigOpen: true,
  isCartOpen: false,
  cart: [],

  setModel: (model) => set({ model }),
  setSize: (size) => set({ size }),
  setMaterial: (material) => set({ material }),
  setPattern: (pattern) => set({ pattern }),
  setColors: (colors) => set((state) => ({ colors: { ...state.colors, ...colors } })),
  setLogo: (logo) => set({ logo }),
  setLogoPosition: (pos) => set({ logoPosition: pos }),
  setLogoScale: (scale) => set({ logoScale: scale }),
  setActiveColorPart: (part) => set({ activeColorPart: part }),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setIsConfigOpen: (isOpen) => set({ isConfigOpen: isOpen }),
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
}));
