import { toolTypes } from "../constants";

 export const adjustmentIsRequired=(type)=>{
    return [toolTypes.RECTANGLE,toolTypes.LINE].includes(type);
  }