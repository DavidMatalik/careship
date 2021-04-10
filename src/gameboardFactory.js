export default function gameBoardFactory(size, shipFactory) {
  let boardStatus = []
  let ships = []
  initBoardStatus()

  // Create a ship and put it on given coordinates
  const placeShip = (coords) => {
    const shipLen = coords.length
    const index = ships.push(shipFactory(shipLen)) - 1
    coords.forEach((coord) => {
      boardStatus[coord[0]][coord[1]] = ships[index]
    })
    return true
  }

  const receiveGift = (coordPair) => {
    let fieldValue = boardStatus[coordPair[0]][coordPair[1]]
    // Check if fieldValue has ship
    if (typeof fieldValue === 'object') {
      fieldValue.sendGift()
      fieldValue = true
    }
    // Check if fieldValue is empty
    if (fieldValue === undefined) {
      fieldValue = false
    }
    boardStatus[coordPair[0]][coordPair[1]] = fieldValue
  }

  const areAllSupplied = () => {
    // If you find a ship which isn't supplied return false
    for (let i = 0; i < ships.length; i++) {
      if (!ships[i].isSupplied()) {
        return false
      }
    }
    // Otherwise return true
    return true
  }

  const getBoardStatus = () => boardStatus

  function initBoardStatus() {
    for (let i = 0; i < size; i++) {
      boardStatus[i] = new Array(size).fill(undefined)
    }
  }

  return { placeShip, receiveGift, areAllSupplied, getBoardStatus }
}
