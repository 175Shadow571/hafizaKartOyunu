import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const PORT = 5000

const app = express();
app.use(cors({
  origin: "*"
})); // Tüm domainlerden istek kabul et


// Örn: /api/character/1  => Superhero API'den çeker
app.get("/api/character/:id/image", async (req, res) => {
  const { id } = req.params;
  try {    
    const response = await fetch(`https://superheroapi.com/api/${process.env.API_KEY}/${id}/image`);
    if (!response.ok) {
      throw new Error("API isteği başarısız oldu");
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Proxy hatası:", error.message);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.listen(PORT ,"0.0.0.0" , () => {
  console.log("Proxy server çalışıyor: http://localhost:5000");
});