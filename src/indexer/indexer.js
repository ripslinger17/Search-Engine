import * as cheerio from "cheerio";
import lunr from "lunr";
import stopword from "stopword";
import { readFileSync, readdirSync, writeFileSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const folderPath = path.join(__dirname, "../scrapper/data/html");
const indexFilePath = "./index.json";
const metadataFilePath = "./indexed_files.json";

// Load previously indexed file metadata
let indexedFiles = existsSync(metadataFilePath) ? JSON.parse(readFileSync(metadataFilePath, "utf8")) : {};

const files = readdirSync(folderPath).filter((file) => file.endsWith(".html"));
let newDocument = [];

for (let file of files) {
  try {
    const filePath = path.join(folderPath, file);
    const fileStat = statSync(filePath);
    const lastModified = fileStat.mtimeMs; // Get file modification time

    // Skip file if it hasn't changed
    if (indexedFiles[file] && indexedFiles[file].lastModified === lastModified) {
      continue;
    }

    const html = readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);

    const title = $("title").text().replace(/ - Wikipedia$/i, "").trim();
    let content = $("p, h1, h2, h3, h4, h5, h6, li").text().trim();
    content = stopword.removeStopwords(content.split(/\s+/)).join(" ");

    newDocument.push({ url: file, title, content });

    // Store both lastModified and title in metadata
    indexedFiles[file] = { lastModified, title };
  } catch (error) {
    console.error(`Skipping ${file}: ${error.message}`);
  }
}

if (newDocument.length > 0) {
  let idx = lunr(function () {
    this.ref("url");
    this.field("title");
    this.field("content");

    newDocument.forEach((doc) => this.add(doc));
  });

  writeFileSync(indexFilePath, JSON.stringify(idx.toJSON())); // Save the index
  writeFileSync(metadataFilePath, JSON.stringify(indexedFiles, null, 2)); // Save indexed file metadata
  console.log(`Indexed ${newDocument.length} new documents.`);
} else {
  console.log("No new documents to index.");
}

// Search function
function search(query) {
  const indexData = JSON.parse(readFileSync(indexFilePath, "utf8"));
  let idx = lunr.Index.load(indexData);
  let results = idx.search(query);
  console.log("Search Results:", results);
  return results;
}

// Example usage
// search("chelsea");
