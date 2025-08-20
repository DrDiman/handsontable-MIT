import {
  rangeEach,
  rangeEachReverse,
  isNumeric,
  valueAccordingPercent,
} from 'handsontable/helpers/number';

describe('Number helper', () => {
  //
  // Handsontable.helper.isNumeric
  //
  describe('isNumeric', () => {
    it('should return `false` for non-numeric values', () => {
      expect(isNumeric()).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric('')).toBe(false);
      expect(isNumeric(' ')).toBe(false);
      expect(isNumeric('a')).toBe(false);
      expect(isNumeric('abcd')).toBe(false);
      expect(isNumeric('a1.22')).toBe(false);
      expect(isNumeric('1.22a')).toBe(false);
      expect(isNumeric('10.0,00')).toBe(false);
      expect(isNumeric('10,0.00')).toBe(false);
      expect(isNumeric('e+22')).toBe(false);
      expect(isNumeric([1])).toBe(false);
      expect(isNumeric({})).toBe(false);
      expect(isNumeric(new Date())).toBe(false);
    });

    it('should return `true` for numeric values (number type)', () => {
      expect(isNumeric(0.001)).toBe(true);
      expect(isNumeric(0)).toBe(true);
      expect(isNumeric(1)).toBe(true);
      expect(isNumeric(-10000)).toBe(true);
      expect(isNumeric(10000)).toBe(true);
      expect(isNumeric(-10.000)).toBe(true);
      expect(isNumeric(10.000)).toBe(true);
      expect(isNumeric(1e+26)).toBe(true);
    });

    it('should return `true` for numeric values (string type)', () => {
      expect(isNumeric('.001')).toBe(true);
      expect(isNumeric('0.001')).toBe(true);
      expect(isNumeric('0')).toBe(true);
      expect(isNumeric('1')).toBe(true);
      expect(isNumeric('-10000')).toBe(true);
      expect(isNumeric('10000')).toBe(true);
      expect(isNumeric('-10.000')).toBe(true);
      expect(isNumeric('10.000')).toBe(true);
      expect(isNumeric('1e+26')).toBe(true);
      expect(isNumeric('22e-26')).toBe(true);
      expect(isNumeric('0.45e+26')).toBe(true);
      expect(isNumeric('.45e+26')).toBe(true);
    });

    it('should return `true` for comma-separated decimal values (string type)', () => {
      expect(isNumeric('1,22')).toBe(true);
      expect(isNumeric('77,70')).toBe(true);
      expect(isNumeric('2456,22')).toBe(true);
      expect(isNumeric('-1,22')).toBe(true);
      expect(isNumeric('+1,22')).toBe(true);
      expect(isNumeric(',22')).toBe(true);
      expect(isNumeric('1,22e5')).toBe(true);
      expect(isNumeric('1,22e-5')).toBe(true);
    });

    it('should detect hexadecimal values correctly', () => {
      expect(isNumeric('0xA')).toBe(true);
      expect(isNumeric('0x1')).toBe(true);
      expect(isNumeric('0xabcdef')).toBe(true);
      expect(isNumeric('0xABCDEF')).toBe(true);
      expect(isNumeric('0xabc123')).toBe(true);
      expect(isNumeric('0xABC123')).toBe(true);

      expect(isNumeric('0xabcdefghi')).toBe(false);
      expect(isNumeric('0xqwerty')).toBe(false);
      expect(isNumeric('0x12AH')).toBe(false);
      expect(isNumeric('0xABCG')).toBe(false);
      expect(isNumeric('0xG')).toBe(false);
    });

    it('should return `true` for numeric values with whitespaces (string type)', () => {
      expect(isNumeric('   .020   ')).toBe(true);
      expect(isNumeric('   0.020   ')).toBe(true);
      expect(isNumeric('   0   ')).toBe(true);
      expect(isNumeric('   1   ')).toBe(true);
      expect(isNumeric('   -   10000   ')).toBe(true);
      expect(isNumeric('   10000   ')).toBe(true);
      expect(isNumeric('   -   10.000   ')).toBe(true);
      expect(isNumeric('   10.000   ')).toBe(true);
      expect(isNumeric('   1e+26   ')).toBe(true);
      expect(isNumeric('   1e+26   ')).toBe(true);
      expect(isNumeric('   0.2e+26   ')).toBe(true);
      expect(isNumeric('   .2e+26   ')).toBe(true);
    });

    it('should handle ReDoS-safe numeric validation', () => {
      // Test with very long numeric strings that could cause ReDoS
      const longNumber = `1${'0'.repeat(1000)}`;
      const longDecimal = `0.${'1'.repeat(1000)}`;
      const longExponent = `1e${'0'.repeat(1000)}`;

      const startTime = Date.now();

      expect(isNumeric(longNumber)).toBe(true);
      expect(isNumeric(longDecimal)).toBe(true);
      expect(isNumeric(longExponent)).toBe(true);

      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle ReDoS-safe non-numeric validation', () => {
      // Test with very long non-numeric strings that could cause ReDoS
      const longNonNumeric = `a${'b'.repeat(1000)}`;
      const longInvalidHex = `0x${'g'.repeat(1000)}`;
      const longInvalidDecimal = `1.${'a'.repeat(1000)}`;

      const startTime = Date.now();

      expect(isNumeric(longNonNumeric)).toBe(false);
      expect(isNumeric(longInvalidHex)).toBe(false);
      expect(isNumeric(longInvalidDecimal)).toBe(false);

      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle edge cases with leading/trailing whitespace', () => {
      expect(isNumeric('  123  ')).toBe(true);
      expect(isNumeric('  -123  ')).toBe(true);
      expect(isNumeric('  0.123  ')).toBe(true);
      expect(isNumeric('  1e5  ')).toBe(true);
      expect(isNumeric('  0x1a  ')).toBe(true);

      expect(isNumeric('  123abc  ')).toBe(false);
      expect(isNumeric('  abc123  ')).toBe(false);
    });

    it('should handle decimal numbers starting with dot', () => {
      expect(isNumeric('.123')).toBe(true);
      expect(isNumeric('-.123')).toBe(true);
      expect(isNumeric('+.123')).toBe(true);
      expect(isNumeric('.123e5')).toBe(true);
      expect(isNumeric('.123e-5')).toBe(true);

      expect(isNumeric('.')).toBe(false);
      expect(isNumeric('.abc')).toBe(false);
    });

    it('should handle scientific notation edge cases', () => {
      expect(isNumeric('1e+5')).toBe(true);
      expect(isNumeric('1e-5')).toBe(true);
      expect(isNumeric('1E+5')).toBe(true);
      expect(isNumeric('1E-5')).toBe(true);
      expect(isNumeric('0e+5')).toBe(true);
      expect(isNumeric('0e-5')).toBe(true);

      expect(isNumeric('1e')).toBe(false);
      expect(isNumeric('1e+')).toBe(false);
      expect(isNumeric('1e-')).toBe(false);
      expect(isNumeric('e5')).toBe(false);
    });

    it('should handle hexadecimal edge cases', () => {
      expect(isNumeric('0x0')).toBe(true);
      expect(isNumeric('0x1')).toBe(true);
      expect(isNumeric('0xa')).toBe(true);
      expect(isNumeric('0xA')).toBe(true);
      expect(isNumeric('0xf')).toBe(true);
      expect(isNumeric('0xF')).toBe(true);
      expect(isNumeric('0x123456789abcdef')).toBe(true);
      expect(isNumeric('0x123456789ABCDEF')).toBe(true);

      expect(isNumeric('0x')).toBe(false);
      expect(isNumeric('0xg')).toBe(false);
      expect(isNumeric('0xG')).toBe(false);
      expect(isNumeric('0x123g')).toBe(false);
    });

    it('should handle object types with numeric valueOf()', () => {
      // Number objects
      expect(isNumeric(Object(42))).toBe(true);
      expect(isNumeric(Object(0))).toBe(true);
      expect(isNumeric(Object(-123.45))).toBe(true);
      expect(isNumeric(Object(Infinity))).toBe(true); // Object.valueOf() returns number, no isFinite check
      expect(isNumeric(Object(NaN))).toBe(true); // Object.valueOf() returns number, no isNaN check

      // Custom objects with numeric valueOf
      const customNumObj = { valueOf: () => 123 };
      expect(isNumeric(customNumObj)).toBe(true);

      const customFloatObj = { valueOf: () => 3.14 };
      expect(isNumeric(customFloatObj)).toBe(true);

      const customZeroObj = { valueOf: () => 0 };
      expect(isNumeric(customZeroObj)).toBe(true);
    });

    it('should handle object types with non-numeric valueOf()', () => {
      // String objects
      expect(isNumeric(Object('123'))).toBe(false);
      expect(isNumeric(Object('abc'))).toBe(false);

      // Boolean objects
      expect(isNumeric(Object(true))).toBe(false);
      expect(isNumeric(Object(false))).toBe(false);

      // Custom objects with non-numeric valueOf
      const customStringObj = { valueOf: () => '123' };
      expect(isNumeric(customStringObj)).toBe(false);

      const customBoolObj = { valueOf: () => true };
      expect(isNumeric(customBoolObj)).toBe(false);

      const customArrayObj = { valueOf: () => [1, 2, 3] };
      expect(isNumeric(customArrayObj)).toBe(false);
    });

    it('should handle Date objects (explicitly excluded)', () => {
      expect(isNumeric(new Date())).toBe(false);
      expect(isNumeric(new Date(2023, 0, 1))).toBe(false);
      expect(isNumeric(new Date('2023-01-01'))).toBe(false);
    });

    it('should handle null and undefined objects', () => {
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });

    it('should handle arrays and plain objects', () => {
      expect(isNumeric([])).toBe(false);
      expect(isNumeric([1, 2, 3])).toBe(false);
      expect(isNumeric({})).toBe(false);
      expect(isNumeric({ a: 1, b: 2 })).toBe(false);
    });

    it('should handle edge cases for string whitespace', () => {
      expect(isNumeric('   ')).toBe(false); // only whitespace
      expect(isNumeric('\t\n\r')).toBe(false); // only whitespace characters
      expect(isNumeric('')).toBe(false); // empty string
    });

    it('should handle incomplete scientific notation', () => {
      expect(isNumeric('1e')).toBe(false);
      expect(isNumeric('1e+')).toBe(false);
      expect(isNumeric('1e-')).toBe(false);
      expect(isNumeric('e5')).toBe(false);
      expect(isNumeric('e+5')).toBe(false);
      expect(isNumeric('e-5')).toBe(false);
    });

    it('should handle incomplete hexadecimal notation', () => {
      expect(isNumeric('0x')).toBe(false);
      expect(isNumeric('0X')).toBe(false);
    });

    it('should handle mixed valid and invalid cases', () => {
      // Valid cases with various formats
      expect(isNumeric('123.456')).toBe(true);
      expect(isNumeric('-123.456')).toBe(true);
      expect(isNumeric('+123.456')).toBe(true);
      expect(isNumeric('123.456e+10')).toBe(true);
      expect(isNumeric('123.456E-10')).toBe(true);
      expect(isNumeric('0x123ABC')).toBe(true);

      // Invalid cases
      expect(isNumeric('123.456.789')).toBe(false);
      expect(isNumeric('123e456e789')).toBe(false);
      expect(isNumeric('0x123G')).toBe(false);
      expect(isNumeric('123abc')).toBe(false);
      expect(isNumeric('abc123')).toBe(false);
    });
  });

  //
  // Handsontable.helper.valueAccordingPercent
  //
  describe('valueAccordingPercent', () => {
    it('should calculate percentage from number value', () => {
      expect(valueAccordingPercent(100, 50)).toBe(50);
      expect(valueAccordingPercent(200, 25)).toBe(50);
      expect(valueAccordingPercent(1000, 10)).toBe(100);
      expect(valueAccordingPercent(50, 200)).toBe(100);
    });

    it('should calculate percentage from string value', () => {
      expect(valueAccordingPercent(100, '50%')).toBe(50);
      expect(valueAccordingPercent(200, '25%')).toBe(50);
      expect(valueAccordingPercent(1000, '10%')).toBe(100);
      expect(valueAccordingPercent(50, '200%')).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(valueAccordingPercent(0, 50)).toBe(0);
      expect(valueAccordingPercent(100, 0)).toBe(0);
      expect(valueAccordingPercent(100, '0%')).toBe(0);
      expect(valueAccordingPercent(100, 100)).toBe(100);
      expect(valueAccordingPercent(100, '100%')).toBe(100);
    });

    it('should handle decimal percentages', () => {
      expect(valueAccordingPercent(100, 33.33)).toBe(33);
      expect(valueAccordingPercent(100, '33.33%')).toBe(33);
      expect(valueAccordingPercent(100, 66.66)).toBe(66);
      expect(valueAccordingPercent(100, '66.66%')).toBe(66);
    });
  });

  //
  // Handsontable.helper.rangeEach
  //
  describe('rangeEach', () => {
    it('should iterate increasingly, when `from` and `to` arguments are passed and `from` number is lower then `to`', () => {
      const spy = jasmine.createSpy();

      rangeEach(-1, 2, spy);

      expect(spy.calls.count()).toBe(4);
      expect(spy.calls.argsFor(0)).toEqual([-1]);
      expect(spy.calls.argsFor(1)).toEqual([0]);
      expect(spy.calls.argsFor(2)).toEqual([1]);
      expect(spy.calls.argsFor(3)).toEqual([2]);
    });

    it('should iterate only once, when `from` and `to` arguments are equal', () => {
      const spy = jasmine.createSpy();

      rangeEach(10, 10, spy);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0)).toEqual([10]);
    });

    it('should iterate only once, when `from` and `to` arguments are equal and from value is zero', () => {
      const spy = jasmine.createSpy();

      rangeEach(0, spy);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0)).toEqual([0]);
    });

    it('should iterate increasingly from 0, when only `from` argument is passed', () => {
      const spy = jasmine.createSpy();

      rangeEach(4, spy);

      expect(spy.calls.count()).toBe(5);
      expect(spy.calls.argsFor(0)).toEqual([0]);
      expect(spy.calls.argsFor(4)).toEqual([4]);
    });

    it('should handle when rangeTo is a function', () => {
      const spy = jasmine.createSpy();

      rangeEach(3, spy);

      expect(spy.calls.count()).toBe(4);
      expect(spy.calls.argsFor(0)).toEqual([0]);
      expect(spy.calls.argsFor(1)).toEqual([1]);
      expect(spy.calls.argsFor(2)).toEqual([2]);
      expect(spy.calls.argsFor(3)).toEqual([3]);
    });

    it('should not iterate decreasingly, when `from` and `to` arguments are passed and `from` number is higher then `to`', () => {
      const spy = jasmine.createSpy();

      rangeEach(1, -3, spy);

      expect(spy.calls.count()).toBe(0);
    });
  });

  //
  // Handsontable.helper.rangeEachReverse
  //
  describe('rangeEachReverse', () => {
    it('should iterate decreasingly, when `from` and `to` arguments are passed and `from` number is higher then `to`', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(2, -1, spy);

      expect(spy.calls.count()).toBe(4);
      expect(spy.calls.argsFor(0)).toEqual([2]);
      expect(spy.calls.argsFor(1)).toEqual([1]);
      expect(spy.calls.argsFor(2)).toEqual([0]);
      expect(spy.calls.argsFor(3)).toEqual([-1]);
    });

    it('should iterate only once, when `from` and `to` arguments are equal', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(10, 10, spy);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0)).toEqual([10]);
    });

    it('should iterate only once, when `from` and `to` arguments are equal and from value is zero', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(0, spy);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0)).toEqual([0]);
    });

    it('should iterate decreasingly to 0, when only `from` argument is passed', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(4, spy);

      expect(spy.calls.count()).toBe(5);
      expect(spy.calls.argsFor(0)).toEqual([4]);
      expect(spy.calls.argsFor(4)).toEqual([0]);
    });

    it('should handle when rangeTo is a function', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(3, spy);

      expect(spy.calls.count()).toBe(4);
      expect(spy.calls.argsFor(0)).toEqual([3]);
      expect(spy.calls.argsFor(1)).toEqual([2]);
      expect(spy.calls.argsFor(2)).toEqual([1]);
      expect(spy.calls.argsFor(3)).toEqual([0]);
    });

    it('should not iterate increasingly, when `from` and `to` arguments are passed and `from` number is higher then `to`', () => {
      const spy = jasmine.createSpy();

      rangeEachReverse(1, 5, spy);

      expect(spy.calls.count()).toBe(0);
    });
  });
});
