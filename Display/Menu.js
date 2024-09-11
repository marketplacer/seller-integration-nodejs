class Menu {

    // Text

    static marketplacerLogo = `

    MM    MM   AAA   RRRRRR  KK  KK EEEEEEE TTTTTTT PPPPPP  LL        AAA    CCCCC  EEEEEEE RRRRRR   TM
    MMM  MMM  AAAAA  RR   RR KK KK  EE        TTT   PP   PP LL       AAAAA  CC    C EE      RR   RR 
    MM MM MM AA   AA RRRRRR  KKKK   EEEEE     TTT   PPPPPP  LL      AA   AA CC      EEEEE   RRRRRR  
    MM    MM AAAAAAA RR  RR  KK KK  EE        TTT   PP      LL      AAAAAAA CC    C EE      RR  RR  
    MM    MM AA   AA RR   RR KK  KK EEEEEEE   TTT   PP      LLLLLLL AA   AA  CCCCC  EEEEEEE RR   RR                                                                              
    `;

    static license = `\x1b[2m    The license covering the usage of this software can be found here:
    https://github.com/marketplacer/seller-integration-nodejs/blob/main/LICENSE\x1b[0m
    `;
    
    // Methods

    static displayWelcome() {
        console.log(this.marketplacerLogo);
    }

    static displayLicense() {
        console.log(this.license);
    }

    static displayMenu() {
        console.log("1. Generate test products data file");
        console.log("2. Ingest your test products into Marketplacer");
        console.log("3. Retrieve your orders from Marketplacer");
        console.log("4. Dispatch your orders");
        console.log("5. Delete ALL products");
    }
}

module.exports = Menu;