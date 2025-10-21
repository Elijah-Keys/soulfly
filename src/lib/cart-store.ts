import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;               // unique row key (we'll use productId:size)
  productId?: string;       // your internal product slug/id
  name: string;
  price: number;            // display price on site (Stripe uses priceId)
  size: string;
  quantity: number;
  image: string;
  priceId: string;          // ✅ Stripe TEST price_... required for checkout
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;

  getSubtotal: () => number;
  getTotal: () => number;
}

const rowId = (productId?: string, size?: string) =>
  `${productId ?? 'item'}:${size ?? ''}`;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,
      discountAmount: 0,

      // ✅ Single, correct implementation that preserves priceId
      addItem: (item) =>
        set((state) => {
          const id = rowId(item.productId, item.size);
          const qty = Math.max(1, Number(item.quantity) || 1);

          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }

          const newItem: CartItem = { id, ...item, quantity: qty };
          return { items: [...state.items, newItem] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const q = Math.max(0, Number(quantity) || 0);
          const items = state.items
            .map((i) => (i.id === id ? { ...i, quantity: q } : i))
            .filter((i) => i.quantity > 0);
          return { items };
        }),

      clearCart: () => set({ items: [], discountCode: null, discountAmount: 0 }),

      applyDiscount: (code, amount) =>
        set({
          discountCode: code,
          discountAmount: Math.max(0, Number(amount) || 0),
        }),

      removeDiscount: () => set({ discountCode: null, discountAmount: 0 }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().discountAmount);
      },
    }),
    { name: 'soulfly-cart' }
  )
);
