//displaying numbers
export function toFixed5(value: any): string {
  if (!value) return "";
  try {
    return value.toString().match(/^-?\d+(?:\.\d{0,5})?/)[0];
  } catch (error) {
    console.error("Invalid Input, may be undefined", error);
    return "Invalid Input, may be undefined";
  }
}

//calculations and transactions
export function toFixed18(value: any): string {
  if (!value) return "";
  try {
    return value.toString().match(/^-?\d+(?:\.\d{0,18})?/)[0];
  } catch (error) {
    console.error("Invalid Input, may be undefined", error);
    return "Invalid Input, may be undefined";
  }
}


//input fields
export function toFixed2(value: any): string {
  if (!value) return "";
  try {
    return value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
  } catch (error) {
    console.error("Invalid Input, may be undefined", error);
    return "Invalid Input, may be undefined";
  }
}

//input fields
export function toFixed3(value: any): string {
  if (!value) return "";
  try {
    return value.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
  } catch (error) {
    console.error("Invalid Input, may be undefined", error);
    return "Invalid Input, may be undefined";
  }
}

export function limitDecimalsInInput(val: string | number): string {
  val = String(val);
  let b = val;
  let c = val;
  c =
    b.indexOf(".") >= 0
      ? b.substr(0, b.indexOf(".")) + b.substr(b.indexOf("."), 3)
      : b;

  return c;
}

export function percOf(value: string, total: string): string {
  return ((Number(value) / Number(total)) * 100).toString();
}

/**
 * Converts number in E-notation to a string of the number without E-notation.
 *
 * @param number
 * @returns string
 */
export function removeENotation(number: number) {
  let string = number.toString();
  if (!string.includes("e")) return string;
  let split = string.split("");
  let notation: any = [];
  while (notation[0] != "e") {
    notation.splice(0, 0, split.pop());
  }
  let places: any = notation.slice(2);
  places = Number(places.join(""));

  let result: any = split.filter((char) => char != ".");
  for (let i = 1; i < places; i++) {
    if (notation[1] === "-") {
      result.splice(0, 0, "0");
    } else if (notation[1] === "+") {
      result.push("0");
    }
  }
  if (notation[1] === "-") {
    result.splice(0, 0, "0.");
  }
  result = result.join("");
  console.log(result);
  return toFixed18(result);
}

export function checkNotation(number: number): string {
  //small numbers in e-notation past 18 decimals set to 0 (dust)
  if (number < 0.000000000000000001) return "0";

  //small numbers past 6 decimal places are converted to enotation, which needs to be removed.
  if (number < 0.0000001) {
    return removeENotation(number);
  }

  return String(number);
}
