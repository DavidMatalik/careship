export default (function () {
  const createBoardFields = (size, board) => {
    for (let i = 0; i < size * size; i++) {
      const field = document.createElement('div')
      field.classList.add('field')
      board.appendChild(field)
    }
  }

  const createBoards = (boardSize) => {
    const boardsContainer = document.createElement('div')
    const board1 = document.createElement('div')
    const board2 = document.createElement('div')

    boardsContainer.appendChild(board1)
    boardsContainer.appendChild(board2)

    boardsContainer.id = 'board-container'
    board1.id = 'board-1'
    board2.id = 'board-2'

    createBoardFields(boardSize, board1)
    createBoardFields(boardSize, board2)

    return boardsContainer
  }

  const loadStartpage = (boardSize) => {
    const body = document.querySelector('body')
    const heading = document.createElement('h1')
    const form = document.createElement('form')
    const nameLabel = document.createElement('label')
    const nameInput = document.createElement('input')
    const startButton = document.createElement('button')

    body.appendChild(heading)
    body.appendChild(createBoards(boardSize))
    body.appendChild(form)

    form.appendChild(nameLabel)
    form.appendChild(nameInput)
    form.appendChild(startButton)

    heading.innerHTML = 'Careship'

    nameLabel.innerHTML = 'Name: '
    nameInput.placeholder = 'Enter your name'
    startButton.innerHTML = 'Start Game'
  }

  return { loadStartpage }
})()
