/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/pubsub-js/src/pubsub.js":
/*!**********************************************!*\
  !*** ./node_modules/pubsub-js/src/pubsub.js ***!
  \**********************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/mroderick/PubSubJS
 */

(function (root, factory){
    'use strict';

    var PubSub = {};
    root.PubSub = PubSub;
    factory(PubSub);
    // CommonJS and Node.js module support
    if (true){
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
        module.exports = exports = PubSub; // CommonJS
    }
    // AMD support
    /* eslint-disable no-undef */
    else {}

}(( typeof window === 'object' && window ) || this, function (PubSub){
    'use strict';

    var messages = {},
        lastUid = -1,
        ALL_SUBSCRIBING_MSG = '*';

    function hasKeys(obj){
        var key;

        for (key in obj){
            if ( Object.prototype.hasOwnProperty.call(obj, key) ){
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a function that throws the passed exception, for use as argument for setTimeout
     * @alias throwException
     * @function
     * @param { Object } ex An Error object
     */
    function throwException( ex ){
        return function reThrowException(){
            throw ex;
        };
    }

    function callSubscriberWithDelayedExceptions( subscriber, message, data ){
        try {
            subscriber( message, data );
        } catch( ex ){
            setTimeout( throwException( ex ), 0);
        }
    }

    function callSubscriberWithImmediateExceptions( subscriber, message, data ){
        subscriber( message, data );
    }

    function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
        var subscribers = messages[matchedMessage],
            callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
            s;

        if ( !Object.prototype.hasOwnProperty.call( messages, matchedMessage ) ) {
            return;
        }

        for (s in subscribers){
            if ( Object.prototype.hasOwnProperty.call(subscribers, s)){
                callSubscriber( subscribers[s], originalMessage, data );
            }
        }
    }

    function createDeliveryFunction( message, data, immediateExceptions ){
        return function deliverNamespaced(){
            var topic = String( message ),
                position = topic.lastIndexOf( '.' );

            // deliver the message as it is now
            deliverMessage(message, message, data, immediateExceptions);

            // trim the hierarchy and deliver message to each level
            while( position !== -1 ){
                topic = topic.substr( 0, position );
                position = topic.lastIndexOf('.');
                deliverMessage( message, topic, data, immediateExceptions );
            }

            deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
        };
    }

    function hasDirectSubscribersFor( message ) {
        var topic = String( message ),
            found = Boolean(Object.prototype.hasOwnProperty.call( messages, topic ) && hasKeys(messages[topic]));

        return found;
    }

    function messageHasSubscribers( message ){
        var topic = String( message ),
            found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
            position = topic.lastIndexOf( '.' );

        while ( !found && position !== -1 ){
            topic = topic.substr( 0, position );
            position = topic.lastIndexOf( '.' );
            found = hasDirectSubscribersFor(topic);
        }

        return found;
    }

    function publish( message, data, sync, immediateExceptions ){
        message = (typeof message === 'symbol') ? message.toString() : message;

        var deliver = createDeliveryFunction( message, data, immediateExceptions ),
            hasSubscribers = messageHasSubscribers( message );

        if ( !hasSubscribers ){
            return false;
        }

        if ( sync === true ){
            deliver();
        } else {
            setTimeout( deliver, 0 );
        }
        return true;
    }

    /**
     * Publishes the message, passing the data to it's subscribers
     * @function
     * @alias publish
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publish = function( message, data ){
        return publish( message, data, false, PubSub.immediateExceptions );
    };

    /**
     * Publishes the message synchronously, passing the data to it's subscribers
     * @function
     * @alias publishSync
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publishSync = function( message, data ){
        return publish( message, data, true, PubSub.immediateExceptions );
    };

    /**
     * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
     * @function
     * @alias subscribe
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { String }
     */
    PubSub.subscribe = function( message, func ){
        if ( typeof func !== 'function'){
            return false;
        }

        message = (typeof message === 'symbol') ? message.toString() : message;

        // message is not registered yet
        if ( !Object.prototype.hasOwnProperty.call( messages, message ) ){
            messages[message] = {};
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = 'uid_' + String(++lastUid);
        messages[message][token] = func;

        // return token for unsubscribing
        return token;
    };

    PubSub.subscribeAll = function( func ){
        return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
    };

    /**
     * Subscribes the passed function to the passed message once
     * @function
     * @alias subscribeOnce
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { PubSub }
     */
    PubSub.subscribeOnce = function( message, func ){
        var token = PubSub.subscribe( message, function(){
            // before func apply, unsubscribe message
            PubSub.unsubscribe( token );
            func.apply( this, arguments );
        });
        return PubSub;
    };

    /**
     * Clears all subscriptions
     * @function
     * @public
     * @alias clearAllSubscriptions
     */
    PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
        messages = {};
    };

    /**
     * Clear subscriptions by the topic
     * @function
     * @public
     * @alias clearAllSubscriptions
     * @return { int }
     */
    PubSub.clearSubscriptions = function clearSubscriptions(topic){
        var m;
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                delete messages[m];
            }
        }
    };

    /**
       Count subscriptions by the topic
     * @function
     * @public
     * @alias countSubscriptions
     * @return { Array }
    */
    PubSub.countSubscriptions = function countSubscriptions(topic){
        var m;
        // eslint-disable-next-line no-unused-vars
        var token;
        var count = 0;
        for (m in messages) {
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0) {
                for (token in messages[m]) {
                    count++;
                }
                break;
            }
        }
        return count;
    };


    /**
       Gets subscriptions by the topic
     * @function
     * @public
     * @alias getSubscriptions
    */
    PubSub.getSubscriptions = function getSubscriptions(topic){
        var m;
        var list = [];
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                list.push(m);
            }
        }
        return list;
    };

    /**
     * Removes subscriptions
     *
     * - When passed a token, removes a specific subscription.
     *
	 * - When passed a function, removes all subscriptions for that function
     *
	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
     * @function
     * @public
     * @alias subscribeOnce
     * @param { String | Function } value A token, function or topic to unsubscribe from
     * @example // Unsubscribing with a token
     * var token = PubSub.subscribe('mytopic', myFunc);
     * PubSub.unsubscribe(token);
     * @example // Unsubscribing with a function
     * PubSub.unsubscribe(myFunc);
     * @example // Unsubscribing from a topic
     * PubSub.unsubscribe('mytopic');
     */
    PubSub.unsubscribe = function(value){
        var descendantTopicExists = function(topic) {
                var m;
                for ( m in messages ){
                    if ( Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0 ){
                        // a descendant of the topic exists:
                        return true;
                    }
                }

                return false;
            },
            isTopic    = typeof value === 'string' && ( Object.prototype.hasOwnProperty.call(messages, value) || descendantTopicExists(value) ),
            isToken    = !isTopic && typeof value === 'string',
            isFunction = typeof value === 'function',
            result = false,
            m, message, t;

        if (isTopic){
            PubSub.clearSubscriptions(value);
            return;
        }

        for ( m in messages ){
            if ( Object.prototype.hasOwnProperty.call( messages, m ) ){
                message = messages[m];

                if ( isToken && message[value] ){
                    delete message[value];
                    result = value;
                    // tokens are unique, so we can just stop here
                    break;
                }

                if (isFunction) {
                    for ( t in message ){
                        if (Object.prototype.hasOwnProperty.call(message, t) && message[t] === value){
                            delete message[t];
                            result = true;
                        }
                    }
                }
            }
        }

        return result;
    };
}));


/***/ }),

/***/ "./node_modules/uniqid/index.js":
/*!**************************************!*\
  !*** ./node_modules/uniqid/index.js ***!
  \**************************************/
/***/ ((module) => {

/* 
(The MIT License)
Copyright (c) 2014-2021 Halász Ádám <adam@aimform.com>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//  Unique Hexatridecimal ID Generator
// ================================================

//  Dependencies
// ================================================
var pid = typeof process !== 'undefined' && process.pid ? process.pid.toString(36) : '' ;
var address = '';
if(false){ var i, mac, networkInterfaces; } 

//  Exports
// ================================================
module.exports = module.exports.default = function(prefix, suffix){ return (prefix ? prefix : '') + address + pid + now().toString(36) + (suffix ? suffix : ''); }
module.exports.process = function(prefix, suffix){ return (prefix ? prefix : '') + pid + now().toString(36) + (suffix ? suffix : ''); }
module.exports.time    = function(prefix, suffix){ return (prefix ? prefix : '') + now().toString(36) + (suffix ? suffix : ''); }

//  Helpers
// ================================================
function now(){
    var time = Date.now();
    var last = now.last || time;
    return now.last = time > last ? time : last + 1;
}


/***/ }),

/***/ "./src/gameLogic.js":
/*!**************************!*\
  !*** ./src/gameLogic.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shipFactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shipFactory */ "./src/shipFactory.js");
/* harmony import */ var _gameboardFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gameboardFactory */ "./src/gameboardFactory.js");
/* harmony import */ var _playerFactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./playerFactory */ "./src/playerFactory.js");





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((() => {
  let playerBoard = null
  let computerBoard = null
  let player = null
  let computer = null

  const startNewGame = (msg, playerName) => {
    playerBoard = (0,_gameboardFactory__WEBPACK_IMPORTED_MODULE_2__.default)(10, _shipFactory__WEBPACK_IMPORTED_MODULE_1__.default)
    computerBoard = (0,_gameboardFactory__WEBPACK_IMPORTED_MODULE_2__.default)(10, _shipFactory__WEBPACK_IMPORTED_MODULE_1__.default)

    player = (0,_playerFactory__WEBPACK_IMPORTED_MODULE_3__.default)(computerBoard, playerName)
    computer = (0,_playerFactory__WEBPACK_IMPORTED_MODULE_3__.default)(playerBoard)

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

    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('changedPlayerboard', playerBoard.getBoardStatus())
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('changedComputerboard', computerBoard.getBoardStatus())
  }

  const evaluateField = (msg, coords) => {
    player.chooseField(coords)
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('changedComputerboard', computerBoard.getBoardStatus())
    if (computerBoard.areAllSupplied()) {
      pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('gameFinished', player.getName())
    }

    computer.chooseField()
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('changedPlayerboard', playerBoard.getBoardStatus())
    if (playerBoard.areAllSupplied()) {
      pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('gameFinished', computer.getName())
    }
  }

  const init = () => {
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe('startClicked', startNewGame)
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe('fieldClicked', evaluateField)
  }

  return { init }
})());


/***/ }),

/***/ "./src/gameView.js":
/*!*************************!*\
  !*** ./src/gameView.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var uniqid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uniqid */ "./node_modules/uniqid/index.js");
/* harmony import */ var uniqid__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(uniqid__WEBPACK_IMPORTED_MODULE_1__);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((function () {
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
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('fieldClicked', coordsArray)
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

    const fields = getFields(ev.target)
    fields.forEach((field) => {
      field.classList.add('placed')

      const coords = parseInt(field.dataset.coords)
      blockFieldsAround(coords)

      // Remove Listeners so that here no Element can be dropped anymore
      field.removeEventListener('dragover', highlightFields)
      field.removeEventListener('drop', placeShip)
    })

    // Remove original element and draggedElementCopy
    const data = ev.dataTransfer.getData('text')
    document.getElementById(data).remove()
    draggedShipCopy.remove()

    if (!dragContainer.hasChildNodes()) {
      form.style.display = 'flex'
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
      dragShip.id = uniqid__WEBPACK_IMPORTED_MODULE_1___default()()
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
      pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish('startClicked', nameInput.value)
      form.style.display = 'none'
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

    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe('changedPlayerboard', updatePlayerboard)
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe('changedComputerboard', updateComputerboard)
    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe('gameFinished', renderFinishDisplay)
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
})());


/***/ }),

/***/ "./src/gameboardFactory.js":
/*!*********************************!*\
  !*** ./src/gameboardFactory.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ gameBoardFactory)
/* harmony export */ });
function gameBoardFactory(size, shipFactory) {
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


/***/ }),

/***/ "./src/playerFactory.js":
/*!******************************!*\
  !*** ./src/playerFactory.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ playerFactory)
/* harmony export */ });
function playerFactory(gameBoard, name = 'Computer') {
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


/***/ }),

/***/ "./src/shipFactory.js":
/*!****************************!*\
  !*** ./src/shipFactory.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ shipFactory)
/* harmony export */ });
function shipFactory(len) {
  const suppliedSections = new Array(len).fill(false)

  // Update supply status of a ship
  const sendGift = () => {
    suppliedSections.push(true)
    suppliedSections.shift()
  }

  // If whole ship is supllied with gifts return true
  const isSupplied = () => {
    return suppliedSections.every((el) => el === true)
  }

  return { sendGift, isSupplied }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _gameLogic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameLogic */ "./src/gameLogic.js");
/* harmony import */ var _gameView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameView */ "./src/gameView.js");



_gameView__WEBPACK_IMPORTED_MODULE_1__.default.init(10)
_gameLogic__WEBPACK_IMPORTED_MODULE_0__.default.init()

// Next Steps:

/*
   So wie es jetzt ist könnte ich mal Commit machen
   
   Boards verhauts gerade ziemlich noch wenn ich rauszoome

   Was gerade Problem: auch bei Klick auf bereits vorhandenes Feld macht
   Computer einen Zug. Wenn auf bereits gecklicktes Feld von Player geklicked wird
   sollte eig. nichts passieren oder?

   Wie der Code in gameView strukturiert ist gefällt mir teilweise gar nicht:
   z.B. paar Dom-Element ganz oben erstellt, paar Dom-Elemente in init usw...
   Vielleicht Alle ganz oben? Und in init nur Funktionen aufrufen?
   */

})();

/******/ })()
;
//# sourceMappingURL=main.js.map