import { readdirSync, renameSync } from "node:fs";
import path from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const folderPath = path.join(__dirname, "/data/html");

// Read all files in the directory
let files = readdirSync(folderPath)
    .filter(file => file.match(/^page_\d+\.html$/)) // Only select files matching "page_<number>.html"
    .sort((a, b) => {
        // Extract numbers from file names and compare them numerically
        let numA = parseInt(a.match(/\d+/)[0], 10);
        let numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
    });

console.log(`Found ${files.length} files. Renaming...`);

// First pass: Rename to temporary names to avoid conflicts
files.forEach((file, index) => {
    let tempName = `temp_${index}.html`;
    renameSync(path.join(folderPath, file), path.join(folderPath, tempName));
});

// Second pass: Rename temp files to final sequential names
files.forEach((_, index) => {
    let tempName = `temp_${index}.html`;
    let newName = `page_${index}.html`;
    renameSync(path.join(folderPath, tempName), path.join(folderPath, newName));
});

console.log("Renaming complete.");
