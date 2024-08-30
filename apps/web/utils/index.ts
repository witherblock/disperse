// Define the type for an Nx2 matrix
type MatrixNx2<T> = [T, T][];

// Type guard function to check if a value is an Nx2 matrix
export function isNx2Matrix<T>(value: unknown): value is MatrixNx2<T> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((row) => Array.isArray(row) && row.length === 2)
  );
}

export function isBigInt(value: string) {
  try {
    return BigInt(parseInt(value, 10)) !== BigInt(value);
  } catch (e) {
    return false;
  }
}
