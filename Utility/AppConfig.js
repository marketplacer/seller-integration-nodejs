const fs = require('fs');

class AppConfig {
    constructor() {
        this._config = null;
        this.loadConfig();
    }

    loadConfig() {
        
        try {
            const data = fs.readFileSync('./config.json', 'utf8');
            this._config = JSON.parse(data);
          } catch (err) {
            console.error('Error reading config file:', err);
            process.exit(1);
          }
    }

    get sellerAPIEndpoint() {
        return this._config.marketplacerApiEndpoint;
    }

    get sellerAPIKey() {
        return this._config.marketplacerApiKey;
    }

    get basicAuthUserName() {
        return this._config.basicAuthUsername;
    }

    get basicAuthPassword() {
        return this._config.basicAuthPassword;
    }
}

module.exports = new AppConfig();