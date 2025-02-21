// TODO: Implement search query processing
import puppeteer from 'puppeteer';
// import { promises as fs } from 'node:fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

function countLines(filePath) // this functions count length of the file
{
    try
    {
        const data = readFileSync(filePath, "utf-8");
        const lines = data.split('\n');
        return lines.length;
    } catch(error)
    {
        console.error("Error reading file:", error);
        return -1;
    }
}

const filePath = path.join(__dirname + "/data/list.txt"); // gives the list of url's to visit for scrapping
const lineCount = countLines(filePath); // stores how much links are there in the file.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// if (lineCount !== -1) {
//   console.log(`The file has ${lineCount} links.`);
// }

(async () => {
    // Launching a headless browser
    const browser = await puppeteer.launch();
    const fileContent = readFileSync(__dirname + "/data/list.txt", "utf8");
    const lines = fileContent.split('\n');

    for(let i = 0; i < lineCount; i++)
    {
        const page = await browser.newPage(); // new page for every website
        const link = lines[i]?.trim(); // remove white spaces and ? is used because if null is there return undefined so it does not cause any error

        if(!link)
        {
            console.error(`Invalid link at line ${i}\n`);
            await page.close();
            continue;
        }

        await page.goto(link, {waitUntil: "networkidle2"}); // wait for network to be idle
        const pageSourceHTML = await page.content(); // load all the page content

        const fileName = `page_${i}.html`; // filename to save with
        const filePath = join(__dirname + "/data/html/" + fileName); // path to save at

        console.log("Saving at : " + filePath);
        console.log(`Attempting ${link}` );
        writeFileSync(filePath, pageSourceHTML, "utf8"); // save the html source in the file path in the specified utf8 format
        console.log(`${link} has been saved successfully in ${fileName}\n`);
        await page.close();
        // console.log("Sleeping for 1 second...");
        // await sleep(1000);
    }
    // Closing the browser
    await browser.close();
  })();