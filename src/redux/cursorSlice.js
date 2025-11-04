import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cursors: []
}

const cursorSlice = createSlice({
  name: "cursor",
  initialState,
  reducers: {
    updateCursorPosition: (state, action) => {
      const { x, y, userId } = action.payload;
      const index = state.cursors.findIndex(c => c.userId === userId);
      if (index !== -1) {
        state.cursors[index] = {
          userId,
          x,
          y
        }
      } else {
        state.cursors.push({
          x, y, userId
        })
      }
    }
  }
})
export const { updateCursorPosition } = cursorSlice.actions;
export default cursorSlice.reducer;