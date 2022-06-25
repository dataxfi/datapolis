import Web3 from "web3";
import { INextTokensToSearch, IPoolNode, ITokenGraph, supportedChains } from "./@types";
export default class Pathfinder {
    private fetchFunction;
    nodes: ITokenGraph;
    tokensChecked: Set<string>;
    private pendingQueries;
    private userTokenIn;
    private userTokenOut;
    private chainId;
    private allPaths;
    private trade;
    private depth;
    private pathFound;
    constructor(chainId: supportedChains, web3?: Web3);
    private addPoolNode;
    private addTokenNode;
    searchPoolData({ poolsFromToken, tokenAddress, destinationAddress, parentTokenAddress, IN, nextTokensToSearch, amt, }: {
        poolsFromToken: IPoolNode[];
        tokenAddress: string;
        destinationAddress: string;
        parentTokenAddress: string;
        IN: boolean;
        nextTokensToSearch: INextTokensToSearch;
        amt?: string;
    }): Promise<INextTokensToSearch | null>;
    private getPoolData;
    private getTokenPaths;
    getTokenPath({ tokenAddress, destinationAddress, amt, abortSignal, IN, }: {
        tokenAddress: string;
        destinationAddress: string;
        IN: boolean;
        parentTokenAddress?: string;
        amt?: string;
        abortSignal?: AbortSignal;
    }): Promise<string[]>;
    private constructPath;
    private resolveAllPaths;
}
