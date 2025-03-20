const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const axios = require("axios");
const path = require("path");
const fs = require("fs");  // Missing import

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.fields([{ name: "user_image" }, { name: "cloth_image" }]), async (req, res) => {
    if (!req.files || !req.files["user_image"] || !req.files["cloth_image"]) {
        return res.status(400).json({ error: "Missing files!" });
    }

    // Resize images before sending to ACGPN
    const resizedUserImage = path.join(__dirname, "uploads", "resized_user.jpg");
    const resizedClothImage = path.join(__dirname, "uploads", "resized_cloth.jpg");

    try {
        await sharp(req.files["user_image"][0].path).resize(512, 512).toFile(resizedUserImage);
        await sharp(req.files["cloth_image"][0].path).resize(512, 512).toFile(resizedClothImage);

        // Ensure the Ngrok URL is correct (Update it!)
        const ACGPN_URL = "https://301e-34-60-90-182.ngrok-free.app/tryon"; 

        // Prepare FormData
        const formData = new FormData();
        formData.append("user_image", fs.createReadStream(resizedUserImage));
        formData.append("cloth_image", fs.createReadStream(resizedClothImage));

        const response = await axios.post(ACGPN_URL, formData, {
            headers: { ...formData.getHeaders() }
        });

        res.json({ message: "Processing complete!", result: response.data });
    } catch (error) {
        console.error("Error processing images:", error);
        res.status(500).json({ error: "Error processing images!" });
    }
});

app.listen(5000, () => console.log("✅ Backend running on port 5000"));
