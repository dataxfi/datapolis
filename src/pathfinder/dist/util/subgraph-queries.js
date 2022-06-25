"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniswapV3Query = exports.uniswapV2Query = void 0;
function uniswapV2Query(address, amt, skipT0, skipT1, callT0, callT1) {
    if (skipT0 === void 0) { skipT0 = 0; }
    if (skipT1 === void 0) { skipT1 = 0; }
    if (callT0 === void 0) { callT0 = true; }
    if (callT1 === void 0) { callT1 = true; }
    console.log("Calling with v2 schema (pairs)");
    var generalReq = "orderBy:reserveUSD\n  orderDirection:desc){\n      id\n    token1{\n      id\n    }\n    token0{\n      id\n    }\n\n    totalValueLockedToken0:reserve0\n    totalValueLockedToken1:reserve1\n  }";
    var t0Match = "t0IsMatch: pairs(first:1000 skip:".concat(skipT0, " where:{token0_contains:\"").concat(address, "\", reserve0_gt:\"").concat(amt, "\"}\n  ").concat(generalReq);
    var t1Match = "t1IsMatch: pairs(first:1000 skip:".concat(skipT1, " where:{token1_contains:\"").concat(address, "\", reserve1_gt:\"").concat(amt, "\"}\n  ").concat(generalReq);
    var query = "\n  query {\n    ".concat(callT0 ? t0Match : "", "\n\n    ").concat(callT1 ? t1Match : "", "\n  }\n  ");
    return query;
}
exports.uniswapV2Query = uniswapV2Query;
function uniswapV3Query(address, amt, skipT0, skipT1, callT0, callT1) {
    if (skipT0 === void 0) { skipT0 = 0; }
    if (skipT1 === void 0) { skipT1 = 0; }
    if (callT0 === void 0) { callT0 = true; }
    if (callT1 === void 0) { callT1 = true; }
    console.log("Calling with v3 schema (pools)");
    var generalReq = "orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ){\n      id\n      token1{\n        id\n      }\n      token0{\n        id\n      }\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }";
    var t0Match = "t0IsMatch: pools(first:1000 skip:".concat(skipT0, " where:{token0_in:[\"").concat(address, "\"],\n    totalValueLockedToken0_gt:\"").concat(amt, "\"}     \n    ").concat(generalReq);
    var t1Match = "t1IsMatch: pools(first:1000 skip:".concat(skipT1, " where:{token1_in:[\"").concat(address, "\"], \n  totalValueLockedToken1_gt:\"").concat(amt, "\"}   \n  ").concat(generalReq);
    return "query {\n      ".concat(callT0 ? t0Match : "", "\n      \n      ").concat(callT1 ? t1Match : "", "\n    }");
}
exports.uniswapV3Query = uniswapV3Query;
//# sourceMappingURL=subgraph-queries.js.map