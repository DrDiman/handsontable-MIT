import {
  addClass,
  closestDown,
  getParent,
  hasClass,
  isInput,
  removeClass,
  HTML_CHARACTERS,
  fastInnerHTML,
  fastInnerText,
} from 'handsontable/helpers/dom/element';

describe('DomElement helper', () => {
  //
  // Handsontable.helper.HTML_CHARACTERS
  //
  describe('HTML_CHARACTERS', () => {
    it('should match HTML tags', () => {
      expect(HTML_CHARACTERS.test('<div>')).toBe(true);
      expect(HTML_CHARACTERS.test('<span>')).toBe(true);
      expect(HTML_CHARACTERS.test('<p>')).toBe(true);
      expect(HTML_CHARACTERS.test('<br/>')).toBe(true);
      expect(HTML_CHARACTERS.test('<input type="text">')).toBe(true);
      expect(HTML_CHARACTERS.test('<div class="test">content</div>')).toBe(true);
    });

    it('should match HTML entities', () => {
      expect(HTML_CHARACTERS.test('&amp;')).toBe(true);
      expect(HTML_CHARACTERS.test('&lt;')).toBe(true);
      expect(HTML_CHARACTERS.test('&gt;')).toBe(true);
      expect(HTML_CHARACTERS.test('&quot;')).toBe(true);
      expect(HTML_CHARACTERS.test('&#39;')).toBe(true);
      expect(HTML_CHARACTERS.test('&nbsp;')).toBe(true);
      expect(HTML_CHARACTERS.test('&copy;')).toBe(true);
    });

    it('should not match plain text', () => {
      expect(HTML_CHARACTERS.test('plain text')).toBe(false);
      expect(HTML_CHARACTERS.test('123')).toBe(false);
      expect(HTML_CHARACTERS.test('')).toBe(false);
      expect(HTML_CHARACTERS.test(' ')).toBe(false);
    });

    it('should not match incomplete HTML', () => {
      expect(HTML_CHARACTERS.test('<')).toBe(false);
      expect(HTML_CHARACTERS.test('>')).toBe(false);
      expect(HTML_CHARACTERS.test('&')).toBe(false);
      expect(HTML_CHARACTERS.test('&amp')).toBe(false);
    });

    it('should be ReDoS-safe', () => {
      // These patterns could cause ReDoS with the old regex
      const longTag = `<${'a'.repeat(1000)}>`;
      const startTime = Date.now();
      HTML_CHARACTERS.test(longTag);
      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should be ReDoS-safe with complex HTML patterns', () => {
      // Test with various patterns that could cause ReDoS
      const longAttribute = `<div${' a="b"'.repeat(1000)}>`;
      const longEntity = `&${'amp'.repeat(1000)};`;
      const longIncompleteTag = `<${'a'.repeat(1000)}`;
      const longIncompleteEntity = `&${'amp'.repeat(1000)}`;

      const startTime = Date.now();

      HTML_CHARACTERS.test(longAttribute);
      HTML_CHARACTERS.test(longEntity);
      HTML_CHARACTERS.test(longIncompleteTag);
      HTML_CHARACTERS.test(longIncompleteEntity);

      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle nested HTML structures safely', () => {
      const nestedHtml = `<div><span><p><a href="#">${'nested'.repeat(100)}</a></p></span></div>`;
      const startTime = Date.now();
      HTML_CHARACTERS.test(nestedHtml);
      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle mixed content safely', () => {
      const mixedContent = `text${'<div>'.repeat(100)}content${'</div>'.repeat(100)}more text`;
      const startTime = Date.now();
      HTML_CHARACTERS.test(mixedContent);
      const endTime = Date.now();

      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  //
  // Handsontable.helper.fastInnerHTML
  //
  describe('fastInnerHTML', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
    });

    afterEach(() => {
      element = null;
    });

    it('should use innerHTML for content with HTML tags', () => {
      const htmlContent = '<span>test</span>';

      fastInnerHTML(element, htmlContent);

      expect(element.innerHTML).toBe(htmlContent);
    });

    it('should use innerHTML for content with HTML entities', () => {
      const entityContent = 'test &amp; more';

      fastInnerHTML(element, entityContent);

      expect(element.innerHTML).toBe(entityContent);
    });

    it('should use fastInnerText for plain text content', () => {
      const textContent = 'plain text content';

      fastInnerHTML(element, textContent);

      expect(element.textContent).toBe(textContent);
      expect(element.innerHTML).toBe(textContent);
    });

    it('should handle empty content', () => {
      fastInnerHTML(element, '');

      expect(element.textContent).toBe('');
    });

    it('should handle whitespace-only content', () => {
      fastInnerHTML(element, '   ');

      expect(element.textContent).toBe('   ');
    });
  });

  //
  // Handsontable.helper.fastInnerText
  //
  describe('fastInnerText', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
    });

    afterEach(() => {
      element = null;
    });

    it('should replace existing text node content', () => {
      element.appendChild(document.createTextNode('original'));

      fastInnerText(element, 'new content');

      expect(element.textContent).toBe('new content');
      expect(element.childNodes.length).toBe(1);
    });

    it('should create new text node when element is empty', () => {
      fastInnerText(element, 'new content');

      expect(element.textContent).toBe('new content');
      expect(element.childNodes.length).toBe(1);
      expect(element.firstChild.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should replace multiple child nodes with single text node', () => {
      element.innerHTML = '<span>old</span>text<span>content</span>';

      fastInnerText(element, 'new content');

      expect(element.textContent).toBe('new content');
      expect(element.childNodes.length).toBe(1);
      expect(element.firstChild.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should handle empty content', () => {
      fastInnerText(element, '');

      expect(element.textContent).toBe('');
      expect(element.childNodes.length).toBe(1);
    });
  });

  //
  // Handsontable.helper.isInput
  //
  describe('isInput', () => {
    it('should return true for inputs, selects, and textareas', () => {
      expect(isInput(document.createElement('input'))).toBe(true);
      expect(isInput(document.createElement('select'))).toBe(true);
      expect(isInput(document.createElement('textarea'))).toBe(true);
    });

    it('should return true for contentEditable elements', () => {
      const div = document.createElement('div');

      div.contentEditable = 'true';

      expect(isInput(div)).toBe(true);
    });
  });

  //
  // Handsontable.helper.closestDown
  //
  describe('closestDown', () => {
    const test1 = '<div class="wrapper1"><table><tbody><tr><td class="test1">test1</td></tr></tbody></table></div>';
    const test2 = `<div class="wrapper2"><table><tbody><tr><td class="test2">test2${test1}</td></tr></tbody></table></div>`;

    it('should return last TD element (starting from last child element)', () => {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = test2;
      const td1 = wrapper.querySelector('.test1');
      const td2 = wrapper.querySelector('.test2');

      expect(closestDown(td1, ['TD'])).toBe(td2);
    });

    it('should return proper value depends on passed `until` element', () => {
      const td = document.createElement('td');

      td.innerHTML = test2;
      const wrapper2 = td.querySelector('.wrapper2');

      expect(closestDown(wrapper2, ['TD'])).toBe(td);
      expect(closestDown(wrapper2, ['TD'], wrapper2.firstChild)).toBe(null);
    });
  });

  //
  // Handsontable.helper.getParent
  //
  describe('getParent', () => {
    let element = null;

    beforeEach(() => {
      element = document.createElement('div');
      element.innerHTML = '<div id="a1"><ul id="a2"></ul><ul id="b2"><li id="a3"><span id="a4">HELLO</span></li></ul></div>';
    });

    afterEach(() => {
      element = null;
    });

    it('should return the node parent only from the one level deep', () => {
      expect(getParent(element.querySelector('#a4'))).toBe(element.querySelector('#a3'));
      expect(getParent(element.querySelector('#a1'))).toBe(element);
    });

    it('should return the node parent from the defined level deep', () => {
      expect(getParent(element.querySelector('#a4'), 0)).toBe(element.querySelector('#a3'));
      expect(getParent(element.querySelector('#a4'), 1)).toBe(element.querySelector('#b2'));
      expect(getParent(element.querySelector('#a4'), 2)).toBe(element.querySelector('#a1'));
      expect(getParent(element.querySelector('#a4'), 3)).toBe(element);
      expect(getParent(element.querySelector('#a4'), 4)).toBe(null);
      expect(getParent(element.querySelector('#a4'), 5)).toBe(null);
      expect(getParent(element.querySelector('#a2'), 0)).toBe(element.querySelector('#a1'));
      expect(getParent(element.querySelector('#a2'), 1)).toBe(element);
    });
  });

  /**
   * Handsontable.helper.hasClass
   */
  describe('hasClass', () => {
    let element = null;

    beforeEach(() => {
      element = document.createElement('div');
      element.className = 'test1';
    });

    afterEach(() => {
      element = null;
    });

    it('should not throw an error when checked the element has not classList property', () => {
      expect(() => { hasClass(document, 'test2'); }).not.toThrow();
    });

    it('should return true if element has className', () => {
      expect(hasClass(element, 'test1')).toBeTruthy();
    });

    it('should return false if element has not className', () => {
      expect(hasClass(element, 'test2')).toBeFalsy();
    });

    it('should not touch the DOM element when the passed argument is empty', () => {
      const elementMock = {
        classList: {
          contains: jasmine.createSpy('classList'),
        }
      };
      hasClass(elementMock);

      expect(elementMock.classList.contains).not.toHaveBeenCalled();

      elementMock.classList.contains.calls.reset();
      hasClass(elementMock, '');

      expect(elementMock.classList.contains).not.toHaveBeenCalled();

      elementMock.classList.contains.calls.reset();
      hasClass(elementMock, []);

      expect(elementMock.classList.contains).not.toHaveBeenCalled();

      elementMock.classList.contains.calls.reset();
      hasClass(elementMock, ['']);

      expect(elementMock.classList.contains).not.toHaveBeenCalled();
    });
  });

  /**
   * Handsontable.helper.addClass
   */
  describe('addClass', () => {
    let element = null;

    beforeEach(() => {
      element = document.createElement('div');
      element.className = 'test1';
    });

    afterEach(() => {
      element = null;
    });

    it('should add CSS class without removing old one', () => {
      addClass(element, 'test2');

      expect(element.className).toBe('test1 test2');
    });

    it('should add multiple CSS classes without removing old one (delimited by an empty space)', () => {
      addClass(element, 'test2 test4 test3');

      expect(element.className).toBe('test1 test2 test4 test3');
    });

    it('should add multiple CSS classes without removing old one (passed as an array)', () => {
      addClass(element, ['test2', 'test4', 'test3']);

      expect(element.className).toBe('test1 test2 test4 test3');
    });

    it('should not touch the DOM element when the passed argument is empty', () => {
      const elementMock = {
        classList: {
          add: jasmine.createSpy('classList'),
        }
      };
      addClass(elementMock);

      expect(elementMock.classList.add).not.toHaveBeenCalled();

      elementMock.classList.add.calls.reset();
      addClass(elementMock, '');

      expect(elementMock.classList.add).not.toHaveBeenCalled();

      elementMock.classList.add.calls.reset();
      addClass(elementMock, []);

      expect(elementMock.classList.add).not.toHaveBeenCalled();

      elementMock.classList.add.calls.reset();
      addClass(elementMock, ['']);

      expect(elementMock.classList.add).not.toHaveBeenCalled();
    });
  });

  /**
   * Handsontable.helper.removeClass
   */
  describe('removeClass', () => {
    let element = null;

    beforeEach(() => {
      element = document.createElement('div');
      element.className = 'test1 test3';
    });

    afterEach(() => {
      element = null;
    });

    it('should remove CSS class without removing rest CSS classes', () => {
      removeClass(element, 'test1');

      expect(element.className).toBe('test3');
    });

    it('should remove multiple CSS classes (delimited by an empty space)', () => {
      removeClass(element, 'test2 test3 test1');

      expect(element.className).toBe('');
    });

    it('should remove CSS multiple classes (passed as an array)', () => {
      removeClass(element, ['test2', 'test3', 'test1']);

      expect(element.className).toBe('');
    });

    it('should not touch the DOM element when the passed argument is empty', () => {
      const elementMock = {
        classList: {
          remove: jasmine.createSpy('classList'),
        }
      };
      removeClass(elementMock);

      expect(elementMock.classList.remove).not.toHaveBeenCalled();

      elementMock.classList.remove.calls.reset();
      removeClass(elementMock, '');

      expect(elementMock.classList.remove).not.toHaveBeenCalled();

      elementMock.classList.remove.calls.reset();
      removeClass(elementMock, []);

      expect(elementMock.classList.remove).not.toHaveBeenCalled();

      elementMock.classList.remove.calls.reset();
      removeClass(elementMock, ['']);

      expect(elementMock.classList.remove).not.toHaveBeenCalled();
    });
  });
});
