import { create } from 'zustand';

const usePuzzleStore = create((set, get) => ({
  pieces: [],
  selectedPiece: null,

  initPuzzle: (pieces) => set({ pieces, selectedPiece: null }),

  updatePiecePosition: (id, x, y) => set((state) => {
    // Find the piece and its connection group
    const piece = state.pieces.find((p) => p.id === id);
    if (!piece) return {};

    const updatedPieces = state.pieces.map((p) => {
      // If the piece is connected to the dragged piece, update its position relatives to the dragged piece
      if (p.id === id) {
        return { ...p, currentX: x, currentY: y };
      }
      
      // If they are in the same connection group, move them together
      if (piece.groupId && p.groupId === piece.groupId) {
        const dx = p.currentX - piece.currentX;
        const dy = p.currentY - piece.currentY;
        return { ...p, currentX: x + dx, currentY: y + dy };
      }

      return p;
    });

    return { pieces: updatedPieces };
  }),

  selectPiece: (piece) => set({ selectedPiece: piece }),

  checkSnapping: (id) => set((state) => {
    const threshold = 20; // snapping threshold in pixels
    const pieces = [...state.pieces];
    const draggedPiece = pieces.find((p) => p.id === id);
    if (!draggedPiece) return {};

    // Helper to merge groups
    const mergeGroups = (groupId1, groupId2) => {
      const targetGroupId = groupId1 || groupId2 || `group-${Math.random().toString(36).substr(2, 9)}`;
      pieces.forEach((p) => {
        if ((groupId1 && p.groupId === groupId1) || (groupId2 && p.groupId === groupId2) || p.id === id) {
          p.groupId = targetGroupId;
        }
      });
    };

    // Check snapping against all other pieces
    for (const other of pieces) {
      if (other.id === id) continue;
      
      // If they are already in the same group, skip
      if (draggedPiece.groupId && other.groupId === draggedPiece.groupId) continue;

      // Calculate correct relative offset
      const correctDx = other.correctX - draggedPiece.correctX;
      const correctDy = other.correctY - draggedPiece.correctY;

      // Calculate current relative offset
      const currentDx = other.currentX - draggedPiece.currentX;
      const currentDy = other.currentY - draggedPiece.currentY;

      // Calculate distance between current and correct relative offset
      const distance = Math.sqrt(Math.pow(currentDx - correctDx, 2) + Math.pow(currentDy - correctDy, 2));

      if (distance < threshold) {
        // Snap dragged piece (and its group) to the correct relative position to the other piece
        const targetX = other.currentX - correctDx;
        const targetY = other.currentY - correctDy;

        // Move the dragged piece and its group
        const dx = targetX - draggedPiece.currentX;
        const dy = targetY - draggedPiece.currentY;

        pieces.forEach((p) => {
          if (p.id === id || (draggedPiece.groupId && p.groupId === draggedPiece.groupId)) {
            p.currentX += dx;
            p.currentY += dy;
          }
        });

        // Merge connection groups
        mergeGroups(draggedPiece.groupId, other.groupId);
        break; // Only snap to one neighbor at a time
      }
    }

    return { pieces };
  }),
}));

export default usePuzzleStore;
