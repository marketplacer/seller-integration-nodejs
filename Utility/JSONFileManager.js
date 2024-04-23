const fs = require('fs');


class JSONFileManager {

    static loadJSONNodesFromFile(pathToFile) {
        try {
            const data = fs.readFileSync(pathToFile, 'utf8');
            const nodes = JSON.parse(data);
            return nodes;
        } catch (exception) {
            console.error('\x1b[31mError reading product file:\x1b[0m', exception);
            process.exit(1);
        }
    }

    static writeJSONToFile(pathToFile, jsonString) {
        try {
            fs.writeFile(pathToFile, jsonString, (err) => {
                if (err) {
                    console.error('\x1b[31mError writing file:\x1b[1m', err);
                }
                console.log('\x1b[32m-> File' + pathToFile + ' written OK.\x1b[0m');
            });
        } catch (exception) {
            console.error('\x1b[31mException writing file:\x1b[1m', exception);
            process.exit(1);
        }
    }

    static appendJSONToFile(pathToFile, jsonString) {
        try {
            fs.appendFile(pathToFile, jsonString, (err) => {
                if (err) {
                    console.error('\x1b[31mError writing file:\x1b[1m', err);
                }
                //console.log('\x1b[32m-> File' + pathToFile + ' written OK.\x1b[0m');
            });
        } catch (exception) {
            console.error('\x1b[31mException writing file:\x1b[1m', exception);
            process.exit(1);
        }
    }

    static deleteFile(pathToFile) {
        try {
            fs.unlink(pathToFile, (err) => {
                if (err) {
                    //console.error('\x1b[31mError writing file:\x1b[1m', err);
                }
                //console.log('\x1b[32m-> File' + pathToFile + ' removed OK.\x1b[0m');
            });
        } catch (exception) {
            console.error('\x1b[31mException removing file:\x1b[1m', exception);
            process.exit(1);
        }
    }

    static checkAndCreateFolder(pathToFolder) {
        fs.stat(pathToFolder, (err) => {
            if (err) {
                // If the folder doesn't exist, create it
                if (err.code === 'ENOENT') {
                  fs.mkdir(pathToFolder, (err) => {
                    if (err) {
                      console.error('Error creating folder:', err);
                    }
                  });
                } else {
                  // If there was another error, log it
                  console.error('Error checking folder existence:', err);
                }
              }
0        });
    }

    
}

module.exports = JSONFileManager;