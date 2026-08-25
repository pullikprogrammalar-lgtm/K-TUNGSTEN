const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxWY83YzrUruhbap9etNale6PYBKzepFzuWRwZM13DeKyiXdoTdFdCFjTqxvO3sAFcW/exec";

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {

    // =========================
    // GET
    // =========================
    if (req.method === "GET") {

      const action = req.query?.action || "applications";

      const url =
        GOOGLE_APPS_SCRIPT_URL +
        "?action=" +
        encodeURIComponent(action);

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow"
      });

      const raw = await response.text();

      let result;

      try {
        result = JSON.parse(raw);
      } catch (error) {
        return res.status(502).json({
          success: false,
          error: "Google Apps Script noto‘g‘ri javob qaytardi.",
          raw: raw.slice(0, 500)
        });
      }

      return res.status(200).json(result);
    }


    // =========================
    // POST
    // =========================
    if (req.method === "POST") {

      let body = req.body;

      if (typeof body !== "string") {
        body = JSON.stringify(body || {});
      }

      const response = await fetch(
        GOOGLE_APPS_SCRIPT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: body,
          redirect: "follow"
        }
      );

      const raw = await response.text();

      let result;

      try {
        result = JSON.parse(raw);
      } catch (error) {
        return res.status(502).json({
          success: false,
          error: "Google Apps Script noto‘g‘ri javob qaytardi.",
          raw: raw.slice(0, 500)
        });
      }

      return res.status(response.ok ? 200 : 502).json(result);
    }


    return res.status(405).json({
      success: false,
      error: "Faqat GET yoki POST so‘rovi qabul qilinadi."
    });

  } catch (error) {

    console.error(
      "Google Apps Script proxy xatosi:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Google Apps Script bilan bog‘lanib bo‘lmadi.",
      details: error?.message || "Noma’lum xatolik"
    });
  }
};
