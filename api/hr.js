const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxWY83YzrUruhbap9etNale6PYBKzepFzuWRwZM13DeKyiXdoTdFdCFjTqxvO3sAFcW/exec";

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // GET — ulanishni tekshirish uchun
  if (req.method === "GET") {
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "GET",
        redirect: "follow"
      });

      const raw = await response.text();

      let result;

      try {
        result = JSON.parse(raw);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Google Apps Script JSON qaytarmadi.",
          status: response.status,
          raw: raw.slice(0, 1000)
        });
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error("GAS GET xatosi:", error);

      return res.status(500).json({
        success: false,
        error: "Google Apps Script bilan bog‘lanib bo‘lmadi.",
        details: error.message
      });
    }
  }

  // POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Faqat GET va POST so‘rovlari qabul qilinadi."
    });
  }

  try {
    let body = req.body;

    if (typeof body !== "string") {
      body = JSON.stringify(body || {});
    }

    console.log("HR → GAS:", body);

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body,
      redirect: "follow"
    });

    const raw = await response.text();

    console.log("GAS javobi:", raw);

    let result;

    try {
      result = JSON.parse(raw);
    } catch (e) {
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
