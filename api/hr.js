// Vercel Serverless Function
// K-TUNGSTEN saytining arizalarini Google Apps Script'ga xavfsiz server tomondan uzatadi.

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxOH_jZNzmP60aidplfRsSjBeyAq0FDwxuGS1QrGMRh3_Ppwb2TmiaZJO1BPpOlZYqf/exec";

module.exports = async (req, res) => {
  // CORS: saytning o‘zi bilan ishlash uchun
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Faqat POST so‘rovi qabul qilinadi."
    });
  }

  try {
    let body = req.body;

    // Vercel ayrim holatlarda body'ni string, ayrim holatlarda obyekt qilib beradi.
    if (typeof body !== "string") {
      body = JSON.stringify(body || {});
    }

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body,
      redirect: "follow"
    });

    const raw = await response.text();

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        success: false,
        error: "Google Apps Script noto‘g‘ri javob qaytardi.",
        raw: raw.slice(0, 500)
      });
    }

    return res.status(response.ok ? 200 : 502).json(result);
  } catch (error) {
    console.error("Google Apps Script proxy xatosi:", error);

    return res.status(500).json({
      success: false,
      error: "Google Apps Script bilan bog‘lanib bo‘lmadi.",
      details: error?.message || "Noma’lum xatolik"
    });
  }
};
