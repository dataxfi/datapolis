import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { approve, approveTransactions } from "./Utilities";

export const testAcctId = "0x867A6D38D30C4731c85bF567444F8CF22885DfAd";

export async function closeBrowser(browser: puppeteer.Browser) {
  try {
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}
export async function setupPuppBrowser() {
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  try {
    browser = await puppeteer.launch({ headless: false, timeout: 5000 });
    page = await browser.newPage();
    await page.goto("http://localhost:3000/");
    return { page, browser };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function setupDappBrowser(acct2: boolean = false) {
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  try {
    browser = await dappeteer.launch(puppeteer, {
      metamaskVersion: "v10.8.1",
      headless: false,
      timeout: 5000,
      ignoreDefaultArgs:["--disable-popup-blocking", "--disable-extensions"]
    });
    console.log(
      `Setting up metamask with creds: \n Password: ${process.env.REACT_APP_T_ACCT_PASS} \n Seed: ${process.env.REACT_APP_T_ACCT_SEED}`
    );

    metamask = await dappeteer.setupMetamask(browser, {
      seed: process.env.REACT_APP_T_ACCT_SEED,
      password: process.env.REACT_APP_T_ACCT_PASS,
    });

    if (acct2 && process.env.REACT_APP_T_ACCT2_PK && process.env.REACT_APP_T_ACCT_PASS) {
      console.log("Importing Account Two")
      await metamask.importPK(process.env.REACT_APP_T_ACCT2_PK);
      await metamask.switchAccount(1)
    }

    await metamask.switchNetwork("rinkeby");

    page = await browser.newPage();
    await page.goto("http://localhost:3000/");
    return { page, browser, metamask };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function quickConnectWallet(page: puppeteer.Page) {
  await page.waitForSelector("#d-wallet-button");
  await page.click("#d-wallet-button");
}

export async function setupDataX(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  network: string,
  mobile: boolean
) {
  expect(page).toBeDefined();
  mobile ? await page.setViewport({ width: 360, height: 740 }) : await page.setViewport({ width: 1039, height: 913 });
  await metamask.switchNetwork(network);
  await page.bringToFront();
  await quickConnectWallet(page);
  await page.waitForSelector(".sc-hKwDye.iWCqoQ.web3modal-provider-container");
  await page.click(".sc-hKwDye.iWCqoQ.web3modal-provider-container");
  
  try {
    // Confirm Connection in MetaMaks
    await approve(metamask.page, true);
    await approve(metamask.page, true);
  } catch (error) {
    console.log("Coudnt connect to site.");
  }
  await page.bringToFront();
  await quickConnectWallet(page);
  await metamask.page.bringToFront();
  await approveTransactions(metamask, page, 1);

  //Check wallet address in is the button
  const walletBtn = await page.waitForSelector("#d-view-txs-btn");

  await new Promise((res, rej) => setTimeout(res, 500));
  const btnText = await page.evaluate((el) => el.textContent, walletBtn);
  expect(btnText).toBe("0x867...DfAd");
}

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
