import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import {
  setupDappBrowser,
  setupDataX,
  closeBrowser,
  getBalanceInMM,
  acceptCookies,
  switchAccounts,
  setUpSwap,
  evaluateMax,
  getBalanceInDapp,
  swapOrSelect,
  clickMaxTrade,
  selectToken,
  awaitTokenSelect,
  getPercInDapp,
  typeAmount,
  getExecuteButtonText,
  getSelectedTokens,
  navToTradeXFromLanding,
} from "../utils";
import BigNumber from "bignumber.js";
describe("Token modal should present datatokens and other ERC20 tokens as expected", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let acc1DapBalT1: BigNumber,
    acc1MMBalT1: BigNumber,
    acc2DapBalT1: BigNumber,
    acc2MMBalT1: BigNumber,
    acc1DapBalT2: BigNumber,
    acc1MMBalT2: BigNumber,
    acc2DapBalT2: BigNumber,
    acc2MMBalT2: BigNumber,
    acc3DapBalt1: BigNumber;

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

  it("Should have OCEAN balance > 0 to run these tests", async () => {
    //import and check ocean balance
  });
  it("Should be able to select datatokens on trade", async () => {
    //open token modal
    //select datatoken
    //check datatoken populates field
  });
  it("Should be able to select ERC20 tokens on trade", async () => {
    //OPEN TOKEN MODAL
    //select erc20 tab
    //select erc20 token (not ocean, weth?)
  });
  it("Should be able to select datatokens on stake", async () => {
    //nav to stake
    //open token modal
    //select datatoken
    //check datatoken populates field
  });
  it("Should be able to select ERC20 tokens on stake", async () => {
    //OPEN TOKEN MODAL
    //select erc20 tab
    //select erc20 token (not ocean, weth?)
  });
  it("Should be able to select datatokens on LP", async () => {
    //nav to lp
  });
  it("Should not be able to select ERC20 tokens on LP", async () => {
    //OPEN TOKEN MODAL
    //verify erc20 tab does not exist
  });
  it("Should fetch a new list of tokens when network changes", async () => {
    //nav to stake
    //check list for datatokens, get token 1 or length or something
    //check list for erc20 tokens, get token 1 or length or something
    //switch netowork
    //check list for datatokens, get token 1 or length or something
    //check list for erc20 tokens, get token 1 or length or something
    //ensure tokens change
  });
});
