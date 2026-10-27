import { expect, test } from 'vitest';
import { seriesNeighbours } from './series';

const p = (id: string, name: string, part: number) => ({ id, data: { series: { name, part } } }) as any;
const all = [p('a1', 'A', 1), p('a2', 'A', 2), p('a3', 'A', 3), p('b1', 'B', 2), { id: 'x', data: {} } as any];

test('finds previous and next parts in the same series only', () => {
  expect(seriesNeighbours(all, all[1])).toEqual({ prev: all[0], next: all[2] });
  expect(seriesNeighbours(all, all[0])).toEqual({ prev: undefined, next: all[1] });
  expect(seriesNeighbours(all, all[3])).toEqual({ prev: undefined, next: undefined });
});
test('posts without a series have no neighbours', () => {
  expect(seriesNeighbours(all, all[4])).toEqual({ prev: undefined, next: undefined });
});
