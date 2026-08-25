// Vercel Serverless Function
// K-TUNGSTEN saytining arizalarini Google Apps Script'ga
// server tomondan xavfsiz uzatadi.

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxEkpJe2_ucfzKHpdb0fDxyScxRaRRc_2sWkWDaOgGGVMvF91v7IYZWuXwR8T0eveFK/exec";

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Faqat POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Faqat POST so‘rovi qabul qilinadi."
    });
  }

  try {
    let body = req.body;

    // Vercel body obyekt yoki string bo‘lishi mumkin
    if (typeof body !== "string") {
      body = JSON.stringify(body || {});
    }

    // 1. Google Apps Script'ga dastlabki POST
    let response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body,
      redirect: "manual"
    });

    // 2. Google Apps Script redirect qilsa,
    // yangi manzilga POST'ni qayta yuboramiz
    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")
    ) {
      const redirectUrl = response.headers.get("location");

      response = await fetch(redirectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body,
        redirect: "follow"
      });
    }

    const raw = await response.text();

    // JSON javobni tekshiramiz
    let result;

    try {
      result = JSON.parse(raw);
    } catch (parseError) {
      console.error("Google Apps Script javobi:", raw);

      return res.status(502).json({
        success: false,
        error: "Google Apps Script JSON formatida javob qaytarmadi.",
        status: response.status,
        raw: raw.slice(0, 1000)
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
