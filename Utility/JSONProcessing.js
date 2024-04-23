class JSONProcessing {
    static GetLeafTaxonsOnly(jsonData) {
        const leafNodes = jsonData.data.taxons.nodes.flatMap(node => this.getLeafNodes(node));

        return leafNodes;
    }

    static getLeafNodes(node) {

        if (!node.children || node.children.nodes.length === 0) {
            return [node];
        } else {
            return node.children.nodes.flatMap(childNode => this.getLeafNodes(childNode));
        }
    }

    static attemptToShip(statusFlags) {
        if (statusFlags.length <= 0) {
            console.log('\x1b[31m---> Invoice has no status flags - something is wrong here.\x1b[0m');

            // If we don't have status flags something is wrong, no point in attempting to ship
            return false;
        }

        statusFlags.forEach(status => {
            console.log(`\x1b[33m--> ${status}\x1b[0m`);
        });
        const onlyPaid = statusFlags.every(status => status === 'PAID');
        const containsPaidAndPartiallySent = statusFlags.includes("PAID") && statusFlags.includes("PARTIALLY_SENT");

        return onlyPaid || containsPaidAndPartiallySent;
    }

    static buildShippableLineItemsList(invoice) {
        console.log('--> Building a list of items still to ship');

        let shippedItems = [];

        //Check if any shipments - if not just display line items
        if (invoice.data.node.shipments.length == 0) {
            console.log('--> No shipments - ship everything');
            invoice.data.node.lineItems.forEach(lineItem => {
                console.log(`\x1b[34m---> Line Item Id: ${lineItem.legacyId} (${lineItem.quantity} / ${lineItem.quantity})\x1b[0m`);
                shippedItems.push({
                    lineItemId: lineItem.id,
                    quantity: lineItem.quantity
                });
            });
        } else {
            console.log('--> Partial shipments - ship remaining');
            // We have some shipped items we need to adjust the quantities we can ship
            invoice.data.node.lineItems.forEach(lineItem => {
                let shippedLineItemQuantity = lineItem.quantity - this.returnShippedQuantity(lineItem.id, lineItem.legacyId, invoice.data.node.shipments);
                if (shippedLineItemQuantity > 0) {
                    console.log(`\x1b[34m---> Line Item Id: ${lineItem.legacyId} (${shippedLineItemQuantity} / ${lineItem.quantity})\x1b[0m`);
                    shippedItems.push({
                        lineItemId: lineItem.id,
                        quantity: shippedLineItemQuantity
                    });
                }
            });
        }

        return shippedItems;
    }

    static returnShippedQuantity(lineItemId, legacyId, shipments) {
        let shippedLineItemQuantity = 0;
        shipments.forEach(shipment => {
            shipment.shippedItems.forEach(shippedItem => {
                if (shippedItem.lineItem.id === lineItemId) {
                    shippedLineItemQuantity += shippedItem.quantity;
                }
            });
        });

        console.log(`----> Line Item Id ${legacyId} has been shipped: ${shippedLineItemQuantity}`);

        return shippedLineItemQuantity;
    }

}

module.exports = JSONProcessing;