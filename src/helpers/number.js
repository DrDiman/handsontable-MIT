/**
 * Checks if value of n is a numeric one
 * http://jsperf.com/isnan-vs-isnumeric/4
 * @param n
 * @returns {boolean}
 */
export function isNumeric(n) {
  /* eslint-disable */
  var t = typeof n;

  if (t == 'number') {
    return !isNaN(n) && isFinite(n);
  }

  if (t == 'string') {
    if (!n.length) {
      return false;
    }

    if (n.length == 1) {
      return /\d/.test(n);
    }

    const trimmed = n.trim();

    // Check for hexadecimal format first (0x...)
    if (/^0x[a-fA-F0-9]+$/i.test(trimmed)) {
      return true;
    }

    // Check for comma-separated decimal format (e.g., "77,70" -> 77.7)
    const commaDecimalPattern = /^[+-]?\s*(\d+(,\d+)?([eE][+-]?\d+)?|,\d+([eE][+-]?\d+)?)$/;
    if (commaDecimalPattern.test(trimmed)) {
      return true;
    }

    // Check for decimal format with optional sign, decimal point, and exponent
    // Using separate checks to avoid nested quantifiers and ReDoS
    const decimalPattern = /^[+-]?\s*(\d+(\.\d+)?([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?)$/;
    return decimalPattern.test(trimmed);
  }

  if (t == 'object') {
    return !!n && typeof n.valueOf() == 'number' && !(n instanceof Date);
  }

  return false;
}

/**
 * A specialized version of `.forEach` defined by ranges.
 *
 * @param {Number} rangeFrom The number from start iterate.
 * @param {Number|Function} rangeTo The number where finish iterate or function as a iteratee.
 * @param {Function} [iteratee] The function invoked per iteration.
 */
export function rangeEach(rangeFrom, rangeTo, iteratee) {
  let index = -1;

  if (typeof rangeTo === 'function') {
    iteratee = rangeTo;
    rangeTo = rangeFrom;
  } else {
    index = rangeFrom - 1;
  }
  while (++index <= rangeTo) {
    if (iteratee(index) === false) {
      break;
    }
  }
}

/**
 * A specialized version of `.forEach` defined by ranges iterable in reverse order.
 *
 * @param {Number} rangeFrom The number from start iterate.
 * @param {Number|Function} rangeTo The number where finish iterate or function as a iteratee.
 * @param {Function} [iteratee] The function invoked per iteration.
 */
export function rangeEachReverse(rangeFrom, rangeTo, iteratee) {
  let index = rangeFrom + 1;

  if (typeof rangeTo === 'function') {
    iteratee = rangeTo;
    rangeTo = 0;
  }
  while (--index >= rangeTo) {
    if (iteratee(index) === false) {
      break;
    }
  }
}

/**
 * Calculate value from percent.
 *
 * @param {Number} value Base value from percent will be calculated.
 * @param {String|Number} percent Can be Number or String (eq. `'33%'`).
 * @returns {Number}
 */
export function valueAccordingPercent(value, percent) {
  percent = parseInt(percent.toString().replace('%', ''), 10);
  percent = parseInt(value * percent / 100, 10);

  return percent;
}
