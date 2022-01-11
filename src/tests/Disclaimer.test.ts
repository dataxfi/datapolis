import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";

describe("Setup web3 and connect to wallet", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  async function closeBrowser() {
    try {
      await browser.close();
      console.log("Browser Succesfully Closed.");
    } catch (error) {
      console.log(error);
    }
  }

  async function setup() {
    try {
      browser = await dappeteer.launch(puppeteer, {
        metamaskVersion: "v10.1.1",
        headless: false,
        timeout: 0,
      });
      console.log(
        `Setting up metamask with creds: \n Password: ${process.env.REACT_APP_T_ACCT_PASS} \n Seed: ${process.env.REACT_APP_T_ACCT_SEED}`
      );

      metamask = await dappeteer.setupMetamask(browser, {
        seed: process.env.REACT_APP_T_ACCT_SEED,
        password: process.env.REACT_APP_T_ACCT_PASS,
      });
      await metamask.switchNetwork("rinkeby");
      // Add Ocean Token to MetaMask
      // await metamask.addToken("0x8967bcf84170c91b0d24d4302c2376283b0b3a07");
      page = await browser.newPage();
      await page.goto("http://localhost:3000/");
      console.log("Browser Succesfully Opened.");
    } catch (error) {
      console.log(error);
    }
  }

  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await closeBrowser();
  });

  it("Sign disclaimer and connect to wallet.", async () => {
    expect(page).toBeDefined();
    await page.setViewport({ width: 1039, height: 913 });
    await page.waitForSelector("#d-wallet-button");
    await page.click("#d-wallet-button");
    await page.waitForSelector(
      ".sc-hKwDye.iWCqoQ.web3modal-provider-container"
    );
    await page.click(".sc-hKwDye.iWCqoQ.web3modal-provider-container");
    //Confirm Connection in MetaMaks
    await metamask.confirmTransaction();
    await metamask.confirmTransaction();
    page.bringToFront();
    //Confirm disclaimer appears
    expect(
      await page.waitForSelector("#disclaimer-modal", {
        visible: true,
        timeout: 3000,
      })
    ).toBeDefined();
    //Sign disclaimer
    await page.waitForSelector("#sign-disclaimer-btn");
    await page.click("#sign-disclaimer-btn");

    //Sign disclaimer in metatmask
    await metamask.sign();
    page.bringToFront();

    //Check wallet address in is the button
    const walletBtn = await page.waitForSelector("#d-view-txs-btn")
    await new Promise((res,rej) => setTimeout(res, 3000))
    const btnText = await page.evaluate((el) => el.textContent, walletBtn);
    expect(btnText).toBe("0x867...DfAd");
  });
});

// Test priority

// High value features

// Boilerplate
// 1.Connecting to provider
// 2.Accessing user wallet
// 3.Collecting wallet information
// 4.Getting token lists

// Making Trade:
// 1. OCEAN to DT
// 2. DT to OCEAN
// 3. DT to DT

// Staking:
// 1. Stake ocean in Pool

// Unstaking:
// 1. Unstake ocean from pool

// LP:
// 1. Pool Import
// 2. Pool Scan

// Edge cases in highvalue features:
//
