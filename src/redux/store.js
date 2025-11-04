import { configureStore } from '@reduxjs/toolkit';
import whiteboardReducer from "./whiteboardReducer.js"
import cursorReducer from "./cursorSlice.js"
export const store = configureStore({
  reducer: {
    whiteboard: whiteboardReducer,
    cursor:cursorReducer
  },
  middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
    serializableCheck:{
      ignoreActions:["whiteboard/setElements"],
      ignoredPaths:["whiteboard.elements"]
    }
  })
});
