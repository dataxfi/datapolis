import Pathfinder from "../../Pathfinder";
import Web3 from "@dataxfi/datax.js/node_modules/web3";
import ganache from "ganache-core";
describe("Pathfinder works for all chains when supplying exact IN to OUT pair.", () => {
  jest.setTimeout(60000);

  const web3 = new Web3(ganache.provider() as any);

  it("Pathfinder works on mainnet", async () => {
    try {
      const pathfinder = new Pathfinder("1", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
        destinationAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on matic", async () => {
    try {
      const pathfinder = new Pathfinder("137", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x282d8efce846a88b159800bd4130ad77443fa1a1",
        destinationAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on energyweb", async () => {
    try {
      const pathfinder = new Pathfinder("246", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
        destinationAddress: "0x9dad43ee9e09837aeaca21799c88613e8e7c67dd",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  // it("Pathfinder works on bsc", async () => {
  //   try {
  //     const pathfinder = new Pathfinder(56);
  //     const path = await pathfinder.getTokenPath({
  //       tokenAddress: "0xdce07662ca8ebc241316a15b611c89711414dd1a",
  //       destinationAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  //       IN: true,
  //     });
  //     expect(path).toBeDefined();
  //     expect(Array.isArray(path)).toBe(true);
  //     expect(path.length).toBeGreaterThanOrEqual(2);
  //   } catch (error) {
  //     if (error.code && error.code === 1) {
  //       return;
  //     }
  //     throw error;
  //   }
  // });
  it("Pathfinder works on rinkeby", async () => {
    try {
      const pathfinder = new Pathfinder("4", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0xcf6823cf19855696d49c261e926dce2719875c3d",
        destinationAddress: "0x8d2da54a1691fd7bd1cd0a242d922109b0616c68",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on moonriver", async () => {
    try {
      const pathfinder = new Pathfinder("1285", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae",
        destinationAddress: "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
});

describe("Pathfinder works for all chains when supplying IN to exact OUT pair.", () => {
  jest.setTimeout(60000);

  const web3 = new Web3(ganache.provider() as any);

  it("Pathfinder works on mainnet", async () => {
    try {
      const pathfinder = new Pathfinder("1", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
        destinationAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        IN: false,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on matic", async () => {
    try {
      const pathfinder = new Pathfinder("137", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x282d8efce846a88b159800bd4130ad77443fa1a1",
        destinationAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        IN: false,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on energyweb", async () => {
    try {
      const pathfinder = new Pathfinder("246", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
        destinationAddress: "0x9dad43ee9e09837aeaca21799c88613e8e7c67dd",
        IN: false,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  // it("Pathfinder works on bsc", async () => {
  //   try {
  //     const pathfinder = new Pathfinder(56);
  //     const path = await pathfinder.getTokenPath({
  //       tokenAddress: "0xdce07662ca8ebc241316a15b611c89711414dd1a",
  //       destinationAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  //       IN: false,
  //     });
  //     expect(path).toBeDefined();
  //     expect(Array.isArray(path)).toBe(true);
  //     expect(path.length).toBeGreaterThanOrEqual(2);
  //   } catch (error) {
  //     if (error.code && error.code === 1) {
  //       return;
  //     }
  //     throw error;
  //   }
  // });
  it("Pathfinder works on rinkeby", async () => {
    try {
      const pathfinder = new Pathfinder("4", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0xcf6823cf19855696d49c261e926dce2719875c3d",
        destinationAddress: "0x8d2da54a1691fd7bd1cd0a242d922109b0616c68",
        IN: false,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on moonriver", async () => {
    try {
      const pathfinder = new Pathfinder("1285", web3);
      const path = await pathfinder.getTokenPath({
        tokenAddress: "0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae",
        destinationAddress: "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
        IN: false,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
});
