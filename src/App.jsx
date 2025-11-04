import React, { useEffect } from 'react'
import Whiteboard from './components/whiteboard/Whiteboard'
import { connectionWithSocketServer } from './socketConn/socketConnection'
import Cursor from './components/cursor/Cursor'
const App = () => {
  useEffect(()=>{
    connectionWithSocketServer()
  },[])
  return (
    <><Whiteboard/>
    <Cursor/>
    </>
  )
}

export default App