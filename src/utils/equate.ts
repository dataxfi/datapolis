export function toFixed(
  value: number | string | undefined
): string {
  try {
    return Number(value).toFixed(5).toString();
  } catch (error) {
    console.error("Invalid Input, may be undefined", error)
    return "Invalid Input, may be undefined";
  }
}

export function percOf(value: string, total: string): string {
  return ((Number(value) / Number(total)) * 100).toString();
}
