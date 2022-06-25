"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var Pathfinder = (function () {
    function Pathfinder(chainId, web3) {
        this.allPaths = [];
        this.nodes = {};
        this.tokensChecked = new Set();
        this.pendingQueries = new Set();
        this.userTokenIn = "";
        this.userTokenOut = "";
        this.chainId = chainId;
        switch (Number(this.chainId)) {
            case 4:
                this.fetchFunction = util_1.rinkebyPools;
                break;
            case 137:
                this.fetchFunction = util_1.maticPools;
                break;
            case 56:
                this.fetchFunction = util_1.bscPools;
                break;
            case 1285:
                this.fetchFunction = util_1.moonriverPools;
                break;
            case 246:
                this.fetchFunction = util_1.energywebPools;
                break;
            default:
                this.fetchFunction = util_1.mainnetPools;
                break;
        }
    }
    Pathfinder.prototype.addPoolNode = function (poolNode, tokenNode) {
        tokenNode[poolNode.poolAddress] = poolNode;
    };
    Pathfinder.prototype.addTokenNode = function (tokenAdress, parentTokenAddress) {
        if (!parentTokenAddress)
            parentTokenAddress = null;
        this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {} };
    };
    Pathfinder.prototype.searchPoolData = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, parentTokenAddress = _a.parentTokenAddress, IN = _a.IN, amt = _a.amt, poolsFromToken = _a.poolsFromToken, nextTokensToSearch = _a.nextTokensToSearch;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var i, poolNode, t1IsIn, nextTokenAddress, nextAmt;
                        return __generator(this, function (_a) {
                            try {
                                if (poolsFromToken.length === 0) {
                                    console.log("There are no pools for " + tokenAddress + " on this chain.");
                                    reject({ code: 1, message: "There are no pools for " + tokenAddress + " on this chain." });
                                }
                                for (i = 0; i < poolsFromToken.length; i++) {
                                    poolNode = poolsFromToken[i];
                                    t1IsIn = poolNode.t1Address === tokenAddress;
                                    if (this.nodes[tokenAddress]) {
                                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                                    }
                                    else {
                                        this.addTokenNode(tokenAddress, parentTokenAddress);
                                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                                    }
                                    nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;
                                    nextAmt = void 0;
                                    if (!IN)
                                        nextAmt = "1";
                                    if (!nextTokensToSearch[nextTokenAddress])
                                        IN ? (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress }) : (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress, amt: nextAmt[0] });
                                    if (poolNode.t1Address === destinationAddress || poolNode.t2Address === destinationAddress) {
                                        this.addTokenNode(destinationAddress, tokenAddress);
                                        resolve(null);
                                        return [2];
                                    }
                                }
                                resolve(nextTokensToSearch);
                            }
                            catch (error) {
                                console.error(error);
                            }
                            return [2];
                        });
                    }); })];
            });
        });
    };
    Pathfinder.prototype.getPoolData = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, amt = _a.amt, IN = _a.IN, parentTokenAddress = _a.parentTokenAddress, _b = _a.skip, skip = _b === void 0 ? 0 : _b, _c = _a.poolsFromToken, poolsFromToken = _c === void 0 ? [] : _c, _d = _a.nextTokensToSearch, nextTokensToSearch = _d === void 0 ? {} : _d;
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        tokenAddress = tokenAddress.toLowerCase();
                        destinationAddress = destinationAddress.toLowerCase();
                        if (this.tokensChecked.has(tokenAddress))
                            return [2];
                        this.pendingQueries.add(tokenAddress);
                        return [4, this.fetchFunction(tokenAddress, amt)];
                    case 1:
                        response = _e.sent();
                        if (!response) {
                            throw new Error("Failed to retrieve subgraph data.");
                        }
                        console.log(response);
                        poolsFromToken.push.apply(poolsFromToken, response);
                        return [4, this.searchPoolData({
                                poolsFromToken: poolsFromToken,
                                tokenAddress: tokenAddress,
                                destinationAddress: destinationAddress,
                                IN: IN,
                                parentTokenAddress: parentTokenAddress,
                                amt: amt,
                                nextTokensToSearch: nextTokensToSearch,
                            })];
                    case 2:
                        nextTokensToSearch = _e.sent();
                        if (!(nextTokensToSearch && response.length >= 1000)) return [3, 4];
                        return [4, this.getPoolData({
                                tokenAddress: tokenAddress,
                                destinationAddress: destinationAddress,
                                parentTokenAddress: parentTokenAddress,
                                amt: amt,
                                IN: IN,
                                skip: skip + 1000,
                                poolsFromToken: poolsFromToken,
                                nextTokensToSearch: nextTokensToSearch,
                            })];
                    case 3:
                        _e.sent();
                        return [3, 5];
                    case 4:
                        this.pendingQueries.delete(tokenAddress);
                        this.tokensChecked.add(tokenAddress);
                        return [2, nextTokensToSearch];
                    case 5: return [3, 7];
                    case 6:
                        error_1 = _e.sent();
                        throw error_1;
                    case 7: return [2];
                }
            });
        });
    };
    Pathfinder.prototype.getTokenPaths = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, IN = _a.IN, parentTokenAddress = _a.parentTokenAddress, amt = _a.amt;
        return __awaiter(this, void 0, void 0, function () {
            var nextTokensToSearch, _i, _b, _c, token, value, path, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tokenAddress = tokenAddress.toLowerCase();
                        destinationAddress = destinationAddress.toLowerCase();
                        if (!this.userTokenIn)
                            this.userTokenIn = tokenAddress;
                        if (!this.userTokenOut)
                            this.userTokenOut = destinationAddress;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4, this.getPoolData({ tokenAddress: tokenAddress, destinationAddress: destinationAddress, parentTokenAddress: parentTokenAddress, amt: amt, IN: IN })];
                    case 2:
                        nextTokensToSearch = _d.sent();
                        if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
                            for (_i = 0, _b = Object.entries(nextTokensToSearch); _i < _b.length; _i++) {
                                _c = _b[_i], token = _c[0], value = _c[1];
                                return [2, this.getTokenPaths({ destinationAddress: destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN: IN })];
                            }
                        }
                        else if (this.pendingQueries.size === 0) {
                            path = this.constructPath({ destination: this.userTokenOut });
                            if (path) {
                                this.allPaths.push(path);
                            }
                        }
                        return [3, 4];
                    case 3:
                        error_2 = _d.sent();
                        console.error(error_2);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    Pathfinder.prototype.getTokenPath = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, amt = _a.amt, abortSignal = _a.abortSignal, IN = _a.IN;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var path;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", function () {
                                        return reject(new Error("Aborted"));
                                    });
                                    if (tokenAddress.toLowerCase() === destinationAddress.toLowerCase()) {
                                        return [2, resolve([tokenAddress])];
                                    }
                                    return [4, this.getTokenPaths({ tokenAddress: tokenAddress, destinationAddress: destinationAddress, amt: amt, IN: IN })];
                                case 1:
                                    _a.sent();
                                    if (!(this.pendingQueries.size === 0)) return [3, 3];
                                    return [4, this.resolveAllPaths()];
                                case 2:
                                    path = _a.sent();
                                    return [2, resolve(path)];
                                case 3: return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    Pathfinder.prototype.constructPath = function (_a) {
        var path = _a.path, destination = _a.destination;
        try {
            var parent_1;
            if (path) {
                parent_1 = this.nodes[path[0]].parent;
            }
            else {
                path = [destination];
                parent_1 = this.nodes[destination].parent;
            }
            if (parent_1) {
                path.unshift(parent_1);
                this.constructPath({ path: path });
            }
            return path;
        }
        catch (error) {
            console.error(error);
        }
    };
    Pathfinder.prototype.resolveAllPaths = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shortestPath, allPathsResolved;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.allSettled(this.allPaths)];
                    case 1:
                        allPathsResolved = _a.sent();
                        allPathsResolved.forEach(function (promise) { return __awaiter(_this, void 0, void 0, function () {
                            var path;
                            return __generator(this, function (_a) {
                                if (promise.status === "fulfilled") {
                                    path = promise.value;
                                    if (!shortestPath || shortestPath.length > path.length) {
                                        shortestPath = path;
                                    }
                                }
                                return [2];
                            });
                        }); });
                        return [2, shortestPath];
                }
            });
        });
    };
    return Pathfinder;
}());
exports.default = Pathfinder;
//# sourceMappingURL=Pathfinder.js.map