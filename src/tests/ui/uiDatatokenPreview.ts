import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, acceptCookies, navToTradeXFromLanding } from "../utils";
import BigNumber from "bignumber.js";
describe("Trade Platform User Interface Works as Expected", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    const tools = await setupDappBrowser(true);
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await acceptCookies(page);
    await navToTradeXFromLanding(page);
    await setupDataX(page, metamask, "polygon", false);
    await page.bringToFront();
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should open datatoken preview when selecting a datatoken", async () => {
    //open token modal
    //select datatoken for token 2
    //wait a moment for transition
    //ensure token preview opens
  });
  it("Should be able to close preview with back button", async () => {
    //press back button
    //wait a moment for transition
    //ensure modal closes (beware it doesnt unrender, check for it in viewport)
  });
  it("Should be able to open preview with preview dataset button", async () => {
    //press preview dataset button
    //wait a moment for transition
    //ensure preview appears
  });
  it("Should be able to close preview with preview dataset button", async () => {
    //press preview dataset button
    //wait a moment for transition
    //ensure preview dissapears
  });
});
