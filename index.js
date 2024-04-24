import puppeteer from "puppeteer";
import { Crawler } from "./crawler.js";
import ExcelJS from 'exceljs';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();


class Process {
    static START_URL = process.argv[2];
}


(async () => {
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

    console.log(crawler.getStoredAll)
    
    await browser.close();

    app.get('/download', async (req, res) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
    
        worksheet.addRow(['Club Name', 'Email']);
        
        data.foreach(column => {
            worksheet.addTable([column.club, column.email]);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content=Disposition', 'attachment; filename="data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    })
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Server is running on port ${PORT}');
    });

    
})();

