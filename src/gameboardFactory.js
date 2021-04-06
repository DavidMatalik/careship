export default function gameBoardFactory(size, shipFactory) {
  let boardStatus = []
  initBoardStatus()

  // Create a ship and put it on given coordinates
  const placeShip = (coords) => {
    const len = coords.length
    const ship = shipFactory(len)
    coords.forEach((coord) => {
      boardStatus[coord[0]][coord[1]] = ship
    })
    return true
  }

  const getBoardStatus = () => boardStatus

  function initBoardStatus() {
    for (let i = 0; i < size; i++) {
      boardStatus[i] = new Array(size).fill(null)
    }
  }

  return { placeShip, getBoardStatus }
}
