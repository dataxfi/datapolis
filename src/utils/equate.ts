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

export function percOf(value: string, total: string): string {
  return ((Number(value) / Number(total)) * 100).toString();
}


