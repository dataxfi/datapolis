import puppeteer from "puppeteer";
import * as dappeteer from "@keithers98/dappeteer-stable";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, acceptCookies, navToTradeXFromLanding, goToLocalHost } from "../utils";
import BigNumber from "bignumber.js";
describe("Datatoken previews should work as expected", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await acceptCookies(page);
    await navToTradeXFromLanding(page);
    await setupDataX(page, metamask, "rinkeby", false);
    await page.bringToFront();
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should open datatoken preview when selecting a datatoken", async () => {
    //select datatoken for token 2
    //open token modal
    const selectToken2 = await page.waitForSelector("#selectToken2");
    await selectToken2?.click();
    await page.waitForTimeout(150);
    //select datatoken
    const tokenModal = await page.waitForSelector("#tokenModal", { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    await page.waitForTimeout(150);
    const ARCCOR20 = await page.waitForSelector("#ZEASEA-66-btn", { timeout: 3000 });
    expect(ARCCOR20).toBeDefined;
    ARCCOR20?.click();
    //check datatoken populates field
    await page.waitForTimeout(500);
    const selectedToken1 = await page.waitForSelector("#selectedToken1");
    const innerText = await selectedToken1?.getProperty("innerText");
    expect(innerText).toBe("ZEASEA-66");
    //press preview dataset button
    const previewDatasetButton = await page.waitForSelector("#viewDescButton");
    await previewDatasetButton?.click();
    //ensure token preview opens
    const datasetPreviewModal = await page.waitForSelector("#dataset-desc-vis");
    expect(datasetPreviewModal).toBeDefined();
  });
  it("Should be able to close preview with back button", async () => {
    //press back button
    const backBtn = await page.waitForSelector("#datasetBackBtn");
    await backBtn?.click();
    //ensure modal closes (beware it doesnt unrender, check for it in viewport
    const invisModal = await page.waitForSelector("#dataset-desc-invis");
    expect(invisModal).toBeDefined();
  });
  it("Should be able to open preview with preview dataset button", async () => {
    //press preview dataset button
    const previewDatasetButton = await page.waitForSelector("#viewDescButton");
    await previewDatasetButton?.click();
    //ensure preview appears
    const datasetPreviewModal = await page.waitForSelector("#dataset-desc-vis");
    expect(datasetPreviewModal).toBeDefined();
  });
  it("Should be able to close preview with preview dataset button", async () => {
    //press preview dataset button
    const previewDatasetButton = await page.waitForSelector("#viewDescButton");
    await previewDatasetButton?.click();
    //ensure preview dissapears
    //ensure modal closes (beware it doesnt unrender, check for it in viewport
    const invisModal = await page.waitForSelector("#dataset-desc-invis");
    expect(invisModal).toBeDefined();
  });
});
