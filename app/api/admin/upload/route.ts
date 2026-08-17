import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return map[ext.toLowerCase()] || "image/jpeg";
}

function getWordPressAppCredentials() {
  const url = (process.env.WOOCOMMERCE_URL || "https://shopoholics.in").replace(/\/+$/, "");

  // Read server-side WordPress Application Password credentials from environment
  const username =
    process.env.WORDPRESS_USERNAME ||
    process.env.WP_USERNAME ||
    process.env.WP_ADMIN_USER;

  const appPassword =
    process.env.WORDPRESS_APPLICATION_PASSWORD ||
    process.env.WP_APPLICATION_PASSWORD ||
    process.env.WORDPRESS_APP_PASSWORD;

  if (!username || !appPassword) {
    return {
      baseUrl: url,
      authHeader: null,
      error:
        "WordPress Application Password is not configured. Please set WORDPRESS_USERNAME and WORDPRESS_APPLICATION_PASSWORD in .env.local.",
    };
  }

  // Sanitize application password (remove extraneous whitespace while preserving password characters)
  const cleanAppPass = appPassword.trim();
  const cleanUsername = username.trim();
  const authHeader = `Basic ${Buffer.from(`${cleanUsername}:${cleanAppPass}`).toString("base64")}`;

  return {
    baseUrl: url,
    authHeader,
    error: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAuthenticatedAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "hero";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in upload request." },
        { status: 400 }
      );
    }

    const creds = getWordPressAppCredentials();
    if (!creds.authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: creds.error,
        },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "banner.jpg";
    const lastDotIndex = originalName.lastIndexOf(".");
    const ext = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : ".jpg";
    const rawBaseName = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
    const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${type}_${Date.now()}_${cleanBaseName}${ext}`;
    const contentType = file.type || getMimeType(ext);

    // Direct Upload to WordPress Media Library via WordPress REST API (/wp-json/wp/v2/media)
    const mediaEndpointUrl = `${creds.baseUrl}/wp-json/wp/v2/media`;

    const wpRes = await fetch(mediaEndpointUrl, {
      method: "POST",
      headers: {
        Authorization: creds.authHeader,
        "Content-Disposition": `attachment; filename="${uniqueFileName}"`,
        "Content-Type": contentType,
      },
      body: buffer,
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok) {
      console.error("[WP Media Upload Error]:", wpData);
      const errorMsg =
        wpData.message || wpData.code || "Failed to upload image to WordPress Media Library.";
      return NextResponse.json(
        {
          success: false,
          error: `WordPress Media Upload Failed: ${errorMsg}`,
          details: wpData,
        },
        { status: wpRes.status || 500 }
      );
    }

    // Extract the authoritative WordPress source_url
    const sourceUrl = wpData.source_url || wpData.guid?.rendered || wpData.link;

    if (!sourceUrl) {
      throw new Error("WordPress Media Library did not return a valid image URL.");
    }

    return NextResponse.json({
      success: true,
      url: sourceUrl,
      mediaId: wpData.id,
      fileName: uniqueFileName,
      size: buffer.length,
      mimeType: contentType,
    });
  } catch (err: any) {
    console.error("[API Admin Upload POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during image upload." },
      { status: 500 }
    );
  }
}
