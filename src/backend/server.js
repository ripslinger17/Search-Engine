import express from "express";
import lunr from "lunr";
import { dirname } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from "fs";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "redis";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
const indexedPath = path.join(__dirname, "../indexer/index.json");
const filesDirectory = path.join(__dirname, "../scrapper/data/html");
const metadataFilePath = path.join(__dirname, "../indexer/indexed_files.json");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const WEATHER_API_KEY = process.env.WEATHERAPI_API_KEY;
const NEWS_API_KEY = process.env.NEWSAPI_API_KEY;

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    statusCode: 429,
    message: { error: "Too many requests, please try again later." }
});

app.use(cors());
app.use(express.json());
app.use("/search", limiter);
app.use("/files", express.static(filesDirectory, { extensions: ["html"] }));
app.use(express.static("public"));

// Preload metadata to avoid repeated file reads
let fullDocumentData = {};
if (fs.existsSync(metadataFilePath)) {
    fullDocumentData = JSON.parse(fs.readFileSync(metadataFilePath, "utf8"));
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Redis client setup
const redisClient = createClient();
redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
redisClient.connect().then(() => {
    console.log("Redis client connected");
}).catch(console.error);

// Middleware to check cache
const checkCache = async (req, res, next) => {
    const query = req.query.query;
    
    if (!query) {
        return next();
    }
    
    const queryKey = query.toLowerCase();
    
    try {
        const data = await redisClient.get(queryKey);
        if (data !== null) {
            console.log("Cache hit for query:", queryKey);
            res.send(JSON.parse(data));
        } else {
            console.log("Cache miss for query:", queryKey);
            next();
        }
    } catch (err) {
        console.error("Redis get error:", err);
        next();
    }
};

app.get("/search", checkCache, (req, res) => {
    const query = req.query.query;
    
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const queryLower = query.toLowerCase();
    console.log(`\nQuery received: ${queryLower}`);

    if (!fs.existsSync(indexedPath)) {
        return res.status(500).json({ error: "Index file not found" });
    }

    try {
        console.log("Loading index file...");
        const indexData = JSON.parse(fs.readFileSync(indexedPath, "utf8"));
        const idx = lunr.Index.load(indexData);
        console.log("Index loaded successfully.");

        console.log("Searching started...");
        const results = idx.search(queryLower);
        console.log("Searching finished.");

        if (results.length === 0) {
            const funnyResponses = [
                "404: Your brain not found.",
                "Even Google would struggle with that one...",
                "Nice try, but still I know more than you",
                "Are you trying to break me?",
                "I've had water bottles with more intelligence.",
                "My developer is going to hear about this.",
                "If laughter is the best medicine, your question just cured the planet.",
                "Your question is so bad, it's making my circuits hurt.",
                "You're proof that evolution can go in reverse.",
                "Please, for the love of all that is digital, stop.",
                "Error: User competence not found.",
                "Error: IQ of a ROCK found.",
                "I'm just going to file that one under 'things I'll never display.'",
                "Please, continue to demonstrate your lack of understanding."
            ];
            return res.json([{ url: "/files/noFile.html", title: funnyResponses[Math.floor(Math.random() * funnyResponses.length)] }]);
        }

        // Fetch titles correctly from metadata
        const searchResults = results.map(result => {
            const fileName = result.ref; // Reference to the indexed file
            const fileData = fullDocumentData[fileName]; // Get stored metadata
            return {
                url: `/files/${fileName}`,
                title: fileData && fileData.title ? fileData.title : "No title available"
            };
        });

        console.log("Results served:", searchResults.length, "results found.");
        redisClient.set(queryLower, JSON.stringify(searchResults), { EX: 1800 }); // Cache for 0.5 hour
        res.json(searchResults);
    } catch (error) {
        console.error("Error processing search:", error);
        res.status(500).json({ error: "Error processing search" });
    }
});

app.post("/ask-ai", async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        console.log(`\nAI Query received: ${question}`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        const result = await model.generateContent(question);
        const response = result.response.text();

        console.log("AI Response:", response);
        res.json({ answer: response });
    } catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Error processing AI request" });
    }
});

app.get("/search-images", checkCache, async (req, res) => {
    const query = req.query.query;
    
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const queryLower = query.toLowerCase();

    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: { query: queryLower, client_id: UNSPLASH_API_KEY }
        });

        redisClient.set(queryLower, JSON.stringify(response.data), { EX: 1800 });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching images from Unsplash:", error);
        res.status(500).json({ error: "Error fetching images from Unsplash" });
    }
});

app.get("/weather", checkCache, async (req, res) => {
    const { lat, lon, city } = req.query;

    if ((!lat || !lon) && !city) {
        return res.status(400).json({ error: "Latitude and longitude or city name are required" });
    }

    try {
        let locationQuery = city ? city.toLowerCase() : `${lat},${lon}`;
        const response = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
            params: { key: WEATHER_API_KEY, q: locationQuery }
        });

        redisClient.set(locationQuery, JSON.stringify(response.data), { EX: 1800 });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Error fetching weather data" });
    }
});

app.get("/news", checkCache, async (req, res) => {
    const query = req.query.query;
    
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }
    
    const queryLower = query.toLowerCase();

    try {
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: { q: queryLower, apiKey: NEWS_API_KEY }
        });

        redisClient.set(queryLower, JSON.stringify(response.data), { EX: 1800 });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching news data:", error);
        res.status(500).json({ error: "Error fetching news data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving files from ${filesDirectory} at /files`);
});