import sanitizeHTML from "sanitize-html";
import format from "html-format";
import { appendFileSync, readFileSync, writeFileSync, readdir, readdirSync } from "node:fs";
import { dirname, resolve } from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const folderPath = path.join(__dirname + "/../scrapper/data/html");

let numOfFiles = readdirSync(folderPath).length;

(async () => {
    console.log(numOfFiles + " HTML files are being cleaned and formatted.")
    console.log("Please wait!");
    for(let i = 0; i < numOfFiles; i++)
    {
        const fileName = `page_${i}.html`;
        const filePath = path.join(__dirname + "/../scrapper/data/html/" + fileName);
        
        const dirty = readFileSync(filePath, "utf8");
        const clean = sanitizeHTML(dirty, {
            exclusiveFilter: function(frame)
            {
                // return (frame.attribs && ( frame.attribs.class == "vector-dropdown" || frame.attribs.class == "vector-menu" || frame.attribs.class == "vector-pinnable" || frame.attribs.class == "vector-sticky" || frame.attribs.class == "wbc-editpage" || frame.attribs.class == "noprint" || frame.attribs.class == "mw-editsection"));
                return (frame.attribs && ( frame.attribs.class == "vector-dropdown" || frame.attribs.class == "vector-menu" || frame.attribs.class == "interlanguage" || frame.attribs.class == "vector-dropdown-content"|| frame.attribs.class == "side-box" || frame.attribs.class == "mw-editsection") && (frame.tag == "div" || frame.tag == "li" && !frame.text.trim() && Object.keys(frame.attribs).length == 0));
            },
            enforceHtmlBoundary: true,
            disallowedTagsMode: "completelyDiscard",
            allowedTags: ['b', 'i', 'em', 'strong', 'p', "h1", "h2", "h3", "h4", "h5", "h6", "div", "hr", "li", "main", "ol", "br", "<!DOCTYPE html>", "html", "head", "title", "body", "a"]
            // allowedAttributes: {'a': [ 'href' ]}
        });
        function removeBlankLines(text) {
            return text.split('\n').filter(line => line.trim() !== '').join('\n');
        }
        
        const formattedHtml = removeBlankLines(clean);
        writeFileSync(filePath, formattedHtml, "utf8");
    }
    console.log("Cleaning and formatting of " + numOfFiles + " HTML files is completed");
})();
