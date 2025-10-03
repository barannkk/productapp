const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const PORT = 5000;
const products = JSON.parse(fs.readFileSync("products.json", "utf8"));

const API_KEY = "6b3c5986d2e0b191dd89155170f4edc3";

async function getGoldPrice() {
  try {
    const response = await axios.get(
      `http://data.fixer.io/api/latest?access_key=${API_KEY}&symbols=XAU,USD`
    );
    const rates = response.data.rates;
    const usdRate = rates.USD;
    const xauRate = rates.XAU;
    return (usdRate / xauRate) / 31.1035;
  } catch (error) {
    console.error("Failed to fetch gold price:", error.message);
    return 70;
  }
}

app.get("/products", async (req, res) => {
  const goldPrice = await getGoldPrice();

  const enrichedProducts = products.map(p => ({
    ...p,
    price: parseFloat(((p.popularityScore + 1) * p.weight * goldPrice).toFixed(2)),
    popularity: parseFloat((p.popularityScore * 5).toFixed(1)),
  }));

  res.json(enrichedProducts);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
