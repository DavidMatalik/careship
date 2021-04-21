import playerFactory from './playerFactory'

// Possible to use same beforeeach across multiple files?
// The for-loop to create an array is also in gameBoardFactory

const arrSize = 10
let fakeArr = []
let fakeGameboard = null

beforeEach(() => {
  for (let i = 0; i < arrSize; i++) {
    fakeArr[i] = new Array(arrSize).fill(undefined)
  }

  const fakeGameboardFactory = (size, shipFactory) => {
    return {
      placeShip: '',
      receiveGift: (coordPair) => {
        fakeArr[coordPair[0]][coordPair[1]] = false
      },
      areAllSupplied: '',
      getBoardStatus: () => fakeArr,
    }
  }

  fakeGameboard = fakeGameboardFactory(10, {})
})

test('getName returns a set name', () => {
  const gameBoard = {}
  const player = playerFactory(gameBoard, 'John')
  expect(player.getName()).toBe('John')
})

test('getName returns as default name', () => {
  const gameBoard = {}
  const player = playerFactory(gameBoard)
  expect(player.getName()).toBe('Computer')
})

test('chooseField updates gameBoard for human players', () => {
  const player = playerFactory(fakeGameboard, 'John')

  player.chooseField([1, 1])

  expect(fakeArr[1][1]).toBe(false)
})

test('chooseField updates gameBoard for computer players', () => {
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
