import { Product } from "@/types/product";

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "flagship-smartphone-pro",
    title: "Apex Smartphone Pro Titanium",
    tagline: "Aerospace Titanium. Neural Bionic Chip. Cinema-grade Optics.",
    category: "smartphones",
    categoryLabel: "Smartphones",
    price: 1299,
    originalPrice: 1499,
    rating: 4.9,
    reviewCount: 384,
    badge: "FLAGSHIP",
    featuredImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Forged in Grade 5 Titanium with an ultra-fine brushed finish. Powered by the groundbreaking 3nm Neural Engine processor delivering 60fps console-quality ray tracing and all-day battery performance.",
    features: [
      "Grade 5 Titanium enclosure with contoured edges",
      "Dynamic 6.8-inch ProMotion Super Retina OLED at 120Hz",
      "Quad-lens 200MP sensor array with 10x periscope optical zoom",
      "Next-Gen 3nm Neural Chip with 16-core GPU",
      "Sub-6GHz & mmWave 5G connectivity + Satellite SOS"
    ],
    isFeatured: true,
    variants: [
      {
        id: "var-1-1",
        name: "Deep Crimson / 512GB",
        colorName: "Deep Crimson",
        colorHex: "#8B0000",
        storage: "512GB",
        price: 1299,
        originalPrice: 1499,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      },
      {
        id: "var-1-2",
        name: "Natural Titanium / 512GB",
        colorName: "Natural Titanium",
        colorHex: "#A8A8A8",
        storage: "512GB",
        price: 1299,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      },
      {
        id: "var-1-3",
        name: "Obsidian Black / 1TB",
        colorName: "Obsidian Black",
        colorHex: "#1C1C1E",
        storage: "1TB",
        price: 1499,
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Display Size", value: "6.8-inch ProMotion OLED", category: "Display" },
      { name: "Resolution", value: "3120 x 1440 at 505 ppi", category: "Display" },
      { name: "Processor", value: "Neural Bionic Pro 3nm", category: "Performance" },
      { name: "RAM", value: "16GB LPDDR5X", category: "Performance" },
      { name: "Main Camera", value: "200MP f/1.4 OIS Quad Pixel", category: "Camera" },
      { name: "Telephoto", value: "50MP 10x Optical Periscope", category: "Camera" },
      { name: "Battery Capacity", value: "5,200 mAh (32h Video Playback)", category: "Battery" },
      { name: "Charging Speed", value: "80W Wired, 50W Mag-Safe", category: "Battery" },
      { name: "Weight", value: "218g Titanium Chassis", category: "Design" }
    ]
  },
  {
    id: "prod-2",
    slug: "hyperbook-ultra-16",
    title: "HyperBook Ultra 16 Titanium Laptop",
    tagline: "Unrivaled Compute. Liquid Retina XDR. 24-Hour Battery.",
    category: "laptops",
    categoryLabel: "Laptops",
    price: 2499,
    originalPrice: 2799,
    rating: 5.0,
    reviewCount: 192,
    badge: "BEST SELLER",
    featuredImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Designed for demanding creators and developers. Features a 16.2-inch Mini-LED XDR display with 1600 nits peak brightness and up to 128GB unified memory architecture.",
    features: [
      "16.2-inch Liquid Retina XDR Display (3456 x 2234)",
      "24-core CPU & 40-core GPU Unified Processor",
      "Up to 24 hours all-day battery autonomy",
      "Six-speaker sound system with force-cancelling woofers",
      "Full array of Thunderbolt 5, HDMI 2.1, and SDXC"
    ],
    isFeatured: true,
    variants: [
      {
        id: "var-2-1",
        name: "Space Black / 64GB / 2TB",
        colorName: "Space Black",
        colorHex: "#212124",
        storage: "2TB",
        price: 2499,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Display", value: "16.2-inch Mini-LED 1600 nits", category: "Display" },
      { name: "Processor", value: "24-core High Performance Chip", category: "Performance" },
      { name: "Memory", value: "64GB Unified Architecture", category: "Performance" },
      { name: "Battery", value: "100Whr (24hr endurance)", category: "Battery" }
    ]
  },
  {
    id: "prod-3",
    slug: "aero-buds-studio",
    title: "AeroBuds Studio Max ANC Headphones",
    tagline: "Acoustic Perfection. Adaptive Noise Cancelling. Spatial Audio.",
    category: "audio",
    categoryLabel: "Audio",
    price: 549,
    rating: 4.8,
    reviewCount: 512,
    badge: "NEW",
    featuredImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Custom dual dynamic drivers paired with ultra-low latency acoustic wireless streaming deliver studio-grade audio accuracy.",
    features: [
      "Custom 40mm dynamic drivers with neodymium magnets",
      "Active Noise Cancellation with 8 external microphones",
      "Lossless 24-bit 192kHz Spatial Audio playback",
      "Anodized aluminum cups with memory foam cushions",
      "40 hours listening time with ANC enabled"
    ],
    isFeatured: true,
    variants: [
      {
        id: "var-3-1",
        name: "Crimson Red",
        colorName: "Crimson Red",
        colorHex: "#8B0000",
        price: 549,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Driver Size", value: "40mm Custom Neodymium", category: "Performance" },
      { name: "Battery Life", value: "40 Hours (ANC On)", category: "Battery" },
      { name: "Weight", value: "384g Premium Aluminum", category: "Design" }
    ]
  },
  {
    id: "prod-4",
    slug: "chronos-titanium-watch",
    title: "Chronos Ultra Cellular Smartwatch",
    tagline: "Titanium Case. Sapphire Crystal. Multi-band GPS.",
    category: "wearables",
    categoryLabel: "Wearables",
    price: 799,
    originalPrice: 899,
    rating: 4.9,
    reviewCount: 228,
    badge: "LIMITED",
    featuredImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Built for extreme endurance, outdoor exploration, and precision athletic tracking with 100m water resistance.",
    features: [
      "49mm Titanium case with flat sapphire front crystal",
      "3000 nits peak brightness Always-On Retina display",
      "Precision dual-frequency L1 & L5 GPS tracking",
      "Depth gauge & water temperature sensor",
      "Up to 72 hours extended battery life"
    ],
    isFeatured: true,
    variants: [
      {
        id: "var-4-1",
        name: "Titanium Orange Alpine Loop",
        colorName: "Titanium",
        colorHex: "#D00000",
        price: 799,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Case Size", value: "49mm Grade 5 Titanium", category: "Design" },
      { name: "Display", value: "3000 nits Sapphire OLED", category: "Display" },
      { name: "Water Resistance", value: "100 meters (EN13319)", category: "Performance" }
    ]
  }
];
