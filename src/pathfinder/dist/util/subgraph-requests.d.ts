export declare function uniswapV2Req(url: string, address: string, amt: string): Promise<{
    poolAddress: any;
    t1Address: any;
    t2Address: any;
    t1Liquidity: any;
    t2Liquidity: any;
    edges: Set<any>;
}[]>;
export declare function uniswapV3Req(url: string, address: string, amt: string): Promise<{
    poolAddress: any;
    t1Address: any;
    t2Address: any;
    t1Liquidity: any;
    t2Liquidity: any;
    edges: Set<any>;
}[]>;
