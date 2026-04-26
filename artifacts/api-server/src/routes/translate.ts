import { Router, type IRouter } from "express";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MAX_CACHE = 50000;
const cache = new Map<string, string>();

function cacheGet(key: string): string | undefined {
  const v = cache.get(key);
  if (v === undefined) return undefined;
  cache.delete(key);
  cache.set(key, v);
  return v;
}

function cacheSet(key: string, value: string) {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

const SUPPORTED_TARGETS = new Set(["hi", "bn"]);

async function translateOne(
  text: string,
  source: string,
  target: string,
): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VendorkartTranslate/1.0)",
      Accept: "application/json",
    },
  });
  if (!r.ok) throw new Error(`translate http ${r.status}`);
  const data = (await r.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray((data as unknown[])[0])) return text;
  const segments = (data as unknown[][])[0] as unknown[];
  return segments
    .map((seg) => {
      if (Array.isArray(seg) && typeof seg[0] === "string") return seg[0] as string;
      return "";
    })
    .join("");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i] as T, i);
    }
  }
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

router.post("/translate", async (req, res) => {
  try {
    const body = req.body ?? {};
    const texts: unknown = body.texts;
    const target: unknown = body.target;
    const source = typeof body.source === "string" ? body.source : "en";

    if (!Array.isArray(texts) || typeof target !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }
    if (!SUPPORTED_TARGETS.has(target)) {
      return res.json({ translations: texts });
    }

    const safeTexts = texts.map((t) => (typeof t === "string" ? t : ""));

    const results = await mapWithConcurrency(safeTexts, 8, async (text) => {
      if (!text || !text.trim()) return text;
      if (text.length > 4500) return text;
      const key = `${source}|${target}|${text}`;
      const cached = cacheGet(key);
      if (cached !== undefined) return cached;
      try {
        const translated = await translateOne(text, source, target);
        cacheSet(key, translated);
        return translated;
      } catch (e) {
        logger.warn(
          { err: e, snippet: text.slice(0, 60) },
          "translate one failed",
        );
        return text;
      }
    });

    res.json({ translations: results });
  } catch (e) {
    logger.error({ err: e }, "translate endpoint error");
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
