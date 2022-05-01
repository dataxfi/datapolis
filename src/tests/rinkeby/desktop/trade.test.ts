/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */

import puppeteer from 'puppeteer'
import * as dappeteer from '@keithers98/dappeteer-stable'
import 'regenerator-runtime/runtime'
import {
  setupDataX,
  closeBrowser,
  approveTransactions,
  checkBalance,
  confirmAndCloseTxDoneModal,
  confirmTokensClearedAfterTrade,
  executeTransaction,
  reloadOrContinue,
  setUpSwap,
  navToTradeXFromLanding,
  goToLocalHost
} from '../../utils'

describe('Execute Standard Trades on Trade', () => {
  jest.setTimeout(300000)
  let page: puppeteer.Page
  let browser: puppeteer.Browser
  let metamask: dappeteer.Dappeteer

  beforeAll(async () => {
    browser = global.browser
    metamask = global.metamask
    page = global.page
    await goToLocalHost(page)

    console.log(!!browser, !!page, !!metamask)
    await navToTradeXFromLanding(page)
    await setupDataX(page, metamask, 'rinkeby', false)
  })

  afterAll(async () => {
    await closeBrowser(browser)
  })

  async function stdTradeFlow (t1Symbol: string, t2Symbol: string, amt: string, pos: number) {
    await setUpSwap(page, metamask, t1Symbol, t2Symbol, amt, pos)
    await checkBalance(page, metamask, false, t2Symbol, t1Symbol)
    await executeTransaction(page, metamask, 'trade')
    await approveTransactions(metamask, page, 1)
    await confirmAndCloseTxDoneModal(page)
    await confirmTokensClearedAfterTrade(page)
    await setUpSwap(page, metamask, t1Symbol, t2Symbol, '0', pos)
    await checkBalance(page, metamask, true, t2Symbol, t1Symbol)
  }

  it('10 OCEAN -> SAGKRI-94', async () => {
    await stdTradeFlow('OCEAN', 'SAGKRI-94', '10', 1)
  })

  it('.1 OCEAN -> SAGKRI-94', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('OCEAN', 'SAGKRI-94', '.1', 1)
  })

  it('MAX OCEAN -> SAGKRI-94', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('OCEAN', 'SAGKRI-94', 'max', 1)
  })

  it('1 SAGKRI-94 -> OCEAN', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('SAGKRI-94', 'OCEAN', '1', 1)
  })

  it('1 SAGKRI-94 -> DAZORC-13', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('SAGKRI-94', 'DAZORC-13', '1', 1)
  })

  it('MAX DAZORC-13 -> SAGKRI-94', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('DAZORC-13', 'SAGKRI-94', 'max', 1)
  })

  it('MAX SAGKRI-94 -> OCEAN', async () => {
    await reloadOrContinue(false, page)
    await stdTradeFlow('SAGKRI-94', 'OCEAN', 'max', 1)
  })
})
