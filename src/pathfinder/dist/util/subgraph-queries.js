"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniswapV3Query = exports.uniswapV2Query = void 0;
function uniswapV2Query(address, amt, first, skip) {
    if (first === void 0) { first = 1000; }
    if (skip === void 0) { skip = 0; }
    console.log("Calling with v2 schema (pairs)");
    var generalReq = "orderBy:reserveUSD\n  orderDirection:desc){\n      id\n    token1{\n      id\n    }\n    token0{\n      id\n    }\n\n    totalValueLockedToken0:reserve0\n    totalValueLockedToken1:reserve1\n  }";
    return "\n  query {\n    t0IsMatch: pairs(first:".concat(first, " skip:").concat(skip, " where:{token0_contains:\"").concat(address, "\", reserve0_gt:\"").concat(amt, "\"}\n    ").concat(generalReq, "\n    \n    \n    t1IsMatch: pairs(first:").concat(first, " skip:").concat(skip, " where:{token1_contains:\"").concat(address, "\", reserve1_gt:\"").concat(amt, "\"}\n    ").concat(generalReq, "\n  }\n  ");
}
exports.uniswapV2Query = uniswapV2Query;
function uniswapV3Query(address, amt, first, skip) {
    if (first === void 0) { first = 1000; }
    if (skip === void 0) { skip = 0; }
    console.log("Calling with v3 schema (pools)");
    var generalReq = "orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ){\n      id\n      token1{\n        id\n      }\n      token0{\n        id\n      }\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }";
    return "query {\n      t0IsMatch: pools(first:".concat(first, " skip:").concat(skip, " where:{token0_in:[\"").concat(address, "\"],\n      totalValueLockedToken0_gt:\"").concat(amt, "\"}     \n      ").concat(generalReq, "\n      \n      \n      t1IsMatch: pools(first:").concat(first, " skip:").concat(skip, " where:{token1_in:[\"").concat(address, "\"], \n      totalValueLockedToken1_gt:\"").concat(amt, "\"}   \n      ").concat(generalReq, "\n    }");
}
exports.uniswapV3Query = uniswapV3Query;
//# sourceMappingURL=subgraph-queries.js.map