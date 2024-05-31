class GQLOperationLibrary {
    static advertUpsert = `
    mutation advertUpsert($input: AdvertUpsertMutationInput!) {
        advertUpsert(input: $input) {
          status
          advert {
            id
            legacyId
          }
          errors {
            field
            messages
          }
        }
      }
    `;

    static brands = `
    query getFirst10Brands {
      brands(first: 100) {
        nodes {
          id
          name
        }
      }
    }
    `;


    static taxons = `
    query getSomeEndNodeTaxons{
        taxons(first: 100) {
          nodes {
            id
            displayName
            prototype {
              name
              id
            }
            children(first: 5) {
              nodes {
                id
                displayName
                prototype {
                  name
                  id
                }
                children(first: 5) {
                  nodes {
                    id
                    displayName
                    prototype {
                      name
                      id
                    }
                    children(first: 5) {
                      nodes {
                        id
                        displayName
                        prototype {
                          name
                          id
                        }
                        children(first: 5) {
                          nodes {
                            id
                            displayName
                            prototype {
                              name
                              id
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    static getPrototypesById = `
    query getPrototype($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Prototype {
          id
          name
          optionTypes {
            nodes {
              id
              name
              fieldType
              appliedTo
              optional
              optionValues {
                nodes {
                  id
                  name
                  displayName
                }
              }
            }
          }
        }
      }
    }`;

    static getNonDispatchedInvoices = `
    query getNonDispatchedInvoices(
      $first: Int 
      $after: String
      $filters: InvoiceFilters,
      $sort: InvoiceSort
    ){
      invoices(
        first: $first, 
        after: $after,
        filters: $filters
        sort: $sort
      
      ) {
        totalCount
        pageInfo{
          hasNextPage
          endCursor
        }
        nodes {
          id
          legacyId
          createdAt
          buyerSurname
          buyerFirstName
          buyerPhone
          buyerEmailAddress
          shippingAddress {
            address
            city
            state{
              short
            }
            postcode
          }
          seller {
            businessName
          }
          lineItems {
            id
            variantSku
            variantBarcode
            variantName
            quantity
          }
        }
      }
    }
    
    `;

    static getIndividualInvoice = `
    query getInvoice($id: ID!){
      node(id: $id) {
        ... on Invoice {
          legacyId
          id
          statusFlags
          lineItems {
            id
            legacyId
            quantity
            variantId
            status
          }
          shipments {
            id
            trackingLink
            trackingNumber
            carrier
            shippedItems {
              id
              lineItem{
                id
              }
              quantity
            }
          }
        }
      }
    }
    `;

    static getInvoiceByLegacyId = `
    query getInvoiceByLegacyId($first: Int, $filters: InvoiceFilters) {
      invoices(first: $first, filters: $filters) {
        totalCount
        nodes {
          legacyId
          id
          statusFlags
          lineItems {
            id
            legacyId
            quantity
            variantId
            status
          }
          shipments {
            id
            trackingLink
            trackingNumber
            carrier
            shippedItems {
              id
              lineItem {
                id
              }
              quantity
            }
          }
        }
      }
    }
    
    `;

    static getShipmentCarriers =  `
    query getShipmentCarriers($pageSize: Int, $endCursor: String) {
      shipmentCarriers(first: $pageSize, after: $endCursor) {
        totalCount
        pageInfo{
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
        }
      }
    }
    `;

    static dispatchLineItems = `
    mutation dispatchLineItems($input: ShipmentCreateMutationInput!){
      shipmentCreate(
        input: $input
      ) {
        errors {
          field
          messages
        }
        shipment {
          id
        }
      }
    }
    `;
}

module.exports = GQLOperationLibrary;