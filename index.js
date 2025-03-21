const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static("uploads")); // Serves uploaded files

// 📂 Ensure 'uploads' folder exists
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
      user_image_path: `${req.protocol}://${req.get("host")}/uploads/${req.files["user_image"][0].filename}`,
      cloth_image_path: `${req.protocol}://${req.get("host")}/uploads/${req.files["cloth_image"][0].filename}`,
    });
  }
);

// 📌 Fix `/tryon` Endpoint (Checks for Output Image)
app.post("/tryon", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Error reading uploads folder" });
    }

    // ✅ Find the latest try-on output image
    const tryOnImage = files
      .filter((file) => file.includes("output") || file.includes("result")) // Adjust based on naming
      .sort((a, b) => fs.statSync(path.join(uploadDir, b)).mtimeMs - fs.statSync(path.join(uploadDir, a)).mtimeMs)[0];

    if (!tryOnImage) {
      return res.status(404).json({ error: "Try-on image not found!" });
    }

    console.log("✅ Found try-on image:", tryOnImage);
    res.json({ output_image: `${req.protocol}://${req.get("host")}/uploads/${tryOnImage}` });
  });
});

// 🏃 Start the Server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
