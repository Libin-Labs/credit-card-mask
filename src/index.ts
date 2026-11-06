export interface PanMaskOptions {
  visibleLast?: number;
  minHidden?: number;
  groupSize?: number;
  separator?: ' ' | '-';
  mask?: '*' | '•';
}
export interface MaskedPanInput {
  readonly masked: string;
  readonly digitCount: number;
  /** One output caret offset per UTF-16 input boundary, including the final boundary. */
  readonly offsets: readonly number[];
}
export function mapPanInput(input: string, options: PanMaskOptions = {}): MaskedPanInput {
  if (
    !options ||
    typeof options !== 'object' ||
    ![null, Object.prototype].includes(Object.getPrototypeOf(options))
  )
    throw new TypeError('Mask options must be a plain record.');
  for (const key of Reflect.ownKeys(options)) {
    const descriptor = Object.getOwnPropertyDescriptor(options, key)!;
    if (typeof key !== 'string' || !descriptor.enumerable || !('value' in descriptor))
      throw new TypeError('Options must be own data properties.');
  }
  if (typeof input !== 'string' || input.length > 128)
    throw new TypeError('Expected at most 128 input units.');
  if (
    !options ||
    typeof options !== 'object' ||
    Array.isArray(options) ||
    Object.keys(options).some(
      (k) => !['visibleLast', 'minHidden', 'groupSize', 'separator', 'mask'].includes(k),
    )
  )
    throw new TypeError('Unsupported mask option.');
  const last = options.visibleLast ?? 4,
    hidden = options.minHidden ?? 1,
    group = options.groupSize ?? 4;
  if (
    !Number.isInteger(last) ||
    last < 0 ||
    last > 4 ||
    !Number.isInteger(hidden) ||
    hidden < 1 ||
    hidden > 19 ||
    !Number.isInteger(group) ||
    group < 1 ||
    group > 19
  )
    throw new RangeError('Invalid mask limits.');
  const separator = options.separator ?? ' ',
    mask = options.mask ?? '•';
  if (![' ', '-'].includes(separator) || !['*', '•'].includes(mask))
    throw new TypeError('Unsupported separator or mask.');
  if (/[^0-9 -]/.test(input))
    throw new SyntaxError('Only ASCII digits, spaces, and hyphens are accepted.');
  const digits = input.replace(/[ -]/g, '');
  if (digits.length > 19) throw new RangeError('At most 19 digits.');
  const visible = Math.min(last, Math.max(0, digits.length - hidden));
  let masked = '';
  const boundaries = [0];
  for (let i = 0; i < digits.length; i++) {
    if (i && i % group === 0) masked += separator;
    masked += i < digits.length - visible ? mask : digits[i];
    boundaries.push(masked.length);
  }
  let count = 0;
  const offsets = [0];
  for (const c of input) {
    if (/[0-9]/.test(c)) count++;
    offsets.push(boundaries[count]!);
  }
  return Object.freeze({ masked, digitCount: digits.length, offsets: Object.freeze(offsets) });
}
export function maskPan(input: string, options: PanMaskOptions = {}): string {
  return mapPanInput(input, options).masked;
}
