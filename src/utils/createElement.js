import rough from "roughjs"
import { toolTypes } from "../constants"

const generator = rough.generator();

const generateRectangle = ({ x1, y1, x2, y2 }) => generator.rectangle(x1, y1, x2 - x1, y2 - y1);

const generateLine = ({ x1, y1, x2, y2 }) => generator.line(x1, y1, x2, y2);



export const createElement = ({ x1, y1, x2, y2, toolType, id,text }) => {
  let roughElement;
  switch (toolType) {
    case toolTypes.RECTANGLE:
      roughElement = generateRectangle({ x1, y1, x2, y2 })
      return {
        id: id,
        roughElement,
        type: toolType,
        x1, y1, x2, y2,
      }
    case toolTypes.LINE:
      roughElement = generateLine({ x1, y1, x2, y2 })
      return {
        id: id,
        roughElement,
        type: toolType,
        x1, y1, x2, y2,
      }
    case toolTypes.PENSIL:
      return{
        id:id,
        type:toolType,
        points:[{x:x1,y:y1}],
      }
    case toolTypes.TEXT:
      return{
        id,
        type:toolType,
        x1,
        y1,
        x2,
        y2,
        text:text || ""
      }
    default:
      throw new Error("something went wrong while creating element")
  }
}