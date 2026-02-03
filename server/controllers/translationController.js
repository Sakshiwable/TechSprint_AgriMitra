import axios from "axios";
import TranslationCache from "../models/TranslationCache.js";

// GET /api/translate/content/:sourceId?lang=hi
export const getContent = async (req, res) => {
  const { sourceId } = req.params;
  const target =
    req.query.lang ||
    req.userLanguage ||
    (req.headers["accept-language"]
      ? req.headers["accept-language"].split(",")[0].split("-")[0]
      : "en");

  try {
    const doc = await TranslationCache.findOne({ sourceId });
    if (!doc)
      return res.status(404).json({ success: false, error: "not found" });

    // increment access asynchronously
    doc.incrementAccess().catch(() => {});

    // return original when requested
    if (target === "orig" || target === doc.originalLang) {
      return res.json({ html: doc.originalContent, fromCache: true });
    }

    // check cache
    const cached = doc.getTranslation(target);
    if (cached) {
      return res.json({ html: cached, fromCache: true });
    }

    // call translation microservice
    const translatorUrl = process.env.TRANSLATOR_URL || "http://localhost:8001";
    const payload = {
      source_id: sourceId,
      html: doc.originalContent,
      source_lang: doc.originalLang,
      target_lang: target,
    };

    const r = await axios.post(`${translatorUrl}/translate`, payload, {
      timeout: 120000,
    });
    const translatedHtml = r.data?.translated_html || r.data?.html || "";
    const model = r.data?.model || "unknown";
    const confidence = r.data?.confidence ?? null;

    // persist translation into map fields
    try {
      doc.setTranslation(target, translatedHtml, confidence);
      await doc.save();
    } catch (e) {
      console.warn("[translate] failed to save translation cache", e.message);
    }

    return res.json({
      html: translatedHtml,
      fromCache: false,
      model,
      confidence,
    });
  } catch (err) {
    console.error("[translate] error", err.message);
    // fallback to original content
    try {
      const doc = await TranslationCache.findOne({ sourceId });
      if (doc) return res.json({ html: doc.originalContent, fallback: true });
    } catch (e) {
      console.error("[translate] fallback lookup failed", e.message);
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

export default { getContent };
