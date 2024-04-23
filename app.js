const appConfig = require('./Utility/AppConfig.js');
const menu = require('./Display/Menu.js');
const dataService = require('./DataService/DataService.js');
const jsonFileManager = require('./Utility/JSONFileManager.js');
const jsonProcessing = require('./Utility/JSONProcessing.js');
const gqlOperationLibrary = require('./GQLOperationLibrary/GQLOperationLibrary.js');
const encodeDecode = require('./Utility/EncodeDecode.js');
const { faker } = require('@faker-js/faker');
const readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const _dataService = new dataService(
    appConfig.sellerAPIEndpoint,
    appConfig.sellerAPIKey,
    appConfig.basicAuthUserName,
    appConfig.basicAuthPassword
);

let brandCount = 0;
let leafTaxonCount = 0;
let shipmentCarrierCount = 0;

menu.displayWelcome();
menu.displayLicense();

console.log('Your endpoint is set to: \x1b[32m' + appConfig.sellerAPIEndpoint + '\x1b[0m\n');

menu.displayMenu();

promptUser();

jsonFileManager.checkAndCreateFolder('./DataFiles/');


function promptUser() {
    rl.question('Choose an option (1 - 4): \n', (answer) => {
        if (answer === '1') {
            console.log("Attempting test product creation...");


            (async () => {
                const brands = await _dataService.gqlRequest(gqlOperationLibrary.brands, 'getFirst10Brands', null);

                brandCount = Object.keys(brands.data.brands.nodes).length;
                console.log(`--> \x1b[33mNumber of Brands fetched: ${brandCount}\x1b[0m`);


                await jsonFileManager.writeJSONToFile('./DataFiles/brands.json', JSON.stringify(brands));

                const taxons = await _dataService.gqlRequest(gqlOperationLibrary.taxons, 'getSomeEndNodeTaxons', null);

                const leafTaxons = jsonProcessing.GetLeafTaxonsOnly(taxons);
                leafTaxonCount = Object.keys(leafTaxons).length;
                console.log(`--> \x1b[33mNumber of Leaf Taxons fetched: ${leafTaxonCount}\x1b[0m`);


                await jsonFileManager.writeJSONToFile('./DataFiles/taxons.json', JSON.stringify(leafTaxons));

                const uniquePrototypes = [];

                // Generate a list of unique prototypes for our categories
                for (const taxon of leafTaxons) {
                    if (uniquePrototypes.indexOf(taxon.prototype.id) === -1) {
                        uniquePrototypes.push(taxon.prototype.id);
                        
                    }
                }

                // Get the the Prototype Data
                const prototypes = await _dataService.gqlRequest(gqlOperationLibrary.getPrototypesById, 'getPrototype', { ids: uniquePrototypes });
                await jsonFileManager.writeJSONToFile('./DataFiles/prototypes.json', JSON.stringify(prototypes));


                // -------- CREATE PRODUCTS FILE ---------

                let productsToWrite = [];

                for (let i = 0; i < 10; i++) {

                    const randomBrandId = randomBrand(brands);
                    console.log(`---> Random Brand Id ${randomBrandId}`);

                    const randomTaxonId = randomTaxon(leafTaxons);
                    console.log(`---> Random Taxon Id ${randomTaxonId}`);

                    const prototypeId = getPrototypeForTaxon(randomTaxonId, leafTaxons);
                    console.log(`----> Prototype for Taxon ${prototypeId}`);

                    const advertOptionValues = randomOptionValues(prototypeId, prototypes, 'ADVERT');

                    const variantOptionValues = randomOptionValues(prototypeId, prototypes, 'VARIANT');

                    // Check if variantOptionValues is null -if so product would be invalid

                    const product = {
                        input: {
                            attributes: {
                                brandId: randomBrandId,
                                taxonId: randomTaxonId,
                                title: faker.commerce.productName(),
                                description: faker.commerce.productDescription(),
                                price: faker.commerce.price(),
                                attemptAutoPublish: true,
                                images: [{ sourceUrl: faker.image.urlPicsumPhotos() }],
                                ...((advertOptionValues !== null) ? { advertOptionValues: advertOptionValues } : {}),
                                variants: [
                                    {
                                        countOnHand: Math.floor(Math.random() * 1000) + 1,
                                        sku: faker.string.alpha(4),
                                        variantOptionValues: variantOptionValues
                                    }
                                ]
                            }
                        }
                    };

                    console.log(`-> Sample Project JSON`);
                    
                    productsToWrite.push(product);
                    
                }

                await jsonFileManager.writeJSONToFile('./DataFiles/products.json', JSON.stringify(productsToWrite));
                rl.close();
            })();


        } else if (answer === '2') {
            console.log("Attempting test product ingestion");


            const products = jsonFileManager.loadJSONNodesFromFile('./DataFiles/products.json');

            for (const product of products) {
                _dataService.gqlRequest(gqlOperationLibrary.advertUpsert, 'advertUpsert', product);
            }
            rl.close();

        } else if (answer === '3') {
            console.log("Listing orders that can be shipped....");
            // Do something for Option 3

            (async () => {
                const invoiceVariables = {
                    first: 10,
                    after: null,
                    filters: {
                        notDispatched: true,
                        paidSince: "2023-09-26T09:15:49Z"
                    },
                    sort: {
                        fields: "CREATED_AT",
                        ordering: "ASCENDING"
                    }
                };

                let hasNextPage = true;
                let pageNumber = 0;

                while (hasNextPage) {
                    pageNumber++;
                    console.log(`--> PAGE ${pageNumber}`);
                    const invoices = await _dataService.gqlRequest(gqlOperationLibrary.getNonDispatchedInvoices, 'getNonDispatchedInvoices', invoiceVariables);

                    for (const invoice of invoices.data.invoices.nodes) {
                        console.log(`---> Shippable Invoice ID: ${invoice.legacyId} [${invoice.buyerSurname}]`);
                    }

                    if (invoices.data.invoices.pageInfo.hasNextPage) {
                        invoiceVariables.after = invoices.data.invoices.pageInfo.endCursor;
                        console.log(`--> End Cursor: ${invoices.data.invoices.pageInfo.endCursor}`);
                    } else {
                        hasNextPage = false;
                    }
                }
                rl.close();
            })();
        } else if (answer === '4') {
            rl.question('Please enter an Invoice number, e.g. 10233 \n', (invoiceNumber) => {
                console.log(`-> Checking invoice: ${invoiceNumber}`);
                const graphQLInvoiceID = encodeDecode.constructGqlId(invoiceNumber, 'Invoice');
                console.log(`--> GraphQL Invoice ID: ${graphQLInvoiceID}`);

                (async () => {
                    const invoiceVariables = {
                        id: graphQLInvoiceID,
                    };

                    const invoice = await _dataService.gqlRequest(gqlOperationLibrary.getIndividualInvoice, 'getInvoice', invoiceVariables);
                    if (invoice.data.node === null) {
                        console.log('---> Could not find that invoice - API returns null');
                        return;
                    }

                    if (jsonProcessing.attemptToShip(invoice.data.node.statusFlags)) {
                        console.log('\n Generating list of Shipment Carriers...');
                    
                        const carrierIDs = await generateShipmentCarriers();

                        const randomCarrierId = randomCarrier(carrierIDs);
    
                        console.log(`--> Random Carrier ID selected: ${randomCarrierId}`);
                        const shippedItems = jsonProcessing.buildShippableLineItemsList(invoice);

                        //console.log(`shippedItems JSON ${JSON.stringify(shippedItems)}`);

                        var shipmentCreateVariables = {
                            input: {
                                invoiceId: graphQLInvoiceID,
                                dispatchedAt: new Date().toISOString(),
                                note: faker.word.words(),
                                postageCarrierId: randomCarrierId,
                                trackingNumber: faker.string.uuid(),
                                shippedItems: shippedItems
                            }
                        }

                        const shipment = await _dataService.gqlRequest(gqlOperationLibrary.dispatchLineItems, 'dispatchLineItems', shipmentCreateVariables);

                        console.log(`--> shipmentCreate response: 
                            ${JSON.stringify(shipment)}
                        `)

                    } else {
                        console.log('--> This invoice is not in a state where it can be shipped.');
                    }
                    //console.log(JSON.stringify(invoice));
                    
                })();

                rl.close();
            });

        } else {
            console.log("Numbers 1 - 4 is all we accept here!");
            rl.close();
        }
    });
}

// ---------------------------------------
//
// Data Fetch Operations
//
// ---------------------------------------
async function generateShipmentCarriers() {
    await jsonFileManager.deleteFile('./DataFiles/carriers.txt');
    const lines = [];
    const shipmentCarrierVariables = {
        first: 10,
        after: null,
    };

    let hasNextPage = true;
    

    while (hasNextPage) {
        
        const shipmentCarriers = await _dataService.gqlRequest(gqlOperationLibrary.getShipmentCarriers, 'getShipmentCarriers', shipmentCarrierVariables);

        for (const carrier of shipmentCarriers.data.shipmentCarriers.nodes) {
            //console.log(`---> Shipment Carrier ID: ${carrier.id} [${carrier.name}]`);
            await jsonFileManager.appendJSONToFile('./DataFiles/carriers.txt', `---> Shipment Carrier ID: ${carrier.id} [${carrier.name}]\n`);
            lines.push(carrier.id);
            shipmentCarrierCount++;
        }

        if (shipmentCarriers.data.shipmentCarriers.pageInfo.hasNextPage) {
            shipmentCarrierVariables.after = shipmentCarriers.data.shipmentCarriers.pageInfo.endCursor;
            
        } else {
            hasNextPage = false;
        }
    }
    console.log(`---> [\x1b[33m${shipmentCarrierCount}\x1b[0m] shipment carriers found (list in \x1b[33mcarriers.txt\x1b[0m)`)
    return lines;
}



// ---------------------------------------
//
// Taxon / Category Manipulation Functions
//
// ---------------------------------------

function randomCarrier(carrierIDs) {
    const randomCarrierIdIndex = Math.floor(Math.random() * carrierIDs.length) + 1;
    const randomCarrierId = carrierIDs[randomCarrierIdIndex -1];
    return randomCarrierId;
}

function randomBrand(brandJSON) {
    const randomBrandIndex = Math.floor(Math.random() * brandCount) + 1;
    const randomBrandId = brandJSON.data.brands.nodes[randomBrandIndex - 1];
    return randomBrandId.id;
}

function randomTaxon(taxonJSON) {
    const randomTaxonIndex = Math.floor(Math.random() * leafTaxonCount) + 1;
    const randomTaxonId = taxonJSON[randomTaxonIndex - 1];
    return randomTaxonId.id;
}

function getPrototypeForTaxon(taxonId, leafTaxons) {
    return leafTaxons.find(obj => obj.id === taxonId).prototype.id;
}

function getRandomOptionValue(optionValues) {
    const optionValueCount = optionValues.length;
    if (optionValueCount <= 0) {
        return null;
    }
    const randomOptionValueIndex = Math.floor(Math.random() * optionValueCount) + 1;
    console.log(`------> Number of Option Values ${optionValueCount} - pick random ${randomOptionValueIndex}`);

    const randomOptionValue = {
        optionValueId: optionValues[randomOptionValueIndex - 1].id
    };

    return randomOptionValue;

}

function randomOptionValues(prototypeId, prototypes, objectType) {
    const prototype = prototypes.data.nodes.find(proto => proto.id === prototypeId);

    let optionValues = [];

    console.log(`----> \x1b[35mPrototype Name: ${prototype.name}\x1b[35m`);

    //Check for optionTypes of objectType (ADVERT / VARIANT)
    prototype.optionTypes.nodes.forEach(optionType => {
        if (optionType.appliedTo === objectType) {
            if (optionType.fieldType === "FREE_TEXT") {
                const freeText = {
                    optionTypeId: optionType.id,
                    textValue: "Some Random String"
                };
                optionValues.push(freeText);
            } else {
                // We need to parse the Option Values
                const randomOV = getRandomOptionValue(optionType.optionValues.nodes);
                if (randomOV !== null) {
                    optionValues.push(randomOV);
                }
            }
        }
    });

    console.log(`-----> ${optionValues.length}`);
    if (optionValues.length === 0) {
        console.log(`-----> We do not have optionValues for ${objectType}`)
    } else {
        console.log(`-----> Here's our random optionValues collection for ${objectType}`);
        console.log(JSON.stringify(optionValues));
    }

    return optionValues;
}