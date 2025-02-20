import axios from "axios";
import *  as cheerio from "cheerio";
import { appendFileSync } from 'node:fs';
import { dirname, join } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname + "/crawledLinks.txt");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const maxCrawlLength = 5;

const axiosInstance = axios.create();


const targetUrl = "https://en.wikipedia.org/wiki/Military_history"
// const targetUrl = ["https://en.wikipedia.org/wiki/Civilization", "https://en.wikipedia.org/wiki/History", "https://en.wikipedia.org/wiki/Ancient_history", "https://en.wikipedia.org/wiki/Military_history"];
let urlToVisit = [targetUrl];
const linkData = [];



const crawler = async () => {
    let crawledCount = 0;
    const pagePattern = /^https:\/\/en\.wikipedia\.org\/wiki\/.+/; // Wikipedia page pattern

    while (urlToVisit.length && crawledCount <= maxCrawlLength) {
        const currentUrl = urlToVisit.shift();
        crawledCount++;

        try {
            const response = await axiosInstance.get(currentUrl);
            const $ = cheerio.load(response.data);
            
            const linkElements = $("a[href]");
            linkElements.each((index, element) => {
                let url = $(element).attr("href");

                // Ensure absolute URL
                if (!url.startsWith("http")) {
                    url = new URL(url, targetUrl).href;
                }
                
                // Restrict to Wikipedia domain
                if (url.startsWith("https://en.wikipedia.org/wiki/") && !url.includes("#") && !url.includes("Portal:Current_events/") && !url.includes("Category:") && !url.includes("Special:") && !url.includes("Help:") && !url.includes("Wikipedia:") && !url.includes("User:") && !url.includes("Wikipedia_talk:") &&!urlToVisit.includes(url)) {
                    urlToVisit.push(url);
                }
            });

            if (pagePattern.test(currentUrl)) {
                linkData.push(currentUrl);
            }
        } catch (error) {
            console.error(`Error fetching ${currentUrl}: ${error.message}`);
        }
        console.log("Sleeping for 3 second...");
        await sleep(3000);
    }

    console.log(urlToVisit);
    console.log("Attempting urlTiVisit Queue");
    console.log("Saving at: " + filePath + '\n');
    for (let i = 0; i < urlToVisit.length; i++) {
        try {
            appendFileSync(filePath, urlToVisit[i] + '\n', "utf8");
        } catch (error) {
            console.error(`Error saving ${urlToVisit[i]}: ${error.message}\n`);
        }
    }
};

crawler();
