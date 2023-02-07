import { Builder, By, Key, until } from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('generateAPI', async function () {
    this.timeout(10000);
    let driver;

    if (!fs.existsSync('./screenshots')){
        fs.mkdirSync('./screenshots');
    }

    const generateAPI = async (prompt) => {
        console.log(prompt);
        await driver.get('https://localhost:5173');
        const story = await driver.findElement(
            By.id('story'));

        const submitButton= await driver.findElement(
                By.id('submit'));

        await story.sendKeys(prompt, Key.ENTER);

        submitButton.click();

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.id('definition')));

        // Return page content
        const definition = await driver.findElement(By.id('definition'));
        console.log(definition.getText());
        return await definition.getText();
    };

    // Make sure the BROWSER env variable is set
    before(async function() {
        if (!process.env.BROWSER) {
            throw new Error('No BROWSER environment variable set')
        }
    });

    // Before each test, initialize Selenium and launch the browser
    beforeEach(async function() {
        // Microsoft uses a longer name for Edge
        let browser = process.env.BROWSER;
        if (browser === 'edge') {
            browser = 'MicrosoftEdge';
        }

        // Connect to service specified in env variable or default to 'selenium'
        const host = process.env.SELENIUM || 'selenium';
        const server = `http://${host}:4444`;
        driver = await new Builder()
            .usingServer(server)
            .forBrowser(browser)
            .build();
    });

    // After each test, take a screenshot and close the browser
    afterEach(async function () {
        if (driver) {
            // Take a screenshot of the result page
            const filename = this.currentTest.fullTitle()
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`,
                encodedString, 'base64');

            // Close the browser
            await driver.quit();
        }
    });
    
    //const words = require('random-words');
    // Our test definitions
    //let test = words(2);
    let test = ["librarian", "books"];
    it('Generate API', async function () {
        const content = await generateAPI('As a ' + test[0] + ' I want to get all '+ test[1]);
        assert.isTrue(content.includes(test[1]));
    });

});
