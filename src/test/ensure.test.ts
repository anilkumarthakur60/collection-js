import { collect, UnexpectedValueException } from '../collect';

describe('Collection ensure method', () => {
  it('should verify that all elements are of a given type', () => {
    const collection = collect([1, 2, 3]);
    expect(() => collection.ensure('number')).not.toThrow();
  });

  it('should throw an error if an element is not of the given type', () => {
    const collection = collect([1, '2', 3]);
    expect(() => collection.ensure('number')).toThrow(UnexpectedValueException);
  });

  it('should verify that all elements are of a given class type', () => {
    class MyClass { }
    const collection = collect([new MyClass(), new MyClass()]);
    expect(() => collection.ensure(MyClass)).not.toThrow();
  });

  it('should throw an error if an element is not of the given class type', () => {
    class MyClass { }
    const collection = collect([new MyClass(), {}]);
    expect(() => collection.ensure(MyClass)).toThrow(UnexpectedValueException);
  });

  it('should verify that all elements are of any of the given types', () => {
    const collection = collect([1, '2', 3]);
    expect(() => collection.ensure('number', 'string')).not.toThrow();
  });

  it('should throw an error if an element is not of any of the given types', () => {
    const collection = collect([1, '2', true]);
    expect(() => collection.ensure('number', 'string')).toThrow(UnexpectedValueException);
  });

  it('should allow method chaining', () => {
    const collection = collect([1, 2, 3]);
    expect(() => collection.ensure('number').each(item => item)).not.toThrow();
  });
});
