import gameboardFactory from './gameboardFactory'

const arrSize = 10
let fakeArr = []

beforeEach(() => {
  for (let i = 0; i < arrSize; i++) {
    fakeArr[i] = new Array(arrSize).fill(undefined)
  }
})

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
  // const expectedArray = create2DArray(10)
  const fakeShip = fakeShipFactory(1)
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([[1, 1]])
  // expectedArray[1][1] = fakeShip
  fakeArr[1][1] = [fakeShip, [[1, 1]]]

  // expect(gameBoard.getBoardStatus()).toStrictEqual(expectedArray)
  expect(gameBoard.getBoardStatus()).toStrictEqual(fakeArr)
})

test('placeShip method changes boardStatus for medium ship', () => {
  const fakeShipFactory = jest.fn().mockReturnValue({
    sendGift: '',
    isSupplied: '',
  })
  const fakeShip = fakeShipFactory()
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  gameBoard.placeShip([
    [1, 1],
    [1, 2],
    [1, 3],
  ])

  fakeArr[1][1] = [fakeShip, [
    [1, 1],
    [1, 2],
    [1, 3],
  ] ]
  fakeArr[1][2] = [fakeShip, [
    [1, 1],
    [1, 2],
    [1, 3],
  ] ]
  fakeArr[1][3] = [fakeShip, [
    [1, 1],
    [1, 2],
    [1, 3],
  ] ]

  expect(fakeShipFactory).toBeCalledWith(3)
  expect(gameBoard.getBoardStatus()).toStrictEqual(fakeArr)
})

test('receiveGift tracks succesful gift', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {},
      isSupplied: () => false,
    }
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  fakeArr[1][1] = true
  gameBoard.placeShip([[1, 1]])
  gameBoard.receiveGift([1, 1])

  expect(gameBoard.getBoardStatus()).toStrictEqual(fakeArr)
})

test('receiveGift tracks missed gift', () => {
  const fakeShipFactory = (num) => {
    return {
      sendGift: '',
      isSupplied: '',
    }
  }
  const fakeShip = fakeShipFactory()
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  fakeArr[1][1] = [fakeShip, [[1, 1]]]
  fakeArr[0][1] = false
  gameBoard.placeShip([[1, 1]])
  gameBoard.receiveGift([0, 1])

  expect(gameBoard.getBoardStatus()).toStrictEqual(fakeArr)
})

test('receiveGift updates boardStatus for completely supplied ship', () => {
  const isSuppliedMock = jest.fn()
  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {},
      isSupplied: isSuppliedMock,
    }
  }
  const gameBoard = gameboardFactory(10, fakeShipFactory)

  isSuppliedMock.mockReturnValueOnce(false).mockReturnValueOnce(true)

  fakeArr[1][1] = 'shipSupplied'
  fakeArr[1][2] = 'shipSupplied'

  gameBoard.placeShip([[1, 1], [1, 2]])

  gameBoard.receiveGift([1, 1])
  gameBoard.receiveGift([1, 2])

  expect(gameBoard.getBoardStatus()).toStrictEqual(fakeArr)
})

test('sendGift method of the correct ship gets called', () => {
  let counter = 0

  const fakeShipFactory = (num) => {
    return {
      sendGift: () => {
        counter++
      },
      isSupplied: () => false,
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
