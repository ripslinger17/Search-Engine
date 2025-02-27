# Search-Engine

This project is a fully functional search engine developed as a Major College Project in the final year of engineering. It involves web crawling, scraping, indexing, and searching, along with a frontend and backend for user interaction. The project leverages various technologies and APIs to provide a seamless search experience.

---
## Index
- [Information](#information)
  - [Development Environment](#development-environment)
  - [Technologies Used](#technologies-used)
  - [Project Digraram](#project-digraram)

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Running the Project](#running-the-project)
- [Features](#features)
  - [Web Crawler](#1-web-crawler)
  - [Link Copier](#2-link-copier)
  - [Web Scraper](#3-web-scraper)
  - [File Renamer](#4-file-renamer)
  - [HTML Cleaner](#5-html-cleaner)
  - [Indexer](#6-indexer)
  - [Backend](#7-backend)
  - [API Endpoints](#8-api-endpoints)
  - [External API Integrations](#9-external-api-integrations)
  - [Frontend](#10-frontend)
  - [Documentation](#11-documentation)
- [Additional Information](#additional-information)
- [Demo](#demo)
- [License](#license)
- [Disclaimer](#disclaimer)
- [Contributions](#contributions)

---
## Information

### Development Environment
- **IDE:** Visual Studio Code
- **Operating System:** macOS Sequoia
- **Browser:** Google Chrome
- **Node.js Version:** 20.15.0
- **Redis Version:** 7.2.7

### Technologies Used
- **Backend:** Node.js, Express.js, Lunr.js, Redis, Axios, CORS
- **Frontend:** HTML, CSS, JavaScript, Bootstrap, OpenStreetMap
- **Web Crawling & Scraping:** Axios, Cheerio, Puppeteer
- **Indexing & Search:** Lunr.js, Cheerio, Stopword
- **Data Cleaning:** Sanitize-html
- **Caching:** Redis
- **External APIs:** Google Gemini, Unsplash API, Weather API, News API

### Project Digraram
![Search Engine Flowchart](https://github.com/ripslinger17/Search-Engine/blob/main/docs/search-engine-diagram.svg)

---
## Installation

### Prerequisites
- Install [Node.js](https://nodejs.org/)
- Install [Redis](https://redis.io/) for caching functionality
- API keys for [Google Gemini](https://ai.google.dev/), [Unsplash](https://unsplash.com/developers), [WeatherAPI](https://www.weatherapi.com/), and [NewsAPI](https://newsapi.org/)
- Basic knowledge of web crawling, scraping, and indexing
- Clone the repository:
  ```sh
  git clone https://github.com/ripslinger17/Search-Engine
  cd Search-Engine
  ```
- Install dependencies:
  ```sh
  npm install
  ```
- Creating Required Files  
    - Before running the project, ensure the necessary files are created using the following command:  
  ```sh
  mkdir -p src/crawler src/scrapper/data src/indexer src/backend

    touch src/crawler/crawledLinks.txt \
        src/scrapper/data/list.txt \
        src/indexer/index.json \
        src/indexer/indexed_files.json \
        src/backend/.env
  ```
- Add the following environment variables to the `.env` file:
  ```sh
    GEMINI_API_KEY=
    UNSPLASH_API_KEY=
    NEWSAPI_API_KEY=
    WEATHERAPI_API_KEY=
  ```
- **Note:** Obtain API keys from the respective providers and add them to the `.env` file.

### Running the Project
- Start the Redis server:
**Note: This project was developed on macOS, and Redis was installed using Homebrew. Your installation process or system configuration may differ, but the following instructions are provided as a reference.**
    ```sh
    brew services start redis
    ```
    ```sh
    brew services info redis
    ```
    ```sh
    redis-cli
    ```
    - To stop redis server
        ```sh
        brew services stop redis
        ```

    
- Start the backend server:
  ```sh
  node src/backend/server.js
  ```

- Open the frontend in a browser from `pages/index.html`

---

## Features

### 1. Web Crawler
- Developed using `axios` and `cheerio`.
- Crawls web pages and extracts URLs.
- Located in `src/crawler/crawler.js`.

### 2. Link Copier
- Transfers all crawled links from `crawledLinks.txt` to `/scrapper/data/list.txt` for further processing.
- Designed to identify and eliminate duplicate links before transferring, ensuring a refined and optimized dataset.
- Implemented in `src/crawler/copier.js`.

### 3. Web Scraper
- Implemented using `puppeteer`.
- Downloads entire HTML pages (default: Wikipedia, customizable as needed).
- Saves downloaded pages in `src/scrapper/data/html/`.
- **Caution:** Ensure compliance with website policies before scraping.

### 4. File Renamer
- Renames downloaded files sequentially for better organization and processing.
- Implemented in `src/scrapper/renamer.js`.

### 5. HTML Cleaner
- Uses `sanitize-html` to:
  - Remove unnecessary CSS, ads, and potential malicious code.
  - Reduce file size while retaining essential content.
- Implemented in `src/indexer/cleaner.js`.

### 6. Indexer
- Built using `lunr.js`, `cheerio`, and `stopword`.
- Creates an inverted index in JSON format to track indexed files.
- Utilizes [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) algorithm and [fuzzy search](https://en.wikipedia.org/wiki/Approximate_string_matching) for improved accuracy.
- **Note:** `lunr.js` was chosen over Elasticsearch due to its lightweight nature.
- Implemented in `src/indexer/indexer.js`.

### 7. Backend
- Developed using `Node.js`, `Express.js`, `Lunr`, `Redis`, `Axios`, and `CORS`.
- Implements caching via Redis for optimized search performance.
- Supports rate limiting to prevent abuse.
- Indexed search results are cached, significantly improving repeated query performance.
- Backend logic is contained in `src/backend/server.js`.

### 8. API Endpoints
- `/search` - Search engine query processing (caching enabled)
- `/news` - Fetches latest news (caching enabled)
- `/weather` - Retrieves weather data (caching enabled)
- `/search-images` - Image search functionality (caching enabled)
- `/ask-ai` - AI-powered chatbot using Google Gemini
- `/files` - Hosts all project-related files

### 9. External API Integrations
- **Google Gemini** - AI chatbot (`/ask-ai` endpoint)
- **Unsplash API** - Image search (`/search-images` endpoint)
- **Weather API** - Weather retrieval (`/weather` endpoint)
- **News API** - Fetches news articles (`/news` endpoint)
- **OpenStreetMap** - Map implementation (no API required)

### 10. Frontend
- Built with `Bootstrap`.
- Icons sourced from `Bootstrap Icons`.
- Pages included:
  - `pages/index.html` - Landing page
  - `pages/search.html` - Search and AI chat integration
  - `pages/image-search.html` - Image search
  - `pages/maps.html` - Location-based search (uses OpenStreetMap, no API required)
  - `pages/news.html` - News search
  - `pages/weather.html` - Weather updates

### 11. Documentation
- Located in the `docs` folder.
- Includes `TODO.md` with planned features and updates.
- Contains `api_collection.json` for API testing.
- Provides example queries and usage instructions.

## Additional Information
- All APIs used in this project are free or provide a free/demo version as of February 2025.
- Developed and tested on `macOS`. Compatibility testing for `Windows` and `Linux` is pending.
- The project contains **easter eggs** hidden within the code.
- Open to improvements, suggestions, and constructive feedback.

## Demo
Watch the project demo on YouTube: [Project Demo](https://youtu.be/1PiVwS_gOmo?si=lBCF0j9YMkuJ_y9g)

---
## License
This project is licensed under the MIT License.

---
## Disclaimer
This project was developed for educational purposes as part of an engineering final year project. Ensure compliance with legal and ethical guidelines while using web crawling and scraping functionalities.

---
## Contributions
Feel free to contribute to the project by reporting issues or suggesting improvements.

