# Learning Goals

Use TDD

Use Publisher Subscriber Pattern

Use HTML5 native Drag and Drop API

# Insights

Dragimage can't be changed while dragging the element. 
If you want to change (e.g. rotating it during dragging) you need to clone the original element. 
Then you let this clone follow the mouse and change it as needed.

Firefox returns value `0` for pageX and pageY during drag event. 
You can use dragover event instead, then also Firefox returns useful values for pageX and pageY.

# Todos

Implement mobile Drag and Drop function.

If you hover with mouse over draggable element, change mouse cursor.

Implement logic so that computer chooses different fields for its ships than player does.


