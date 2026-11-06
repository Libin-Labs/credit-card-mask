import test from 'node:test';
import assert from 'node:assert/strict';
import { maskPan, mapPanInput } from '../dist/esm/index.js';
test('default masks all but last four with output grouping', () => {
  assert.equal(maskPan('4111 1111-1111 1234'), '•••• •••• •••• 1234');
  assert.equal(maskPan('4111111111111234', { mask: '*', separator: '-' }), '****-****-****-1234');
});
test('short incremental input always hides at least one', () => {
  assert.equal(maskPan(''), '');
  assert.equal(maskPan('4'), '•');
  assert.equal(maskPan('41'), '•1');
  assert.equal(maskPan('41111', { visibleLast: 0 }), '•••• •');
  assert.equal(maskPan('123456', { minHidden: 5 }), '•••• •6');
});
test('raw caret boundaries map through separators', () => {
  const result = mapPanInput('12-34 56', { mask: '*', visibleLast: 0 });
  assert.equal(result.masked, '**** **');
  assert.equal(result.digitCount, 6);
  assert.deepEqual(result.offsets, [0, 1, 2, 2, 3, 4, 4, 6, 7]);
  assert.equal(result.offsets.length, '12-34 56'.length + 1);
});
test('all offsets monotone and bounded on incremental edits', () => {
  for (const s of ['1', '12', '12 3', '1234 5', '12-34-567', '--12 34--']) {
    const r = mapPanInput(s);
    for (let i = 0; i < r.offsets.length; i++) {
      assert.ok(r.offsets[i] >= 0 && r.offsets[i] <= r.masked.length);
      if (i) assert.ok(r.offsets[i] >= r.offsets[i - 1]);
    }
    assert.equal(r.offsets.at(-1), r.masked.length);
  }
});
test('does not expose raw digits and owns returned mapping', () => {
  const r = mapPanInput('9876543210', { visibleLast: 0 });
  assert.equal(JSON.stringify(r).includes('9876543210'), false);
  assert.deepEqual(Object.keys(r).sort(), ['digitCount', 'masked', 'offsets']);
  assert.throws(() => r.offsets.push(1), TypeError);
  const secret = '98765432109876543210';
  try {
    maskPan(secret);
  } catch (error) {
    assert.equal(error.message.includes(secret), false);
  }
  for (let n = 1; n <= 19; n++)
    for (let visibleLast = 0; visibleLast <= 4; visibleLast++) {
      const input = Array.from({ length: n }, (_, i) => String(i % 10)).join('');
      const output = maskPan(input, { visibleLast, mask: '*' }).replace(/ /g, '');
      const visible = Math.min(visibleLast, n - 1);
      assert.equal(output, '*'.repeat(n - visible) + input.slice(n - visible));
    }
});
test('unsupported input controls and configuration bounds', () => {
  const accessor = {};
  Object.defineProperty(accessor, 'visibleLast', {
    enumerable: true,
    get() {
      throw new Error('executed');
    },
  });
  assert.throws(() => maskPan('1234', accessor), TypeError);
  assert.throws(() => maskPan('1234', Object.create({ visibleLast: 0 })), TypeError);
  for (const s of ['4111\n1234', '٤١١١', '****1234', '+1234'])
    assert.throws(() => maskPan(s), SyntaxError);
  assert.throws(() => maskPan('1'.repeat(20)), RangeError);
  assert.throws(() => maskPan(null), TypeError);
  for (const o of [{ visibleLast: 5 }, { minHidden: 0 }, { groupSize: 0 }, { visibleLast: NaN }])
    assert.throws(() => maskPan('1234', o), RangeError);
  for (const o of [{ mask: 'x' }, { separator: '\n' }, { unknown: true }])
    assert.throws(() => maskPan('1234', o), TypeError);
});
