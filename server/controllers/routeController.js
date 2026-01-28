import axios from "axios";

export const getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (
      !origin ||
      !destination ||
      origin.lat == null ||
      origin.lng == null ||
      destination.lat == null ||
      destination.lng == null
    ) {
      return res.status(400).json({ message: "origin and destination required" });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "ORS_API_KEY not configured in server .env" });
    }

    const body = {
      coordinates: [
        [Number(origin.lng), Number(origin.lat)],
        [Number(destination.lng), Number(destination.lat)],
      ],
      // you can add options like instructions: true for step-by-step
    };

    const orsRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      body,
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const feat = orsRes.data?.features?.[0];
    if (!feat) return res.status(500).json({ message: "No route returned" });

    const summary = feat.properties?.summary || {};
    const distanceMeters = summary.distance ?? null;
    const durationSeconds = summary.duration ?? null;

    // ORS geometry.coordinates: [ [lng, lat], ... ] -> convert to [lat, lng]
    const coordinates = (feat.geometry?.coordinates || []).map((c) => [
      c[1],
      c[0],
    ]);

    return res.json({
      coordinates,
      distance: distanceMeters != null ? `${(distanceMeters / 1000).toFixed(2)} km` : null,
      duration:
        durationSeconds != null
          ? `${Math.round(durationSeconds / 60)} min`
          : null,
      raw: feat,
    });
  } catch (err) {
    console.error("getRoute error:", err?.response?.data || err.message || err);
    return res.status(500).json({ message: "Failed to fetch route" });
  }
};

export const searchPlaces = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);

    // Use Nominatim (OpenStreetMap) for place search
    const nomUrl = `https://nominatim.openstreetmap.org/search`;
    const r = await axios.get(nomUrl, {
      params: { q, format: "json", addressdetails: 0, limit: 8 },
      headers: { "User-Agent": "TravelSync/1.0 (you@example.com)" },
      timeout: 8000,
    });

    const places = (r.data || []).map((p) => ({
      name: p.display_name,
      lat: Number(p.lat),
      lng: Number(p.lon),
    }));

    return res.json(places);
  } catch (err) {
    console.error("searchPlaces error:", err?.message || err);
    return res.json([]);
  }
};