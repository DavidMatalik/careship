import PubSub from 'pubsub-js'
import uniqid from 'uniqid'

export default (function () {
  const body = document.querySelector('body')

  const heading = document.createElement('h1')
  const introduction = document.createElement('section')
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
  const finishContainer = document.createElement('div')
  const finishMessage = document.createElement('p')
  const playAgainButton = document.createElement('button')
  const infoMobile = document.createElement('div')

  let infoRotation = document.createElement('div')
  let draggedShipSections = null
  let draggedShipCopy = null
  let shipVerticalPosition = false
  let shipsPlacedArray = []

  const toggle = (element) => {
    if (element.classList.contains('display-none')) {
      element.classList.remove('display-none')
    } else {
      element.classList.add('display-none')
    }
  }

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

  const removeDragDropListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.removeEventListener('dragleave', whitenFields)
      field.removeEventListener('dragover', highlightFields)
      field.removeEventListener('drop', placeShip)
    })
  }

  const addClickListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.addEventListener('click', publishCoords)
    })
  }

  const publishCoords = (event) => {
    console.log(event.target)
    // If clicked on already clicked field
    if (
      !event.target.classList.contains('field') ||
      event.target.hasChildNodes()
    ) {
      return
    }

    const coords = event.target.dataset.coords
    const coordsArray = [parseInt(coords[0]), parseInt(coords[1])]
    PubSub.publish('fieldClicked', coordsArray)
  }

  const makeShipDraggable = (ship) => {
    ship.draggable = 'true'
    ship.ondragstart = (ev) => {
      if(infoRotation){
        infoRotation.id = 'info-rotation'
        infoRotation.innerHTML = `Press and hold ctrl for vertical placing`
        document.body.appendChild(infoRotation)
      }

      var img = new Image()
      img.src = 'transparent.png'
      ev.dataTransfer.setDragImage(img, 0, 0)
      ev.dataTransfer.setData('text', ev.target.id)
      draggedShipSections = parseInt(ev.target.dataset.sections)

      draggedShipCopy = ship.cloneNode(true)
      draggedShipCopy.classList.add('dragged-ship-position')

      document.addEventListener('dragover', (ev) => {
        draggedShipCopy.style.top = ev.pageY + 10 + 'px'
        draggedShipCopy.style.left = ev.pageX + 'px'

        document.body.append(draggedShipCopy)

        if (infoRotation){
          infoRotation.style.top = ev.pageY + 10 + 'px'
          infoRotation.style.left = ev.pageX - infoRotation.offsetWidth / 2 + 'px'

          setTimeout(() => {
            if (infoRotation){
              infoRotation.remove()
            }
            infoRotation = null
          }, 2500)
        }
      })

      document.addEventListener('mousemove', (ev) => {
        if (infoRotation){
          infoRotation.style.top = ev.pageY + 10 + 'px'
          infoRotation.style.left = ev.pageX - infoRotation.offsetWidth / 2 + 'px'
        }
      })

      document.addEventListener('dragend', () => {
        draggedShipCopy.remove()
      })
    }

    // If ctrl key is pressed and hold
    // then display draggedElementCopy elementVerticalPosition
    ship.ondrag = (ev) => {
      if (ev.ctrlKey) {
        draggedShipCopy.classList.add('dragged-ship-vertical')
        if (shipVerticalPosition === false) {
          shipVerticalPosition = true
          // Without whitenAllFields for some time elementVerticalPosition
          // highlights are displayed and horizontal
          whitenAllFields()
        }
      } else {
        draggedShipCopy.classList.remove('dragged-ship-vertical')
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

    // If all ships are dragged and dropped
    if (!dragContainer.hasChildNodes()) {
      toggle(form)
      PubSub.publish('shipsPlaced', shipsPlacedArray)
      removeDragDropListeners(board1)
      toggle(dragContainer)
      toggle(introduction)
    }
  }

  // Block all fields around one specified field
  function blockFieldsAround(coordsEl) {
    let blockedCoords = []

    /* For avoiding blocks on the opposite side
  the modulo tests are implemented */

    // Block fields on bottom side
    if (coordsEl % 10 !== 0) {
      blockedCoords.push(`${coordsEl + 9}`)
    }
    blockedCoords.push(`${coordsEl + 10}`)
    if (coordsEl % 10 !== 9) {
      blockedCoords.push(`${coordsEl + 11}`)
    }

    // Block fields on top side
    if (coordsEl % 10 !== 9) {
      blockedCoords.push(`${coordsEl - 9}`)
    }
    blockedCoords.push(`${coordsEl - 10}`)
    if (coordsEl % 10 !== 0) {
      blockedCoords.push(`${coordsEl - 11}`)
    }

    // Block fields on left and right side
    if ((coordsEl % 10 !== 0) & (coordsEl % 10 !== 9)) {
      blockedCoords.push(`${coordsEl - 1}`)
      blockedCoords.push(`${coordsEl + 1}`)
    }

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
    playerName.innerHTML = 'Your Board'
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
      field.classList.remove('highlight', 'blocked', 'placed')
    })
  }

  const startGame = (event) => {
    // If input makes sense the if below is executed
    if (form.checkValidity()) {
      // preventDefault() prevents page from relaoding
      event.preventDefault()
      PubSub.publish('startClicked', nameInput.value)
      toggle(form)
      toggle(board2Container)
      playerName.innerHTML = `${nameInput.value}'s board`
      computerName.innerHTML = `Computer's board`
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

    toggle(form)
    form.addEventListener('submit', startGame)
    return form
  }

  const createMobileMessage = () => {
    infoMobile.id = 'info-mobile'
    infoMobile.innerHTML = 'Sorry... Game only works on Desktop'

    document.addEventListener('touchstart', (ev) => {
      toggle(infoMobile)
      infoMobile.style.top = ev.changedTouches[0].pageY + 10 + 'px'

      setTimeout(() => {
        infoMobile.remove()
      }, 2500)
    })
    
    return infoMobile
  }

  const renderPlacingShips = () => {
    // reset necessary stuff
    resetBoard(board1)
    addDragDropListeners(board1)
    resetBoard(board2)
    playerName.innerHTML = 'Your Board'
    shipsPlacedArray = []

    // Hide and show necessary stuff
    toggle(dragContainer)
    container.insertBefore(createDragZone(), container.firstChild)
    toggle(board2Container)
    toggle(finishContainer)
  }

  const init = (boardSize) => {
    container.id = 'container'

    container.appendChild(createDragZone())
    container.appendChild(createBoards(boardSize))
    container.appendChild(createForm())
    container.appendChild(finishContainer)

    body.appendChild(heading)
    body.appendChild(introduction)
    body.appendChild(container)
    body.appendChild(createMobileMessage())

    finishContainer.appendChild(finishMessage)
    finishContainer.appendChild(playAgainButton)

    addDragDropListeners(board1)

    heading.innerHTML = 'Careship'

    introduction.innerHTML = 'This game is about supplying ships of your friend with gifts. Then your friend for sure feels better. Start by placing your ships.'

    toggle(board2Container)

    finishContainer.id = 'finish-container'
    finishMessage.id = 'finish-message'
    toggle(finishContainer)

    playAgainButton.addEventListener('click', renderPlacingShips)
    playAgainButton.innerHTML = 'Play Again!'

    PubSub.subscribe('changedPlayerboard', updatePlayerboard)
    PubSub.subscribe('changedComputerboard', updateComputerboard)
    PubSub.subscribe('gameFinished', renderFinishDisplay)
  }

  const updatePlayerboard = (msg, boardDetails) => {
    // Hier kommt ein 2D-Array rein mit undefined/object/true/false
    for (let i = 0; i < boardDetails.length; i++) {
      for (let j = 0; j < boardDetails.length; j++) {
        const field = board1.querySelector(`[data-coords='${i}${j}']`)
        if (!field.hasChildNodes()) {
          if (boardDetails[i][j] === false) {
            addIcon(field, 'fa-fish', 'fish-color')
          }
          if (boardDetails[i][j] === true) {
            addIcon(field, 'fa-hand-holding-heart', 'hand-holding-heart-color')
          }
        }
      }
    }
  }

  const updateComputerboard = (msg, boardDetails) => {
    // Hier kommt ein 2D-Array rein mit undefined/object/true/false
    for (let i = 0; i < boardDetails.length; i++) {
      for (let j = 0; j < boardDetails.length; j++) {
        const field = board2.querySelector(`[data-coords='${i}${j}']`)

        if (boardDetails[i][j] === 'shipSupplied') {
          field.innerHTML = ''
          field.classList.add('placed')
          addIcon(field, 'fa-hand-holding-heart', 'hand-holding-heart-color')
        }

        if (!field.hasChildNodes()) {
          if (boardDetails[i][j] === false) {
            addIcon(field, 'fa-fish', 'fish-color')
          }
          if (boardDetails[i][j] === true) {
            addIcon(field, 'fa-hand-holding-heart', 'hand-holding-heart-color')
          }
        }
      }
    }
  }

  const addIcon = (element, iconClass, iconColor) => {
    const icon = document.createElement('i')
    icon.classList.add('fas', `${iconClass}`, 'fa-2x')
    element.appendChild(icon)
    element.classList.add(`${iconColor}`)
  }

  const removeFieldListeners = (board) => {
    const fields = Array.from(board.children)
    fields.forEach((field) => {
      field.removeEventListener('click', publishCoords)
    })
  }

  const renderFinishDisplay = (msg, name) => {
    finishMessage.innerHTML = `${name} has supplied all ships!`
    toggle(finishContainer)
    removeFieldListeners(board2)
    nameInput.value = ''
  }

  return { init }
})()
