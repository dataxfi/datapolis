export default function errorMessages(error: any): string {
  const { code } = error;

  // received an rpc error
  if (code) {
    switch (String(code)) {
      case "-32700":
        return "Invalid JSON reveived, contact support.";
      case "-32600":
        return "Invalid JSON request, contact support.";
      case "-32601":
        return "Method unavailable, contact support.";
      case "-32602":
        return "Invalid method call, contact support.";
      case "-32603":
        return "Internal JSON-RPC error, contact support";
      case "-32000":
        return "Invalid input, contact support.";
      case "-32001":
        return "Resource not found, contact support.";
      case "-32002":
        return "Resource unavailable, contact support.";
      case "-32003":
        return "Transaction rejected, contact support.";
      case "-32004":
        return "Method not supported, contact support.";
      case "-32005":
        return "Request limit exceeded, contact support.";
      case "4001":
        return "User rejected transaction.";
      case "4100":
        return "Unauthorized request, contact support.";
      case "4200":
        return "Request not supported by provider.";
      case "4900":
      case "4901":
        //similar issue, could be either code
        return "The provider disconnected, refresh the page.";
      default:
        return "An error occured, contact support. (1)";
    }
  } else {
    //received an ocean error OR internal error

    const oceanErrors = [
      "oceanAddress is not defined",
      "Swap fee too high.",
      "Weight out of bounds (min 1, max9)",
      "Failed to call create pool",
      "Failed to call approve DT token",
      "Failed to call approve OCEAN token",
      "Not enough Ocean Tokens",
      "OCEAN approve failed",
      "undefined ocean token contract address",
      "Not enough datatokens",
      "DT approve failed",
      "Too much reserve to add",
      "Not enough poolShares",
      "Exceed Max Removal limit",
      "Amount of DT is too low",
      "Transaction has been reverted by the EVM",
      "Transaction was not mined within 50 blocks",
    ];

    const oceanErrorFound = oceanErrors.findIndex((err) => String(error).includes(err));

    if (oceanErrorFound) {
      switch (oceanErrorFound) {
        case 0:
        case 8:
          return "Missing ocean address";
        case 1:
          return oceanErrors[1];
        case 2:
          return "Weight out of bounds, contact support.";
        case 3:
          return "Failed to create pool, contact support.";
        case 10:
        case 4:
          return "Failed to approve DT, contact support.";
        case 5:
          return "Failed to approve ocean, contact support.";
        case 7:
          return "User rejected transaction";
        case 11:
          return oceanErrors[11];
        case 12:
          return "Not enough pool shares";
        case 13:
          return "Transaction failed, contact support.";
        case 14:
          return oceanErrors[14];
        case 15:
          return oceanErrors[15];
        case 16:
          return "Transaction was not mined within 50 blocks, check the transaction in your wallet.";
        default:
          return "An error occurred, contact support. (2)";
      }
    } else {
      return error;
    }
  }
}
