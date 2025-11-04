import {
  Square,
  Slash,
  LucideEraser,
  PenIcon,
  Type,
  LucideLassoSelect,
} from "lucide-react";
import { toolTypes } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { setElements, setToolType } from "../../redux/whiteboardReducer";

import { emitClearWhiteBoard } from "../../socketConn/socketConnection";

const IconButton = ({ Icon, type, isRubber }) => {
  const dispatch = useDispatch();
  const selectedToolType = useSelector((state) => state.whiteboard.tool);

  const handleToolChange = () => {
    dispatch(setToolType(type));
  };
  const handleClearCanvas = () => {
    dispatch(setElements([]));
    emitClearWhiteBoard();
  };

  const isActive = selectedToolType === type;

  return (
    <button
      className={`menu_button ${isActive ? "menu_button_active" : ""}`}
      onClick={isRubber ? handleClearCanvas : handleToolChange}
    >
      <Icon className="menu_icon" />
    </button>
  );
};

const Menu = () => {
  return (
    <div className="menu_container">
      <IconButton Icon={Square} type={toolTypes.RECTANGLE} />
      <IconButton Icon={Slash} type={toolTypes.LINE} />
      <IconButton Icon={LucideEraser} isRubber />
      <IconButton Icon={PenIcon} type={toolTypes.PENSIL} />
      <IconButton Icon={Type} type={toolTypes.TEXT} />
      <IconButton Icon={LucideLassoSelect} type={toolTypes.SELECTION} />
    </div>
  );
};

export default Menu;
