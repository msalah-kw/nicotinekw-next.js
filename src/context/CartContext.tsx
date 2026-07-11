'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  getCartAction,
  addToCartAction,
  updateCartQuantityAction,
  removeFromCartAction,
} from "@/app/actions/cart";

export interface CartItem {
  key: string;
  quantity: number;
  subtotal: string;
  total: string;
  product?: {
    node: {
      id: string;
      databaseId: number;
      slug: string;
      name: string;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
      price: string | null;
      regularPrice: string | null;
    };
  } | null;
  variation?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      price: string | null;
      regularPrice: string | null;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
    };
    attributes?: {
      name: string;
      label: string | null;
      value: string;
    }[] | null;
  } | null;
}

export interface ToastItem {
  name: string;
  image: string | null;
  price: string | null;
  quantity: number;
}

export interface CartData {
  contents: {
    nodes: CartItem[];
  };
  subtotal: string;
  total: string;
}

/**
 * Product metadata passed from UI components to enable instant optimistic updates.
 * Both ProductCard and AddToCartForm already have this data available.
 */
export interface OptimisticProductMeta {
  name: string;
  image: string | null;
  price: string | null;
  slug: string;
}

interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  mutating: boolean;
  cartItemsCount: number;
  addToCart: (productId: number, quantity: number, variationId?: number, meta?: OptimisticProductMeta) => Promise<boolean>;
  updateQuantity: (key: string, quantity: number) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  showCartToast: boolean;
  toastItem: ToastItem | null;
  dismissCartToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "vapecart_woocommerce_session";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [showCartToast, setShowCartToast] = useState(false);
  const [toastItem, setToastItem] = useState<ToastItem | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize and update session token in localStorage and state
  const handleSessionToken = useCallback((newToken: string | null, clearSession?: boolean) => {
    if (clearSession) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSessionToken(undefined);
    }
    if (newToken) {
      localStorage.setItem(LOCAL_STORAGE_KEY, newToken);
      setSessionToken(newToken);
    }
  }, []);

  // Sync token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY) || undefined;
    setSessionToken(token);
    
    // Load initial cart details
    const initCart = async () => {
      setLoading(true);
      const res = await getCartAction(token);
      handleSessionToken(res.sessionToken, res.clearSession);
      
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      setLoading(false);
    };

    initCart();
  }, [handleSessionToken]);

  const refreshCart = async () => {
    setLoading(true);
    const res = await getCartAction(sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
    if (res.success && res.cart) {
      setCart(res.cart);
    }
    setLoading(false);
  };

  const dismissCartToast = useCallback(() => {
    setShowCartToast(false);
  }, []);

  const showToast = useCallback((item: ToastItem) => {
    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastItem(item);
    setShowCartToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowCartToast(false);
    }, 3000);
  }, []);

  const addToCart = async (productId: number, quantity: number, variationId?: number, meta?: OptimisticProductMeta) => {
    // ─── OPTIMISTIC UPDATE: Instantly update the UI ───
    const prevCart = cart; // Snapshot for rollback on failure

    if (meta) {
      // Show toast immediately with the product metadata
      showToast({
        name: meta.name,
        image: meta.image,
        price: meta.price,
        quantity,
      });

      // Build a synthetic CartItem for instant display
      const optimisticKey = `optimistic-${productId}-${variationId || 'simple'}-${Date.now()}`;
      const syntheticItem: CartItem = {
        key: optimisticKey,
        quantity,
        subtotal: meta.price || "0",
        total: meta.price || "0",
        product: {
          node: {
            id: `temp-${productId}`,
            databaseId: productId,
            slug: meta.slug,
            name: meta.name,
            image: meta.image ? { sourceUrl: meta.image, altText: meta.name } : null,
            price: meta.price,
            regularPrice: meta.price,
          },
        },
        variation: null,
      };

      setCart((prev) => {
        if (!prev) {
          // First item in an empty cart
          return {
            contents: { nodes: [syntheticItem] },
            subtotal: meta.price || "0",
            total: meta.price || "0",
          };
        }

        // Check if the same product (and variation) is already in the cart
        const existingIndex = prev.contents.nodes.findIndex(
          (n) =>
            n.product?.node?.databaseId === productId &&
            (variationId ? n.variation?.node?.databaseId === variationId : !n.variation)
        );

        let updatedNodes: CartItem[];
        if (existingIndex >= 0) {
          // Increment quantity on existing item
          updatedNodes = prev.contents.nodes.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          updatedNodes = [...prev.contents.nodes, syntheticItem];
        }

        return {
          ...prev,
          contents: { nodes: updatedNodes },
        };
      });
    }

    // ─── BACKGROUND: Fire the server action and reconcile ───
    setMutating(true);
    const res = await addToCartAction(productId, quantity, variationId, sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);

    if (res.success && res.cart) {
      // Reconcile with the real server state
      setCart(res.cart);

      // If no meta was provided (rare fallback), show toast from server data
      if (!meta) {
        const addedNode = res.cart.contents.nodes.find(
          (n: CartItem) => n.product?.node?.databaseId === productId
        );
        if (addedNode && addedNode.product?.node) {
          const p = addedNode.product.node;
          showToast({
            name: p.name,
            image: p.image?.sourceUrl || null,
            price: p.price,
            quantity,
          });
        }
      }

      setMutating(false);
      return true;
    }

    // ─── ROLLBACK on failure ───
    if (meta && prevCart !== undefined) {
      setCart(prevCart);
    }

    setMutating(false);
    return false;
  };

  const updateQuantity = async (key: string, quantity: number) => {
    // ─── OPTIMISTIC UPDATE ───
    const prevCart = cart;

    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contents: {
          nodes: prev.contents.nodes.map((item) =>
            item.key === key ? { ...item, quantity } : item
          ),
        },
      };
    });

    // ─── BACKGROUND SERVER ACTION ───
    setMutating(true);
    const res = await updateCartQuantityAction(key, quantity, sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
    if (res.success && res.cart) {
      setCart(res.cart);
      setMutating(false);
      return true;
    }
    
    // Rollback
    setCart(prevCart);
    setMutating(false);
    return false;
  };

  const removeItem = async (key: string) => {
    // ─── OPTIMISTIC UPDATE ───
    const prevCart = cart;

    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contents: {
          nodes: prev.contents.nodes.filter((item) => item.key !== key),
        },
      };
    });

    // ─── BACKGROUND SERVER ACTION ───
    setMutating(true);
    const res = await removeFromCartAction([key], sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
    if (res.success && res.cart) {
      setCart(res.cart);
      setMutating(false);
      return true;
    }
    
    // Rollback
    setCart(prevCart);
    setMutating(false);
    return false;
  };

  const clearCart = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCart(null);
    setSessionToken(undefined);
  };

  // Compute total item count in the cart
  const cartItemsCount = cart?.contents?.nodes?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        mutating,
        cartItemsCount,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
        showCartToast,
        toastItem,
        dismissCartToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
