import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tool: null,
  elements:[]
};

const whiteboardSlice = createSlice({
  name: 'whiteBoard',
  initialState,
  reducers: {
    setToolType: (state, action) => {
      state.tool = action.payload;
    },
    updateElements:(state,action)=>{
      const {id}=action.payload;
      const index=state.elements.findIndex(element=>element.id===id);
      if(index===-1){
        state.elements.push(action.payload)
      }else{
        // if index is found update element in our array
        state.elements[index]=action.payload;
      }
    },
    setElements:(state,action)=>{
      state.elements=action.payload;
    }
  },
});

export const { setToolType,updateElements,setElements } = whiteboardSlice.actions;
export default whiteboardSlice.reducer;
