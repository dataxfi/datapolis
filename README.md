# DataX Decentralized Application

### A defi exchange platform built using ocean protocol and web3.

>DataX Docs: https://docs.datax.fi/

## TradeX

Trade your OCEAN and datatokens for other datatokens or OCEAN.

## StakeX

Stanke ocean from Datatoken/Ocean pools. View and manage your liquidity position.

## Run locally

1. clone the repository locally
2. install dependencies (using yarn)
3. run yarn start

## Testing

The DataX dapp frontend has two ways of testing: manually, or automated testing. While the manual test protocol is more granular, it is very time consuming. Our automated test suites all execute E2E tests using puppeteer, dappeteer, jest, and react-testing library.

Checkout dappeteer: https://github.com/ChainSafe/dappeteer/blob/master/docs/API.md

**Manual Test Protocol**

> Once you have a local instance of the dapp, you can use the TestProtocol.md file to complete standard tests that check the limits of the application.

1. Open the TestProtocol.md file in preview mode and complete the tests as described.
2. Check the boxes for each test
3. Write notes in the input field if you experience bugs or have ideas on feature enhancements.
4. Save and Share you results in standup.

If you feel another test would be beneficial to add to the protocol, bring it up to the team to discuss implementation.

**Automated Testing**

1. Follow steps 1 and 2 from the Run Locally section in this readme.
2. Review the scripts in the package JSON and the following statements.
   - Our tests currently only support the rinkeby test net
   - Our tests require the following env variables in your local env:

```
REACT_APP_T_ACCT_SEED = "private key"
REACT_APP_T_ACCT_PASS = "password"
```
Reach out to development-internal to request these credentials if you need them.

The scripts intentially omit an option to test them all at once. This is because the transaction are all real , the suits take a few minutes each, and require human supervision, by default headless is always set to false. Review the process to ensure there are sufficient balances, gas, etc., for each transaction.