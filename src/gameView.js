import PubSub from 'pubsub-js'
import uniqid from 'uniqid'

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

  let draggedShipSections = null
  let draggedShipCopy = null
  let shipVerticalPosition = false
  let shipsPlacedArray = []

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

  // Check if element would wrap (what is unwanted)
  const checkWrap = (targetEl) => {
    const coords = targetEl.dataset.coords
    const coord = shipVerticalPosition
      ? parseInt(coords[0])
      : parseInt(coords[1])

    return parseInt(draggedShipSections) + coord > 10 ? true : false
  }

  // Check if element would be placed on blocked
  // field. (what is unwanted)
  const checkBlocked = (targetEl) => {
    let blocked = false
    const fields = getFields(targetEl)

    fields.forEach((field) => {
      if (field.classList.contains('blocked')) {
        blocked = true
      }
    })
    return blocked
  }

  // Returns all fields depending on number of global var sections
  // and if global var elementVerticalPosition is true or false
  const getFields = (targetEl) => {
    let fields = []
    let coords = parseInt(targetEl.dataset.coords)

    const iterator = shipVerticalPosition ? 10 : 1

    for (let i = draggedShipSections; i > 0; i--) {
      const field = document.querySelector(
        `[data-coords='${coords < 10 ? 0 : ''}${coords}']`
      )

      if (field === null) {
        break
      }

      fields.push(field)
      // Prepare selection of field under current field
      coords += iterator
    }
    return fields
  }

  // Add color to fields  to highlight them
  // where mouse is and fields on right to mouse
  const highlightFields = (ev) => {
    ev.preventDefault()

    if (checkWrap(ev.target) || checkBlocked(ev.target)) {
      return
    }

    const fields = getFields(ev.target)
    fields.forEach((field) => field.classList.add('highlight'))
  }

  // For change from elementVerticalPosition to horizontal or otherway
  function whitenAllFields() {
    const fields = document.querySelectorAll('.field')
    fields.forEach((field) => {
      field.classList.remove('highlight')
    })
  }

  // Remove color from previously highlighted
  // fields when mouse goes somewhere else
  function whitenFields(ev) {
    ev.preventDefault()

    const fields = getFields(ev.target)
    fields.forEach((field) => field.classList.remove('highlight'))
  }

  const addDragDropListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.addEventListener('dragleave', whitenFields)
      field.addEventListener('dragover', highlightFields)
      field.addEventListener('drop', placeShip)
    })
  }

  const addClickListeners = (board) => {
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

  const makeShipDraggable = (ship) => {
    ship.draggable = 'true'
    ship.ondragstart = (ev) => {
      var img = new Image()
      ev.dataTransfer.setDragImage(img, 0, 0)
      ev.dataTransfer.setData('text', ev.target.id)
      ev.dataTransfer.effectAllowed = 'all'
      draggedShipSections = parseInt(ev.target.dataset.sections)

      draggedShipCopy = ship.cloneNode(true)
      draggedShipCopy.style.position = 'absolute'
      draggedShipCopy.style.transformOrigin = 'top left'

      document.body.append(draggedShipCopy)

      document.addEventListener('drag', (ev) => {
        draggedShipCopy.style.top = ev.pageY + 10 + 'px'
        draggedShipCopy.style.left = ev.pageX + 'px'
      })

      document.addEventListener('dragend', () => {
        draggedShipCopy.remove()
      })
    }

    // If ctrl key is pressed and hold
    // then display draggedElementCopy elementVerticalPosition
    ship.ondrag = (ev) => {
      if (ev.ctrlKey) {
        draggedShipCopy.style.transform = 'rotate(90deg)'
        if (shipVerticalPosition === false) {
          shipVerticalPosition = true
          // Without whitenAllFields for some time elementVerticalPosition
          // highlights are displayed and horizontal
          whitenAllFields()
        }
      } else {
        draggedShipCopy.style.transform = ''
        if (shipVerticalPosition === true) {
          shipVerticalPosition = false
          // Without whitenAllFields for some time elementVerticalPosition
          // highlights are displayed and horizontal
          whitenAllFields()
        }
      }
    }
  }

  // Color all appropriate fields after placing on valid spot
  const placeShip = (ev) => {
    ev.preventDefault()
    if (checkWrap(ev.target) || checkBlocked(ev.target)) {
      return
    }

    let shipCoords = []

    const fields = getFields(ev.target)
    fields.forEach((field) => {
      field.classList.add('placed')

      const coords = parseInt(field.dataset.coords)
      blockFieldsAround(coords)

      shipCoords.push(field.dataset.coords)

      // Remove Listeners so that here no Element can be dropped anymore
      field.removeEventListener('dragover', highlightFields)
      field.removeEventListener('drop', placeShip)
    })

    // Remove original element and draggedElementCopy
    const data = ev.dataTransfer.getData('text')
    document.getElementById(data).remove()
    draggedShipCopy.remove()

    // Save coords of currently placed ship
    // for later passing to PubSub
    shipsPlacedArray.push(shipCoords)

    if (!dragContainer.hasChildNodes()) {
      form.style.display = 'flex'
      PubSub.publish('shipsPlaced', shipsPlacedArray)
    }
  }

  // Block all fields around one specified field
  const blockFieldsAround = (coordsEl) => {
    let blockedCoords = []

    // Block fields on bottom side
    blockedCoords.push(`${coordsEl + 9}`)
    blockedCoords.push(`${coordsEl + 10}`)
    blockedCoords.push(`${coordsEl + 11}`)

    // Block fields on top side
    blockedCoords.push(`${coordsEl - 9}`)
    blockedCoords.push(`${coordsEl - 10}`)
    blockedCoords.push(`${coordsEl - 11}`)

    // Block fields on left and right side
    blockedCoords.push(`${coordsEl - 1}`)
    blockedCoords.push(`${coordsEl + 1}`)

    blockedCoords.forEach((coords) => {
      const el = document.querySelector(
        `[data-coords='${coords < 10 ? 0 : ''}${coords}']`
      )
      if (el !== null) {
        el.classList.add('blocked')
      }
    })
  }

  const createDragShips = (name, amount, sections) => {
    for (let i = 0; i < amount; i++) {
      const dragShip = document.createElement('div')
      dragShip.id = uniqid()
      dragShip.dataset.sections = sections
      dragShip.classList.add(`ship-${name}`)
      makeShipDraggable(dragShip)
      dragContainer.appendChild(dragShip)
    }
  }

  const createDragZone = () => {
    dragContainer.id = 'drag-container'

    createDragShips('big', 1, 5)
    createDragShips('large', 2, 4)
    createDragShips('medium', 3, 3)
    createDragShips('small', 2, 2)

    return dragContainer
  }

  const createBoards = (boardSize) => {
    board1Container.classList.add('board-container')
    board2Container.classList.add('board-container')

    board1Container.appendChild(playerName)
    board2Container.appendChild(computerName)

    board1Container.appendChild(board1)
    board2Container.appendChild(board2)

    boardsContainer.appendChild(board1Container)
    boardsContainer.appendChild(board2Container)

    playerName.classList.add('name')
    computerName.classList.add('name')

    boardsContainer.id = 'boards-container'
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
      board2Container.style.display = 'block'
      playerName.innerHTML = `${nameInput.value}'s board`
      computerName.innerHTML = `Computer's board`
      finishMessage.style.display = 'none'
      resetBoard(board1)
      resetBoard(board2)
      addClickListeners(board2)
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

    addDragDropListeners(board1)

    heading.innerHTML = 'Careship'

    board2Container.style.display = 'none'

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
    form.style.display = 'flex'
  }

  return { init }
})()
