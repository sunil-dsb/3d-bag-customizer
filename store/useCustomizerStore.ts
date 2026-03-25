import { create } from 'zustand';

export type BagModelType = 'backpack' | 'tote' | 'messenger' | 'bauletto' | 'cassiopea';

export interface CartItem {
  id: string;
  model: BagModelType;
  colors: {
    body: string;
    straps: string;
    zippers: string;
  };
  price: number;
}

interface CustomizerState {
  model: BagModelType;
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
  cart: CartItem[];

  setModel: (model: BagModelType) => void;
  setColors: (colors: Partial<CustomizerState['colors']>) => void;
  setLogo: (logo: string | null) => void;
  setLogoPosition: (pos: { x: number; y: number }) => void;
  setLogoScale: (scale: number) => void;
  setActiveColorPart: (part: keyof CustomizerState['colors']) => void;
  setActiveMenu: (menu: 'colors' | 'logos' | 'options' | null) => void;
  setIsConfigOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  model: 'backpack',
  colors: {
    body: '#d2b897',
    straps: '#4a2c11',
    zippers: '#d4af37',
  },
  logo: null,
  logoPosition: { x: 0.5, y: 0.5 }, // Normalized coordinates (0 to 1)
  logoScale: 0.5,
  
  activeColorPart: 'body',
  activeMenu: 'colors',
  isConfigOpen: false,
  cart: [],

  setModel: (model) => set({ model }),
  setColors: (colors) => set((state) => ({ colors: { ...state.colors, ...colors } })),
  setLogo: (logo) => set({ logo }),
  setLogoPosition: (pos) => set({ logoPosition: pos }),
  setLogoScale: (scale) => set({ logoScale: scale }),
  setActiveColorPart: (part) => set({ activeColorPart: part }),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setIsConfigOpen: (isOpen) => set({ isConfigOpen: isOpen }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
}));
