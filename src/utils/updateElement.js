import { toolTypes } from "../constants";
import { createElement } from "./createElement";
import { store } from "../redux/store";
import { setElements } from "../redux/whiteboardReducer";
import { emitElementUpdate } from "../socketConn/socketConnection";
export const updatePencilElement = ({
  index,
  newPoints
}, elements) => {
let elementsCopy=[...elements];
elementsCopy[index]={
  ...elementsCopy[index],
  points:newPoints,
}
const updatedPensilElement=elementsCopy[index];
store.dispatch(setElements(elementsCopy))
emitElementUpdate(updatedPensilElement);

}

export const updateElement = ({ id, x1, x2, y1, y2, type, index, text }, elements) => {
  const elementsCopy = [...elements];
  switch (type) {
    case toolTypes.LINE:
    case toolTypes.RECTANGLE:
      const updateElement = createElement({ id, x1, x2, y1, y2, toolType: type })
      elementsCopy[index] = updateElement;
      store.dispatch(setElements(elementsCopy))
      emitElementUpdate(updateElement)
      break;
    case toolTypes.PENSIL:
      elementsCopy[index] = {
        ...elementsCopy[index],
        points: [
          ...elementsCopy[index].points,
          {
            x: x2,
            y: y2
          }
        ]
      }
      const updatedPensilElement = elementsCopy[index]
      store.dispatch(setElements(elementsCopy))
      emitElementUpdate(updatedPensilElement)
      break;
    case toolTypes.TEXT:
      const textWidth = document.getElementById("canvas").getContext("2d").measureText(text).width;
      const textHeight = 24;
      elementsCopy[index] = {
        ...createElement(
          {
            id,
            x1,
            y1,
            x2: x1 + textWidth,
            y2: y1 + textHeight,
            toolType: type,
            text
          }
        )
      }
      const updatedTextElement = elementsCopy[index];
      store.dispatch(setElements(elementsCopy))
      emitElementUpdate(updatedTextElement)
      break;
    default:
      throw new Error("Something went wrong while updating the element")
  }
}