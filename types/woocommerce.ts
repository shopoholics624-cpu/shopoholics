export interface WooImage {
  id: number;
  date_created: string;
  date_modified: string;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image?: WooImage | null;
  menu_order: number;
  count: number;
}

export interface WooBrand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: WooImage | null;
}

export interface WooAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooProductVariation {
  id: number;
  date_created: string;
  date_modified: string;
  description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  image: WooImage;
  attributes: WooVariationAttribute[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: "simple" | "variable" | "grouped" | "external";
  status: "draft" | "pending" | "private" | "publish";
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  categories: WooCategory[];
  images: WooImage[];
  attributes: WooAttribute[];
  variations: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  average_rating: string;
  rating_count: number;
}

export interface WooProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  orderby?: "date" | "id" | "include" | "title" | "slug" | "price" | "popularity" | "rating";
  order?: "asc" | "desc";
  slug?: string;
  status?: string;
}
