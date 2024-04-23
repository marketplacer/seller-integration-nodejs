class EncodeDecode {
    static generateBasicAuthHeader(username, password) {
        return ('Basic ' + Buffer.from(username + ':' + password).toString('base64'));
    }

    static constructGqlId(id, entity) {
        return (Buffer.from(entity + '-' + id).toString('base64'));
    }
}

module.exports = EncodeDecode;