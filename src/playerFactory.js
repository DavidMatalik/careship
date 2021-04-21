export default function playerFactory(gameBoard, name = 'Computer') {
  const chooseField = (coords = generateCoords()) => {
    gameBoard.receiveGift(coords)
    return gameBoard.getBoardStatus()
  }

  const generateCoords = () => {
    // When length is 10 a random number between 0-9 should be generated
    const arr = gameBoard.getBoardStatus()
    const range = arr.length

    let coord1
    let coord2

    // Assign coordinates which have not been assigned before
    // This could be written more performantly
    do {
      coord1 = Math.floor(Math.random() * range)
      coord2 = Math.floor(Math.random() * range)
    } while ((arr[coord1][coord2] !== false || arr[coord1][coord2]) !== true)

    return [coord1, coord2]
  }

  const getName = () => {
    return name
  }

  return { getName, chooseField }
}
