import fs from 'fs';
import puppeteer from 'puppeteer';
import { v4 } from 'uuid';
import ejs from 'ejs';

export default (req, res) => {
    const { template } = req.params

    if("favicon.ico" === template) {
        return res.sendStatus(200)
    }

    const templateFilePath =  `${import.meta.dirname}/templates/${template}.ejs`
    
    if(!fs.existsSync(templateFilePath)) { 
        return res.sendStatus(404)
    }

    ejs.renderFile(templateFilePath, req.body, {}, async (err, html) => {
        if(err) {
            console.error(err);
            res.send({error: err})
        }

        try {
            const browser = await puppeteer.launch({
                executablePath: process.env.CHROME_BIN || undefined,
                args: ['--no-sandbox', '--headless', '--disable-gpu']
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'domcontentloaded' });
            await page.emulateMediaType('screen');

            const pdf = await page.pdf({
                printBackground: true,
                margin: {top: 0, right: 0, bottom: 0, left: 0},
                format: 'A4',
                landscape: true
            });

            await browser.close();

            res.setHeader('Content-Length', pdf.length);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${v4()}.pdf"`);
            res.write(pdf)
            res.end();


        } catch(e) {
            console.error(e)
        }
    })
}