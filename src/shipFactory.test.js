import { TestScheduler } from '@jest/core'
import shipFactory from './shipFactory'

test('sendGift returns true', () => {
  const ship = shipFactory(1)
  expect(ship.sendGift(0)).toBe(true)
})

test('isSupplied returns true if ship is full of gifts', () => {
  const ship = shipFactory(1)
  ship.sendGift(0)
  expect(ship.isSupplied()).toBe(true)
})

test('isSupplied returns true if big ship is full of gifts', () => {
  const ship = shipFactory(4)
  ship.sendGift(0)
  ship.sendGift(1)
  ship.sendGift(2)
  ship.sendGift(3)
  expect(ship.isSupplied()).toBe(true)
})

test('isSupplied returns false is lacking gifts', () => {
  const ship = shipFactory(1)
  expect(ship.isSupplied()).toBe(false)
})

test('isSupplied returns false if is lacking gifts', () => {
  const ship = shipFactory(4)
  ship.sendGift(0)
  ship.sendGift(1)
  expect(ship.isSupplied()).toBe(false)
})
