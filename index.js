import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import fetch from "node-fetch"; 


const app = express();
const PORT = 5000;

// ✅ Use Render URL (Replace with your actual Render backend URL)
const RENDER_BACKEND_URL = "https://your-render-backend.onrender.com"; 

app.use(cors());

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📸 Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 🛠️ API Route to Handle File Uploads
app.post(
  "/upload",
  upload.fields([
    { name: "user_image", maxCount: 1 },
    { name: "cloth_image", maxCount: 1 },
  ]),
  (req, res) => {
    if (!req.files || !req.files["user_image"] || !req.files["cloth_image"]) {
      return res.status(400).json({ error: "Missing files!" });
    }

    res.json({
      user_image_path: `${RENDER_BACKEND_URL}/uploads/${req.files["user_image"][0].filename}`,
      cloth_image_path: `${RENDER_BACKEND_URL}/uploads/${req.files["cloth_image"][0].filename}`,
    });
  }
);

// 🔄 Try-On API (Calls Render Backend)
app.post("/tryon", async (req, res) => {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/tryon`, { method: "POST" });
    const data = await response.json();

    if (data.output_image) {
      res.json({ output_image: data.output_image });
    } else {
      res.status(500).json({ error: "Try-on failed from Render!" });
    }
  } catch (error) {
    console.error("❌ Error calling Render backend:", error);
    res.status(500).json({ error: "Render API not reachable!" });
  }
});

// 🏃 Start the Server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
