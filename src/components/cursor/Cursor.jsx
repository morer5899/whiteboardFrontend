import React from "react";
import { useSelector } from "react-redux";
import { MousePointer2 } from "lucide-react"; 

const Cursor = () => {
  const cursors = useSelector((state) => state.cursor.cursors);

  return (
    <>
      {cursors.map((c) => (
        <MousePointer2
          key={c.userId}
          className="cursor-icon"
          style={{
            position: "fixed", // Changed from absolute to fixed
            left: c.x,
            top: c.y,
            width: "24px",
            height: "24px",
            color: c.color || "#000", 
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1000, 
          }}
        />
      ))}
    </>
  );
};

export default Cursor;