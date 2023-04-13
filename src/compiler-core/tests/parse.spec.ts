import { ElementTypes, NodeTypes } from '../ast';
import { baseParse } from '../parse';

describe('Parse', () => {
  describe('interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{ message }}');
      const interpolation = ast.children[0];

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`
        }
      });
    });
  });

  describe('element', () => {
    test('simple element div', () => {
      const ast = baseParse('<div></div>');
      const element = ast.children[0];

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: []
      });
    });
  });

  describe('text', () => {
    test('simple text div', () => {
      const ast = baseParse('some text');
      const text = ast.children[0];

      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text'
      });
    });
  });

  test('hello world', () => {
    const ast = baseParse('<div>hi, {{message}}</div>');
    const content = ast.children[0];

    expect(content).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi, '
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `message`
          }
        }
      ]
    });
  });

  test('Nested element', () => {
    const ast = baseParse('<div><p>hi, </p>{{message}}</div>');
    const content = ast.children[0];

    expect(content).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi, '
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `message`
          }
        }
      ]
    });
  });

  test('should throw error when lack end tag', () => {
    expect(() => baseParse('<div><span></div>')).toThrow(`缺少结束标签:span`);
  });
});