import express from 'express';
import ejs from 'ejs'
import fs from 'fs'

export const app = express();
app.use(express.static(import.meta.dirname));
app.use(express.json());

const bodySample = {
    'shipping': {
        pages: [
            {
                sticker: 'http://dev-vm:1337/sticker.png',
                id: 123456,
                numero_client: 98735,
                date: '01/08/2024',
                adresse: {
                    nom: 'Doe',
                    prenom: 'John',
                    adresse: '1 rue de la paix',
                    adresse2: 'Batiment B',
                    code_postal: 75000,
                    ville: 'Paris',
                    pays: 'France',
                    siren: '123456789'
                },
                lignes: [
                    {
                        designation: 'BIKINI HALTER HEXAGON - 36 / Martinica',
                        reference: '312163029-60',
                        quantite: 2,
                    },
                    {
                        designation: 'LOGO SINGLE SHOULDER BIKINI - XS / Noir',
                        reference: '007048-150',
                        quantite: 5,
                    }
                ]
            },
            {
                sticker: 'http://dev-vm:1337/sticker.png',
                id: 123456,
                numero_client: 98735,
                date: '01/08/2024',
                adresse: {
                    nom: 'Bob',
                    prenom: 'Alice',
                    adresse: '1 rue de la paix',
                    adresse2: '',
                    code_postal: 75000,
                    ville: 'Paris',
                    pays: 'France',
                    siren: ''
                },
                lignes: [
                    {
                        designation: 'BIKINI HALTER HEXAGON - 36 / Martinica',
                        reference: '312163029-60',
                        quantite: 3,
                    },
                    {
                        designation: 'LOGO SINGLE SHOULDER BIKINI - XS / Noir',
                        reference: '007048-150',
                        quantite: 8,
                    }
                ]
            }
        ]
    }
}

app.use((req, res, next) => {

    next()
});

 
app.listen(1337, () => {
    console.log('Preview listening on port 1337')

    app.get('/:template', (req, res) => {
        const { template } = req.params

        if("favicon.ico" === template) {
            return res.sendStatus(200)
        }

        const templateFilePath =  `${import.meta.dirname}/../src/templates/${template}.ejs`
        
        if(!fs.existsSync(templateFilePath)) {
            return res.sendStatus(404)
        }

        console.log( bodySample[template])

        ejs.renderFile(templateFilePath, bodySample[template], {}, async (err, html) => {

            if(err) {
                console.error(err);
                res.send({error: err})
            }

            res.setHeader('Content-Type', 'text/html');
            res.send(html)
        })
    })
});

