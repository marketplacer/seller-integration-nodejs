# Marketplacer Seller Integration with Node.js

![image](https://github.com/binarythistle/seller-integration-nodejs/assets/815719/a2346614-ad8f-42e1-a5fe-d4864a1a2b0b)


This is a simple Node.js seller integration into Marketplacer using the GraphQL Seller API

## What you'll learn

This app is intended to help sellers and channel managers new to Marketplacer to:

- Understand the core interactions of a Seller integration
- Understand both the generic and Marketplacer specific concepts of the GraphQL Seller API
- Understand how to use node.js to start writing seller-based integrations

## About the app

The app is written in JavaScript using node.js. It is intended to be a lightweight demonstration of the core concepts a seller should be aware of when integrating into Marketplacer. 

> [!IMPORTANT]
> It is not intended to be a production-ready solution, for more detail please refer to the [license](./LICENSE).

The app attempts to use as few external packages as possible, keeping it simple, and focused on the concepts at hand. For example:

- For persistent storage we are only using JSON files
- We are not making use of a GraphQL Client (e.g. Apollo), instead we are just using the standard `fetch` api

## Quick Start

To get up and running with this sample app, here are the steps you should follow:

### Prerequisites (Marketplacer App)

1. Obtain the Seller API endpoint for your Marketplacer instance, e.g.:

```bash
https://<your-marketplacer-instance>.marketplacer.com/graphql
```
> [!TIP]
> Remember to include the `/graphql` component of the route

2. [Generate a Seller API Key](https://dev.marketplacer.com/docs/seller-api/getting_started/#step-1-get-an-api-key)
3. [Optional] If using additional Basic Authentication, obtain the Basic Auth username and password from your Marketplacer representative.

> [!NOTE]
> The Basic Auth credentials are not the same as your seller login to Marketplacer

### Prerequisites (Local Development Environment)

3. Install node.js

To check you have this installed correctly, type `node -v` at the command line, you should get a response similar to the following:

```bash
v20.11.1
```

> [!TIP]
> We recommend that you use node 20 or above to run this demo

4. Clone this repo to your local machine:

```bash
git clone https://github.com/marketplacer/seller-integration-nodejs.git
```

5. Open the project folder (`seller-integration-nodejs`) in the code editor of your choice and update the `config.json` file with the configuration elements you gathered above, specifically:

- Seller API endpoint
- Seller API Key
- [Optional] Basic Auth Username
- [Optional] Basic Auth Password

Your `config.json` file should look something like this (remembering to save it too): 

```json
{
    "marketplacerApiKey" : "54dqQOJEERD6HpJGYyE36WLjdXP98A........",
    "marketplacerApiEndpoint" : "https://amazingbuy.marketplacer.com/graphql",
    "basicAuthUsername" : "dduck",
    "basicAuthPassword" : "Abcd1234!@"
}
```

6. Run NPM install

We have kept external packages to a minimum but we are using `faker/js` to help generate test product data, so to ensure you have the package locally type:

```bash
npm install
```

### Running the app

At a command line type: 

```bash
node app.js
```

You should then be presented with something similar to the following:

```bash    
Your endpoint is set to: https://amazingbuy.marketplacer.com/graphql

1. Generate test product data file
2. Ingest your test products into Marketplacer
3. Retrieve your orders from Marketplacer
4. Dispatch your orders
Choose an option (1 - 4):
```
We have 4 options to pick from that depict a standard flow a Seller would typically follow when integrating into Marketplacer:
![image](https://github.com/binarythistle/seller-integration-nodejs/assets/815719/dd2bfd19-44ec-48e5-83c1-58cc48a72edd)


#### 1. Generate test products data file

We have provided this option to demonstrate how you can prepare product data for ingestion, it covers key concepts such as: Brands, Taxons, Prototypes, Option Types and Option values that are important when understanding how to create products.

> [!NOTE]
> These concepts are [further covered in this article.](https://dev.marketplacer.com/docs/seller-api/examples/products/howto_addproducts_latest/).

It should be noted however, that while we are using valid category data from Marketplacer to generate products, we are doing so in a standalone way, i.e. we are not mapping back to any other source product data - something that you would typically be doing in a real-world example.

This step:

- Retrieves a list of the first 10 Brands stored on the platform
  - We use the `brands` query to achieve this
  - **NOTE:** we don't use pagination in this step, we introduce this in step 3
- Retrieves the first 10 Taxons (Categories) from your Marketplacer instance
  - We use the `taxons` query to achieve this
- Generates a list of "leaf taxons" that we will use to create products
- Determines the Prototype (attribute group) used by each Leaf Taxon
- For each Prototype we then retrieve a list of Option Types (attributes) and Options Values (attribute values)
  - We use the `nodes` query to return `prototype` objects to achieve this 
- We then create a list of products (saved to `/DataFiles/products.json`) that can be imported in step 2.

> [!NOTE]
> We use randomly selected Option Values for each product and variant, in addition to using the `faker/js` package to create random / fake product descriptions, prices etc.

By the end of this step you will have a `products.json` file that will contain 10 valid test products ready for import / creation in step 2.

#### 2. Ingest your test products into Marketplacer

This step:

- We read the `products.json` file generated in Step 1
- For each product we call the `advertUpsert` mutation to create the product


#### 3. Retrieve your orders from Marketplacer

> [!TIP]
> From a Seller perspective we refer to Orders as "invoices".

This step:

- We use the [`invoices` query to retrieve invoices](https://dev.marketplacer.com/docs/seller-api/examples/orders/invoices/) from Marketplacer that have not been dispatched
  - **NOTE:** we use pagination in this example to ensure we cycle through the entire dataset

#### 4. Dispatch your orders

This step:

- We ask for an invoice Id for an invoice that still needs to be shipped
- We query for that individual invoice using the `node` query
- Using the [`statusFlags` of the invoice](https://dev.marketplacer.com/docs/seller-api/examples/orders/howto_invoicestatusflags/) we determine if it can be shipped
- We get a list of Shipment (Postage) Carriers, and pick a random Id for one of them
- Looking at all the line items for the invoice we build a list of all the remaining shippable items
- We construct the variable set we'll pass to `shipmentCreate`, consisting of:
	- The `invoiceId`
	- A `dispatchedAt` date
	- A `note` (randomly generated using Faker)
	- A `postageCarrierId` - this was the randomly generated value above
	- A `trackingNumber` - randomly generated using Faker
	- Our generated `shippedItems` list
- We [call the `shipmentCreate` mutation](https://dev.marketplacer.com/docs/seller-api/examples/shipping/creating_shipments/) to create a shipment for all remaining line items

## Future releases

Some possible future extensions to this app are:

- Passing brand and taxon "mapping" values when we create products (this example uses taxon and brand Ids)
- Allow selective shipments of line items (this example just ships all remaining un-shipped line items)
- Allow for the creation of Refund Requests
- Allow for the acceptance and return of refund requests
- Utilize webhooks for Invoice retrieval (this would likely be a separate project)
- Utilize a GraphQL client like Apollo
