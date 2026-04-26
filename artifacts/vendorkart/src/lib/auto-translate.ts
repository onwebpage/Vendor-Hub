import type { Language } from "./language-context";

type Lang = Language;

const NO_TRANSLATE_SELECTOR =
  "script,style,noscript,code,pre,textarea,[contenteditable='true'],[data-no-translate],.notranslate";

const TRANSLATABLE_ATTRS = [
  "placeholder",
  "title",
  "alt",
  "aria-label",
  "aria-placeholder",
  "aria-description",
] as const;

type AttrName = (typeof TRANSLATABLE_ATTRS)[number];

const SKIP_TEXT_PATTERNS: RegExp[] = [
  /^[\s\d.,:;\-+%/$₹€£¥()[\]{}|*#@!?<>=&~`'"\\]+$/u,
  /^https?:\/\//i,
  /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
];

const LOCAL_STORAGE_CACHE_KEY = "vendorkart_translate_cache_v1";
const MAX_CACHE_ENTRIES = 8000;

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

let saveTimer: number | null = null;
function saveCacheDebounced(cache: Record<string, string>) {
  if (saveTimer != null) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    try {
      const entries = Object.entries(cache);
      if (entries.length > MAX_CACHE_ENTRIES) {
        const trimmed = Object.fromEntries(
          entries.slice(entries.length - MAX_CACHE_ENTRIES),
        );
        localStorage.setItem(
          LOCAL_STORAGE_CACHE_KEY,
          JSON.stringify(trimmed),
        );
      } else {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cache));
      }
    } catch {
      // ignore quota errors
    }
  }, 1500);
}

function isAlreadyInLang(text: string, lang: Lang): boolean {
  const letters = text.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return true;
  if (lang === "en") {
    const ascii = text.match(/[A-Za-z]/g) || [];
    return ascii.length / letters.length > 0.7;
  }
  if (lang === "hi") {
    const dev = text.match(/[\u0900-\u097F]/g) || [];
    return dev.length / letters.length > 0.3;
  }
  if (lang === "bn") {
    const bn = text.match(/[\u0980-\u09FF]/g) || [];
    return bn.length / letters.length > 0.3;
  }
  return false;
}

function shouldTranslateText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  for (const re of SKIP_TEXT_PATTERNS) if (re.test(trimmed)) return false;
  if (!/\p{L}/u.test(trimmed)) return false;
  return true;
}

function isInsideNoTranslate(node: Node): boolean {
  let el: Element | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  while (el) {
    if (el.matches?.(NO_TRANSLATE_SELECTOR)) return true;
    el = el.parentElement;
  }
  return false;
}

class AutoTranslator {
  private currentLang: Lang = "en";
  private originalsText = new WeakMap<Text, string>();
  private originalsAttr = new WeakMap<Element, Map<AttrName, string>>();
  private cache: Record<string, string> = loadCache();
  private observer: MutationObserver | null = null;
  private pendingTextNodes = new Set<Text>();
  private pendingAttrEls = new Set<Element>();
  private flushTimer: number | null = null;
  private inFlight = false;
  private applyingTranslations = false;

  init() {
    if (typeof document === "undefined") return;
    if (this.observer) return;
    this.observer = new MutationObserver((muts) => {
      if (this.applyingTranslations) return;
      for (const m of muts) {
        if (m.type === "childList") {
          for (const n of Array.from(m.addedNodes)) this.collectFromNode(n);
        } else if (m.type === "characterData") {
          if (m.target.nodeType === Node.TEXT_NODE) {
            this.pendingTextNodes.add(m.target as Text);
          }
        } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
          this.pendingAttrEls.add(m.target as Element);
        }
      }
      this.scheduleFlush();
    });
    this.observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS as unknown as string[],
    });
    this.collectFromNode(document.body);
    this.scheduleFlush();
  }

  setLanguage(lang: Lang) {
    if (this.currentLang === lang && lang !== "en") {
      // Re-flush in case content changed
      this.collectFromNode(document.body);
      this.scheduleFlush();
      return;
    }
    this.currentLang = lang;
    if (lang === "en") {
      this.restoreAll();
    } else {
      // Allow React to finish re-rendering first
      window.setTimeout(() => {
        this.collectFromNode(document.body);
        this.scheduleFlush();
      }, 0);
    }
  }

  private collectFromNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!isInsideNoTranslate(node)) this.pendingTextNodes.add(node as Text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (isInsideNoTranslate(el)) return;

    // Walk text nodes
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const t = n as Text;
        const parent = t.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest?.(NO_TRANSLATE_SELECTOR))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let cur: Node | null = null;
    while ((cur = walker.nextNode())) {
      this.pendingTextNodes.add(cur as Text);
    }

    // Walk elements with translatable attributes
    if (el.matches?.(`[${TRANSLATABLE_ATTRS.join("],[")}]`)) {
      this.pendingAttrEls.add(el);
    }
    const attrSelector = TRANSLATABLE_ATTRS.map((a) => `[${a}]`).join(",");
    const attrEls = el.querySelectorAll(attrSelector);
    attrEls.forEach((e) => {
      if (!isInsideNoTranslate(e)) this.pendingAttrEls.add(e);
    });
  }

  private scheduleFlush() {
    if (this.flushTimer != null) return;
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null;
      this.flush().catch(() => {});
    }, 120);
  }

  private restoreAll() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let cur: Node | null = null;
    const updates: Array<[Text, string]> = [];
    while ((cur = walker.nextNode())) {
      const t = cur as Text;
      const orig = this.originalsText.get(t);
      if (orig != null && t.textContent !== orig) updates.push([t, orig]);
    }
    const elWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
    );
    let el: Node | null = null;
    const attrUpdates: Array<[Element, AttrName, string]> = [];
    while ((el = elWalker.nextNode())) {
      const e = el as Element;
      const map = this.originalsAttr.get(e);
      if (!map) continue;
      for (const [name, orig] of map) {
        if (e.getAttribute(name) !== orig) attrUpdates.push([e, name, orig]);
      }
    }
    this.applyingTranslations = true;
    try {
      for (const [t, v] of updates) t.textContent = v;
      for (const [e, name, v] of attrUpdates) e.setAttribute(name, v);
    } finally {
      // Yield to release observer queue
      window.setTimeout(() => {
        this.applyingTranslations = false;
      }, 0);
    }
  }

  private async flush() {
    const lang = this.currentLang;
    if (lang === "en") {
      this.pendingTextNodes.clear();
      this.pendingAttrEls.clear();
      return;
    }
    if (this.inFlight) {
      this.scheduleFlush();
      return;
    }
    if (this.pendingTextNodes.size === 0 && this.pendingAttrEls.size === 0) {
      return;
    }
    this.inFlight = true;
    try {
      const textNodes = Array.from(this.pendingTextNodes);
      const attrEls = Array.from(this.pendingAttrEls);
      this.pendingTextNodes.clear();
      this.pendingAttrEls.clear();

      // Build a map: source string -> list of targets to update
      type TextTarget = { kind: "text"; node: Text };
      type AttrTarget = { kind: "attr"; el: Element; attr: AttrName };
      const targetsBySource = new Map<string, Array<TextTarget | AttrTarget>>();
      const cachedApplications: Array<
        [TextTarget | AttrTarget, string]
      > = [];

      const addTarget = (source: string, t: TextTarget | AttrTarget) => {
        const cacheKey = `${lang}|${source}`;
        const cached = this.cache[cacheKey];
        if (cached !== undefined) {
          cachedApplications.push([t, cached]);
          return;
        }
        const list = targetsBySource.get(source) ?? [];
        list.push(t);
        targetsBySource.set(source, list);
      };

      for (const node of textNodes) {
        if (!node.isConnected) continue;
        if (isInsideNoTranslate(node)) continue;
        const current = node.textContent ?? "";
        if (!shouldTranslateText(current)) continue;
        const stored = this.originalsText.get(node);
        if (isAlreadyInLang(current, lang)) {
          // Already translated (likely via t.* or previous run). Don't re-translate.
          continue;
        }
        const source = stored ?? current;
        if (stored == null) this.originalsText.set(node, current);
        addTarget(source, { kind: "text", node });
      }

      for (const el of attrEls) {
        if (!el.isConnected) continue;
        if (isInsideNoTranslate(el)) continue;
        let map = this.originalsAttr.get(el);
        for (const attr of TRANSLATABLE_ATTRS) {
          const current = el.getAttribute(attr);
          if (current == null) continue;
          if (!shouldTranslateText(current)) continue;
          if (isAlreadyInLang(current, lang)) continue;
          if (!map) {
            map = new Map();
            this.originalsAttr.set(el, map);
          }
          const stored = map.get(attr);
          const source = stored ?? current;
          if (stored == null) map.set(attr, current);
          addTarget(source, { kind: "attr", el, attr });
        }
      }

      // Apply cached translations immediately
      this.applyTranslations(cachedApplications);

      const sources = Array.from(targetsBySource.keys());
      if (sources.length === 0) return;

      const CHUNK = 60;
      for (let i = 0; i < sources.length; i += CHUNK) {
        const chunk = sources.slice(i, i + CHUNK);
        let translations: string[] = chunk;
        try {
          const r = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts: chunk, target: lang, source: "en" }),
          });
          if (r.ok) {
            const data = (await r.json()) as { translations?: string[] };
            translations = data.translations ?? chunk;
          }
        } catch {
          // network error — leave as-is
        }
        const applications: Array<[TextTarget | AttrTarget, string]> = [];
        for (let k = 0; k < chunk.length; k++) {
          const src = chunk[k] as string;
          const trans = translations[k] ?? src;
          this.cache[`${lang}|${src}`] = trans;
          const targets = targetsBySource.get(src) ?? [];
          for (const t of targets) applications.push([t, trans]);
        }
        this.applyTranslations(applications);
        saveCacheDebounced(this.cache);
      }
    } finally {
      this.inFlight = false;
      if (
        this.pendingTextNodes.size > 0 ||
        this.pendingAttrEls.size > 0
      ) {
        this.scheduleFlush();
      }
    }
  }

  private applyTranslations(
    applications: Array<
      [
        { kind: "text"; node: Text } | { kind: "attr"; el: Element; attr: AttrName },
        string,
      ]
    >,
  ) {
    if (applications.length === 0) return;
    this.applyingTranslations = true;
    try {
      for (const [target, value] of applications) {
        if (target.kind === "text") {
          if (target.node.isConnected && target.node.textContent !== value) {
            target.node.textContent = value;
          }
        } else {
          if (target.el.isConnected && target.el.getAttribute(target.attr) !== value) {
            target.el.setAttribute(target.attr, value);
          }
        }
      }
    } finally {
      window.setTimeout(() => {
        this.applyingTranslations = false;
      }, 0);
    }
  }
}

export const autoTranslator = new AutoTranslator();
