import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWooProductById, getWooProductVariations } from "@/lib/woocommerce";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import {
  readCartFromFile,
  writeCartToFile,
} from "@/lib/cart-store";
import { CartItem } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";
import { getFreeGiftBundle, createFreeGiftCartItem } from "@/lib/bundle-utils";

const GUEST_SESSION_COOKIE_NAME = "shopoholics_cart_session";

interface ResolvedCartContext {
  cartKey: string;
  customerId: number | null;
  guestSessionId: string;
  isNewGuestSession: boolean;
}

/**
 * Resolves the authenticated customer cart key or guest session cart key.
 * 
 * Authenticated Customer (e.g. Customer ID #3):
 * - Cart Key: "cust_3"
 * - Stored in file: "data/carts/cust_3.json"
 * 
 * Guest Customer:
 * - Session ID: "cart_sess_..."
 * - Cart Key: "guest_cart_sess_..."
 * - Stored in file: "data/carts/guest_cart_sess_....json"
 */
async function resolveCartContext(): Promise<ResolvedCartContext> {
  const cookieStore = await cookies();
  const customerSession = await getAuthenticatedCustomerSession();

  if (customerSession && customerSession.customerId) {
    const custId = customerSession.customerId;
    return {
      cartKey: `cust_${custId}`,
      customerId: custId,
      guestSessionId: "",
      isNewGuestSession: false,
    };
  }

  // Guest Cart Session
  const existingGuestSession = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
  let guestSessionId = existingGuestSession || "";
  let isNewGuestSession = false;

  if (!guestSessionId) {
    guestSessionId = `cart_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    isNewGuestSession = true;
  }

  return {
    cartKey: `guest_${guestSessionId}`,
    customerId: null,
    guestSessionId,
    isNewGuestSession,
  };
}

/**
 * Normalizes cart totals according to pure WooCommerce values.
 */
function calculateWooCartTotals(items: CartItem[]) {
  const subtotal = (items || []).reduce(
    (sum, item) => {
      if (!item || item.isFreeGift || item.unavailable) return sum;
      const price = item.selectedVariant?.price ?? item.product?.price ?? 0;
      return sum + price * (item.quantity || 1);
    },
    0
  );

  const totalQuantity = (items || []).reduce(
    (sum, item) => (item && !item.isFreeGift && !item.unavailable ? sum + (item.quantity || 1) : sum),
    0
  );

  return {
    subtotal,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    total: subtotal,
    totalQuantity,
  };
}

/**
 * SERVER-SIDE CART ITEM NORMALIZER
 * Guarantees every cart item returned has a fully hydrated, non-null product and selectedVariant object.
 */
async function normalizeCartItem(rawItem: any): Promise<CartItem> {
  const rawProductId = String(rawItem.productId || rawItem.product?.id || rawItem.id || "").replace(/\D/g, "");
  const rawVarId = rawItem.variationId || rawItem.selectedVariant?.wooVariationId || null;
  const quantity = Math.max(1, parseInt(String(rawItem.quantity || 1), 10));

  // If item is a complimentary gift item, preserve free gift schema safely
  if (rawItem.isFreeGift) {
    const giftProduct: Product = rawItem.product || {
      id: rawProductId || "gift",
      title: rawItem.freeGiftDetails?.giftTitle || "Complimentary Gift",
      slug: "free-gift",
      price: 0,
      featuredImage: rawItem.freeGiftDetails?.giftImage || "/images/logo-cropped.png",
      images: [rawItem.freeGiftDetails?.giftImage || "/images/logo-cropped.png"],
      rating: 5,
      reviewCount: 1,
      brand: "Shop-O-Holics",
      categoryLabel: "Free Gift",
      type: "simple",
      description: "Complimentary luxury tech gift.",
      specs: [],
      keyFeatures: [],
      inStock: true,
      stockStatus: "instock",
    };

    const giftVariant: ProductVariant = rawItem.selectedVariant || {
      id: `var-${giftProduct.id}`,
      sku: `SKU-GIFT-${giftProduct.id}`,
      name: giftProduct.title,
      colorName: "Standard",
      colorHex: "#8B0000",
      attributes: {},
      price: 0,
      image: giftProduct.featuredImage,
      inStock: true,
      stockStatus: "instock",
    };

    return {
      id: rawItem.id || `gift_${giftProduct.id}`,
      productId: String(giftProduct.id),
      variationId: null,
      product: giftProduct,
      selectedVariant: giftVariant,
      quantity,
      hasProtectionPlan: false,
      protectionPlanCost: 0,
      isFreeGift: true,
      freeGiftDetails: rawItem.freeGiftDetails,
      inStock: true,
      unavailable: false,
    };
  }

  let wooProduct: Product | null = null;
  if (rawProductId) {
    try {
      wooProduct = await getWooProductById(rawProductId);
    } catch (err) {
      wooProduct = null;
    }
  }

  // Handle case where product no longer exists in WooCommerce
  if (!wooProduct) {
    const fallbackProduct: Product = rawItem.product || {
      id: rawProductId || "unavailable",
      title: rawItem.product?.title || "Product Currently Unavailable",
      slug: "unavailable",
      price: 0,
      featuredImage: rawItem.product?.featuredImage || "/images/logo-cropped.png",
      images: ["/images/logo-cropped.png"],
      rating: 0,
      reviewCount: 0,
      brand: "Shop-O-Holics",
      categoryLabel: "Unavailable",
      type: "simple",
      description: "This item is currently unavailable.",
      specs: [],
      keyFeatures: [],
      inStock: false,
      stockStatus: "outofstock",
    };

    const fallbackVariant: ProductVariant = rawItem.selectedVariant || {
      id: `var-${fallbackProduct.id}`,
      sku: "UNAVAILABLE",
      name: "Unavailable Option",
      colorName: "Standard",
      colorHex: "#8B0000",
      attributes: {},
      price: 0,
      image: fallbackProduct.featuredImage,
      inStock: false,
      stockStatus: "outofstock",
    };

    return {
      id: rawItem.id || `${rawProductId || 'item'}-unavailable`,
      productId: String(fallbackProduct.id),
      variationId: rawVarId,
      product: fallbackProduct,
      selectedVariant: fallbackVariant,
      quantity,
      hasProtectionPlan: Boolean(rawItem.hasProtectionPlan),
      protectionPlanCost: rawItem.protectionPlanCost || 990,
      selectedAttributes: rawItem.selectedAttributes || {},
      inStock: false,
      unavailable: true,
    };
  }

  // Live WooCommerce Product & Variation Price & Stock Resolution
  let livePrice = wooProduct.price;
  let liveImage = wooProduct.featuredImage;
  let liveStockStatus = wooProduct.stockStatus !== "outofstock" && wooProduct.inStock !== false;
  let liveSku = wooProduct.sku || `SKU-${wooProduct.id}`;
  let liveVarName = "Standard Edition";

  if (rawVarId && (wooProduct.type === "variable" || wooProduct.hasVariations)) {
    try {
      const rawVariations = await getWooProductVariations(rawProductId);
      const matchVar = rawVariations.find((v) => String(v.id) === String(rawVarId));
      if (matchVar) {
        livePrice = parseFloat(matchVar.price || matchVar.regular_price || String(wooProduct.price));
        liveStockStatus = matchVar.purchasable !== false && matchVar.stock_status === "instock";
        if (matchVar.image?.src) liveImage = matchVar.image.src;
        if (matchVar.sku) liveSku = matchVar.sku;
        liveVarName = (matchVar.attributes || []).map((a: any) => a.option).join(" / ") || "Selected Variation";
      }
    } catch (varErr) {
      // Fall back to stored variant info or parent product live price
    }
  }

  const selectedVariant: ProductVariant = {
    id: rawItem.selectedVariant?.id || `var-${rawVarId || wooProduct.id}`,
    wooVariationId: rawVarId ? Number(rawVarId) : undefined,
    sku: liveSku,
    name: rawItem.selectedVariant?.name || liveVarName,
    colorName: rawItem.selectedVariant?.colorName || "Standard",
    colorHex: rawItem.selectedVariant?.colorHex || "#8B0000",
    storage: rawItem.selectedVariant?.storage || undefined,
    attributes: rawItem.selectedAttributes || rawItem.selectedVariant?.attributes || {},
    price: livePrice,
    image: liveImage,
    inStock: liveStockStatus,
    stockStatus: liveStockStatus ? "instock" : "outofstock",
  };

  const updatedProduct: Product = {
    ...wooProduct,
    price: livePrice,
    featuredImage: liveImage,
    inStock: liveStockStatus,
    stockStatus: liveStockStatus ? "instock" : "outofstock",
  };

  return {
    id: rawItem.id || `${wooProduct.id}-${selectedVariant.id}`,
    productId: String(wooProduct.id),
    variationId: rawVarId,
    product: updatedProduct,
    selectedVariant,
    quantity,
    hasProtectionPlan: Boolean(rawItem.hasProtectionPlan),
    protectionPlanCost: rawItem.protectionPlanCost || 990,
    selectedAttributes: selectedVariant.attributes,
    inStock: liveStockStatus,
    unavailable: false,
  };
}

/**
 * GET /api/cart - Fetch persistent customer or guest cart items and totals
 */
export async function GET() {
  try {
    const context = await resolveCartContext();
    const cookieStore = await cookies();

    // Read persistent cart directly from disk
    const storedItems = await readCartFromFile(context.cartKey);

    // Normalize every stored item to guarantee non-null product & selectedVariant objects
    const revalidatedItems = await Promise.all(
      storedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    const totals = calculateWooCartTotals(revalidatedItems);

    const response = NextResponse.json({
      success: true,
      cartKey: context.cartKey,
      customerId: context.customerId,
      sessionId: context.guestSessionId || context.cartKey,
      items: revalidatedItems,
      totals,
    });

    // Set persistent guest session cookie if new
    if (context.isNewGuestSession && context.guestSessionId) {
      cookieStore.set(GUEST_SESSION_COOKIE_NAME, context.guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("[API /api/cart GET Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your cart. Please try again.",
        items: [],
        totals: { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, total: 0, totalQuantity: 0 },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Add item to cart with Variable Product Server-Side Resolution
 */
export async function POST(request: NextRequest) {
  try {
    const context = await resolveCartContext();
    if (!context.customerId) {
      return NextResponse.json(
        { success: false, requireAuth: true, message: "Authentication required to add items to your shopping bag." },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { product, selectedVariant, quantity = 1, productId, variationId, selectedAttributes, isCardAdd } = body;

    if (!product && !productId) {
      return NextResponse.json({ success: false, message: "Missing product or product ID payload" }, { status: 400 });
    }

    const pId = productId || product?.id;
    const isVariableProduct =
      product?.type === "variable" ||
      product?.hasVariations === true ||
      (!variationId && (!selectedVariant || isCardAdd));

    // VARIABLE PRODUCT RESOLUTION SERVER-SIDE
    if (isVariableProduct && pId && (!variationId || isCardAdd)) {
      const rawVariations = await getWooProductVariations(pId);

      if (!rawVariations || rawVariations.length === 0) {
        if (!selectedVariant && (!product || product.type === "variable")) {
          return NextResponse.json(
            { success: false, message: "This product is currently unavailable." },
            { status: 400 }
          );
        }
      } else {
        // Find FIRST valid variation in WooCommerce returned order (purchasable & instock)
        const firstValidVar =
          rawVariations.find((v) => v.purchasable !== false && v.stock_status === "instock") ||
          rawVariations.find((v) => v.purchasable !== false && v.stock_status !== "outofstock");

        if (!firstValidVar) {
          return NextResponse.json(
            { success: false, message: "This product is currently unavailable." },
            { status: 400 }
          );
        }

        // Construct canonical WooCommerce variation attributes
        const resolvedAttrs: Record<string, string> = {};
        (firstValidVar.attributes || []).forEach((a: any) => {
          if (a.name && a.option) {
            const cleanName = a.name.replace(/^pa_/, "").replace(/_/g, " ").replace(/-/g, " ");
            const capName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            resolvedAttrs[capName] = a.option;
            resolvedAttrs[a.name] = a.option;
          }
        });

        const varPrice = parseFloat(firstValidVar.price || firstValidVar.regular_price || String(product?.price || 0));
        const varImage = firstValidVar.image?.src || product?.featuredImage || "";
        const varSku = firstValidVar.sku || product?.sku || `SKU-${firstValidVar.id}`;
        const varName = (firstValidVar.attributes || []).map((a: any) => a.option).join(" / ") || "Standard Variation";

        variationId = firstValidVar.id;
        selectedAttributes = { ...resolvedAttrs, ...(selectedAttributes || {}) };

        selectedVariant = {
          id: `var-${firstValidVar.id}`,
          wooVariationId: firstValidVar.id,
          sku: varSku,
          name: varName,
          colorName: resolvedAttrs["Color"] || resolvedAttrs["Colour"] || "Standard",
          colorHex: "#8B0000",
          storage: resolvedAttrs["Storage"] || undefined,
          attributes: selectedAttributes,
          price: varPrice,
          image: varImage,
          inStock: firstValidVar.purchasable !== false && firstValidVar.stock_status === "instock",
          stockStatus: firstValidVar.stock_status || "instock",
        };
      }
    }

    // Resolve base product if missing
    if (!product && pId) {
      product = await getWooProductById(pId);
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Specified product could not be found in WooCommerce catalog." },
        { status: 404 }
      );
    }

    // Construct simple variant fallback if product is non-variable
    if (!selectedVariant) {
      selectedVariant = {
        id: `var-${product.id}-default`,
        wooVariationId: Number(product.id),
        sku: product.sku || `SKU-${product.id}`,
        name: product.title,
        colorName: "Standard",
        colorHex: "#8B0000",
        attributes: selectedAttributes || {},
        price: product.price,
        image: product.featuredImage,
        inStock: product.inStock !== false && product.stockStatus !== "outofstock",
        stockStatus: product.stockStatus || "instock",
      };
    }

    if (!selectedVariant || selectedVariant.inStock === false || selectedVariant.stockStatus === "outofstock") {
      return NextResponse.json(
        { success: false, message: "This product or selected variation is currently out of stock." },
        { status: 400 }
      );
    }

    const currentCartItems = await readCartFromFile(context.cartKey);

    const variationKey = variationId || selectedVariant.wooVariationId
      ? String(variationId || selectedVariant.wooVariationId)
      : selectedVariant.id !== `var-${pId}-default`
      ? selectedVariant.id
      : "";

    const compositeItemId = variationKey ? `${pId}-var-${variationKey}` : `${pId}-var-default`;

    const existingIndex = currentCartItems.findIndex((i: any) => i.id === compositeItemId);

    let updatedItems = [...currentCartItems];
    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({
        id: compositeItemId,
        productId: String(pId),
        variationId: variationId || selectedVariant.wooVariationId || null,
        product,
        selectedVariant,
        quantity,
        hasProtectionPlan: false,
        protectionPlanCost: 990,
        sku: selectedVariant.sku || selectedVariant.id,
        selectedAttributes: selectedVariant.attributes || {},
      });
    }

    // Auto-bundle complimentary gift if applicable
    const freeGiftBundle = getFreeGiftBundle(product);
    const existingGiftIndex = updatedItems.findIndex((i: any) => i.isFreeGift);

    if (freeGiftBundle) {
      const giftCartItem = createFreeGiftCartItem(product, selectedVariant, freeGiftBundle, quantity);
      if (existingGiftIndex > -1) {
        updatedItems[existingGiftIndex] = giftCartItem;
      } else {
        updatedItems.push(giftCartItem);
      }
    }

    // Normalize all items server-side before writing to disk
    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);

    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      cartKey: context.cartKey,
      customerId: context.customerId,
      items: normalizedItems,
      totals,
    });
  } catch (error: any) {
    console.error("[API /api/cart POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to add product to cart." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart - Update item quantity or toggle VIP protection plan
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity, action } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Missing item ID parameter" }, { status: 400 });
    }

    const context = await resolveCartContext();
    const currentCartItems = await readCartFromFile(context.cartKey);

    let updatedItems = currentCartItems.map((item: any) => {
      if (item.id === itemId) {
        if (action === "toggle_protection") {
          return { ...item, hasProtectionPlan: !item.hasProtectionPlan };
        }
        if (typeof quantity === "number") {
          return { ...item, quantity: Math.max(1, quantity) };
        }
      }
      return item;
    });

    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);
    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      cartKey: context.cartKey,
      customerId: context.customerId,
      items: normalizedItems,
      totals,
    });
  } catch (error: any) {
    console.error("[API /api/cart PUT Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart item." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Remove specific item or clear cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clear") === "true";

    const context = await resolveCartContext();

    if (clearAll) {
      await writeCartToFile(context.cartKey, []);
      return NextResponse.json({
        success: true,
        cartKey: context.cartKey,
        customerId: context.customerId,
        items: [],
        totals: { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, total: 0, totalQuantity: 0 },
      });
    }

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Missing itemId parameter" }, { status: 400 });
    }

    const currentCartItems = await readCartFromFile(context.cartKey);
    let updatedItems = currentCartItems.filter((i: any) => i.id !== itemId);

    // Re-eval free gift bundle if main items removed
    const isMainCartPurchased = updatedItems.some((i: any) => !i.isFreeGift);
    if (!isMainCartPurchased) {
      updatedItems = [];
    }

    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);
    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      cartKey: context.cartKey,
      customerId: context.customerId,
      items: normalizedItems,
      totals,
    });
  } catch (error: any) {
    console.error("[API /api/cart DELETE Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove item from cart." },
      { status: 500 }
    );
  }
}
