import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const PuzzlePiece = ({
  piece,
  isSelected,
  onDragMove,
  onDragEnd,
  onClick,
  draggable = true,
}) => {
  const [image] = useImage(piece.dataUrl);

  return (
    <Image
      image={image}
      x={piece.currentX + piece.minX}
      y={piece.currentY + piece.minY}
      width={piece.canvasW}
      height={piece.canvasH}
      draggable={draggable}
      shadowColor="#000000"
      shadowBlur={isSelected ? 10 : 3}
      shadowOffset={isSelected ? { x: 4, y: 4 } : { x: 1, y: 1 }}
      shadowOpacity={0.5}
      onClick={onClick}
      onTap={onClick} // Support mobile tap events
      onDragMove={(e) => {
        const node = e.target;
        const nominalX = node.x() - piece.minX;
        const nominalY = node.y() - piece.minY;
        onDragMove(nominalX, nominalY);
      }}
      onDragEnd={() => {
        onDragEnd();
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'grab';
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'default';
        }
      }}
    />
  );
};

export default PuzzlePiece;
