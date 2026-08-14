import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWooProductById, getWooProductVariations, getWooVariationById } from "@/lib/woocommerce";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import { readCartFromFile, writeCartToFile } from "@/lib/cart-store";
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
  const subtotal = (items || []).reduce((sum, item) => {
    if (!item || item.isFreeGift || item.unavailable) return sum;
    const price = item.selectedVariant?.price ?? item.product?.price ?? 0;
    return sum + price * (item.quantity || 1);
  }, 0);

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
 * Revalidates stored cart items against live WooCommerce product & variation price and stock status.
 */
async function normalizeCartItem(rawItem: any): Promise<CartItem> {
  const rawProductId = String(rawItem.productId || rawItem.product?.id || rawItem.id || "").replace(/\D/g, "");
  const rawVarId = rawItem.variationId || rawItem.selectedVariant?.wooVariationId || null;
  const quantity = Math.max(1, parseInt(String(rawItem.quantity || 1), 10));

  // Complimentary free gift item handling
  if (rawItem.isFreeGift) {
    const giftProduct: Product = rawItem.product || {
      id: rawProductId || "gift",
      slug: "free-gift",
      title: rawItem.freeGiftDetails?.giftTitle || "Complimentary Gift",
      type: "simple",
      hasVariations: false,
      tagline: "Free Gift",
      brand: "Shop-O-Holics",
      category: "accessories",
      categorySlugs: ["accessories"],
      categoryIds: [0],
      categories: [],
      primaryCategory: { id: 0, name: "Free Gift", slug: "free-gift" },
      categoryLabel: "Free Gift",
      lifestyle: ["work"],
      price: 0,
      rating: 5,
      reviewCount: 1,
      emiAvailable: true,
      freeDelivery: true,
      expressDelivery: true,
      featuredImage: rawItem.freeGiftDetails?.giftImage || "/images/logo-cropped.png",
      images: [rawItem.freeGiftDetails?.giftImage || "/images/logo-cropped.png"],
      description: "Complimentary luxury tech gift.",
      features: ["Complimentary Gift"],
      variants: [],
      specs: [],
      structuredInfo: { overview: "Complimentary Gift", keyFeatures: [] },
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

  // Handle case where product no longer exists in WooCommerce catalog
  if (!wooProduct) {
    const fallbackProduct: Product = rawItem.product || {
      id: rawProductId || "unavailable",
      slug: "unavailable",
      title: rawItem.product?.title || "Product Currently Unavailable",
      type: "simple",
      hasVariations: false,
      tagline: "Unavailable",
      brand: "Shop-O-Holics",
      category: "accessories",
      categorySlugs: [],
      categoryIds: [],
      categories: [],
      primaryCategory: { id: 0, name: "Unavailable", slug: "unavailable" },
      categoryLabel: "Unavailable",
      lifestyle: ["work"],
      price: 0,
      rating: 0,
      reviewCount: 0,
      emiAvailable: false,
      freeDelivery: false,
      expressDelivery: false,
      featuredImage: rawItem.product?.featuredImage || "/images/logo-cropped.png",
      images: ["/images/logo-cropped.png"],
      description: "This item is currently unavailable.",
      features: [],
      variants: [],
      specs: [],
      structuredInfo: { overview: "Unavailable", keyFeatures: [] },
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
      id: rawItem.id || `${rawProductId || "item"}-unavailable`,
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

  // Revalidate live price & stock status
  let livePrice = wooProduct.price;
  let liveImage = wooProduct.featuredImage;
  let liveStockStatus = wooProduct.stockStatus !== "outofstock" && wooProduct.inStock !== false;
  let liveSku = wooProduct.sku || `SKU-${wooProduct.id}`;
  let liveVarName = "Standard Edition";

  if (rawVarId && (wooProduct.type === "variable" || wooProduct.hasVariations)) {
    try {
      const rawVar = await getWooVariationById(rawProductId, rawVarId);
      if (rawVar) {
        livePrice = parseFloat(rawVar.price || rawVar.regular_price || String(wooProduct.price));
        liveStockStatus = rawVar.purchasable !== false && rawVar.stock_status !== "outofstock";
        if (rawVar.image?.src) liveImage = rawVar.image.src;
        if (rawVar.sku) liveSku = rawVar.sku;
        liveVarName = (rawVar.attributes || []).map((a: any) => a.option).join(" / ") || "Selected Variation";
      } else {
        const rawVariations = await getWooProductVariations(rawProductId);
        const matchVar = rawVariations.find((v) => String(v.id) === String(rawVarId));
        if (matchVar) {
          livePrice = parseFloat(matchVar.price || matchVar.regular_price || String(wooProduct.price));
          liveStockStatus = matchVar.purchasable !== false && matchVar.stock_status !== "outofstock";
          if (matchVar.image?.src) liveImage = matchVar.image.src;
          if (matchVar.sku) liveSku = matchVar.sku;
          liveVarName = (matchVar.attributes || []).map((a: any) => a.option).join(" / ") || "Selected Variation";
        }
      }
    } catch (varErr) {
      console.warn(`[normalizeCartItem] Error fetching variation ${rawVarId} for product ${rawProductId}:`, varErr);
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
    unavailable: !liveStockStatus,
  };
}

/**
 * GET /api/cart - Fetch persistent customer or guest cart items and totals
 */
export async function GET() {
  try {
    const context = await resolveCartContext();
    const cookieStore = await cookies();

    // Read persistent cart from Firestore
    const storedItems = await readCartFromFile(context.cartKey);

    // Normalize stored items to guarantee live prices & stock statuses
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
 * POST /api/cart - Add item to cart with WooCommerce Product & Variation Resolution
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

    const pId = String(productId || product?.id || "").replace(/\D/g, "");

    // [SHOP-O-HOLICS CART DEBUG]
    console.log("[SHOP-O-HOLICS CART DEBUG]", {
      productId: pId,
      variationId: variationId || selectedVariant?.wooVariationId || null,
      selectedAttributes: selectedAttributes || selectedVariant?.attributes || {},
      isCardAdd,
    });

    if (!pId) {
      return NextResponse.json({ success: false, message: "Missing product or product ID payload." }, { status: 400 });
    }

    // 1. Fetch Authoritative WooCommerce Product
    let wooProduct: Product | null = null;
    try {
      wooProduct = await getWooProductById(pId);
    } catch (fetchErr: any) {
      console.error(`[WooCommerce Cart API] Failed to fetch product ${pId}:`, fetchErr);
      return NextResponse.json(
        { success: false, message: "Unable to verify product availability. Please try again." },
        { status: 500 }
      );
    }

    if (!wooProduct) {
      console.warn(`[WOOCOMMERCE CART VALIDATION] Product ${pId} not found in catalog.`);
      return NextResponse.json(
        { success: false, message: "Specified product could not be found in WooCommerce catalog." },
        { status: 404 }
      );
    }

    const isVariableProduct = wooProduct.type === "variable" || wooProduct.hasVariations;
    let resolvedVariationId: number | null = variationId ? Number(variationId) : (selectedVariant?.wooVariationId || null);

    // 2. Resolve Variation for Variable Product
    let targetVariant: ProductVariant | null = null;

    if (isVariableProduct) {
      let rawVar: any = null;

      if (resolvedVariationId) {
        try {
          rawVar = await getWooVariationById(pId, resolvedVariationId);
        } catch (vErr) {
          rawVar = null;
        }
      }

      if (!rawVar) {
        const rawVariations = await getWooProductVariations(pId);
        if (resolvedVariationId) {
          rawVar = rawVariations.find((v) => String(v.id) === String(resolvedVariationId));
        }

        if (!rawVar && rawVariations.length > 0) {
          // Find first available variation (purchasable !== false && stock_status !== outofstock)
          rawVar =
            rawVariations.find((v) => v.purchasable !== false && v.stock_status !== "outofstock") ||
            rawVariations[0];
        }
      }

      if (!rawVar) {
        console.warn(`[WOOCOMMERCE CART VALIDATION] Variable product ${pId} has no valid variations.`);
        return NextResponse.json(
          { success: false, message: "This product variation is currently unavailable." },
          { status: 400 }
        );
      }

      resolvedVariationId = rawVar.id;
      const varPrice = parseFloat(rawVar.price || rawVar.regular_price || String(wooProduct.price));
      const varImage = rawVar.image?.src || wooProduct.featuredImage;
      const varSku = rawVar.sku || wooProduct.sku || `SKU-${rawVar.id}`;
      const varName = (rawVar.attributes || []).map((a: any) => a.option).join(" / ") || "Selected Variation";

      const resolvedAttrs: Record<string, string> = {};
      (rawVar.attributes || []).forEach((a: any) => {
        if (a.name && a.option) {
          resolvedAttrs[a.name] = a.option;
        }
      });

      const isVarAvailable = rawVar.purchasable !== false && rawVar.stock_status !== "outofstock";

      // [WOOCOMMERCE CART VALIDATION LOGGING]
      console.log("[WOOCOMMERCE CART VALIDATION]", {
        productId: pId,
        variationId: rawVar.id,
        productType: "variable",
        productStatus: "publish",
        purchasable: rawVar.purchasable !== false,
        manageStock: rawVar.manage_stock ?? false,
        stockStatus: rawVar.stock_status || "instock",
        stockQuantity: rawVar.stock_quantity ?? null,
        resolvedPrice: varPrice,
        validationResult: isVarAvailable ? "SUCCESS" : "REJECTED",
        validationReason: isVarAvailable ? "Available in WooCommerce" : "Variation out of stock or unpurchasable",
      });

      if (!isVarAvailable) {
        return NextResponse.json(
          { success: false, message: "This product variation is currently out of stock." },
          { status: 400 }
        );
      }

      targetVariant = {
        id: `var-${rawVar.id}`,
        wooVariationId: rawVar.id,
        sku: varSku,
        name: varName,
        colorName: resolvedAttrs["Color"] || resolvedAttrs["Colour"] || "Standard",
        colorHex: "#8B0000",
        storage: resolvedAttrs["Storage"] || undefined,
        attributes: { ...resolvedAttrs, ...(selectedAttributes || {}) },
        price: varPrice,
        image: varImage,
        inStock: true,
        stockStatus: rawVar.stock_status || "instock",
      };
    } else {
      // Simple Product Validation
      const isSimpleAvailable = wooProduct.inStock !== false && wooProduct.stockStatus !== "outofstock";

      // [WOOCOMMERCE CART VALIDATION LOGGING]
      console.log("[WOOCOMMERCE CART VALIDATION]", {
        productId: pId,
        variationId: 0,
        productType: "simple",
        productStatus: "publish",
        purchasable: true,
        manageStock: false,
        stockStatus: wooProduct.stockStatus || "instock",
        stockQuantity: null,
        resolvedPrice: wooProduct.price,
        validationResult: isSimpleAvailable ? "SUCCESS" : "REJECTED",
        validationReason: isSimpleAvailable ? "Available in WooCommerce" : "Product out of stock",
      });

      if (!isSimpleAvailable) {
        return NextResponse.json(
          { success: false, message: "This product is currently out of stock." },
          { status: 400 }
        );
      }

      targetVariant = {
        id: `var-${pId}-default`,
        wooVariationId: Number(pId),
        sku: wooProduct.sku || `SKU-${pId}`,
        name: wooProduct.title,
        colorName: "Standard",
        colorHex: "#8B0000",
        attributes: selectedAttributes || {},
        price: wooProduct.price,
        image: wooProduct.featuredImage,
        inStock: true,
        stockStatus: wooProduct.stockStatus || "instock",
      };
    }

    const currentCartItems = await readCartFromFile(context.cartKey);

    const variationKey = resolvedVariationId
      ? String(resolvedVariationId)
      : targetVariant.id !== `var-${pId}-default`
      ? targetVariant.id
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
        variationId: resolvedVariationId || null,
        product: wooProduct,
        selectedVariant: targetVariant,
        quantity,
        hasProtectionPlan: false,
        protectionPlanCost: 990,
        sku: targetVariant.sku || targetVariant.id,
        selectedAttributes: targetVariant.attributes || {},
      });
    }

    // Auto-bundle complimentary gift if applicable
    const freeGiftBundle = getFreeGiftBundle(wooProduct);
    const existingGiftIndex = updatedItems.findIndex((i: any) => i.isFreeGift);

    if (freeGiftBundle) {
      const giftCartItem = createFreeGiftCartItem(wooProduct, targetVariant, freeGiftBundle, quantity);
      if (existingGiftIndex > -1) {
        updatedItems[existingGiftIndex] = giftCartItem;
      } else {
        updatedItems.push(giftCartItem);
      }
    }

    // Normalize all items server-side before writing to Firestore
    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);

    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      cartKey: context.cartKey,
      items: normalizedItems,
      totals,
    });
  } catch (error: any) {
    console.error("[API /api/cart POST Exception]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify product availability. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart - Update cart item quantity or options
 */
export async function PUT(request: NextRequest) {
  try {
    const context = await resolveCartContext();
    if (!context.customerId) {
      return NextResponse.json(
        { success: false, requireAuth: true, message: "Authentication required to modify shopping bag." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, quantity, hasProtectionPlan } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Missing item ID" }, { status: 400 });
    }

    const currentCartItems = await readCartFromFile(context.cartKey);
    const targetIndex = currentCartItems.findIndex((i: any) => i.id === itemId);

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, message: "Cart item not found" }, { status: 404 });
    }

    let updatedItems = [...currentCartItems];

    if (typeof quantity === "number") {
      if (quantity <= 0) {
        updatedItems = updatedItems.filter((i: any) => i.id !== itemId);
      } else {
        updatedItems[targetIndex].quantity = quantity;
      }
    }

    if (typeof hasProtectionPlan === "boolean" && updatedItems[targetIndex]) {
      updatedItems[targetIndex].hasProtectionPlan = hasProtectionPlan;
    }

    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);
    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      items: normalizedItems,
      totals,
    });
  } catch (error) {
    console.error("[API /api/cart PUT Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to update cart" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart - Remove single item or clear entire cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const context = await resolveCartContext();
    if (!context.customerId) {
      return NextResponse.json(
        { success: false, requireAuth: true, message: "Authentication required to modify shopping bag." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clear") === "true";

    if (clearAll) {
      await writeCartToFile(context.cartKey, []);
      return NextResponse.json({
        success: true,
        items: [],
        totals: { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, total: 0, totalQuantity: 0 },
      });
    }

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Missing item ID" }, { status: 400 });
    }

    const currentCartItems = await readCartFromFile(context.cartKey);
    const targetItem = currentCartItems.find((i: any) => i.id === itemId);

    let updatedItems = currentCartItems.filter((i: any) => i.id !== itemId);

    // If removed item was associated with a free gift bundle, remove gift item too if no eligible items remain
    if (targetItem) {
      const remainingNonGiftItems = updatedItems.filter((i: any) => !i.isFreeGift);
      if (remainingNonGiftItems.length === 0) {
        updatedItems = [];
      }
    }

    const normalizedItems = await Promise.all(
      updatedItems.map((rawItem: any) => normalizeCartItem(rawItem))
    );

    await writeCartToFile(context.cartKey, normalizedItems);
    const totals = calculateWooCartTotals(normalizedItems);

    return NextResponse.json({
      success: true,
      items: normalizedItems,
      totals,
    });
  } catch (error) {
    console.error("[API /api/cart DELETE Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to remove cart item" }, { status: 500 });
  }
}
