import puppeteer from "puppeteer";
import { Crawler } from "./crawler.js";
import { google } from "googleapis";
import fs from 'fs';

//load credentials from a json file
const credentials = require('./test-project-421313-b6dd67e500ad');


//Googe sheets API credentials
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_secret, client_id, redirect_uris[O]);

class Process {
    static START_URL = process.argv[2];
}


async function scrapeDate() {
    /*
        initializes browser and page, scrapes all urls on the page and iterates over them
    */
    const browser = await puppeteer.launch({ headless : false});
    const page = await browser.newPage();

    // specify the selectors the crawler should look for
    const crawler = new Crawler({
        "club": '#page > section > div > div > div.col-xl-9.col-lg-8 > h1',
        "email": '#tab-content-ov > section > div > div > div > h3 > a' // 'a[href*="@"]'
    });

    await page.goto(Process.START_URL); // starting url, should change to be more dynamic

    const clubs = await page.evaluate(() => Array.from(document.querySelectorAll('#site-content > div > div > div> div > div > div.floater > a'), element => element.getAttribute("href"))); // 
    for (let i = 0; i < clubs.length; i++) {
        await crawler.crawl(page, clubs[i]);
    };
    
    await browser.close();

};

async function writeToGoogleSheets(getStoredAll){
    const token = fs.readFileSync('token.json');
    oAuth2Client.setCredentials(JSON.parse(token));
    const sheets = google.sheets({version: 'v4', auth: oAuth2Client });

    const spreadsheetId = 'test-webscraper';
    const range = 'Sheet1!A1:B1';

    const values = [
        [getStoredAll.names, getStoredAll.email],
    ];

    const result = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
    });

    console.log(`${result.getStoredAll.updatedCells} cells updated.`)

}

async function main() {
    try{
        const scrapedData = await scrapeDate();
        await writeToGoogleSheets(scrapedData);
    } catch(error){
        console.error('Error: ', error);
    }
}

main();