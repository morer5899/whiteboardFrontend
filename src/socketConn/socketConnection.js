import {io} from "socket.io-client"
let socket;
import {store} from "../redux/store"
import { setElements, updateElements } from "../redux/whiteboardReducer";
import { updateCursorPosition } from "../redux/cursorSlice";
export const connectionWithSocketServer=()=>{
  socket=io("http://localhost:8080")
  socket.on("connect",()=>{
    console.log("connected to socket io server")
  })
  
  socket.on("whiteboard-state",elements=>{
    store.dispatch(setElements(elements))
  })

  socket.on("element-update",(elementData)=>{
    store.dispatch(updateElements(elementData))
  })

  socket.on("whiteboard-clear",()=>{
    store.dispatch(setElements([]))
  })

  socket.on("cursor-position",(cursorData)=>{
    store.dispatch(updateCursorPosition(cursorData))
  })
}

export const emitElementUpdate=(elementData)=>{
  socket.emit("element-update",elementData)
}

export const emitClearWhiteBoard=()=>{
  socket.emit("whiteboard-clear");
}

export const emitCursorPosition=(cursorData)=>{
  socket.emit("cursor-position",cursorData);
}