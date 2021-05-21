import PubSub from 'pubsub-js'
import shipFactory from './shipFactory'
import gameBoardFactory from './gameboardFactory'
import playerFactory from './playerFactory'

export default (() => {
  let playerBoard = null
  let computerBoard = null
  let player = null
  let computer = null

  const prepareBoards = (msg, shipsArray) => {
    playerBoard = gameBoardFactory(10, shipFactory)
    computerBoard = gameBoardFactory(10, shipFactory)

    shipsArray.forEach((ship) => {
      // Format coords for placeShip method
      const formattedShip = ship.map((coords) => {
        return [parseInt(coords[0]), parseInt(coords[1])]
      })
      playerBoard.placeShip(formattedShip)
      computerBoard.placeShip(formattedShip)
    })

    PubSub.publish('changedPlayerboard', playerBoard.getBoardStatus())
    PubSub.publish('changedComputerboard', computerBoard.getBoardStatus())
  }

  const startNewGame = (msg, playerName) => {
    player = playerFactory(computerBoard, playerName)
    computer = playerFactory(playerBoard)
  }

  const evaluateField = (msg, coords) => {
    player.chooseField(coords)
    PubSub.publish('changedComputerboard', computerBoard.getBoardStatus())
    if (computerBoard.areAllSupplied()) {
      PubSub.publish('gameFinished', player.getName())
    }

    computer.chooseField()
    PubSub.publish('changedPlayerboard', playerBoard.getBoardStatus())
    if (playerBoard.areAllSupplied()) {
      PubSub.publish('gameFinished', computer.getName())
    }
  }

  const init = () => {
    PubSub.subscribe('shipsPlaced', prepareBoards)
    PubSub.subscribe('startClicked', startNewGame)
    PubSub.subscribe('fieldClicked', evaluateField)
  }

  return { init }
})()
