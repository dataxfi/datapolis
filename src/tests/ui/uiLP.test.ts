import puppeteer from 'puppeteer'
import * as dappeteer from '@keithers98/dappeteer-stable'
import 'regenerator-runtime/runtime'
import {
  setupDataX,
  closeBrowser,
  quickConnectWallet,
  testAcctId,
  importStakeInfo,
  navToLp,
  navToTradeXFromLanding,
  acceptCookies,
  goToLocalHost
} from '../utils'

describe('Execute Standard Trades on Stake', () => {
  jest.setTimeout(300000)
  let page: puppeteer.Page
  let browser: puppeteer.Browser
  let metamask: dappeteer.Dappeteer

  beforeAll(async () => {
    browser = global.browser
    page = global.page
    metamask = global.metamask
    await goToLocalHost(page)
    await navToTradeXFromLanding(page)
    await acceptCookies(page)
    await setupDataX(page, metamask, 'rinkeby', false)
    await page.evaluate((testAcctId) => {
      window.localStorage.removeItem(`allStakedPools@4@${testAcctId}`)
    }, testAcctId)
    await navToLp(page)
  })

  afterAll(async () => {
    await closeBrowser(browser)
  })

  it('Import message should show when no staked pools.', async () => {
    await page.waitForSelector('#importMessage')
  })

  // it("Should not show loading if no staked pools.", async () => {
  //   await page.waitForFunction('document.querySelector("#lpLoading") === null', { timeout: 5000 });
  // });

  it("Shoud disable buttons if wallet isn't connected.", async () => {
    await page.reload()
    await page.waitForSelector('#d-wallet-button')
    await page.waitForFunction('document.querySelector("#d-view-txs-btn") === null')
    await page.waitForSelector('#importStakeBtn[disabled]')
    // await page.waitForSelector("#scanStakeBtn[disabled]");
  })

  it('Shoud enable buttons if wallet is connected.', async () => {
    await quickConnectWallet(page)
    await page.waitForSelector('#d-view-txs-btn')
    await page.waitForFunction('document.querySelector("#d-wallet-button") === null')
    await page.waitForSelector('#importStakeBtn:not([disabled])')
    // await page.waitForSelector("#scanStakeBtn:not([disabled])");
  })

  it('Should be able to import pool with import button. (SAGKRI-94)', async () => {
    await importStakeInfo(page, 'SAGKRI-94')
    // await page.waitForSelector("#loadingStakeMessage");
    await page.waitForSelector('#SAGKRI-94-lp-item')
    // await page.waitForFunction('document.querySelector("#lpLoading") === null', { timeout: 5000 });
  })

  it('Should be able to open and view stake info. (SAGKRI-94)', async () => {
    await page.waitForSelector('#SAGKRI-94-lp-item')
    await page.click('#SAGKRI-94-lp-item')
    await page.waitForSelector('#yourSharesTitle')
    await page.waitForFunction('document.querySelector("#yourSharesTitle").innerText === "Your Shares in Pool"')
    await page.waitForSelector('#yourShares')
    await page.waitForSelector('#totalPooled1Title')
    await page.waitForFunction("document.querySelector('#totalPooled1Title').innerText === 'Total Pooled SAGKRI-94'")
    await page.waitForSelector('#totalPooled1')
    await page.waitForSelector('#totalPooled2Title')
    await page.waitForFunction("document.querySelector('#totalPooled2Title').innerText === 'Total Pooled OCEAN'")
    await page.waitForSelector('#totalPooled2')
    await page.waitForSelector('#yourSharesPercTitle')
    await page.waitForFunction("document.querySelector('#yourSharesPercTitle').innerText === 'Your pool share'")
    await page.waitForSelector('#yourSharesPerc')
    await page.waitForSelector('#totalSharesTitle')
    await page.waitForFunction("document.querySelector('#totalSharesTitle').innerText === 'Total Shares in Pool'")
    await page.waitForSelector('#totalShares')
  })

  it('Should save data to localStorage and load from localStorage in next session', async () => {
    await page.reload()
    await quickConnectWallet(page)
    await page.waitForSelector('#SAGKRI-94-lp-item')
    // await page.waitForSelector("#loadingStakeMessage");
    const local = await page.evaluate((testAcctId) => window.localStorage.getItem(`allStakedPools@4@${testAcctId.toLowerCase()}`), testAcctId)
    const parsed = JSON.parse(String(local))
    expect(parsed).toHaveLength(1)
  })

  // Test the values in Stake and LP are the same
  // Import a pool with 0 share and test disabled buttons
  // No duplicates test is needed
})
