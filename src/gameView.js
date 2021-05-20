import PubSub from 'pubsub-js'

export default (function () {
  const body = document.querySelector('body')

  const heading = document.createElement('h1')
  const container = document.createElement('div')
  const dragContainer = document.createElement('div')
  const boardsContainer = document.createElement('div')
  const board1Container = document.createElement('div')
  const board2Container = document.createElement('div')
  const playerName = document.createElement('h2')
  const computerName = document.createElement('h2')
  const board1 = document.createElement('div')
  const board2 = document.createElement('div')
  const form = document.createElement('form')
  const nameLabel = document.createElement('label')
  const nameInput = document.createElement('input')
  const startButton = document.createElement('button')
  const finishMessage = document.createElement('p')

  const createBoardFields = (size, board) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const field = document.createElement('div')
        field.classList.add('field')
        field.dataset.coords = `${i}${j}`
        board.appendChild(field)
      }
    }
  }

  const addFieldListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.addEventListener('click', publishCoords)
    })
  }

  const publishCoords = (event) => {
    const coords = event.target.dataset.coords
    const coordsArray = [parseInt(coords[0]), parseInt(coords[1])]
    PubSub.publish('fieldClicked', coordsArray)
  }

  const createDragZone = () => {
    dragContainer.id = 'drag-container'
    //1
    const dragShipBig = document.createElement('div')
    //2
    const dragShipLarge = document.createElement('div')
    //3
    const dragShipMedium = document.createElement('div')
    //2
    const dragShipSmall = document.createElement('div')

    return dragContainer
  }

  const createBoards = (boardSize) => {
    board1Container.appendChild(playerName)
    board2Container.appendChild(computerName)

    board1Container.appendChild(board1)
    board2Container.appendChild(board2)

    boardsContainer.appendChild(board1Container)
    boardsContainer.appendChild(board2Container)

    playerName.id = 'player-name'
    computerName.id = 'computer-name'

    boardsContainer.id = 'board-container'
    board1.id = 'board-1'
    board2.id = 'board-2'

    createBoardFields(boardSize, board1)
    createBoardFields(boardSize, board2)

    return boardsContainer
  }

  const resetBoard = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.innerHTML = ''
    })
  }

  const startGame = (event) => {
    // If input makes sense the if below is executed
    if (form.checkValidity()) {
      // preventDefault() prevents page from relaoding
      event.preventDefault()
      PubSub.publish('startClicked', nameInput.value)
      form.style.display = 'none'
      playerName.innerHTML = `${nameInput.value}'s board`
      computerName.innerHTML = `Computer's board`
      finishMessage.style.display = 'none'
      resetBoard(board1)
      resetBoard(board2)
      addFieldListeners(board2)
    }
  }

  const createForm = () => {
    form.appendChild(nameLabel)
    form.appendChild(nameInput)
    form.appendChild(startButton)

    nameLabel.innerHTML = 'Name: '
    nameInput.placeholder = 'Enter your name'
    nameInput.required = true

    startButton.innerHTML = 'Start new Game'

    form.addEventListener('submit', startGame)
    return form
  }

  const init = (boardSize) => {
    container.id = 'container'

    container.appendChild(createDragZone())
    container.appendChild(finishMessage)
    container.appendChild(createBoards(boardSize))
    container.appendChild(createForm())
    
    body.appendChild(heading)
    body.appendChild(container)

    heading.innerHTML = 'Careship'

    finishMessage.id = 'finish-message'
    finishMessage.style.display = 'none'

    PubSub.subscribe('changedPlayerboard', updatePlayerboard)
    PubSub.subscribe('changedComputerboard', updateComputerboard)
    PubSub.subscribe('gameFinished', renderFinishDisplay)
  }

  const updatePlayerboard = (msg, boardDetails) => {
    // Hier kommt ein 2D-Array rein mit undefined/object/true/false
    // Erstmal mit "o" "t" "f" rendern - später besser rendern
    for (let i = 0; i < boardDetails.length; i++) {
      for (let j = 0; j < boardDetails.length; j++) {
        const field = board1.querySelector(`[data-coords='${i}${j}']`)
        if (typeof boardDetails[i][j] === 'object') {
          field.innerHTML = 'ship'
        }
        if (boardDetails[i][j] === false) {
          field.innerHTML = 'no!'
        }
        if (boardDetails[i][j] === true) {
          field.innerHTML = 'yes!'
        }
      }
    }
  }

  const updateComputerboard = (msg, boardDetails) => {
    // Hier kommt ein 2D-Array rein mit undefined/object/true/false
    // Erstmal mit "o" "t" "f" rendern - später besser rendern
    for (let i = 0; i < boardDetails.length; i++) {
      for (let j = 0; j < boardDetails.length; j++) {
        const field = board2.querySelector(`[data-coords='${i}${j}']`)
        if (boardDetails[i][j] === false) {
          field.innerHTML = 'no!'
        }
        if (boardDetails[i][j] === true) {
          field.innerHTML = 'yes'
        }
      }
    }
  }

  const removeFieldListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.removeEventListener('click', publishCoords)
    })
  }

  const renderFinishDisplay = (msg, name) => {
    finishMessage.innerHTML = `${name} has supplied all ships!`
    finishMessage.style.display = 'block'
    removeFieldListeners(board2)
    nameInput.value = ''
    form.style.display = 'block'
  }

  return { init }
})()
