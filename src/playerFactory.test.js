import playerFactory from './playerFactory'

const arrSize = 10
let fakeArr = []

beforeEach(() => {
  for (let i = 0; i < arrSize; i++) {
    fakeArr[i] = new Array(arrSize).fill(undefined)
  }
})

const createFakeGameboard = (arr) => {
  const fakeGameboardFactory = (size, shipFactory) => {
    return {
      placeShip: '',
      receiveGift: (coordPair) => {
        arr[coordPair[0]][coordPair[1]] = false
      },
      areAllSupplied: '',
      getBoardStatus: () => arr,
    }
  }

  return fakeGameboardFactory(10, {})
}

test('A player object has a given name', () => {
  const gameBoard = {}
  expect(playerFactory(gameBoard, 'John')).toHaveProperty('name', 'John')
})

test('A player object has default name', () => {
  const gameBoard = {}
  expect(playerFactory(gameBoard)).toHaveProperty('name', 'Computer')
})

test('chooseField updates gameBoard for human players', () => {
  const fakeGameboard = createFakeGameboard(fakeArr)
  const player = playerFactory(fakeGameboard, 'John')

  player.chooseField([1, 1])

  expect(fakeArr[1][1]).toBe(false)
})

test('chooseField updates gameBoard for computer players', () => {
  const fakeGameboard = createFakeGameboard(fakeArr)
  const computerPlayer = playerFactory(fakeGameboard)

  computerPlayer.chooseField()

  /* If chooseField updated gameBoard somewhere in gameBoard 
  there should be an entry with value false */
  const falseCheck = fakeArr.some((innerArr) => {
    return innerArr.includes(false)
  })

  expect(falseCheck).toBe(true)
})

test('AI does not pick same coords as before', () => {
  const fakeGameboard = createFakeGameboard(fakeArr)
  const computerPlayer = playerFactory(fakeGameboard)

  for (let i = 0; i < 100; i++) {
    computerPlayer.chooseField()
  }

  /* If AI only picked every coordinate once there should
  be no undefined value anywhere in the array */
  const undefinedCheck = fakeArr.some((innerArr) => {
    return innerArr.includes(undefined)
  })

  expect(undefinedCheck).toBe(false)
})