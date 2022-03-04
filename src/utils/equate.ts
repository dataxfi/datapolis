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

export function percOf(value: string, total: string): string {
  return ((Number(value) / Number(total)) * 100).toString();
}


