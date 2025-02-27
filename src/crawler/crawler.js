import axios from "axios";
import *  as cheerio from "cheerio";
import { appendFileSync } from 'node:fs';
import { dirname, join } from "path";
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname + "/crawledLinks.txt");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const maxCrawlLength = 5; // max number of links it will crawl at a time
const axiosInstance = axios.create(); // single axios instance so that session does not get blocked

// targer urls
// const targetUrl = "https://en.wikipedia.org/wiki/Hello";
const targetUrl = ["https://en.wikipedia.org/wiki/Civilization", "https://en.wikipedia.org/wiki/History", "https://en.wikipedia.org/wiki/Ancient_history", "https://en.wikipedia.org/wiki/Military_history", "https://en.wikipedia.org/wiki/Geography", "https://en.wikipedia.org/wiki/Earth_science", "https://en.wikipedia.org/wiki/Geology", "https://en.wikipedia.org/wiki/Meteorology", "https://en.wikipedia.org/wiki/Political_science", "https://en.wikipedia.org/wiki/Government", "https://en.wikipedia.org/wiki/International_relations", "https://en.wikipedia.org/wiki/Ideology", "https://en.wikipedia.org/wiki/Economics", "https://en.wikipedia.org/wiki/Business", "https://en.wikipedia.org/wiki/Finance", "https://en.wikipedia.org/wiki/Entrepreneurship", "https://en.wikipedia.org/wiki/Physics", "https://en.wikipedia.org/wiki/Chemistry", "https://en.wikipedia.org/wiki/Biology", "https://en.wikipedia.org/wiki/Ecology", "https://en.wikipedia.org/wiki/Astronomy", "https://en.wikipedia.org/wiki/Mathematics", "https://en.wikipedia.org/wiki/Calculus", "https://en.wikipedia.org/wiki/Number_theory", "https://en.wikipedia.org/wiki/Logic", "https://en.wikipedia.org/wiki/Technology", "https://en.wikipedia.org/wiki/Engineering", "https://en.wikipedia.org/wiki/Information_technology", "https://en.wikipedia.org/wiki/Artificial_intelligence", "https://en.wikipedia.org/wiki/Quantum_computing", "https://en.wikipedia.org/wiki/Robotics", "https://en.wikipedia.org/wiki/Medicine", "https://en.wikipedia.org/wiki/Health", "https://en.wikipedia.org/wiki/Public_health", "https://en.wikipedia.org/wiki/Epidemiology", "https://en.wikipedia.org/wiki/The_arts", "https://en.wikipedia.org/wiki/Humanities", "https://en.wikipedia.org/wiki/Visual_arts", "https://en.wikipedia.org/wiki/Music", "https://en.wikipedia.org/wiki/Literature", "https://en.wikipedia.org/wiki/Linguistics", "https://en.wikipedia.org/wiki/Poetry", "https://en.wikipedia.org/wiki/Drama", "https://en.wikipedia.org/wiki/Philosophy", "https://en.wikipedia.org/wiki/Ethics", "https://en.wikipedia.org/wiki/Metaphysics", "https://en.wikipedia.org/wiki/Epistemology", "https://en.wikipedia.org/wiki/Religion", "https://en.wikipedia.org/wiki/Spirituality", "https://en.wikipedia.org/wiki/Myth", "https://en.wikipedia.org/wiki/Comparative_religion", "https://en.wikipedia.org/wiki/Sociology", "https://en.wikipedia.org/wiki/Anthropology", "https://en.wikipedia.org/wiki/Cultural_anthropology", "https://en.wikipedia.org/wiki/Demography", "https://en.wikipedia.org/wiki/Sport", "https://en.wikipedia.org/wiki/Recreation", "https://en.wikipedia.org/wiki/Olympic_Games", "https://en.wikipedia.org/wiki/Entertainment", "https://en.wikipedia.org/wiki/Media", "https://en.wikipedia.org/wiki/Film", "https://en.wikipedia.org/wiki/Television", "https://en.wikipedia.org/wiki/Video_game", "https://en.wikipedia.org/wiki/Architecture", "https://en.wikipedia.org/wiki/Urban_planning", "https://en.wikipedia.org/wiki/Urban_design", "https://en.wikipedia.org/wiki/Education", "https://en.wikipedia.org/wiki/Learning", "https://en.wikipedia.org/wiki/Pedagogy", "https://en.wikipedia.org/wiki/Environment", "https://en.wikipedia.org/wiki/Sustainability", "https://en.wikipedia.org/wiki/Climate_change", "https://en.wikipedia.org/wiki/Conservation_movement", "https://en.wikipedia.org/wiki/Transport", "https://en.wikipedia.org/wiki/Infrastructure", "https://en.wikipedia.org/wiki/Public_transport", "https://en.wikipedia.org/wiki/Rail_transport", "https://en.wikipedia.org/wiki/Law", "https://en.wikipedia.org/wiki/Criminal_justice", "https://en.wikipedia.org/wiki/Forensic_science", "https://en.wikipedia.org/wiki/Human_rights", "https://en.wikipedia.org/wiki/Food", "https://en.wikipedia.org/wiki/Culinary_arts", "https://en.wikipedia.org/wiki/Gastronomy", "https://en.wikipedia.org/wiki/Nutrition", "https://en.wikipedia.org/wiki/Management", "https://en.wikipedia.org/wiki/Innovation", "https://en.wikipedia.org/wiki/Computer_science", "https://en.wikipedia.org/wiki/Data_science", "https://en.wikipedia.org/wiki/Machine_learning", "https://en.wikipedia.org/wiki/Computer_security", "https://en.wikipedia.org/wiki/Cultural_studies", "https://en.wikipedia.org/wiki/Media_studies", "https://en.wikipedia.org/wiki/Popular_culture", "https://en.wikipedia.org/wiki/Fashion", "https://en.wikipedia.org/wiki/Interdisciplinarity", "https://en.wikipedia.org/wiki/Futurism", "https://en.wikipedia.org/wiki/Transhumanism", "https://en.wikipedia.org/wiki/Science_fiction",       "https://en.wikipedia.org/wiki/Competitive_programming","https://en.wikipedia.org/wiki/Chelsea_F.C.","https://en.wikipedia.org/wiki/FC_Goa"];

for(let i = 0; i < targetUrl.length; i++)
{
    console.log(`Crawling ${targetUrl}`);
    let urlToVisit = [targetUrl[i]]; // url to visit
    const linkData = new Set(); // checking for duplicate links.
    
    const crawler = async () => {
        let crawledCount = 0;
        const pagePattern = /^https:\/\/en\.wikipedia\.org\/wiki\/.+/; // Wikipedia page pattern
    
        while (urlToVisit.length && crawledCount < maxCrawlLength) {
            const currentUrl = urlToVisit.shift(); // shift through array
            crawledCount++;
    
            try {
                const response = await axiosInstance.get(currentUrl);
                const $ = cheerio.load(response.data); // load data from web page
                
                const linkElements = $("a[href]"); // select links
                linkElements.each((_, element) => {
                    let url = $(element).attr("href");
    
                    // Ensure absolute URL
                    if (!url.startsWith("http")) {
                        url = new URL(url, currentUrl).href;
                    }
                    
                    // Restrict to Wikipedia domain
                    if (url.startsWith("https://en.wikipedia.org/wiki/") && !url.includes("#") && !url.includes("Portal:") && !url.includes("Category:") && !url.includes("Special:") && !url.includes("Help:") && !url.includes("Wikipedia:") && !url.includes("User:") && !url.includes("Wikipedia_talk:") && !url.includes("User_talk:") && !url.includes("Wikipedia:Manual_of_Style") && !url.includes("Talk:") && !url.includes("Template_talk:") && !url.includes("Main_Page") && !url.includes("File:") && !url.includes("Template:") && !urlToVisit.includes(url)) {
                        urlToVisit.push(url);
                        linkData.add(url);
                    }
                });
                
                // Checks if page pattern matches or not?
                if (pagePattern.test(currentUrl)) {
                    linkData.add(currentUrl);
                }
            } catch (error) {
                console.error(`Error fetching ${currentUrl}: ${error.message}`);
            }
            // Sleep for load balancing on the server
            console.log("Sleeping for 1 second...");
            await sleep(1000);
        }

        // Save links
        console.log("\nAttempting To Save Links");
        console.log("Saving links to:", filePath);
        try {
            appendFileSync(filePath, Array.from(linkData).join('\n') + '\n', "utf8"); // save the while array of data into file
        } catch (error) {
            console.error(`Error saving links: ${error.message}\n`);
        }
        console.log("PROCESS COMPLETE");
    };
    
    crawler();
}

