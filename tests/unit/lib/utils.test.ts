import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('handles false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles mixed inputs', () => {
    expect(cn('foo', ['bar', 'baz'], { qux: true })).toBe('foo bar baz qux');
  });

  // Tailwind merge specific tests
  it('merges conflicting Tailwind classes (padding)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('merges conflicting Tailwind classes (margin)', () => {
    expect(cn('m-4', 'm-8')).toBe('m-8');
  });

  it('merges conflicting Tailwind classes (text color)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('merges conflicting Tailwind classes (background)', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('p-4', 'm-4')).toBe('p-4 m-4');
  });

  it('handles Tailwind responsive prefixes', () => {
    expect(cn('p-4', 'md:p-6', 'lg:p-8')).toBe('p-4 md:p-6 lg:p-8');
  });

  it('merges conflicting responsive classes', () => {
    expect(cn('md:p-4', 'md:p-6')).toBe('md:p-6');
  });

  it('handles Tailwind state prefixes', () => {
    expect(cn('hover:bg-blue-500', 'focus:bg-green-500')).toBe('hover:bg-blue-500 focus:bg-green-500');
  });

  it('handles complex class combinations', () => {
    const result = cn(
      'flex items-center',
      'p-4',
      { 'bg-blue-500': true, 'text-white': true },
      'hover:bg-blue-600'
    );
    expect(result).toBe('flex items-center p-4 bg-blue-500 text-white hover:bg-blue-600');
  });

  it('handles empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('handles whitespace-only strings', () => {
    expect(cn('foo', '   ', 'bar')).toBe('foo bar');
  });

  it('trims whitespace from classes', () => {
    expect(cn('  foo  ', '  bar  ')).toBe('foo bar');
  });
});
