import gameboardFactory from './gameboardFactory'

test('placeShip method calls shipFactory', () => {
  let fakeShipFactoryIsCalled = false
  const fakeShipFactory = (num) => {
    fakeShipFactoryIsCalled = true
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)
  gameBoard.placeShip([[1, 1]])
  expect(fakeShipFactoryIsCalled).toBe(true)
})

test('placeShip method changes boardStatus for small ship', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: '',
      isSupplied: '',
    }
  }
  const fakeShip = fakeShipFactory(1)
  const gameBoard = gameboardFactory(10, fakeShipFactory)
  gameBoard.placeShip([[1, 1]])
  expect(gameBoard.getBoardStatus()).toStrictEqual([
    [null, null, null, null, null, null, null, null, null, null],
    [null, fakeShip, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
  ])
})

test('placeShip method changes boardStatus for medium ship', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: '',
      isSupplied: '',
    }
  }
  const fakeShip = fakeShipFactory(3)
  const gameBoard = gameboardFactory(10, fakeShipFactory)
  gameBoard.placeShip([
    [1, 1],
    [1, 2],
    [1, 3],
  ])
  expect(gameBoard.getBoardStatus()).toStrictEqual([
    [null, null, null, null, null, null, null, null, null, null],
    [null, fakeShip, fakeShip, fakeShip, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
  ])
})
