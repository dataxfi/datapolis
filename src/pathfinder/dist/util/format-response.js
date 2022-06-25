"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatter = void 0;
function formatter(response) {
    var _a;
    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.errors)
        return;
    try {
        var _b = response.data.data, t0IsMatch = _b.t0IsMatch, t1IsMatch = _b.t1IsMatch;
        var allData = __spreadArray(__spreadArray([], t0IsMatch, true), t1IsMatch, true);
        var edges_1 = new Set(allData.map(function (poolData) { return poolData.id; }));
        return allData.map(function (pool) { return ({
            poolAddress: pool.id,
            t1Address: pool.token0.id,
            t2Address: pool.token1.id,
            t1Liquidity: pool.totalValueLockedToken0,
            t2Liquidity: pool.totalValueLockedToken1,
            edges: edges_1,
        }); });
    }
    catch (error) {
        console.error(error);
    }
}
exports.formatter = formatter;
//# sourceMappingURL=format-response.js.map