import gameboardFactory from './gameboardFactory'

const create2DArray = (size) => {
  const myArray = []
  for (let i = 0; i < size; i++) {
    myArray[i] = new Array(size).fill(undefined)
  }
  return myArray
}

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
  const expectedArray = create2DArray(10)
  const fakeShip = fakeShipFactory(1)
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([[1, 1]])
  expectedArray[1][1] = fakeShip
  expect(gameBoard.getBoardStatus()).toStrictEqual(expectedArray)
})

test('placeShip method changes boardStatus for medium ship', () => {
  const fakeShipFactory = jest.fn().mockReturnValue({
    sendGift: '',
    isSupplied: '',
  })
  const expectedArray = create2DArray(10)
  const fakeShip = fakeShipFactory()
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([
    [1, 1],
    [1, 2],
    [1, 3],
  ])
  expectedArray[1][1] = fakeShip
  expectedArray[1][2] = fakeShip
  expectedArray[1][3] = fakeShip
  expect(fakeShipFactory).toBeCalledWith(3)
  expect(gameBoard.getBoardStatus()).toStrictEqual(expectedArray)
})

test('receiveGift tracks succesful gift', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {},
      isSupplied: '',
    }
  }
  const expectedArray = create2DArray(10)
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  expectedArray[1][1] = true
  gameBoard.placeShip([[1, 1]])
  gameBoard.receiveGift([1, 1])
  expect(gameBoard.getBoardStatus()).toStrictEqual(expectedArray)
})

test('receiveGift tracks missed gift', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: '',
      isSupplied: '',
    }
  }
  const expectedArray = create2DArray(10)
  const fakeShip = fakeShipFactory()
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  expectedArray[1][1] = fakeShip
  expectedArray[0][1] = false
  gameBoard.placeShip([[1, 1]])
  gameBoard.receiveGift([0, 1])
  expect(gameBoard.getBoardStatus()).toStrictEqual(expectedArray)
})

test('sendGift method of the correct ship gets called', () => {
  let counter = 0
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {
        counter++
      },
      isSupplied: '',
    }
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([
    [1, 1],
    [1, 2],
  ])
  gameBoard.receiveGift([1, 1])
  gameBoard.receiveGift([1, 2])
  expect(counter).toBe(2)
})

test('areAllSupplied returns true for several ships', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {},
      isSupplied: () => true,
    }
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([[1, 1]])
  gameBoard.placeShip([
    [2, 1],
    [2, 2],
  ])
  gameBoard.receiveGift([1, 1])
  gameBoard.receiveGift([2, 1])
  gameBoard.receiveGift([2, 2])
  expect(gameBoard.areAllSupplied()).toBe(true)
})

test('areAllSupplied returns false for several ships', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {},
      isSupplied: () => {
        return num % 2 === 0 ? false : true
      },
    }
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([[1, 1]])
  gameBoard.placeShip([
    [2, 1],
    [2, 2],
  ])
  expect(gameBoard.areAllSupplied()).toBe(false)
})
