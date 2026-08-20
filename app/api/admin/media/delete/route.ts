import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getWordPressAppCredentials() {
  const url = (process.env.WOOCOMMERCE_URL || "https://wp.shopoholics.in").replace(/\/+$/, "");

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
      error: "WordPress Application Password is not configured in .env.local (WORDPRESS_USERNAME / WORDPRESS_APPLICATION_PASSWORD).",
    };
  }

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

    const body = await req.json();
    const { mediaId, oldUrl } = body;

    const creds = getWordPressAppCredentials();
    if (!creds.authHeader) {
      console.error("[WP Media Delete] Error: Credentials not configured");
      return NextResponse.json({ success: false, error: creds.error }, { status: 500 });
    }

    let targetId = Number(mediaId);
    let resolvedItem: any = null;

    // 1. If mediaId is not provided, resolve it from the WordPress REST API using oldUrl
    if ((!targetId || isNaN(targetId) || targetId <= 0) && oldUrl && typeof oldUrl === "string") {
      if (oldUrl.includes("/wp-content/uploads/")) {
        try {
          const urlObj = new URL(oldUrl);
          const pathSegments = urlObj.pathname.split("/");
          const rawFileName = pathSegments[pathSegments.length - 1]; // e.g. hero-desktop_178689...jpg.jpeg
          const lastDotIdx = rawFileName.lastIndexOf(".");
          const baseNameWithoutExt = lastDotIdx !== -1 ? rawFileName.slice(0, lastDotIdx) : rawFileName;

          console.log(`[WP Media Delete] Resolving attachment for old URL: ${oldUrl}, Search Term: ${baseNameWithoutExt}`);

          const searchUrl = `${creds.baseUrl}/wp-json/wp/v2/media?search=${encodeURIComponent(baseNameWithoutExt)}&per_page=20`;
          const searchRes = await fetch(searchUrl, {
            headers: { Authorization: creds.authHeader },
            cache: "no-store",
          });

          if (searchRes.ok) {
            const items = await searchRes.json();
            if (Array.isArray(items) && items.length > 0) {
              // Find exact matching item
              resolvedItem = items.find((item: any) => {
                const itemSource = item.source_url || item.guid?.rendered || "";
                const itemFile = item.media_details?.file || "";
                return (
                  itemSource === oldUrl ||
                  itemSource.endsWith(rawFileName) ||
                  itemFile.endsWith(rawFileName) ||
                  (item.slug && baseNameWithoutExt.includes(item.slug))
                );
              });

              if (resolvedItem && resolvedItem.id) {
                targetId = resolvedItem.id;
                console.log(`[WP Media Delete] Successfully resolved old attachment ID: ${targetId} for URL: ${oldUrl}`);
              }
            }
          } else {
            console.warn(`[WP Media Delete] Search request failed with status: ${searchRes.status}`);
          }
        } catch (searchErr) {
          console.error("[WP Media Delete] Exception resolving old URL:", searchErr);
        }
      }
    }

    if (!targetId || isNaN(targetId) || targetId <= 0) {
      const msg = `Unable to resolve old WordPress Media Attachment ID for URL: ${oldUrl || "unknown"}`;
      console.warn(`[WP Media Delete] ${msg}`);
      return NextResponse.json(
        {
          success: false,
          error: msg,
          skipped: true,
        },
        { status: 400 }
      );
    }

    // 2. Perform verified deletion on WordPress REST API
    const deleteUrl = `${creds.baseUrl}/wp-json/wp/v2/media/${targetId}?force=true`;
    console.log(`[WP Media Delete] Initiating DELETE on endpoint: ${deleteUrl}`);
    console.log(`[WP Media Delete] Target Attachment ID: ${targetId}, Associated URL: ${oldUrl || "N/A"}`);

    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: creds.authHeader,
      },
      cache: "no-store",
    });

    const wpData = await deleteRes.json();

    console.log(`[WP Media Delete] HTTP Status: ${deleteRes.status} ${deleteRes.statusText}`);
    console.log(`[WP Media Delete] WordPress Response:`, JSON.stringify(wpData));

    if (!deleteRes.ok) {
      const errorMsg = wpData.message || wpData.code || `Failed to delete attachment ${targetId}`;
      console.error(`[WP Media Delete Error]:`, errorMsg);
      return NextResponse.json(
        {
          success: false,
          error: `WordPress Media Library Delete Failed: ${errorMsg}`,
          targetId,
          oldUrl,
          details: wpData,
        },
        { status: deleteRes.status || 500 }
      );
    }

    console.log(`[WP Media Delete Success] Attachment ${targetId} (${oldUrl || "hero asset"}) permanently deleted.`);

    return NextResponse.json({
      success: true,
      message: `Attachment ${targetId} permanently deleted from WordPress Media Library.`,
      deletedMediaId: targetId,
      oldUrl,
    });
  } catch (err: any) {
    console.error("[API Admin Media Delete Fatal Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during media deletion." },
      { status: 500 }
    );
  }
}
