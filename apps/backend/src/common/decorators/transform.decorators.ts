import { Transform } from 'class-transformer';

export function TrimUpper() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
}
