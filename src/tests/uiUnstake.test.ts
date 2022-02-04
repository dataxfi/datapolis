import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, quickConnectWallet } from "./Setup";
import {
  getShares,
  navToLp,
  navToRemoveStake,
  navToStake,
  navToTrade,
  getBalanceInMM,
  navToStakeWPool,
  navToLpFromUnstake,
  acceptCookies,
} from "./Utilities";

describe("User Interface Works as Expected", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let lastTestPassed: boolean = true;

  beforeAll(async () => {
    const tools = await setupDappBrowser();
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await setupDataX(page, metamask, "rinkeby", false);
    await page.bringToFront()
    await acceptCookies(page)
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should have OCEAN balance > 0 to run these tests", async () => {
    const balance = await getBalanceInMM(metamask, "OCEAN");
    await page.waitForFunction('document.querySelector("#loading-lp") === null')
    expect(Number(balance)).toBeGreaterThan(0);
  });


  // //Unstake
  // it("Check transactions for less than .01 ocean are not allowed", async () => {});
  // it("Stake button is: disabled when input = 0, enabled when input is > 0, disabled when input > balance", async () => {});
  // it("Stake button says select token when before token is selected", async () => {});
  // it("Stake button says enter ocean amount when token is selected", async () => {});
  // it("Stake button says unlock or stake when token input is entered", async () => {});
  // it("Balance updates when connecting wallet", async () => {});
  // it("Max button disabled before token is selected", async () => {});
  // it("Max unstake should limit input when less than user balance", async () => {});
  // it("Balance should limit input when less than max stake", async () => {});

});
