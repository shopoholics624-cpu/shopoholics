import { getDb } from "@/lib/firebase-admin";
import { HomepageConfig, HeroSlide, AnnouncementItem, HomepageOffer, HomepageCard } from "@/types/homepage";
import { DEFAULT_HERO_SLIDES, DEFAULT_ANNOUNCEMENTS, DEFAULT_OFFERS, DEFAULT_CARDS } from "@/constants/homepage";

export { DEFAULT_HERO_SLIDES, DEFAULT_ANNOUNCEMENTS, DEFAULT_OFFERS, DEFAULT_CARDS };

const HOMEPAGE_DOC_REF = "homepage_settings";
const MAIN_DOC_ID = "main";

export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    const db = getDb();
    const doc = await db.collection(HOMEPAGE_DOC_REF).doc(MAIN_DOC_ID).get();
    if (doc.exists) {
      const data = doc.data() as HomepageConfig;
      return {
        heroSlides: Array.isArray(data.heroSlides) ? data.heroSlides : DEFAULT_HERO_SLIDES,
        announcements: Array.isArray(data.announcements) ? data.announcements : DEFAULT_ANNOUNCEMENTS,
        offers: Array.isArray(data.offers) ? data.offers : DEFAULT_OFFERS,
        cards: Array.isArray(data.cards) ? data.cards : DEFAULT_CARDS,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[HomepageStore] Firestore read error, using fallback defaults:", err);
  }

  return {
    heroSlides: DEFAULT_HERO_SLIDES,
    announcements: DEFAULT_ANNOUNCEMENTS,
    offers: DEFAULT_OFFERS,
    cards: DEFAULT_CARDS,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveHomepageConfig(config: Partial<HomepageConfig>): Promise<HomepageConfig> {
  const current = await getHomepageConfig();
  const updated: HomepageConfig = {
    heroSlides: config.heroSlides ?? current.heroSlides,
    announcements: config.announcements ?? current.announcements,
    offers: config.offers ?? current.offers,
    cards: config.cards ?? current.cards,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = getDb();
    await db.collection(HOMEPAGE_DOC_REF).doc(MAIN_DOC_ID).set(updated, { merge: true });
  } catch (err: any) {
    console.error("[HomepageStore] Firestore write error:", err);
    throw new Error(`Failed to save homepage settings to database: ${err.message}`);
  }

  return updated;
}
