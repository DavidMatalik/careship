export default function gameBoardFactory(size, shipFactory) {
  let boardStatus = []
  let ships = []

  initBoardStatus()

  // Create a ship and put it on given coordinates
  const placeShip = (coords) => {
    const shipLen = coords.length

    // Save ship with its coordinates (Needed for checking areAllSupplied)
    const index = ships.push([shipFactory(shipLen), coords]) - 1

    coords.forEach((coord) => {
      boardStatus[coord[0]][coord[1]] = ships[index]
    })
  }

  const receiveGift = (coordPair) => {
    let fieldValue = boardStatus[coordPair[0]][coordPair[1]]

    // Check if fieldValue has ship
    if (typeof fieldValue === 'object') {
      fieldValue[0].sendGift()

      // All fields of this ship are already supplied?
      if(fieldValue[0].isSupplied()) {

        // Find index of ship in ships using coordPair
        const ind = ships.findIndex(ship => {
          // Check if coordPair is in current ship
          const found = ship[1].find(coord => {
            if (JSON.stringify(coord) === JSON.stringify(coordPair)){
              return true
            }
          })
          // If coordPair was found return true
          return found ? true : false
        })

        // Set all found coords on 'shipSupplied' in boardStatus
        const suppliedShipCoords = ships[ind][1]
        suppliedShipCoords.forEach(coords => {
          boardStatus[coords[0]][coords[1]] = 'shipSupplied'
        })
        return
      }

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
      if (!ships[i][0].isSupplied()) {
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
