import puppeteer from "puppeteer";
import * as dappeteer from "@keithers98/dappeteer-stable";
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
  navToStake,
  navToLp,
  selectOrImportPool,
  importStakeInfo,
  goToLocalHost,
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
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
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
    const acc1MMBalT1 = await getBalanceInMM(metamask, "mOCEAN", 137);
    expect(Number(acc1MMBalT1)).toBeGreaterThan(0);
  });
  it("Should be able to select datatokens on trade", async () => {
    //open token modal
    const selectToken1 = await page.waitForSelector("#selectToken1");
    await selectToken1?.click();
    //select datatoken
    const tokenModal = await page.waitForSelector("#tokenModal", { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    const ARCCOR20 = await page.waitForSelector("#ARCCOR-20-btn", { timeout: 3000 });
    expect(ARCCOR20).toBeDefined;
    ARCCOR20?.click();
    //check datatoken populates field
    await page.waitForTimeout(500);
    const selectedToken1 = await page.waitForSelector("#selectedToken1");
    const innerText = await selectedToken1?.getProperty("innerText");
    expect(innerText).toBe("ARCCOR-20");
  });

  it("Should be able to select ERC20 tokens on trade", async () => {
    //OPEN TOKEN MODAL
    const selectToken2 = await page.waitForSelector("#selectToken2");
    await selectToken2?.click();
    const tokenModal = await page.waitForSelector("#tokenModal", { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    //select erc20 tab
    const ERC20BTN = await page.waitForSelector("#ERC20-btn", { timeout: 3000 });
    expect(ERC20BTN).toBeDefined();
    await ERC20BTN?.click();
    //TODO: select erc20 token (not ocean, weth?)
    //TODO: check token populates field
    await page.waitForTimeout(500);
    // const selectedToken2 = await page.waitForSelector("#selectedToken2");
    // const innerText = await selectedToken2?.getProperty("innerText");
    // expect(innerText).toBe("ARCCOR-20");
  });

  it("Should not be able to select erc20 tokens on stake token 2", async () => {
    //nav to stake
    await navToStake(page);
    const selectToken2 = await page.waitForSelector("#selectToken2");
    await selectToken2?.click();
    const tokenModal = await page.waitForSelector("#tokenModal", { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    //select erc20 tab
    const ERC20BTN = await page.waitForSelector("#ERC20-btn", { timeout: 3000 });
    expect(ERC20BTN).toBeFalsy();
  });

  it("Should be able to select datatokens on stake (token 2)", async () => {
    const ARCCOR20 = await page.waitForSelector("#ARCCOR-20-btn", { timeout: 3000 });
    expect(ARCCOR20).toBeDefined;
    ARCCOR20?.click();
    await page.waitForTimeout(500);
    const selectedToken1 = await page.waitForSelector("#selectedToken1");
    const innerText = await selectedToken1?.getProperty("innerText");
    expect(innerText).toBe("ARCCOR-20");
    //check datatoken populates field
  });
  it("Should be able to select ERC20 tokens on stake token 1", async () => {
    //open token modal
    const selectToken1 = await page.waitForSelector("#selectToken1");
    await selectToken1?.click();
    //select datatoken
    const tokenModal = await page.waitForSelector("#tokenModal", { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    //select erc20 tab
    const ERC20BTN = await page.waitForSelector("#ERC20-btn", { timeout: 3000 });
    expect(ERC20BTN).toBeDefined();
    await ERC20BTN?.click();
    //TODO: select erc20 token (not ocean, weth?)
    //TODO: check token populates field
    await page.waitForTimeout(500);
    const selectedToken1 = await page.waitForSelector("#selectedToken1");
    const innerText = await selectedToken1?.getProperty("innerText");
    expect(innerText).toBe("ARCCOR-20");
  });
  it("Should be able to select datatokens on LP", async () => {
    //nav to lp
    await navToLp(page);
    await importStakeInfo(page, "ARCCOR-20");
    await page.waitForSelector(`#ARCCOR-20-lp-item`, { timeout: 5000 });
  });
  it("Should not be able to select ERC20 tokens on LP", async () => {
    //OPEN TOKEN MODAL
    await page.waitForSelector("#importStakeBtn");
    await page.click("#importStakeBtn");
    await page.waitForSelector("#tokenModal");
    //select erc20 tab
    const ERC20BTN = await page.waitForSelector("#ERC20-btn", { timeout: 3000 });
    expect(ERC20BTN).toBeFalsy();
  });
  it("Should fetch a new list of tokens when network changes", async () => {
    //nav to stake
    //check list for datatokens, get token 1 or length or something
    //check list for erc20 tokens, get token 1 or length or something
    //switch netowork
    await metamask.switchNetwork("rinkeby")
    //check list for datatokens, get token 1 or length or something
    //check list for erc20 tokens, get token 1 or length or something
    //ensure tokens change
  });
});
