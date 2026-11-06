import { maskPan, mapPanInput, type MaskedPanInput } from '@lp-labs/credit-card-mask';
const display: string = maskPan('1234', { visibleLast: 2, minHidden: 2, mask: '*' });
const edit: MaskedPanInput = mapPanInput('12 34', { separator: '-' });
display.toUpperCase();
edit.offsets[0]?.toFixed();
// @ts-expect-error string input only
maskPan(1234);
// @ts-expect-error only fixed privacy mask characters
maskPan('1234', { mask: '0' });
// @ts-expect-error mapping is readonly
edit.offsets.push(3);
