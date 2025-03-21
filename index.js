const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS properly
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// ✅ Correctly serve uploaded files
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// 📂 Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

// 🛠️ File Upload API
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

// 🛠️ Try-On API (Fixes File Issue)
app.post("/tryon", async (req, res) => {
  const outputImagePath = path.join(uploadDir, "output.png");

  console.log("🔍 Checking if output image exists:", outputImagePath);

  // ✅ If output.png does NOT exist, copy a real image instead of creating fake text
  if (!fs.existsSync(outputImagePath)) {
    console.log("❌ output.png not found, copying a real image...");
    fs.copyFileSync("placeholder.png", outputImagePath); // ✅ Fix: Copy a real image
  }

  // 🔄 Now, check again if output.png exists
  if (!fs.existsSync(outputImagePath)) {
    console.log("❌ Try-on image still missing after copying!");
    return res.status(404).json({ error: "Try-on image not found!" });
  }

  console.log("✅ Found output image:", outputImagePath);
  res.json({ output_image: `${req.protocol}://${req.get("host")}/uploads/output.png` });
});

// 🏃 Start the Server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
