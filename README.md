# @lp-labs/credit-card-mask

Bounded privacy-oriented display masking and raw-input-to-masked caret mapping. Catalog identity 429; standalone package version 0.1.0.
No runtime, peer, or sibling dependencies. Node >=18, ESM and CommonJS with declarations.

## Install

```sh
npm install @lp-labs/credit-card-mask
```

## Quickstart (runnable JavaScript)

```js
import assert from 'node:assert/strict';
import { maskPan, mapPanInput } from '@lp-labs/credit-card-mask';
assert.equal(maskPan('4111 1111 1111 1234', { mask: '*' }), '**** **** **** 1234');
const edit = mapPanInput('12-34 56', { visibleLast: 0, mask: '*' });
assert.equal(edit.masked, '**** **');
assert.deepEqual(edit.offsets, [0, 1, 2, 2, 3, 4, 4, 6, 7]);
```

## Customization and errors

Set visibleLast (0..4, default 4), minHidden (1..19, default 1), groupSize (1..19, default 4), separator (space or hyphen) and mask (bullet or asterisk). Only the final min(visibleLast, digitCount-minHidden) digits are shown; no middle or prefix digits are unmasked. Empty input is accepted for incremental editing; short input always hides at least one digit. offsets maps each raw UTF-16 boundary to the caret after the consumed digits, before any following output group separator. Returned mappings are frozen.

## Complete public declarations

Every runtime export and public type is shown below. This is the complete emitted declaration surface.

```ts
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
export declare function mapPanInput(input: string, options?: PanMaskOptions): MaskedPanInput;
export declare function maskPan(input: string, options?: PanMaskOptions): string;
```

## Performance, boundaries and limitations

O(n) time and space; at most 128 raw units and 19 digits. Only ASCII digits, spaces and hyphens accepted. Non-string/oversized raw input and unsupported options throw TypeError, numeric policy/digit count bounds throw RangeError, malformed characters throw SyntaxError. Errors contain no input. No collection, storage, logging, Luhn, card brand detection, authenticity checks or PCI/compliance guarantee. Raw secrets necessarily exist in caller memory during formatting; masking is display transformation, not secure erasure. Keep secret input out of application logs and persistent state.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

The offline install requires the locked development dependencies already in the npm cache.
Build emits separate ESM/CJS and declarations; type checks include bare-package .mts/.cts consumers with negative cases.
Runtime tests import only the single-quoted standalone dist entry and also run against installed offline tarballs.
No build artifacts or development dependencies are required at runtime.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
