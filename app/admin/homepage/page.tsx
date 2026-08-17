"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Sliders,
  Tag,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Save,
  Monitor,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  Edit3,
  Image as ImageIcon,
} from "lucide-react";
import {
  HeroSlide,
  AnnouncementItem,
  HomepageOffer,
  HomepageCard,
  HomepageConfig,
  HeroRedirectType,
} from "@/types/homepage";
import { DEFAULT_CARDS } from "@/constants/homepage";

function HomepageManagerContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "hero";

  const [activeTab, setActiveTab] = useState<"hero" | "announcements" | "offers" | "cards">(
    (initialTab as any) || "hero"
  );

  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Live WooCommerce data for dropdowns
  const [wooProducts, setWooProducts] = useState<{ id: number; name: string; slug: string; price?: number }[]>([]);
  const [wooCategories, setWooCategories] = useState<{ id: number; name: string; slug: string }[]>([]);

  // Modal / Editing states for Hero Slide
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [uploadingField, setUploadingField] = useState<"desktop" | "mobile" | "card" | "offer" | null>(null);

  // Modal / Editing states for Offer
  const [editingOffer, setEditingOffer] = useState<HomepageOffer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [syncingCouponId, setSyncingCouponId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [offerProductSearch, setOfferProductSearch] = useState("");

  // Modal / Editing states for Homepage Cards
  const [editingCard, setEditingCard] = useState<HomepageCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Dedicated search and change states for Our Picks & Best Seller selectors
  const [ourPicksSearch, setOurPicksSearch] = useState("");
  const [bestSellerSearch, setBestSellerSearch] = useState("");
  const [isChangingOurPicks, setIsChangingOurPicks] = useState(false);
  const [isChangingBestSeller, setIsChangingBestSeller] = useState(false);

  // Load Homepage Config & WooCommerce Data on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch current homepage config
        const res = await fetch("/api/admin/homepage", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.config) {
            setConfig(data.config);
          }
        }

        // 2. Fetch products & categories for live redirect selectors
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?per_page=100", { cache: "no-store" }),
          fetch("/api/categories?include_empty=true", { cache: "no-store" }),
        ]);

        if (prodRes.ok) {
          const pData = await prodRes.json();
          if (isMounted && pData.success && Array.isArray(pData.products)) {
            setWooProducts(
              pData.products.map((p: any) => ({
                id: p.id,
                name: p.name || p.title,
                title: p.title || p.name,
                slug: p.slug,
                price: p.price,
                image: p.featuredImage || p.images?.[0] || "",
              }))
            );
          }
        }

        if (catRes.ok) {
          const cData = await catRes.json();
          if (isMounted && cData.success && Array.isArray(cData.categories)) {
            setWooCategories(
              cData.categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                count: c.count || 0,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load admin homepage data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Replaced / Deleted WordPress Media Items ({ mediaId?: number, oldUrl: string }) to delete ONLY after Firestore save succeeds
  const [pendingDeleteItems, setPendingDeleteItems] = useState<{ mediaId?: number; oldUrl: string }[]>([]);

  // Save all homepage changes to Firestore
  const handleSaveAll = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // 1. Save updated homepage settings to Firestore FIRST
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({
          type: "success",
          message: "All homepage changes saved! Storefront will reflect updates immediately.",
        });
        setConfig(data.config);

        // 2. Safely delete ONLY old replaced WordPress Media Library attachments now that new URLs are saved
        if (pendingDeleteItems.length > 0) {
          const itemsToDelete = [...pendingDeleteItems];
          setPendingDeleteItems([]);
          for (const item of itemsToDelete) {
            try {
              const delRes = await fetch("/api/admin/media/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mediaId: item.mediaId, oldUrl: item.oldUrl }),
              });
              const delData = await delRes.json();
              if (!delRes.ok) {
                console.warn(`[Media Cleanup Warning] Failed to delete old attachment (${item.oldUrl}):`, delData.error);
              } else {
                console.log(`[Media Cleanup Success] Deleted old attachment:`, delData);
              }
            } catch (delErr) {
              console.error(`[Media Cleanup Exception] Could not delete old attachment (${item.oldUrl}):`, delErr);
            }
          }
        }
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        message: err.message || "Failed to save changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 6000);
    }
  };

  // -------------------------------------------------------------
  // HERO SLIDES CONTROLS
  // -------------------------------------------------------------
  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const slides = [...config.heroSlides];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    slides.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setConfig({ ...config, heroSlides: slides });
  };

  const handleToggleSlide = (id: string) => {
    if (!config) return;
    const slides = config.heroSlides.map((s) =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
    );
    setConfig({ ...config, heroSlides: slides });
  };

  const handleDeleteSlide = (id: string) => {
    if (!config) return;
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    const slideToDelete = config.heroSlides.find((s) => s.id === id);
    if (slideToDelete) {
      const items: { mediaId?: number; oldUrl: string }[] = [];
      if (slideToDelete.desktopImage && slideToDelete.desktopImage.includes("/wp-content/uploads/")) {
        items.push({ mediaId: slideToDelete.desktopMediaId, oldUrl: slideToDelete.desktopImage });
      }
      if (slideToDelete.mobileImage && slideToDelete.mobileImage.includes("/wp-content/uploads/")) {
        items.push({ mediaId: slideToDelete.mobileMediaId, oldUrl: slideToDelete.mobileImage });
      }
      if (items.length > 0) {
        setPendingDeleteItems((prev) => [...prev, ...items]);
      }
    }

    const slides = config.heroSlides.filter((s) => s.id !== id);
    slides.forEach((s, idx) => {
      s.order = idx + 1;
    });
    setConfig({ ...config, heroSlides: slides });
  };

  const handleOpenNewSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      title: "New Featured Banner",
      alt: "Hero Banner Promotional Hardware",
      desktopImage: "/images/hero-banner-1.jpg",
      mobileImage: "",
      redirectType: "shop",
      redirectValue: "",
      order: (config?.heroSlides?.length ?? 0) + 1,
      isEnabled: true,
    };
    setEditingSlide(newSlide);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideModal = (slide: HeroSlide) => {
    if (!config) return;
    const exists = config.heroSlides.some((s) => s.id === slide.id);
    let updated: HeroSlide[];
    if (exists) {
      updated = config.heroSlides.map((s) => (s.id === slide.id ? slide : s));
    } else {
      updated = [...config.heroSlides, slide];
    }
    setConfig({ ...config, heroSlides: updated });
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  // Image Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "desktop" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    setUploadingField(field);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", field === "desktop" ? "hero-desktop" : "hero-mobile");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        if (field === "desktop") {
          // Track old desktop image URL & mediaId to delete only after successful save
          const oldUrl = editingSlide.desktopImage;
          const oldMediaId = editingSlide.desktopMediaId;
          if (oldUrl && oldUrl.includes("/wp-content/uploads/") && oldUrl !== data.url) {
            setPendingDeleteItems((prev) => [...prev, { mediaId: oldMediaId, oldUrl }]);
          }
          setEditingSlide({
            ...editingSlide,
            desktopImage: data.url,
            desktopMediaId: data.mediaId || undefined,
          });
        } else {
          // Track old mobile image URL & mediaId to delete only after successful save
          const oldUrl = editingSlide.mobileImage;
          const oldMediaId = editingSlide.mobileMediaId;
          if (oldUrl && oldUrl.includes("/wp-content/uploads/") && oldUrl !== data.url) {
            setPendingDeleteItems((prev) => [...prev, { mediaId: oldMediaId, oldUrl }]);
          }
          setEditingSlide({
            ...editingSlide,
            mobileImage: data.url,
            mobileMediaId: data.mediaId || undefined,
          });
        }
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };

  // -------------------------------------------------------------
  // ANNOUNCEMENTS CONTROLS
  // -------------------------------------------------------------
  const handleMoveAnnouncement = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const items = [...config.announcements];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setConfig({ ...config, announcements: items });
  };

  const handleToggleAnnouncement = (id: string) => {
    if (!config) return;
    const items = config.announcements.map((a) =>
      a.id === id ? { ...a, isEnabled: !a.isEnabled } : a
    );
    setConfig({ ...config, announcements: items });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!config) return;
    const items = config.announcements.filter((a) => a.id !== id);
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setConfig({ ...config, announcements: items });
  };

  const handleAddAnnouncement = () => {
    if (!config) return;
    const newItem: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      text: "NEW SPECIAL PROMOTION: FREE EXPRESS SHIPPING ON ALL ORDERS",
      link: "/shop",
      order: (config.announcements?.length ?? 0) + 1,
      isEnabled: true,
    };
    setConfig({ ...config, announcements: [...config.announcements, newItem] });
  };

  const handleUpdateAnnouncementText = (id: string, text: string) => {
    if (!config) return;
    const items = config.announcements.map((a) => (a.id === id ? { ...a, text } : a));
    setConfig({ ...config, announcements: items });
  };

  const handleUpdateAnnouncementLink = (id: string, link: string) => {
    if (!config) return;
    const items = config.announcements.map((a) => (a.id === id ? { ...a, link } : a));
    setConfig({ ...config, announcements: items });
  };

  // -------------------------------------------------------------
  // OFFERS CONTROLS
  // -------------------------------------------------------------
  const handleToggleOffer = (id: string) => {
    if (!config) return;
    const offers = config.offers.map((o) =>
      o.id === id ? { ...o, isEnabled: !o.isEnabled } : o
    );
    setConfig({ ...config, offers });
  };

  const handleDeleteOffer = (id: string) => {
    if (!config) return;
    if (!confirm("Are you sure you want to delete this offer?")) return;
    const offers = config.offers.filter((o) => o.id !== id);
    offers.forEach((o, idx) => {
      o.order = idx + 1;
    });
    setConfig({ ...config, offers });
  };

  const handleOpenNewOffer = () => {
    const newOffer: HomepageOffer = {
      id: `offer-${Date.now()}`,
      title: "Welcome Offer",
      tagline: "Flat 10% Off on Mobile Accessories",
      badge: "Exclusive Deal",
      code: "WELCOME10",
      discountType: "percent",
      discountAmount: 10,
      targetCategory: "accessories",
      ctaHref: "/shop?category=accessories",
      isEnabled: true,
      order: (config?.offers?.length ?? 0) + 1,
    };
    setEditingOffer(newOffer);
    setIsOfferModalOpen(true);
  };

  const handleSaveOfferModal = (offer: HomepageOffer) => {
    if (!config) return;
    const exists = config.offers.some((o) => o.id === offer.id);
    let updated: HomepageOffer[];
    if (exists) {
      updated = config.offers.map((o) => (o.id === offer.id ? offer : o));
    } else {
      updated = [...config.offers, offer];
    }
    setConfig({ ...config, offers: updated });
    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  // One-click sync coupon with WooCommerce
  const handleSyncWooCoupon = async (offer: HomepageOffer) => {
    setSyncingCouponId(offer.id);
    setSyncStatus(null);

    try {
      const targetCatObj = (wooCategories as any[]).find((c) => c.slug === offer.targetCategory);
      const res = await fetch("/api/admin/offers/sync-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: offer.code,
          discountType: offer.discountType,
          amount: offer.discountAmount,
          description: `${offer.title} - ${offer.tagline}`,
          expiryDate: offer.expiryDate,
          applyTo: offer.applyTo || "entire_store",
          targetCategoryId: targetCatObj?.id,
          targetProductIds: offer.targetProductIds || [],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus(`Coupon ${offer.code} successfully synchronized into WooCommerce!`);
      } else {
        throw new Error(data.error || "WooCommerce coupon sync failed");
      }
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncingCouponId(null);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // -------------------------------------------------------------
  // HOMEPAGE CARDS CONTROLS (Add, Edit, Delete, Reorder, Enable)
  // -------------------------------------------------------------
  const handleToggleCard = (id: string) => {
    if (!config) return;
    const currentCards = config.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
    const updated = currentCards.map((c) =>
      c.id === id ? { ...c, isEnabled: !c.isEnabled } : c
    );
    setConfig({ ...config, cards: updated });
  };

  const handleAddCategoryCard = () => {
    if (!config) return;
    const currentCards = config.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
    const catCards = currentCards.filter((c) => c.section === "category_slider");
    const nextOrder = catCards.length + 1;

    // Pick first available category if any
    const defaultCat = (wooCategories as any[]).find((c) => (c.count || 0) > 0) || wooCategories[0];
    const newCard: HomepageCard = {
      id: `card-cat-${Date.now()}`,
      section: "category_slider",
      slotName: defaultCat ? defaultCat.name : `Category Card ${nextOrder}`,
      title: defaultCat ? defaultCat.name : "New Category",
      subtitle: "Explore Collection",
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
      categorySlug: defaultCat ? defaultCat.slug : undefined,
      ctaHref: defaultCat ? `/shop?category=${defaultCat.slug}` : "/shop",
      order: nextOrder,
      isEnabled: true,
    };

    setEditingCard(newCard);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    if (!config) return;
    if (!confirm("Are you sure you want to delete this category card?")) return;
    const currentCards = config.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
    const cardToDelete = currentCards.find((c) => c.id === id);
    if (cardToDelete && cardToDelete.image && cardToDelete.image.includes("/wp-content/uploads/")) {
      setPendingDeleteItems((prev) => [
        ...prev,
        { mediaId: cardToDelete.mediaId, oldUrl: cardToDelete.image },
      ]);
    }
    const updated = currentCards.filter((c) => c.id !== id);
    setConfig({ ...config, cards: updated });
  };

  const handleMoveCard = (id: string, direction: "up" | "down") => {
    if (!config) return;
    const currentCards = config.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
    const catCards = currentCards.filter((c) => c.section === "category_slider");
    const otherCards = currentCards.filter((c) => c.section !== "category_slider");

    const index = catCards.findIndex((c) => c.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === catCards.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...catCards];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const updatedCatCards = reordered.map((c, i) => ({ ...c, order: i + 1 }));
    setConfig({ ...config, cards: [...updatedCatCards, ...otherCards] });
  };

  const handleOpenEditCard = (card: HomepageCard) => {
    setEditingCard({ ...card });
    setIsCardModalOpen(true);
  };

  const handleSaveCardModal = (card: HomepageCard) => {
    if (!config) return;
    const currentCards = config.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
    const exists = currentCards.some((c) => c.id === card.id);
    let updated: HomepageCard[];
    if (exists) {
      updated = currentCards.map((c) => (c.id === card.id ? card : c));
    } else {
      updated = [...currentCards, card];
    }
    setConfig({ ...config, cards: updated });
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleSelectFeaturedProduct = (slot: "Our Picks" | "Best Seller", product: any) => {
    if (!config) return;
    const currentCards = config.cards && config.cards.length > 0 ? [...config.cards] : [...DEFAULT_CARDS];
    const cardId = slot === "Our Picks" ? "card-bento-picks" : "card-bento-bestseller";
    const existingIndex = currentCards.findIndex((c) => c.id === cardId || c.slotName === slot);

    const updatedCard: HomepageCard = {
      id: cardId,
      section: "bento",
      slotName: slot,
      title: product.name || product.title || slot,
      subtitle: slot === "Our Picks" ? "Handcrafted flagship selection" : "Top rated across categories",
      badge: slot,
      image: product.image || "",
      productSlug: product.slug,
      productId: product.id,
      ctaHref: `/products/${product.slug}`,
      order: slot === "Our Picks" ? 12 : 13,
      isEnabled: existingIndex !== -1 ? currentCards[existingIndex].isEnabled : true,
    };

    if (existingIndex !== -1) {
      currentCards[existingIndex] = updatedCard;
    } else {
      currentCards.push(updatedCard);
    }

    setConfig({ ...config, cards: currentCards });
    if (slot === "Our Picks") {
      setIsChangingOurPicks(false);
      setOurPicksSearch("");
    } else {
      setIsChangingBestSeller(false);
      setBestSellerSearch("");
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;

    setUploadingField("card");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "homepage-card");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        // Track old card image URL & mediaId to delete only after successful save
        const oldUrl = editingCard.image;
        const oldMediaId = editingCard.mediaId;
        if (oldUrl && oldUrl.includes("/wp-content/uploads/") && oldUrl !== data.url) {
          setPendingDeleteItems((prev) => [...prev, { mediaId: oldMediaId, oldUrl }]);
        }
        setEditingCard({
          ...editingCard,
          image: data.url,
          mediaId: data.mediaId || undefined,
        });
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Card image upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleOfferImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingOffer) return;

    setUploadingField("offer");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "homepage-offer");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        // Track old offer image URL & mediaId to delete only after successful save
        const oldUrl = editingOffer.image;
        const oldMediaId = editingOffer.mediaId;
        if (oldUrl && oldUrl.includes("/wp-content/uploads/") && oldUrl !== data.url) {
          setPendingDeleteItems((prev) => [...prev, { mediaId: oldMediaId, oldUrl }]);
        }
        setEditingOffer({
          ...editingOffer,
          image: data.url,
          mediaId: data.mediaId || undefined,
        });
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Offer image upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-[#e5e4de] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#71706b] uppercase tracking-wider">
          Loading Homepage Settings & WooCommerce Catalogs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#e5e4de] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1c1c1a] tracking-tight">
            Homepage Management
          </h1>
          <p className="text-xs sm:text-sm text-[#71706b] mt-0.5">
            Manage your Hero Banners, Announcement Ticker Strip, and Promotional Deals in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#a00000] active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Notification */}
      {saveStatus && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm transition-all ${
            saveStatus.type === "success"
              ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
              : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
          }`}
        >
          {saveStatus.type === "success" ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* WooCommerce Coupon Sync Status */}
      {syncStatus && (
        <div className="p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] shadow-sm">
          <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e4de] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "hero"
              ? "bg-[#8b0000] text-white shadow-md"
              : "bg-white text-[#71706b] hover:text-[#1c1c1a] border border-[#e5e4de]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slides ({config?.heroSlides?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "bg-[#8b0000] text-white shadow-md"
              : "bg-white text-[#71706b] hover:text-[#1c1c1a] border border-[#e5e4de]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Announcement Strip ({config?.announcements?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "offers"
              ? "bg-[#8b0000] text-white shadow-md"
              : "bg-white text-[#71706b] hover:text-[#1c1c1a] border border-[#e5e4de]"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotional Offers ({config?.offers?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("cards")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "cards"
              ? "bg-[#8b0000] text-white shadow-md"
              : "bg-white text-[#71706b] hover:text-[#1c1c1a] border border-[#e5e4de]"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Homepage Cards ({(config?.cards || DEFAULT_CARDS).length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SLIDES MANAGER TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#1c1c1a]">
                Hero Carousel Slides
              </h2>
              <p className="text-xs text-[#71706b]">
                Slides automatically scale with desktop (1920×1080) and mobile (1080×1920) support with zero cropping.
              </p>
            </div>

            <button
              onClick={handleOpenNewSlide}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] hover:bg-[#fff0ee] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>

          <div className="space-y-3">
            {config?.heroSlides?.map((slide, idx) => (
              <div
                key={slide.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  slide.isEnabled ? "border-[#e5e4de] shadow-xs" : "border-dashed border-gray-300 opacity-60 bg-gray-50"
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMoveSlide(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      title="Move slide up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black text-[#71706b]">#{slide.order}</span>
                    <button
                      onClick={() => handleMoveSlide(idx, "down")}
                      disabled={idx === (config.heroSlides.length - 1)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      title="Move slide down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 border border-[#e5e4de] shrink-0">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={slide.desktopImage}
                      alt={slide.alt || slide.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#1c1c1a]">{slide.title}</h3>
                      {slide.mobileImage && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200">
                          Mobile Image Set
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71706b]">
                      Redirects to:{" "}
                      <span className="font-semibold text-[#1c1c1a] bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                        {slide.redirectType.toUpperCase()}: {slide.redirectValue || "/shop"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2.5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  {/* Enable/Disable Switch */}
                  <button
                    onClick={() => handleToggleSlide(slide.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      slide.isEnabled
                        ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {slide.isEnabled ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingSlide({ ...slide });
                      setIsSlideModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ANNOUNCEMENT STRIP TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#1c1c1a]">
                Top Announcement Rolling Strip
              </h2>
              <p className="text-xs text-[#71706b]">
                Informational messages scroll continuously across the top header strip with automatic speed and length adjustment.
              </p>
            </div>

            <button
              onClick={handleAddAnnouncement}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] hover:bg-[#fff0ee] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Announcement</span>
            </button>
          </div>

          {/* Live Marquee Preview Simulator */}
          <div className="bg-[#800000] text-white p-3 rounded-2xl overflow-hidden shadow-inner flex items-center select-none">
            {(() => {
              const active = config?.announcements?.filter((a) => a.isEnabled) || [];
              const safe = active.length > 0 ? active : [{ id: "empty", text: "NO ACTIVE ANNOUNCEMENTS", order: 1, isEnabled: true }];
              const rep = Math.max(1, Math.ceil(6 / safe.length));
              const items = Array.from({ length: rep }, () => safe).flat();
              const dur = Math.max(14, Math.min(50, items.length * 4.5));
              return (
                <div
                  className="flex animate-marquee-smooth items-center text-[11px] font-extrabold tracking-wider uppercase text-white shrink-0"
                  style={{ animationDuration: `${dur}s` }}
                >
                  {items.map((a, i) => (
                    <span key={`prev-1-${a.id}-${i}`} className="px-8 shrink-0 flex items-center">
                      {a.text}
                    </span>
                  ))}
                  {items.map((a, i) => (
                    <span key={`prev-2-${a.id}-${i}`} className="px-8 shrink-0 flex items-center">
                      {a.text}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* List */}
          <div className="space-y-3">
            {config?.announcements?.map((ann, idx) => (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  ann.isEnabled ? "border-[#e5e4de] shadow-xs" : "border-dashed border-gray-300 opacity-60 bg-gray-50"
                }`}
              >
                {/* Reorder controls & inputs */}
                <div className="flex items-start md:items-center gap-3 w-full">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveAnnouncement(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black text-[#71706b]">#{ann.order}</span>
                    <button
                      onClick={() => handleMoveAnnouncement(idx, "down")}
                      disabled={idx === (config.announcements.length - 1)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full">
                    <label className="text-[10px] font-bold text-[#71706b] uppercase block mb-1">
                      Announcement Message
                    </label>
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => handleUpdateAnnouncementText(ann.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                      placeholder="Enter announcement text..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggleAnnouncement(ann.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ann.isEnabled
                        ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {ann.isEnabled ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROMOTIONAL OFFERS TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#1c1c1a]">
                Promotional Offers & Deals
              </h2>
              <p className="text-xs text-[#71706b]">
                Manage homepage offer cards and synchronize discount codes with WooCommerce Coupons in one click.
              </p>
            </div>

            <button
              onClick={handleOpenNewOffer}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] hover:bg-[#fff0ee] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Offer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config?.offers?.map((offer) => (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  offer.isEnabled ? "border-[#e5e4de] shadow-xs" : "border-dashed border-gray-300 opacity-60 bg-gray-50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[10px] font-bold uppercase tracking-wider border border-[#e3beb8]">
                      {offer.badge}
                    </span>
                    <span className="font-mono font-bold text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-md shadow-xs">
                      {offer.code}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#1c1c1a]">{offer.title}</h3>
                  <p className="text-xs text-[#71706b] leading-relaxed">{offer.tagline}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1c1c1a]">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px]">
                      Discount: {offer.discountAmount}{offer.discountType === "percent" ? "%" : "₹"}
                    </span>
                    <span className="bg-[#ffe9e6] text-[#8b0000] px-2 py-1 rounded-md text-[11px] font-bold">
                      {offer.applyTo === "category"
                        ? `Category: ${offer.targetCategory}`
                        : offer.applyTo === "products"
                        ? `Products: ${offer.targetProductIds?.length || 1} item(s)`
                        : "Entire Store"}
                    </span>
                    {offer.usageRule && offer.usageRule !== "unlimited" && (
                      <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {offer.usageRule === "first_order_only"
                          ? "First Order Only"
                          : offer.usageRule === "once_per_customer"
                          ? "Once per Account"
                          : "Once per Order"}
                      </span>
                    )}
                    {offer.maxEligibleQuantity && offer.maxEligibleQuantity > 0 && (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Max Qty: {offer.maxEligibleQuantity} {offer.maxEligibleQuantity === 1 ? "product" : "products"}
                      </span>
                    )}
                    {offer.expiryDate && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">
                        Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
                  {/* One-Click WooCommerce Coupon Sync */}
                  <button
                    onClick={() => handleSyncWooCoupon(offer)}
                    disabled={syncingCouponId === offer.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Synchronize coupon with WooCommerce database"
                  >
                    {syncingCouponId === offer.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>Sync to WooCommerce</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleOffer(offer.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        offer.isEnabled
                          ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {offer.isEnabled ? "Active" : "Disabled"}
                    </button>

                    <button
                      onClick={() => {
                        setEditingOffer({ ...offer });
                        setIsOfferModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HOMEPAGE CARDS MANAGEMENT TAB (Fixed Slots - No Adding/Deleting)       */}
      {/* ========================================================================= */}
      {activeTab === "cards" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e5e4de]">
            <div>
              <h2 className="text-base font-extrabold text-[#1c1c1a] flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#8b0000]" />
                <span>Homepage Cards Management</span>
              </h2>
              <p className="text-xs text-[#71706b] mt-0.5">
                Manage titles, subtitles, images, badges, and click redirects for all fixed category slider and bento deal cards.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#71706b] bg-[#faf9f7] px-3 py-1.5 rounded-xl border border-[#e5e4de]">
              <span>Fixed Layout:</span>
              <span className="text-[#8b0000] font-black">
                {(config?.cards || DEFAULT_CARDS).length} Cards Total
              </span>
            </div>
          </div>

          {/* Section A: "Our Products" Category Slider Cards */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-[#1c1c1a] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8b0000]" />
                  <span>Section 1: "Our Products" Category Slider Cards</span>
                </h3>
                <span className="text-[11px] font-semibold text-[#71706b]">
                  Categories with available WooCommerce products are displayed in 2.5D coverflow
                </span>
              </div>

              <button
                onClick={handleAddCategoryCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(config?.cards || DEFAULT_CARDS)
                .filter((c) => c.section === "category_slider")
                .map((card, idx, arr) => {
                  // Look up live product count from WooCommerce
                  const matchedCat = (wooCategories as any[]).find(
                    (wc) =>
                      wc.slug === card.categorySlug ||
                      card.ctaHref?.includes(wc.slug) ||
                      card.title.toLowerCase().includes(wc.name.toLowerCase())
                  );
                  const liveCount = matchedCat ? matchedCat.count : undefined;

                  return (
                    <div
                      key={card.id}
                      className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                        card.isEnabled
                          ? "border-[#e5e4de] shadow-xs hover:border-[#8b0000] hover:shadow-md"
                          : "border-dashed border-gray-300 opacity-60 bg-gray-50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          {/* eslint-disable-next-img-element */}
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold backdrop-blur-xs">
                              #{card.order}
                            </span>
                            {liveCount !== undefined && (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs ${
                                  liveCount > 0
                                    ? "bg-[#2e7d32] text-white"
                                    : "bg-gray-600 text-white"
                                }`}
                              >
                                {liveCount} {liveCount === 1 ? "Product" : "Products"}
                              </span>
                            )}
                          </div>

                          {/* Reorder Up / Down */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveCard(card.id, "up")}
                              className="p-1 rounded-md bg-black/70 hover:bg-black text-white text-[10px] disabled:opacity-30 cursor-pointer"
                              title="Move Left/Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveCard(card.id, "down")}
                              className="p-1 rounded-md bg-black/70 hover:bg-black text-white text-[10px] disabled:opacity-30 cursor-pointer"
                              title="Move Right/Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#71706b] block">
                            {matchedCat ? `Category: ${matchedCat.name}` : card.slotName}
                          </span>
                          <h4 className="text-xs font-black text-[#1c1c1a] line-clamp-1 mt-0.5">
                            {card.title}
                          </h4>
                          {card.subtitle && (
                            <p className="text-[11px] text-[#71706b] line-clamp-1">
                              {card.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border truncate">
                          Link: {card.ctaHref || "/shop"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1.5">
                        <button
                          onClick={() => handleToggleCard(card.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            card.isEnabled
                              ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                              : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                        >
                          {card.isEnabled ? "Active" : "Disabled"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCard(card)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section B: Featured Showcase Products (Our Picks & Best Seller) & Bento Cards */}
          {(() => {
            const currentCards = config?.cards && config.cards.length > 0 ? config.cards : DEFAULT_CARDS;
            const ourPicksCard =
              currentCards.find((c) => c.id === "card-bento-picks" || c.slotName === "Our Picks") ||
              DEFAULT_CARDS.find((c) => c.id === "card-bento-picks") ||
              {
                id: "card-bento-picks",
                section: "bento",
                slotName: "Our Picks",
                title: "Our Picks Product",
                subtitle: "Handcrafted flagship selection",
                badge: "Our Picks",
                image: "",
                productSlug: "flagship-smartphone-pro",
                ctaHref: "/products/flagship-smartphone-pro",
                order: 12,
                isEnabled: true,
              };

            const bestSellerCard =
              currentCards.find((c) => c.id === "card-bento-bestseller" || c.slotName === "Best Seller") ||
              DEFAULT_CARDS.find((c) => c.id === "card-bento-bestseller") ||
              {
                id: "card-bento-bestseller",
                section: "bento",
                slotName: "Best Seller",
                title: "Best Seller Product",
                subtitle: "Top rated across categories",
                badge: "Best Seller",
                image: "",
                productSlug: "aerobuds-max",
                ctaHref: "/products/aerobuds-max",
                order: 13,
                isEnabled: true,
              };

            const selectedOurPicksProd = ourPicksCard?.productSlug
              ? (wooProducts as any[]).find((p) => p.slug === ourPicksCard.productSlug)
              : null;
            const selectedBestSellerProd = bestSellerCard?.productSlug
              ? (wooProducts as any[]).find((p) => p.slug === bestSellerCard.productSlug)
              : null;

            const filteredOurPicksProducts = (wooProducts as any[]).filter((p) => {
              if (!ourPicksSearch.trim()) return true;
              const term = ourPicksSearch.toLowerCase();
              return (
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.title && p.title.toLowerCase().includes(term)) ||
                (p.slug && p.slug.toLowerCase().includes(term))
              );
            });

            const filteredBestSellerProducts = (wooProducts as any[]).filter((p) => {
              if (!bestSellerSearch.trim()) return true;
              const term = bestSellerSearch.toLowerCase();
              return (
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.title && p.title.toLowerCase().includes(term)) ||
                (p.slug && p.slug.toLowerCase().includes(term))
              );
            });

            return (
              <div className="space-y-6 pt-4 border-t border-[#e5e4de]">
                {/* 1. Featured Products Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-[#1c1c1a] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#8b0000]" />
                        <span>Section 2: Featured Showcase Products (Our Picks & Best Seller)</span>
                      </h3>
                      <p className="text-[11px] text-[#71706b] mt-0.5 font-medium">
                        Select exactly 1 WooCommerce product for Our Picks and 1 for Best Seller. Main image, name, and current price sync live from WooCommerce.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#8b0000] bg-[#ffe9e6] px-2.5 py-1 rounded-full border border-[#e3beb8]">
                      Live WooCommerce Product Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* --- OUR PICKS CARD --- */}
                    <div className="bg-white rounded-2xl p-5 border border-[#e5e4de] shadow-xs space-y-4 flex flex-col justify-between hover:border-[#8b0000] transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8b0000]" />
                            <span className="text-xs font-black text-[#1c1c1a] uppercase tracking-wider">
                              Our Picks Product
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCard(ourPicksCard.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              ourPicksCard.isEnabled
                                ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {ourPicksCard.isEnabled ? "Active (Visible)" : "Disabled (Hidden)"}
                          </button>
                        </div>

                        {selectedOurPicksProd && !isChangingOurPicks ? (
                          <div className="mt-3.5 p-3.5 bg-[#faf9f7] rounded-xl border border-[#e5e4de] flex items-center gap-3.5">
                            {selectedOurPicksProd.image ? (
                              <img
                                src={selectedOurPicksProd.image}
                                alt={selectedOurPicksProd.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block">
                                Selected WooCommerce Product
                              </span>
                              <h4 className="text-xs font-black text-[#1c1c1a] truncate">
                                {selectedOurPicksProd.name || selectedOurPicksProd.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-bold text-[#1c1c1a]">
                                  {selectedOurPicksProd.price ? `₹${selectedOurPicksProd.price}` : "Free / Available"}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px] truncate">
                                  /products/{selectedOurPicksProd.slug}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                value={ourPicksSearch}
                                onChange={(e) => setOurPicksSearch(e.target.value)}
                                placeholder="Search products by name or SKU..."
                                className="w-full px-3.5 py-2 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-xs">
                              {filteredOurPicksProducts.length > 0 ? (
                                filteredOurPicksProducts.map((prod) => (
                                  <button
                                    key={prod.id}
                                    type="button"
                                    onClick={() => handleSelectFeaturedProduct("Our Picks", prod)}
                                    className="w-full p-2.5 flex items-center gap-2.5 hover:bg-[#fff5f5] text-left transition-colors cursor-pointer group"
                                  >
                                    {prod.image ? (
                                      <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="w-9 h-9 object-cover rounded-md border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <span className="text-xs font-bold text-[#1c1c1a] block truncate group-hover:text-[#8b0000]">
                                        {prod.name || prod.title}
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-semibold">
                                        {prod.price ? `₹${prod.price}` : "Available"} • SKU: {prod.slug}
                                      </span>
                                    </div>
                                    <Check className="w-4 h-4 text-[#8b0000] opacity-0 group-hover:opacity-100 shrink-0" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-gray-500">
                                  No matching products found.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-3 flex items-center justify-between gap-2 border-t border-gray-100">
                          {selectedOurPicksProd && !isChangingOurPicks ? (
                            <button
                              type="button"
                              onClick={() => setIsChangingOurPicks(true)}
                              className="px-3 py-1.5 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] cursor-pointer flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3 text-[#8b0000]" />
                              <span>Change / Replace Product</span>
                            </button>
                          ) : (
                            selectedOurPicksProd && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsChangingOurPicks(false);
                                  setOurPicksSearch("");
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )
                          )}

                          <span className="text-[10px] font-mono text-gray-400">
                            Slot: Bento Top-Left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* --- BEST SELLER CARD --- */}
                    <div className="bg-white rounded-2xl p-5 border border-[#e5e4de] shadow-xs space-y-4 flex flex-col justify-between hover:border-[#8b0000] transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1c1c1a]" />
                            <span className="text-xs font-black text-[#1c1c1a] uppercase tracking-wider">
                              Best Seller Product
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCard(bestSellerCard.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              bestSellerCard.isEnabled
                                ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {bestSellerCard.isEnabled ? "Active (Visible)" : "Disabled (Hidden)"}
                          </button>
                        </div>

                        {selectedBestSellerProd && !isChangingBestSeller ? (
                          <div className="mt-3.5 p-3.5 bg-[#faf9f7] rounded-xl border border-[#e5e4de] flex items-center gap-3.5">
                            {selectedBestSellerProd.image ? (
                              <img
                                src={selectedBestSellerProd.image}
                                alt={selectedBestSellerProd.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block">
                                Selected WooCommerce Product
                              </span>
                              <h4 className="text-xs font-black text-[#1c1c1a] truncate">
                                {selectedBestSellerProd.name || selectedBestSellerProd.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-bold text-[#1c1c1a]">
                                  {selectedBestSellerProd.price ? `₹${selectedBestSellerProd.price}` : "Free / Available"}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px] truncate">
                                  /products/{selectedBestSellerProd.slug}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                value={bestSellerSearch}
                                onChange={(e) => setBestSellerSearch(e.target.value)}
                                placeholder="Search products by name or SKU..."
                                className="w-full px-3.5 py-2 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-xs">
                              {filteredBestSellerProducts.length > 0 ? (
                                filteredBestSellerProducts.map((prod) => (
                                  <button
                                    key={prod.id}
                                    type="button"
                                    onClick={() => handleSelectFeaturedProduct("Best Seller", prod)}
                                    className="w-full p-2.5 flex items-center gap-2.5 hover:bg-[#fff5f5] text-left transition-colors cursor-pointer group"
                                  >
                                    {prod.image ? (
                                      <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="w-9 h-9 object-cover rounded-md border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <span className="text-xs font-bold text-[#1c1c1a] block truncate group-hover:text-[#8b0000]">
                                        {prod.name || prod.title}
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-semibold">
                                        {prod.price ? `₹${prod.price}` : "Available"} • SKU: {prod.slug}
                                      </span>
                                    </div>
                                    <Check className="w-4 h-4 text-[#8b0000] opacity-0 group-hover:opacity-100 shrink-0" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-gray-500">
                                  No matching products found.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-3 flex items-center justify-between gap-2 border-t border-gray-100">
                          {selectedBestSellerProd && !isChangingBestSeller ? (
                            <button
                              type="button"
                              onClick={() => setIsChangingBestSeller(true)}
                              className="px-3 py-1.5 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] cursor-pointer flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3 text-[#8b0000]" />
                              <span>Change / Replace Product</span>
                            </button>
                          ) : (
                            selectedBestSellerProd && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsChangingBestSeller(false);
                                  setBestSellerSearch("");
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )
                          )}

                          <span className="text-[10px] font-mono text-gray-400">
                            Slot: Bento Top-Right
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Promo Banner Cards */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#1c1c1a] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8b0000]" />
                      <span>Bento Promotional Banners (4 Cards)</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-[#71706b]">
                      Visible in Bento Showcase
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCards
                      .filter(
                        (c) =>
                          c.section === "bento" &&
                          c.id !== "card-bento-picks" &&
                          c.id !== "card-bento-bestseller" &&
                          c.slotName !== "Our Picks" &&
                          c.slotName !== "Best Seller"
                      )
                      .map((card) => (
                        <div
                          key={card.id}
                          className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                            card.isEnabled
                              ? "border-[#e5e4de] shadow-xs hover:border-[#8b0000] hover:shadow-md"
                              : "border-dashed border-gray-300 opacity-60 bg-gray-50"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              {/* eslint-disable-next-img-element */}
                              <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1.5 left-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-black/75 text-white text-[8px] font-bold">
                                  #{card.order}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#71706b] block">
                                {card.slotName}
                              </span>
                              <h4 className="text-sm font-black text-[#1c1c1a] line-clamp-1">
                                {card.title}
                              </h4>
                              {card.subtitle && (
                                <p className="text-xs text-[#71706b] line-clamp-1">
                                  {card.subtitle}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {card.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[9px] font-bold border border-[#e3beb8]">
                                    {card.badge}
                                  </span>
                                )}
                                {card.ctaText && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#1c1c1a] text-[9px] font-bold">
                                    Button: {card.ctaText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border truncate">
                            Link: {card.ctaHref || "/shop"}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCard(card.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                card.isEnabled
                                  ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                                  : "bg-gray-100 text-gray-600 border border-gray-300"
                              }`}
                            >
                              {card.isEnabled ? "Active" : "Disabled"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditCard(card)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#d8d7d0] hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Card</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HERO SLIDE EDIT / CREATE MODAL                                            */}
      {/* ========================================================================= */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[#e5e4de]">
            <div className="flex items-center justify-between border-b border-[#e5e4de] pb-4">
              <h2 className="text-lg font-black text-[#1c1c1a]">
                {editingSlide.id.startsWith("hero-") && !config?.heroSlides.some((s) => s.id === editingSlide.id)
                  ? "Create Hero Slide"
                  : "Edit Hero Slide"}
              </h2>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Slide Title
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  placeholder="e.g. Upgrade Your Everyday Tech"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={editingSlide.alt}
                  onChange={(e) => setEditingSlide({ ...editingSlide, alt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  placeholder="Descriptive text for screen readers..."
                />
              </div>

              {/* Desktop Image Upload & Preview (1920x1080) */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#8b0000]" />
                    <span className="text-xs font-extrabold text-[#1c1c1a]">
                      Desktop Hero Image <span className="text-[#71706b] font-normal">(1920×1080 recommended)</span>
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] shadow-xs cursor-pointer hover:bg-[#fff0ee] transition-colors">
                    {uploadingField === "desktop" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "desktop")}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={editingSlide.desktopImage}
                  onChange={(e) => setEditingSlide({ ...editingSlide, desktopImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-mono text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  placeholder="/images/hero-banner-1.jpg or https://..."
                />

                {editingSlide.desktopImage && (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#d8d7d0] bg-gray-100">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={editingSlide.desktopImage}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Image Upload & Preview (1080x1920 (9:16)) */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#8b0000]" />
                    <span className="text-xs font-extrabold text-[#1c1c1a]">
                      Mobile/Tablet Hero Image <span className="text-[#71706b] font-normal">(1080×1920 (9:16))</span>
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] shadow-xs cursor-pointer hover:bg-[#fff0ee] transition-colors">
                    {uploadingField === "mobile" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "mobile")}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={editingSlide.mobileImage || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, mobileImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-mono text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  placeholder="Optional: defaults to desktop banner if empty"
                />

                {editingSlide.mobileImage && (
                  <div className="relative aspect-[9/16] w-full max-w-[150px] mx-auto rounded-xl overflow-hidden border border-[#d8d7d0] bg-gray-100 shadow-xs">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={editingSlide.mobileImage}
                      alt="Mobile Preview"
                      className="w-full h-full object-contain object-center bg-gray-50"
                    />
                  </div>
                )}
              </div>

              {/* Redirect Type & Target Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#71706b] uppercase block">
                  Click Redirect Destination
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { type: "shop", label: "Shop All" },
                    { type: "product", label: "Product" },
                    { type: "category", label: "Category" },
                    { type: "custom", label: "Custom URL" },
                    { type: "none", label: "No Redirect" },
                  ].map((dest) => (
                    <button
                      key={dest.type}
                      type="button"
                      onClick={() =>
                        setEditingSlide({
                          ...editingSlide,
                          redirectType: dest.type as HeroRedirectType,
                          redirectValue: dest.type === "shop" ? "/shop" : "",
                        })
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        editingSlide.redirectType === dest.type
                          ? "bg-[#8b0000] text-white shadow-sm"
                          : "bg-gray-100 text-[#1c1c1a] hover:bg-gray-200"
                      }`}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic Selector based on selected redirectType */}
                {editingSlide.redirectType === "product" && (
                  <div>
                    <label className="text-[10px] font-bold text-[#71706b] uppercase block mb-1">
                      Select WooCommerce Product
                    </label>
                    <select
                      value={editingSlide.redirectValue}
                      onChange={(e) => setEditingSlide({ ...editingSlide, redirectValue: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                    >
                      <option value="">-- Choose a Product --</option>
                      {wooProducts.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} {p.price ? `($${p.price})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingSlide.redirectType === "category" && (
                  <div>
                    <label className="text-[10px] font-bold text-[#71706b] uppercase block mb-1">
                      Select WooCommerce Category
                    </label>
                    <select
                      value={editingSlide.redirectValue}
                      onChange={(e) => setEditingSlide({ ...editingSlide, redirectValue: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                    >
                      <option value="">-- Choose a Category --</option>
                      {wooCategories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingSlide.redirectType === "custom" && (
                  <div>
                    <label className="text-[10px] font-bold text-[#71706b] uppercase block mb-1">
                      Enter Custom Internal or External Link
                    </label>
                    <input
                      type="text"
                      value={editingSlide.redirectValue || ""}
                      onChange={(e) => setEditingSlide({ ...editingSlide, redirectValue: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                      placeholder="e.g. /shop?brand=apple or https://..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e5e4de] pt-4">
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#71706b] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveSlideModal(editingSlide)}
                className="px-6 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Update Slide in Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROMOTIONAL OFFER EDIT / CREATE MODAL                                     */}
      {/* ========================================================================= */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-[#e5e4de]">
            <div className="flex items-center justify-between border-b border-[#e5e4de] pb-4">
              <h2 className="text-lg font-black text-[#1c1c1a]">
                {editingOffer.id.startsWith("offer-") && !config?.offers.some((o) => o.id === editingOffer.id)
                  ? "Create Promotional Offer"
                  : "Edit Promotional Offer"}
              </h2>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Optional Offer Image / Banner Upload (WordPress Media Library) */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8b0000]" />
                    <span className="text-xs font-extrabold text-[#1c1c1a]">
                      Offer Image / Icon <span className="text-[#71706b] font-normal">(WordPress Media Library)</span>
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] shadow-xs cursor-pointer hover:bg-[#fff0ee] transition-colors">
                    {uploadingField === "offer" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOfferImageUpload}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={editingOffer.image || ""}
                  onChange={(e) => setEditingOffer({ ...editingOffer, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-mono text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  placeholder="Optional: https://..."
                />

                {editingOffer.image && (
                  <div className="relative w-full max-w-[160px] aspect-square mx-auto rounded-xl overflow-hidden border border-[#d8d7d0] bg-gray-100 shadow-xs">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={editingOffer.image}
                      alt={editingOffer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Offer Title
                </label>
                <input
                  type="text"
                  value={editingOffer.title}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  placeholder="e.g. Welcome Offer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={editingOffer.tagline}
                  onChange={(e) => setEditingOffer({ ...editingOffer, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  placeholder="e.g. Flat 10% Off on Mobile Accessories"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={editingOffer.badge}
                    onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                    placeholder="e.g. Limited Offer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={editingOffer.code}
                    onChange={(e) => setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-mono font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                    placeholder="e.g. WELCOME10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editingOffer.discountType}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Discount Amount ({editingOffer.discountType === "percent" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    value={editingOffer.discountAmount}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  />
                </div>
              </div>

              {/* Apply To: Entire Store / Specific Category / Specific Product(s) */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                <label className="text-xs font-black text-[#1c1c1a] uppercase block">
                  Apply Discount To
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOffer({ ...editingOffer, applyTo: "entire_store" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      (!editingOffer.applyTo || editingOffer.applyTo === "entire_store")
                        ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                        : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                    }`}
                  >
                    Entire Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOffer({ ...editingOffer, applyTo: "category" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingOffer.applyTo === "category"
                        ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                        : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                    }`}
                  >
                    Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOffer({ ...editingOffer, applyTo: "products" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingOffer.applyTo === "products"
                        ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                        : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                    }`}
                  >
                    Specific Product(s)
                  </button>
                </div>

                {/* Specific Category Selector */}
                {editingOffer.applyTo === "category" && (
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-bold text-[#71706b] uppercase block">
                      Target WooCommerce Category
                    </label>
                    <select
                      value={editingOffer.targetCategory || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingOffer({
                          ...editingOffer,
                          targetCategory: val,
                          ctaHref: val ? `/shop?category=${val}` : "/shop",
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                    >
                      <option value="">-- Select Category --</option>
                      {(wooCategories as any[]).map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.count || 0} {(c.count || 0) === 1 ? "product" : "products"})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#71706b]">
                      Discount will automatically apply strictly to products in this category.
                    </p>
                  </div>
                )}

                {/* Specific Product(s) Selector */}
                {editingOffer.applyTo === "products" && (
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-[#71706b] uppercase block">
                      Select Eligible WooCommerce Products ({editingOffer.targetProductIds?.length || 0} selected)
                    </label>

                    {/* Selected Products Badges */}
                    {editingOffer.targetProductIds && editingOffer.targetProductIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-[#d8d7d0] max-h-24 overflow-y-auto">
                        {editingOffer.targetProductIds.map((pId) => {
                          const p = (wooProducts as any[]).find((prod) => prod.id === pId);
                          const pName = p ? p.name || p.title : `Product #${pId}`;
                          return (
                            <span
                              key={pId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ffe9e6] text-[#8b0000] rounded-lg text-xs font-bold"
                            >
                              <span>{pName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedIds = (editingOffer.targetProductIds || []).filter((id) => id !== pId);
                                  setEditingOffer({
                                    ...editingOffer,
                                    targetProductIds: updatedIds,
                                  });
                                }}
                                className="hover:text-black cursor-pointer font-extrabold"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Search and Product List */}
                    <input
                      type="text"
                      value={offerProductSearch}
                      onChange={(e) => setOfferProductSearch(e.target.value)}
                      placeholder="Search products by title..."
                      className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs focus:outline-none focus:border-[#8b0000] bg-white"
                    />

                    <div className="max-h-40 overflow-y-auto rounded-xl border border-[#d8d7d0] bg-white divide-y divide-gray-100">
                      {(wooProducts as any[])
                        .filter((p) =>
                          offerProductSearch.trim()
                            ? (p.name || p.title || "").toLowerCase().includes(offerProductSearch.toLowerCase())
                            : true
                        )
                        .map((prod) => {
                          const isSelected = (editingOffer.targetProductIds || []).includes(prod.id);
                          return (
                            <div
                              key={prod.id}
                              onClick={() => {
                                const current = editingOffer.targetProductIds || [];
                                const next = isSelected
                                  ? current.filter((id) => id !== prod.id)
                                  : [...current, prod.id];
                                setEditingOffer({
                                  ...editingOffer,
                                  targetProductIds: next,
                                });
                              }}
                              className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                isSelected ? "bg-[#fff5f5] font-bold text-[#8b0000]" : "hover:bg-gray-50 text-[#1c1c1a]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="accent-[#8b0000] rounded"
                                />
                                <span>{prod.name || prod.title}</span>
                              </div>
                              <span className="text-gray-400 text-[10px]">#{prod.id}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Usage & Quantity Rules */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1c1c1a] uppercase block">
                    Customer Usage / Eligibility
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "unlimited", label: "Unlimited" },
                      { key: "once_per_customer", label: "Once per Account" },
                      { key: "once_per_order", label: "Once per Order" },
                      { key: "first_order_only", label: "First Order Only" },
                    ].map((rule) => {
                      const isSelected = (editingOffer.usageRule || "unlimited") === rule.key;
                      return (
                        <button
                          key={rule.key}
                          type="button"
                          onClick={() => setEditingOffer({ ...editingOffer, usageRule: rule.key as any })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                              : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                          }`}
                        >
                          {rule.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#71706b]">
                    {editingOffer.usageRule === "first_order_only"
                      ? "Exclusive Welcome Deal: Valid only on customer's first completed order, tracked server-side."
                      : editingOffer.usageRule === "once_per_customer"
                      ? "One-Time per Account: Each customer account can redeem this offer once."
                      : editingOffer.usageRule === "once_per_order"
                      ? "Single redemption per checkout cart."
                      : "Can be used continuously across orders."}
                  </p>
                </div>

                {/* Maximum Eligible Quantity per Order */}
                <div className="space-y-2 pt-2 border-t border-[#e5e4de]">
                  <label className="text-xs font-black text-[#1c1c1a] uppercase block">
                    Maximum Eligible Quantity per Order
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOffer({ ...editingOffer, maxEligibleQuantity: null })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        !editingOffer.maxEligibleQuantity || editingOffer.maxEligibleQuantity <= 0
                          ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                          : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                      }`}
                    >
                      Unlimited
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingOffer({ ...editingOffer, maxEligibleQuantity: 1 })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        editingOffer.maxEligibleQuantity === 1
                          ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                          : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                      }`}
                    >
                      1 Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = editingOffer.maxEligibleQuantity;
                        setEditingOffer({ ...editingOffer, maxEligibleQuantity: current && current > 1 ? current : 2 });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        editingOffer.maxEligibleQuantity && editingOffer.maxEligibleQuantity > 1
                          ? "bg-[#8b0000] text-white border-[#8b0000] shadow-sm"
                          : "bg-white text-[#71706b] border-[#d8d7d0] hover:bg-gray-50"
                      }`}
                    >
                      Custom Limit
                    </button>
                  </div>

                  {editingOffer.maxEligibleQuantity && editingOffer.maxEligibleQuantity > 1 && (
                    <div className="flex items-center gap-2 pt-1">
                      <label className="text-[11px] font-bold text-[#71706b] uppercase">Quantity Limit:</label>
                      <input
                        type="number"
                        min="2"
                        value={editingOffer.maxEligibleQuantity}
                        onChange={(e) =>
                          setEditingOffer({
                            ...editingOffer,
                            maxEligibleQuantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                          })
                        }
                        className="w-24 px-3 py-1.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                      />
                      <span className="text-[11px] text-[#71706b]">products max discounted per order</span>
                    </div>
                  )}

                  <p className="text-[11px] text-[#71706b]">
                    {editingOffer.maxEligibleQuantity === 1
                      ? "Only 1 eligible product receives discount; remaining eligible and other items receive normal pricing."
                      : editingOffer.maxEligibleQuantity && editingOffer.maxEligibleQuantity > 1
                      ? `Up to ${editingOffer.maxEligibleQuantity} eligible products receive discount in each order.`
                      : "All eligible items in the cart will receive the discount."}
                  </p>
                </div>
              </div>

              {/* Start & Expiry Scheduling */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingOffer.startDate ? editingOffer.startDate.split("T")[0] : ""}
                    onChange={(e) => setEditingOffer({ ...editingOffer, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingOffer.expiryDate ? editingOffer.expiryDate.split("T")[0] : ""}
                    onChange={(e) => setEditingOffer({ ...editingOffer, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  />
                </div>
              </div>

              {/* Active Toggle & Claim URL */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-[#e5e4de]">
                <div>
                  <span className="text-xs font-bold text-[#1c1c1a] block">Offer Status</span>
                  <span className="text-[11px] text-[#71706b]">Enable or disable this offer immediately</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffer.isEnabled}
                    onChange={(e) => setEditingOffer({ ...editingOffer, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Claim Offer URL
                </label>
                <input
                  type="text"
                  value={editingOffer.ctaHref || "/shop"}
                  onChange={(e) => setEditingOffer({ ...editingOffer, ctaHref: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e5e4de] pt-4">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#71706b] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveOfferModal(editingOffer)}
                className="px-6 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Update Offer in Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. HOMEPAGE CARD EDIT MODAL                                               */}
      {/* ========================================================================= */}
      {isCardModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[#e5e4de]">
            <div className="flex items-center justify-between border-b border-[#e5e4de] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                  Slot #{editingCard.order} • {editingCard.section === "category_slider" ? "Category Slider" : "Bento Showcase"}
                </span>
                <h2 className="text-lg font-black text-[#1c1c1a] mt-0.5">
                  Edit Card: {editingCard.slotName}
                </h2>
              </div>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Picker (For Category Slider Cards) */}
              {editingCard.section === "category_slider" && (
                <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#1c1c1a] uppercase block">
                      Target WooCommerce Category
                    </label>
                    <span className="text-[10px] font-bold text-[#8b0000] bg-[#ffe9e6] px-2 py-0.5 rounded-md">
                      Live WooCommerce Sync
                    </span>
                  </div>
                  <select
                    value={editingCard.categorySlug || ""}
                    onChange={(e) => {
                      const selectedSlug = e.target.value;
                      const selectedCat = (wooCategories as any[]).find((c) => c.slug === selectedSlug);
                      setEditingCard({
                        ...editingCard,
                        categorySlug: selectedSlug,
                        slotName: selectedCat ? selectedCat.name : editingCard.slotName,
                        ctaHref: selectedSlug ? `/shop?category=${selectedSlug}` : "/shop",
                        title: editingCard.title === "New Category" && selectedCat ? selectedCat.name : editingCard.title,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                  >
                    <option value="">-- Select WooCommerce Category --</option>
                    {(wooCategories as any[]).map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name} ({c.count || 0} {(c.count || 0) === 1 ? "product" : "products"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#71706b]">
                    The storefront card count and Shop Now link will automatically sync with this category in WooCommerce.
                  </p>
                </div>
              )}

              {/* Product Selector (For Our Picks / Best Seller Cards) */}
              {editingCard.section === "bento" &&
                (editingCard.id === "card-bento-picks" ||
                  editingCard.id === "card-bento-bestseller" ||
                  editingCard.slotName === "Our Picks" ||
                  editingCard.slotName === "Best Seller" ||
                  editingCard.productSlug !== undefined) && (
                  <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-[#1c1c1a] uppercase block">
                        Select WooCommerce Product ({editingCard.slotName})
                      </label>
                      <span className="text-[10px] font-bold text-[#8b0000] bg-[#ffe9e6] px-2 py-0.5 rounded-md">
                        Live Product Sync
                      </span>
                    </div>

                    <select
                      value={editingCard.productSlug || ""}
                      onChange={(e) => {
                        const selectedSlug = e.target.value;
                        const selectedProd = (wooProducts as any[]).find((p) => p.slug === selectedSlug);
                        if (selectedProd) {
                          setEditingCard({
                            ...editingCard,
                            productSlug: selectedProd.slug,
                            productId: selectedProd.id,
                            ctaHref: `/products/${selectedProd.slug}`,
                            title: selectedProd.name || selectedProd.title || editingCard.title,
                            image: selectedProd.image || editingCard.image,
                          });
                        } else {
                          setEditingCard({
                            ...editingCard,
                            productSlug: "",
                            productId: undefined,
                          });
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                    >
                      <option value="">-- Select 1 WooCommerce Product --</option>
                      {(wooProducts as any[]).map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name || p.title} {p.price ? `(₹${p.price})` : ""}
                        </option>
                      ))}
                    </select>

                    <p className="text-[11px] text-[#71706b]">
                      Uses the selected product&apos;s live WooCommerce data: main image, name, and current price directly on the storefront.
                    </p>

                    {editingCard.productSlug && (
                      <div className="p-3 bg-white rounded-xl border border-[#d8d7d0] flex items-center gap-3">
                        {(() => {
                          const p = (wooProducts as any[]).find((prod) => prod.slug === editingCard.productSlug);
                          return p ? (
                            <>
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-black text-[#1c1c1a] block truncate">
                                  {p.name || p.title}
                                </span>
                                <span className="text-[11px] font-bold text-[#8b0000]">
                                  {p.price ? `₹${p.price}` : "Live Synced"}
                                </span>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                )}

              {/* Card Image Upload via WordPress Media Library (For non-product cards or custom overrides) */}
              {!(
                editingCard.section === "bento" &&
                (editingCard.id === "card-bento-picks" ||
                  editingCard.id === "card-bento-bestseller" ||
                  editingCard.slotName === "Our Picks" ||
                  editingCard.slotName === "Best Seller")
              ) && (
                <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#e5e4de] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#8b0000]" />
                      <span className="text-xs font-extrabold text-[#1c1c1a]">
                        Card Image <span className="text-[#71706b] font-normal">(WordPress Media Library)</span>
                      </span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d8d7d0] hover:border-[#8b0000] text-xs font-bold text-[#8b0000] shadow-xs cursor-pointer hover:bg-[#fff0ee] transition-colors">
                      {uploadingField === "card" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload to WordPress</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCardImageUpload}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editingCard.image}
                    onChange={(e) => setEditingCard({ ...editingCard, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d7d0] text-xs font-mono text-[#1c1c1a] focus:outline-none focus:border-[#8b0000] bg-white"
                    placeholder="https://..."
                  />

                  {editingCard.image && (
                    <div className="relative w-full max-w-[200px] aspect-[4/3] mx-auto rounded-xl overflow-hidden border border-[#d8d7d0] bg-gray-100 shadow-xs">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={editingCard.image}
                        alt={editingCard.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Card Title / Headline
                  </label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                    placeholder="e.g. Titanium Smartphones"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={editingCard.subtitle || ""}
                    onChange={(e) => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-semibold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                    placeholder="e.g. Apex Flagship Series"
                  />
                </div>
              </div>

              {/* Bento Specific: Badge & CTA Button Text */}
              {editingCard.section === "bento" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                      Badge / Label Text
                    </label>
                    <input
                      type="text"
                      value={editingCard.badge || ""}
                      onChange={(e) => setEditingCard({ ...editingCard, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                      placeholder="e.g. 50% Off or Weekend Special"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                      Button / CTA Text
                    </label>
                    <input
                      type="text"
                      value={editingCard.ctaText || ""}
                      onChange={(e) => setEditingCard({ ...editingCard, ctaText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                      placeholder="e.g. Shop Now or Get Discount"
                    />
                  </div>
                </div>
              )}

              {/* Click Redirect URL */}
              <div>
                <label className="text-xs font-bold text-[#71706b] uppercase block mb-1">
                  Click Redirect URL
                </label>
                <input
                  type="text"
                  value={editingCard.ctaHref || "/shop"}
                  onChange={(e) => setEditingCard({ ...editingCard, ctaHref: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-mono text-[#1c1c1a] focus:outline-none focus:border-[#8b0000]"
                  placeholder="/shop?category=smartphones"
                />
              </div>

              {/* Enable / Disable Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs font-black text-[#1c1c1a] block">Card Status</span>
                  <span className="text-[11px] text-[#71706b]">
                    When enabled, this card appears in the homepage layout.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCard({ ...editingCard, isEnabled: !editingCard.isEnabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    editingCard.isEnabled
                      ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                      : "bg-gray-200 text-gray-700 border border-gray-300"
                  }`}
                >
                  {editingCard.isEnabled ? "Active (Visible)" : "Disabled (Hidden)"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e5e4de] pt-4">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#d8d7d0] text-xs font-bold text-[#71706b] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCardModal(editingCard)}
                className="px-6 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Update Card in Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHomepageManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 bg-white rounded-2xl border border-[#e5e4de] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-9 h-9 text-[#8b0000] animate-spin" />
          <p className="text-xs font-bold text-[#71706b] uppercase tracking-wider">
            Loading Admin Workspace...
          </p>
        </div>
      }
    >
      <HomepageManagerContent />
    </Suspense>
  );
}
