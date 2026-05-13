import express from 'express';
import route from './app.js'
import pdfImgConvert from 'pdf-img-convert'
import * as pdfToImg from "pdf-to-img";

export const app = express();
app.use(express.static('.'));
app.use(express.json());

const port = process.env.PORT || 80;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)

    app.post('/to-png', async (req, res) => {
        const { pdf } = req.body

        if(!pdf) {
            console.error('Missing pdf in request body')
            return res.status(400).send(JSON.stringify({ error: 'pdf is required' }))
        }

        try {
            const pdfData = Buffer.from(pdf, 'base64')
            const document = await pdfToImg.pdf(pdfData)
            if (document.length < 1) {
                throw new Error('Impossible de convertir le document')
            }

            const image = await document.getPage(1);
            res.setHeader('Content-Length', image.length);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="pdf-to-png.png"`); 
            res.send(image)
        } catch(e) {
            console.error(e)
            res.status(400).send(JSON.stringify({ error: `${e.name}: ${e.message}` }))
        }
    })

    app.post('/:template', route)

});

