const security = require('../Utility/EncodeDecode.js')

class DataService {
  constructor(
    sellerAPIEndpoint,
    sellerAPIKey,
    basicAuthUserName = 'n/a',
    basicAuthPassword = 'n/a') {
    this._sellerAPIEndpoint = sellerAPIEndpoint;
    this._sellerAPIKey = sellerAPIKey;
    this._basicAuthUserName = basicAuthUserName;
    this._basicAuthPassword = basicAuthPassword;
  }

  async gqlRequest(gqlQuery, gqlOperation, gqlVariables) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'Marketplacer Node.js Seller Integrator',
        'marketplacer-api-key': this._sellerAPIKey,
        'Authorization': security.generateBasicAuthHeader(this._basicAuthUserName, this._basicAuthPassword)

      },
      body: JSON.stringify(
        {
          query: gqlQuery,
          operation: gqlOperation,
          variables: gqlVariables

        }
      ),
    };

    const res = await fetch(this._sellerAPIEndpoint, requestOptions);
    if (!res.ok) {
      console.log(`\x1b[31m->Could not get a response from the API: ${res.status}\x1b[0m`);
    } else {
      console.log('\x1b[32m-> Response OK\x1b[0m');
      return await res.json();
    }
    
  }
}

module.exports = DataService;