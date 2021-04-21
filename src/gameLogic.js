import PubSub from 'pubsub-js'
import shipFactory from './shipFactory'
import gameBoardFactory from './gameboardFactory'
import playerFactory from './playerFactory'

export default (() => {
  let playerBoard = null
  let computerBoard = null
  let player = null
  let computer = null

  const startNewGame = (msg, playerName) => {
    playerBoard = gameBoardFactory(10, shipFactory)
    computerBoard = gameBoardFactory(10, shipFactory)

    player = playerFactory(computerBoard, playerName)
    computer = playerFactory(playerBoard)

    /* At the moment playerBoard is filled manually
    Implement functionality for letting Player put his ships */
    playerBoard.placeShip([[2, 2]])
    playerBoard.placeShip([
      [4, 4],
      [4, 5],
    ])

    computerBoard.placeShip([[2, 2]])
    computerBoard.placeShip([
      [4, 4],
      [4, 5],
    ])

    PubSub.publish('changedPlayerboard', playerBoard.getBoardStatus())
    PubSub.publish('changedComputerboard', computerBoard.getBoardStatus())
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
    PubSub.subscribe('startClicked', startNewGame)
    PubSub.subscribe('fieldClicked', evaluateField)
  }

  return { init }
})()
