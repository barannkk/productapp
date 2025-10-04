const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const products = JSON.parse(fs.readFileSync("products.json", "utf8"));

// GoldAPI key
const API_KEY = "goldapi-2snvtbdsmgc4vn0l-io";

async function getGoldPrice() {
  try {
    const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": API_KEY,
        "Content-Type": "application/json",
      },
    });
    const pricePerOunce = response.data.price;

    return pricePerOunce / 31.1035;
  } catch (error) {
    console.error("Failed to fetch gold price:", error.message);
    return 70; 
  }
}

app.get("/products", async (req, res) => {
  const goldPrice = await getGoldPrice();

  const enrichedProducts = products.map((p) => ({
    ...p,
    price: parseFloat(
      ((p.popularityScore + 1) * p.weight * goldPrice).toFixed(2)
    ),
    popularity: parseFloat((p.popularityScore * 5).toFixed(1)),
  }));

  res.json(enrichedProducts);
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
