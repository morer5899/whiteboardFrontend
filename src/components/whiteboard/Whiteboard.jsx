import React, { useRef, useLayoutEffect, useState } from "react";
import Menu from "./Menu";
import rough from "roughjs";
import { useSelector, useDispatch } from "react-redux";
import { actions, cursorPositions, toolTypes } from "../../constants";
import {
  adjustElementCoOrdinates,
  adjustmentIsRequired,
  createElement,
  getCursorForPosition,
  getElementAtPosition,
  getResizedCoordinates,
} from "../../utils";
import { v4 as uuid } from "uuid";
import { updateElements as updateElementInStore } from "../../redux/whiteboardReducer";
import { updateElement, drawElement } from "../../utils";
import { updatePencilElement } from "../../utils/updateElement";
import { emitCursorPosition } from "../../socketConn/socketConnection";

let emitCursor = true;
let lastCursorPosition;

const Whiteboard = () => {
  const textAreaRef = useRef();
  const canvasRef = useRef();
  const dispatch = useDispatch();
  const [selectedElement, setSelectedElement] = useState(null);
  const elements = useSelector((state) => state.whiteboard.elements);
  const [action, setAction] = useState(null);
  const toolType = useSelector((state) => state.whiteboard.tool);
  
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      drawElement({ roughCanvas, context: ctx, element });
    });
  }, [elements]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;

    if (selectedElement && action === actions.WRITING) {
      return;
    }

    switch (toolType) {
      case toolTypes.RECTANGLE:
      case toolTypes.LINE:
      case toolTypes.PENSIL:
        {
          const element = createElement({
            x1: clientX,
            y1: clientY,
            x2: clientX,
            y2: clientY,
            toolType,
            id: uuid(),
          });
          setAction(actions.DRAWING);
          setSelectedElement(element);
          dispatch(updateElementInStore(element));
        }
        break;
      case toolTypes.TEXT:
        {
          const element = createElement({
            x1: clientX,
            y1: clientY,
            x2: clientX,
            y2: clientY,
            toolType,
            id: uuid(),
          });
          setAction(actions.WRITING);
          setSelectedElement(element);
          dispatch(updateElementInStore(element));
        }
        break;
      case toolTypes.SELECTION:
        {
          const element = getElementAtPosition(clientX, clientY, elements);
          if (
            element &&
            (element.type === toolTypes.RECTANGLE ||
              element.type === toolTypes.TEXT ||
              element.type === toolTypes.LINE)
          ) {
            setAction(
              element.position === cursorPositions.INSIDE
                ? actions.MOVING
                : actions.RESIZING
            );
            const offsetX = clientX - element.x1;
            const offsetY = clientY - element.y1;
            setSelectedElement({ ...element, offsetX, offsetY });
          } else if (element && element.type === toolTypes.PENSIL) {
            setAction(actions.MOVING);
            const xOffsets = element.points.map((point) => clientX - point.x);
            const yOffsets = element.points.map((point) => clientY - point.y); 

            setSelectedElement({ ...element, xOffsets, yOffsets });
          }
        }
        break;
    }
  };

  const handleMouseUp = () => {
    const selectedElementIndex = elements.findIndex(
      (el) => el.id === selectedElement?.id
    );
    if (selectedElementIndex !== -1) {
      if (action === actions.DRAWING) {
        if (adjustmentIsRequired(elements[selectedElementIndex].type)) {
          const { x1, x2, y1, y2 } = adjustElementCoOrdinates(
            elements[selectedElementIndex]
          );
          updateElement(
            {
              id: selectedElement.id,
              index: selectedElementIndex,
              type: elements[selectedElementIndex].type,
              x1,
              x2,
              y1,
              y2,
            },
            elements
          );
        }
      }
    }
    setAction(null);
    setSelectedElement(null);
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    // Emit cursor position for all mouse movements on the document
    lastCursorPosition = { x: clientX, y: clientY };
    if (emitCursor) {
      emitCursorPosition({ x: clientX, y: clientY });
      emitCursor = false;
      
      setTimeout(() => {
        emitCursor = true;
        emitCursorPosition(lastCursorPosition);
      }, 50);
    }

    if (selectedElement) {
      if (action === actions.DRAWING) {
        const index = elements.findIndex((el) => el.id === selectedElement.id);
        if (index !== -1) {
          updateElement(
            {
              index,
              id: elements[index].id,
              x1: elements[index].x1,
              y1: elements[index].y1,
              x2: clientX,
              y2: clientY,
              type: elements[index].type,
            },
            elements
          );
        }
      }
    }

    if (toolType === toolTypes.SELECTION) {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        event.target.style.cursor = getCursorForPosition(element.position);
      } else {
        event.target.style.cursor = "default";
      }
    }

    if (toolType === toolTypes.SELECTION && action === actions.MOVING && selectedElement && selectedElement.type === toolTypes.PENSIL) {
      const newPoints = selectedElement.points.map((_, index) => ({
        x: clientX - selectedElement.xOffsets[index],
        y: clientY - selectedElement.yOffsets[index], 
      }));
      
      const index = elements.findIndex(el => el.id === selectedElement.id);
      if (index !== -1) {
        updatePencilElement({
          index,
          newPoints
        }, elements);
      }
      return;
    } else if (
      toolType === toolTypes.SELECTION &&
      action === actions.MOVING &&
      selectedElement
    ) {
      const { id, x1, x2, y1, y2, offsetX, offsetY, type, text } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;

      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        updateElement(
          {
            id,
            index,
            x1: newX1,
            y1: newY1,
            x2: newX1 + width,
            y2: newY1 + height,
            type,
            text,
          },
          elements
        );
      }
    } else if (
      action === actions.RESIZING &&
      selectedElement &&
      toolType === toolTypes.SELECTION
    ) {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = getResizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );

      const selectedElementIndex = elements.findIndex(
        (el) => el.id === selectedElement.id
      );
      if (selectedElementIndex !== -1) {
        updateElement(
          {
            x1,
            x2,
            y1,
            y2,
            type: selectedElement.type,
            id: selectedElement.id,
            index: selectedElementIndex,
          },
          elements
        );
      }
    }
  };

  // Add global mouse move listener for cursor tracking
  React.useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      const { clientX, clientY } = event;
      
      // Emit cursor position for all mouse movements
      lastCursorPosition = { x: clientX, y: clientY };
      if (emitCursor) {
        emitCursorPosition({ x: clientX, y: clientY });
        emitCursor = false;
        
        setTimeout(() => {
          emitCursor = true;
          emitCursorPosition(lastCursorPosition);
        }, 50);
      }
    };

    // Add event listener to document to capture mouse movements everywhere
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  const handleTextareaBlur = (event) => {
    const { id, x1, y1, type } = selectedElement;
    const index = elements.findIndex((el) => el.id === selectedElement.id);

    if (index !== -1) {
      updateElement(
        {
          x1,
          y1,
          type,
          text: event.target.value,
          index,
          id: selectedElement.id,
        },
        elements
      );
    }
    setAction(null);
    setSelectedElement(null);
  };

  return (
    <>
      <Menu />
      {action === actions.WRITING && (
        <textarea
          ref={textAreaRef}
          onBlur={handleTextareaBlur}
          style={{
            position: "absolute",
            top: selectedElement.y1 - 3,
            left: selectedElement.x1,
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            outline: 0,
            border: 0,
            resize: "auto",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            zIndex: 10,
          }}
        />
      )}
      <canvas
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
    </>
  );
};

export default Whiteboard;