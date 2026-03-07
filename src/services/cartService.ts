import { CartItem } from '../types';

const CART_KEY = 'sba_cart';

export const cartService = {
    getCart(): CartItem[] {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
            return [];
        }
    },

    saveCart(items: CartItem[]): void {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    },

    addToCart(product: Omit<CartItem, 'quantity'>): CartItem[] {
        const items = cartService.getCart();
        const idx = items.findIndex((i) => i.id === product.id);
        if (idx >= 0) {
            items[idx].quantity += 1;
        } else {
            items.push({ ...product, quantity: 1 });
        }
        cartService.saveCart(items);
        return items;
    },

    removeFromCart(productId: string): CartItem[] {
        const items = cartService.getCart().filter((i) => i.id !== productId);
        cartService.saveCart(items);
        return items;
    },

    updateQuantity(productId: string, quantity: number): CartItem[] {
        let items = cartService.getCart();
        if (quantity <= 0) {
            items = items.filter((i) => i.id !== productId);
        } else {
            items = items.map((i) => (i.id === productId ? { ...i, quantity } : i));
        }
        cartService.saveCart(items);
        return items;
    },

    clearCart(): void {
        localStorage.removeItem(CART_KEY);
    },

    getItemCount(): number {
        return cartService.getCart().reduce((sum, i) => sum + i.quantity, 0);
    },
};

export default cartService;
