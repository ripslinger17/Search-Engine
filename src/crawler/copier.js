// This file is copy all non-duplicate links from crawler to scrapper folder
import { appendFile, readFile } from "node:fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourcePath = resolve(__dirname + "/crawledLinks.txt");
const destinationPath = resolve(__dirname + "/../scrapper/data/list.txt");

// Promisify readFile
function readFilePromise(filePath) {
    return new Promise((resolve, reject) => {
        readFile(filePath, "utf8", (err, data) => {
            if (err) resolve(""); // If file doesn't exist, return empty string
            else resolve(data);
        });
    });
}

// Promisify appendFile
function appendFilePromise(filePath, data) {
    return new Promise((resolve, reject) => {
        appendFile(filePath, data, "utf8", (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function processFile() {
    try {
        // Read source file
        const sourceData = await readFilePromise(sourcePath);
        const sourceLines = sourceData.split("\n").filter(line => line.trim() !== ""); // Remove empty lines

        // Read destination file (if exists)
        const destinationData = await readFilePromise(destinationPath);
        const existingLines = new Set(destinationData.split("\n")); // Store lines in a Set for faster lookup

        // Process each line
        for (let i = 0; i < sourceLines.length; i++) {
            const line = sourceLines[i];

            if (!existingLines.has(line)) {
                await appendFilePromise(destinationPath, line + "\n");
                console.log(`\n${line} from line ${i+1} appended successfully`);
            } else {
                console.log(`\nText "${line}" already exists in the file. Skipping append`);
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

// Run function
processFile();
