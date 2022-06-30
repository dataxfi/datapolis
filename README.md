 <h1> 🌇 <span style={{color:#f3c429}}>Datapolis</span> Decentralized Application 🏛️ </h1>

### A defi exchange platform built using datax.js and web3.

> DataX Docs: https://docs.datax.fi/

Quick navigation 

- [Run locally](#run-locally)
- [Testing](#testing)
  - [Manual Test Protocol](#manual-test-protocol)
  - [Automated Local Testing](#automated-local-testing)
  - [UI Test Suite VS. Rinkeby Test Suite](#ui-test-suite-vs-rinkeby-test-suite)
    - [UI Tests](#ui-tests)
    - [Transaction Tests](#transaction-tests)
    - [Recommended Test Flow](#recommended-test-flow)
  - [Contributing To Test Suites](#contributing-to-test-suites)
- [Vercel Deployment](#vercel-deployment)
  - [Setting Up Deployment From Scratch](#setting-up-deployment-from-scratch)
  - [Deployment Workflow](#deployment-workflow)

## Run locally

1. clone the repository locally
2. install dependencies (using yarn)
3. run yarn start

## Testing

The DataX dapp frontend has two ways of testing: manually, or automated testing. Our automated test suites all execute E2E tests using puppeteer, dappeteer, jest, and react-testing library.

Checkout dappeteer: https://github.com/ChainSafe/dappeteer/blob/master/docs/API.md

### Manual Test Protocol

> You can use the TestProtocol.md file to complete standard tests that check the limits of the application, best applied to the latest staging or test deployment.

1. Open the TestProtocol.md file in preview mode and complete the tests as described.
2. Check the boxes for each test
3. Write notes in the input field if you experience bugs or have ideas on feature enhancements.
4. Save and Share you results in standup.

If you feel another test would be beneficial to add to the protocol, bring it up to the team to discuss implementation.

### Automated Local Testing

> **These tests use a REAL MM account whose credentials are shared between multiple people, if you log into this account outside of chromium ensure you log out and do not send actual assets to this account.**

1. Follow steps 1 and 2 from the Run Locally section in this readme.
2. Review the scripts in the package JSON and the following statements.
   - Our tests currently only support the rinkeby test net, but will incorporate e2e tests on polygon in the future.
   - Our tests require the following env variables in your local env:

```
REACT_APP_T_ACCT_SEED = "private key"
REACT_APP_T_ACCT_PASS = "password"
```

Reach out to development-internal to request these credentials if you need them.

### UI Test Suite VS. Rinkeby Test Suite

A few things to keep in mind regarding both suites:

> Both tests suites are currently only on the rinkeby network, but the UI tests suite does not execute transactions.

> There are two rare but reoccuring unsolved issues with the test suites:

- Error: Node is detached from the document.
  - This rarely happens but will make the suite fail from time to time, rerun the tests.
- Disclaimer isn't being signed.
  - This occurs about 25% of the time, where the MM popup is closed after the disclaimer is sent, effectively rejecting the signature transaction. Rerun the tests.
  - A solution for this is expected to be implemented in the future.

#### UI Tests

> The UI test suite was designed to only test the user interface as a boiler plate test sutie to ensure state and flow is working properly upon any bug fix or enhancement. These tests can be ran all together or seperatly.

      The UI test suite requires access to another account. These two enviorment variables are needed to run this suite:

      - REACT_APP_T_ACCT2_PK = "privateKey"
      - REACT_APP_TESTS_NETWORK="rinkeby"

      You can get the private key from logging into the test account or asking the team in dev-internal channel.

- `yarn run test-ui` will run all of the test files in the UI test suite consecutively in this order: Navigation, cookies, disclaimer, lp, stake, trade, unstake.
- `yarn run test-<fileName>` will run the file name you provide, you can check the package.json or the files themselves for the name. (E.G. uiNav.test.ts --> test-uiNav)

A few other things to keep in mind:

- If you implement a new fix or feature effecting only one page, you can test only that one page. Mind that if you change a componenent used across the entire app, its best to test everything.
- The UI test suites are meant to all pass consecutively (as in each test in a file). Each test works off the position the last test left the dapp. This is intentional. Since these tests focus on UI, the tests should all pass in-order to effectively mimick a user seamlessly flowing through the application.

#### Transaction Tests

The scripts intentially omit an option to test them all at once. This is because the transactions are all real, the suits take a few minutes each, and require human supervision. Review the process to ensure there are sufficient balances, gas, etc., for each transaction.

> You may need to run one suite before the other to ensure you have proper balances. (Consider, if you run stakex before tradex there might not be enough ocean for tradex tests becuase of the max stake test.)

#### Recommended Test Flow

- Open the account in metamask and check balances
- Cookies, Disclaimer, and LP tests can be in any order

1. `yarn test-rinkeby-tradex`
2. `yarn test-rinkeby-stakex`
3. `yarn test-rinkeby-unstake`

> You can run any specific test by `yarn test-rinkeby-<suite> -t <test>`

Close Future Implementation:

- High value acccount transaction tests and low value account transaction tests
- High value/Low value edge cases
- Utility functions for moving assets to test particular suites (sell all DT, sell all OCEAN, unstake all pools, etc.)
- A UX test suite focusing on speed and conveinience.

<<<<<<< HEAD
## Contributing to test suites

> Refer to the Test-API.md file located in the tests directory to view the functions available and quickly write new tests with minimal boilerplate.

Test priority (High value features)

| Boilerplate                                                                                                                  | Making Trade                                             | Staking                                                                     | Unstaking               | LP                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| <p>- Connecting to provider<br />- Accessing user wallet<br />- Collecting wallet information<br />- Getting token lists</p> | <p>- OCEAN to DT<br />- DT to OCEAN<br />- DT to DT </p> | <p>- Stake ocean in Pool <br />- Stake information is present and valid</p> | Unstake ocean from pool | <p>- Pool Import<br />- Pool Scan<br />- Valid Pool Information</p> |
=======
### Contributing To Test Suites
> Refer to the Test-API.md file located in the tests directory to view the functions available and quickly write new tests with minimal boilerplate. 

Test priority (High value features)

| Boilerplate | Making Trade | Staking | Unstaking | LP |
| ----------- | ------------ | ------- | --------- | -- |
|<p>- Connecting to provider<br />- Accessing user wallet<br />- Collecting wallet information<br />- Getting token lists</p>|<p>- OCEAN to DT<br />- DT to OCEAN<br />- DT to DT </p>| <p>- Stake ocean in Pool <br />- Stake information is present and valid</p> | Unstake ocean from pool |<p>- Pool Import<br />- Pool Scan<br />- Valid Pool Information</p> |

## Vercel Deployment 

> Datapolis is currently hosted on vercel through a team account for Datapolis. To gain access to this account contact your superior, or the lead developer. 
> 
> Vercel is integrated with GitHub so that any changes to main, or any other branch, will trigger redeployments respectively. 
 
### Setting Up Deployment From Scratch
The instructions below are provided for any migrations to new teams in vercel, or if setting up Datapolis from scratch in vercel ever becomes necessary. 

1. Ensure your local instance is synced with the latest commit on main
2. Run `yarn build` locally to ensure there are no build errors 
3. [Connect vercel to a git repo](https://vercel.com/docs/concepts/git/vercel-for-github)
4. Before deploying, ensure that all environment variables are correct, they need to configured a bit different than your local instance:
  - Remove all quotes:  "some envrionment variable value" --> some enviornemt variable value
  - Remove all escape characters:  "some/nmultiline/nvalue" --> 
      some
      multiline
      value
5. Check if there are console warnings in local host. If there are, set a new enviornment variable of `CI` to `false` so the deployment wont fail. 

### Deployment Workflow

**Never push to main before testing your fix or feature.** 

1. Create a branch for your improvement.
2. Push your branch to remote, and test the changes on the branch deployment. 
3. Check all tests pass before pushing to development branch. 
4. Wait for review by team. 
5. Merge with main. 

Keep in mind:
If your new changes include changes to datax.js, the version will need to be bumped in datax.js before doing so. Deployment of Datapolis needs to be dependant on the version of datax.js that is currently available on NPM. 

If your new changes include a new envrionment variable, ensure you add this _before_ you deploy, so it is readily available when the new deployment is live. 
>>>>>>> 25ab2b8 (Update readme)
