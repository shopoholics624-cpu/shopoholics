import { Product } from "@/types/product";

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "flagship-smartphone-pro",
    title: "Apex Smartphone Pro Titanium",
    tagline: "Aerospace Titanium. Neural Bionic Chip. Cinema-grade Optics.",
    brand: "Apple",
    category: "smartphones",
    categoryLabel: "Smartphones",
    lifestyle: ["travel", "photography", "work"],
    price: 1299,
    originalPrice: 1499,
    rating: 4.9,
    reviewCount: 384,
    badge: "FLAGSHIP",
    isFeatured: true,
    isTrending: true,
    isNewArrival: true,
    discountPercentage: 13,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
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
    brand: "Apple",
    category: "laptops",
    categoryLabel: "Laptops",
    lifestyle: ["work", "creator", "student"],
    price: 2499,
    originalPrice: 2799,
    rating: 5.0,
    reviewCount: 192,
    badge: "BEST SELLER",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 11,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
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
    variants: [
      {
        id: "var-2-1",
        name: "Space Black / 64GB RAM / 2TB SSD",
        colorName: "Space Black",
        colorHex: "#1E1E20",
        storage: "2TB",
        price: 2499,
        originalPrice: 2799,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      },
      {
        id: "var-2-2",
        name: "Silver / 128GB RAM / 4TB SSD",
        colorName: "Silver",
        colorHex: "#E3E3E3",
        storage: "4TB",
        price: 3299,
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Screen Size", value: "16.2-inch Mini-LED XDR", category: "Display" },
      { name: "Peak Brightness", value: "1,600 nits HDR", category: "Display" },
      { name: "Processor", value: "Ultra Max 24-Core CPU", category: "Performance" },
      { name: "GPU Memory", value: "40-Core Graphics Engine", category: "Performance" },
      { name: "Battery Life", value: "Up to 24 Hours", category: "Battery" },
      { name: "Thunderbolt Ports", value: "3x Thunderbolt 5 (80Gbps)", category: "Connectivity" }
    ]
  },
  {
    id: "prod-3",
    slug: "aerobuds-studio-max",
    title: "AeroBuds Studio Max ANC Headphones",
    tagline: "Active Spatial Audio. Lossless Acoustic Drivers.",
    brand: "Sony",
    category: "audio",
    categoryLabel: "Audio & Acoustics",
    lifestyle: ["music", "travel", "work"],
    price: 549,
    originalPrice: 599,
    rating: 4.8,
    reviewCount: 420,
    badge: "FLAGSHIP",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 8,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Immerse in studio master audio. Precision engineered 40mm custom dynamic drivers deliver uncompressed high-resolution acoustic fidelity with transparent spatial tracking.",
    features: [
      "Dual ANC processors with 8-mic ambient noise rejection",
      "Lossless 24-bit/192kHz Bluetooth 5.4 streaming",
      "Dynamic Head Tracking Spatial Audio",
      "40-Hour continuous battery life with quick-charge",
      "Memory foam ear cushions wrapped in breathable mesh"
    ],
    variants: [
      {
        id: "var-3-1",
        name: "Matte Black",
        colorName: "Matte Black",
        colorHex: "#111111",
        price: 549,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      },
      {
        id: "var-3-2",
        name: "Crimson Red",
        colorName: "Crimson Red",
        colorHex: "#8B0000",
        price: 549,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Driver Size", value: "40mm Custom Dynamic", category: "Performance" },
      { name: "Noise Cancellation", value: "Adaptive Active ANC", category: "Performance" },
      { name: "Battery Life", value: "40 Hours (ANC On)", category: "Battery" },
      { name: "Weight", value: "384g Premium Aluminum", category: "Design" }
    ]
  },
  {
    id: "prod-4",
    slug: "chronos-watch-ultra",
    title: "Chronos Watch Ultra Titanium",
    tagline: "Grade 5 Titanium. Sapphire Crystal. Dual-Freq GPS.",
    brand: "Apple",
    category: "wearables",
    categoryLabel: "Smart Watches",
    lifestyle: ["smarthome", "travel"],
    price: 799,
    originalPrice: 899,
    rating: 4.9,
    reviewCount: 264,
    badge: "BEST SELLER",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 11,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Built for extreme endurance and precision tracking. Features a 49mm Grade 5 Titanium case, 3000 nits flat sapphire front display crystal, and 100m water resistance.",
    features: [
      "49mm Titanium case with raised screen bezel",
      "Precision L1 and L5 dual-frequency GPS",
      "Depth gauge with water temperature sensor",
      "Up to 72 hours battery life in Low Power Mode",
      "ECG, Blood Oxygen, and Advanced Temperature Sensing"
    ],
    variants: [
      {
        id: "var-4-1",
        name: "Titanium / Orange Alpine Loop",
        colorName: "Titanium Orange",
        colorHex: "#FF6600",
        price: 799,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      },
      {
        id: "var-4-2",
        name: "Titanium / Dark Ocean Band",
        colorName: "Dark Ocean",
        colorHex: "#0F2B48",
        price: 799,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Case Size", value: "49mm Grade 5 Titanium", category: "Design" },
      { name: "Display", value: "3,000 nits Sapphire Crystal", category: "Display" },
      { name: "Water Resistance", value: "100m ISO 22810 standard", category: "Performance" },
      { name: "Battery Life", value: "36h normal, 72h low power", category: "Battery" }
    ]
  },
  {
    id: "prod-5",
    slug: "rog-strix-gaming-console-rig",
    title: "ROG Matrix RTX 4090 Gaming Workstation",
    tagline: "Uncompromised 4K 240Hz Ray Tracing Powerhouse.",
    brand: "ASUS",
    category: "gaming",
    categoryLabel: "Gaming Consoles & PCs",
    lifestyle: ["gaming", "creator"],
    price: 3499,
    originalPrice: 3899,
    rating: 5.0,
    reviewCount: 145,
    badge: "HOT",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 10,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "The ultimate flagship gaming beast. Equipped with NVIDIA GeForce RTX 4090 24GB VRAM, Intel i9 14900KS liquid cooled processor, and custom ROG liquid loop.",
    features: [
      "NVIDIA GeForce RTX 4090 24GB GDDR6X",
      "Intel Core i9-14900KS (24 Cores, 6.0 GHz)",
      "64GB DDR5 7200MHz RGB Memory",
      "4TB PCIe Gen5 NVMe M.2 SSD",
      "Custom ROG AIO 360mm Liquid Cooling System"
    ],
    variants: [
      {
        id: "var-5-1",
        name: "Cyber Black / RTX 4090",
        colorName: "Cyber Black",
        colorHex: "#151515",
        price: 3499,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Graphics Card", value: "NVIDIA RTX 4090 24GB", category: "Performance" },
      { name: "Processor", value: "Intel i9-14900KS 6.0GHz", category: "Performance" },
      { name: "RAM", value: "64GB DDR5 7200MHz", category: "Performance" },
      { name: "Storage", value: "4TB PCIe 5.0 NVMe SSD", category: "Storage" }
    ]
  },
  {
    id: "prod-6",
    slug: "lumix-8k-cinema-camera",
    title: "Lumix Medium Format 8K Cinema Camera",
    tagline: "Full-Frame 8K ProRes RAW. 16-Stop Dynamic Range.",
    brand: "Canon",
    category: "cameras",
    categoryLabel: "Cameras & Drones",
    lifestyle: ["photography", "creator"],
    price: 3899,
    originalPrice: 4299,
    rating: 4.9,
    reviewCount: 98,
    badge: "EDITOR CHOICE",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 9,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Designed for cinematic storytellers. Features a 45MP full-frame CMOS sensor capable of recording 8K RAW video at 60fps with internal cooling and dual-pixel AF III.",
    features: [
      "45MP Full-Frame CMOS Sensor",
      "8K 60fps RAW & 4K 120fps High Frame Rate Video",
      "16+ Stops Dynamic Range with V-Log Color Profile",
      "5-Axis In-Body Image Stabilization (8 Stops)",
      "Dual CFexpress Type B and SD UHS-II slots"
    ],
    variants: [
      {
        id: "var-6-1",
        name: "Matte Slate Body",
        colorName: "Matte Slate",
        colorHex: "#2B2B2B",
        price: 3899,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Sensor", value: "45MP Full-Frame CMOS", category: "Camera" },
      { name: "Video Resolution", value: "8K 60p RAW internal", category: "Camera" },
      { name: "ISO Range", value: "100-51,200 (Expandable to 102,400)", category: "Camera" },
      { name: "Stabilization", value: "8-Stop IBIS", category: "Performance" }
    ]
  },
  {
    id: "prod-7",
    slug: "nexus-smart-home-hub",
    title: "Nexus Thread & Matter Smart Home Controller",
    tagline: "Centralized AI Automation. Local Processing Security.",
    brand: "Samsung",
    category: "smarthome",
    categoryLabel: "Smart Home Automation",
    lifestyle: ["smarthome", "office"],
    price: 299,
    originalPrice: 349,
    rating: 4.7,
    reviewCount: 180,
    badge: "NEW",
    isFeatured: false,
    isTrending: true,
    discountPercentage: 14,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "The brain of your modern connected home. Supports Thread, Matter, Zigbee 3.0, and Wi-Fi 7 with zero-latency local automation rule processing.",
    features: [
      "Universal Matter and Thread protocol mesh support",
      "7-inch HD Glass Touchscreen Interface",
      "Encrypted Local Processing (No Cloud Required)",
      "Built-in 360° Presence Sensor & Temperature Monitor"
    ],
    variants: [
      {
        id: "var-7-1",
        name: "Crisp White",
        colorName: "Crisp White",
        colorHex: "#FFFFFF",
        price: 299,
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Protocols", value: "Thread, Matter, Zigbee, Wi-Fi 7", category: "Connectivity" },
      { name: "Display", value: "7.0-inch HD IPS Touchscreen", category: "Display" },
      { name: "Security", value: "AES-256 Local Hardware Encryption", category: "Performance" }
    ]
  },
  {
    id: "prod-8",
    slug: "rog-swift-oled-4k-monitor",
    title: "ROG Swift 32-inch 4K 240Hz OLED Gaming Monitor",
    tagline: "0.03ms Response Time. Quantum Dot OLED Contrast.",
    brand: "ASUS",
    category: "monitors",
    categoryLabel: "Monitors & Displays",
    lifestyle: ["gaming", "creator", "work"],
    price: 1299,
    originalPrice: 1399,
    rating: 4.9,
    reviewCount: 210,
    badge: "BEST SELLER",
    isFeatured: true,
    isTrending: true,
    discountPercentage: 7,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "World's first 32-inch 4K QD-OLED gaming display operating at a hyper-fluid 240Hz refresh rate with true 10-bit color depth and 1,500,000:1 contrast ratio.",
    features: [
      "31.5-inch 4K UHD (3840 x 2160) QD-OLED panel",
      "240Hz refresh rate with ultra-fast 0.03ms GTG response",
      "Custom Heatsink and Graphene Panel Cooling",
      "99% DCI-P3 color gamut with Delta E < 2 calibration",
      "USB-C Hub with 90W Power Delivery"
    ],
    variants: [
      {
        id: "var-8-1",
        name: "Graphite Black",
        colorName: "Graphite Black",
        colorHex: "#1E1E1E",
        price: 1299,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop",
        inStock: true
      }
    ],
    specs: [
      { name: "Panel Type", value: "32-inch QD-OLED 4K", category: "Display" },
      { name: "Refresh Rate", value: "240Hz", category: "Display" },
      { name: "Response Time", value: "0.03ms GTG", category: "Performance" },
      { name: "Color Accuracy", value: "99% DCI-P3, Delta E < 2", category: "Display" }
    ]
  }
];
