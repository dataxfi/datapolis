# Pathfinder 
> A module leveraging subgraph data from api.thegraph.com, respective to `chainId`, to determine swap paths for token pairs. 


Navigation 
- [Pathfinder](#pathfinder)
  - [Usage](#usage)
  - [API](#api)
    - [getPoolsForToken](#getpoolsfortoken)
    - [getTokenPath](#gettokenpath)
  - [Limitations](#limitations)
  - [Set up locally](#set-up-locally)
  - [Test locally](#test-locally)


## Usage

> `IN` paramater refers to whether the 'token in' (token being sold) is the exact token.

```
const pathfinder = new Pathfinder(1);
pathfinder
  .getTokenPath({
    tokenAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
    destinationAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    IN: true,
  })
  .then((r) => console.log("response", r))
  .catch(console.error);
```

output
```
[
  '0x967da4048cd07ab37855c090aaf366e4ce1b9f48',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
]
```

## API

### getPoolsForToken

Makes request for pools associated to a token, sets nodes on the graph for each pool.
Returns the next tokens to be searched OR null if a path can be made.
```  
pathfinder.getPoolsForToken({
    tokenAddress,
    destinationAddress,
    parentPoolAddress,
    IN,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentPoolAddress: string;
    amt?: string;
  }): Promise<INextTokensToSearch | null>
  ```


### getTokenPath 

Gets token path for a swap pair. Returns an array of tokens to be traded in order to route to the destination token, optimised to be the shortes path possible.

   ```
    pathfinder.getTokenPath({
    tokenAddress,
    destinationAddress,
    parentPoolAddress,
    amt,
    abortSignal,
    IN,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentPoolAddress?: string;
    amt?: string;
    abortSignal?: AbortSignal;
  }): Promise<string[]>
  ```

nodes

The node graph being built by getPoolsForToken()

`pathfinder.nodes`

## Limitations 
Currently the subgraphs being queried are all subgraphs from the most popular dex's on supportedChains:

- uniswap (mainnet)
- quickswap (matic)
- carbonswap (EWT)
- pankackeswap (BSC)
- solarbeam (moonriver)

But there are other pools that are available. Apps like balancer use different pools and subgraphs, and support for these could potentially be added in the future. 

## Set up locally 

1. Fork and/or clone 
2. Run `Yarn install`
3. Run `Yarn build`
   
## Test locally 
1. [Set up locally](#set-up-locally)
2. Run `yarn test`