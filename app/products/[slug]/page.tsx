import { Metadata } from "next";
import { getWooProductBySlug, getWooProductById } from "@/lib/woocommerce";
import { PRODUCTS } from "@/constants/products";
import ProductDetailClient from "./client-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const targetSlug = decodeURIComponent(rawSlug || "").toLowerCase();

  const product =
    (await getWooProductBySlug(targetSlug)) ||
    (await getWooProductById(targetSlug)) ||
    PRODUCTS.find(
      (p) =>
        p.slug.toLowerCase() === targetSlug ||
        p.id.toLowerCase() === targetSlug
    ) ||
    null;

  return {
    title: product ? `${product.title} | Shop-O-Holics Crimson Luxe` : "Product Not Found | Shop-O-Holics",
    description: product?.tagline || product?.description?.slice(0, 160) || "Explore premium tech flagships.",
    openGraph: {
      title: product ? `${product.title} | Shop-O-Holics` : "Product Not Found",
      description: product?.tagline || product?.description?.slice(0, 160),
      images: product ? [{ url: product.featuredImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title || "Product Not Found",
      description: product?.tagline || product?.description?.slice(0, 160),
      images: product ? [product.featuredImage] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const targetSlug = decodeURIComponent(rawSlug || "").toLowerCase();

  const initialProduct =
    (await getWooProductBySlug(targetSlug)) ||
    (await getWooProductById(targetSlug)) ||
    PRODUCTS.find(
      (p) =>
        p.slug.toLowerCase() === targetSlug ||
        p.id.toLowerCase() === targetSlug
    ) ||
    null;

  return <ProductDetailClient initialProduct={initialProduct} slug={targetSlug} />;
}
