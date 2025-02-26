import express from "express";
import lunr from "lunr";
import { dirname, join } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from "fs";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
const indexedPath = path.join(__dirname, "../indexer/index.json");
const filesDirectory = path.join(__dirname, "../scrapper/data/html");
const metadataFilePath = path.join(__dirname, "../indexer/indexed_files.json");

app.use(cors());
app.use("/files", express.static(filesDirectory, { extensions: ["html"] }));
app.use(express.static("public"));

// Preload metadata to avoid repeated file reads
let fullDocumentData = {};
if (fs.existsSync(metadataFilePath)) {
    fullDocumentData = JSON.parse(fs.readFileSync(metadataFilePath, "utf8"));
}

app.get("/search", (req, res) => {
    const query = req.query.query;
    console.log(`\nQuery received: ${query}`);

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    if (!fs.existsSync(indexedPath)) {
        return res.status(500).json({ error: "Index file not found" });
    }

    try {
        console.log("Loading index file...");
        const indexData = JSON.parse(fs.readFileSync(indexedPath, "utf8"));
        const idx = lunr.Index.load(indexData);
        console.log("Index loaded successfully.");

        console.log("Searching started...");
        const results = idx.search(query);
        console.log("Searching finished.");

        if (results.length === 0) {
            const funnyResponses = [
                "404: Your brain not found.",
                "Even Google would struggle with that one...",
                "Nice try, but still I know more than you",
                "Are you trying to break me?",
                "I've had watter bottles with more intelligence.",
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
        res.json(searchResults);
    } catch (error) {
        console.error("Error processing search:", error);
        res.status(500).json({ error: "Error processing search" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving files from ${filesDirectory} at /files`);
});