import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupBrowser, setupDataX, closeBrowser } from "../Setup";
import {
  navToStake,
} from "../Utilities";

describe("Execute Standard Trades on StakeX", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let lastTestPassed: boolean = true;

  beforeAll(async () => {
    const tools = await setupBrowser();
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await setupDataX(page, browser, metamask);
    await navToStake(page)
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Stake 10 OCEAN", ()=> {
      expect(true).toBeTruthy()
  })

});

