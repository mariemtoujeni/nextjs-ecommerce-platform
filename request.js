const request = {
    contractNumber: "contractNumber",
    password: "password",
    outputFormat: {
        x: 0,
        y: 0,
        outputPrintingType: "PDF_10x15_300dpi",
        dematerialized: true,
        returnType: "SendPDFByMail",
        printCODDocument: false
    },
    letter: {
        service: {
            productCode: "DOM",
            depositDate: "2024-11-20",
            mailBoxPicking: false,
            transportationAmount:0,
            totalAmount: 13778,
            orderNumber: "440436",
            commercialName: "Nataquashop",
            returnTypeChoice: 2,
            reseauPostal: "0"
        },
        parcel: {
            insuranceValue: 0,
            weight: 1.2,
            nonMachinable: false,
            returnReceipt: false,
            instructions: "",
            pickupLocationId: "",
            ftd: false,
            ddp: false,
            disabledDeliveryBlockingCode: "1",
            cod: false,
            codamount: 0,
            codcurrency: "EUR"
        },
        sender: {
            senderParcelRef: "440436",
            address: {
                companyName: "Nataquashop",
                lastName: "",
                firstName: "",
                line0: "",
                line1: "",
                line2: "Route d'Aubusson",
                line3: "",
                countryCode: "FR",
                city: "JARNAGES",
                zipCode: "23140",
                phoneNumber: "0555667788",
                mobileNumber: "0555667788",
                doorCode1: "",
                doorCode2: "",
                intercom: "",
                email: "nicolas@nataquashop.com",
                language: "fr",
                stateOrProvinceCode: ""
            }
        },
        addressee: {
            addresseeParcelRef: "440436",
            codeBarForReference: false,
            serviceInfo: "",
            promotionCode: "",
            address: {
                companyName: "CARREFOUR CITY",
                lastName: "",
                firstName: "",
                line0: "",
                line1: "",
                line2: "145 AVENUE PAUL VAILLAN COUTURIER",
                line3: "",
                countryCode: "FR",
                city: "VITRY SUR SEINE",
                zipCode: "94400",
                phoneNumber: "0146860000",
                mobileNumber: "",
                doorCode1: "",
                doorCode2: "",
                intercom: "",
                email: "team@squaad.io",
                language: "FR",
                stateOrProvinceCode: ""
            }
        }
    }
};