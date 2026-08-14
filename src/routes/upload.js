import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB — lesson videos run longer than a portfolio intro clip
});

router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";

  const uploadFromBuffer = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: "cloudsec-studio" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

  try {
    const result = await uploadFromBuffer();
    res.status(201).json({ url: result.secure_url, resourceType });
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;