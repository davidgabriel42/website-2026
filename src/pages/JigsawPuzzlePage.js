import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Stage, Layer, Rect } from 'react-konva';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import usePuzzleStore from '../store/usePuzzleStore';
import PuzzlePiece from '../components/PuzzlePiece';

// Bezier Curve Jigsaw Slicing Algorithm
// Generates the points of a jigsaw edge using relative control points.
// Clockwise tracing: Top edge, Right edge, Bottom edge, Left edge.
const drawEdge = (target, p1, p2, type) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const L = Math.sqrt(dx * dx + dy * dy);
  const tx = dx / L;
  const ty = dy / L;
  // Outward normal (points to the right of the direction of travel)
  const nx = ty;
  const ny = -tx;

  if (type === 0) {
    target.lineTo(p2.x, p2.y);
    return;
  }

  const H_tab = L * 0.18; // tab height
  const s = type; // 1 (outward) or -1 (inward)

  const localToGlobal = (u, v) => ({
    x: p1.x + u * tx + v * nx,
    y: p1.y + u * ty + v * ny
  });

  // 1. Line from start corner to beginning of the tab shoulder
  const pA = localToGlobal(0.38 * L, 0);
  target.lineTo(pA.x, pA.y);

  // 2. Bezier 1: shoulder curve to narrow neck base
  const pB = localToGlobal(0.42 * L, 0.2 * H_tab * s);
  const cp1 = localToGlobal(0.39 * L, 0);
  const cp2 = localToGlobal(0.40 * L, 0.1 * H_tab * s);
  target.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, pB.x, pB.y);

  // 3. Bezier 2: waist curves inward, then head curves outward
  const pC = localToGlobal(0.46 * L, 1.0 * H_tab * s);
  const cp3 = localToGlobal(0.38 * L, 0.35 * H_tab * s);
  const cp4 = localToGlobal(0.40 * L, 1.0 * H_tab * s);
  target.bezierCurveTo(cp3.x, cp3.y, cp4.x, cp4.y, pC.x, pC.y);

  // 4. Bezier 3: top of head (smooth dome-like bulge)
  const pD = localToGlobal(0.54 * L, 1.0 * H_tab * s);
  const cp5 = localToGlobal(0.48 * L, 1.1 * H_tab * s);
  const cp6 = localToGlobal(0.52 * L, 1.1 * H_tab * s);
  target.bezierCurveTo(cp5.x, cp5.y, cp6.x, cp6.y, pD.x, pD.y);

  // 5. Bezier 4: symmetric head to narrow neck waist
  const pE = localToGlobal(0.58 * L, 0.2 * H_tab * s);
  const cp7 = localToGlobal(0.60 * L, 1.0 * H_tab * s);
  const cp8 = localToGlobal(0.62 * L, 0.35 * H_tab * s);
  target.bezierCurveTo(cp7.x, cp7.y, cp8.x, cp8.y, pE.x, pE.y);

  // 6. Bezier 5: narrow neck waist back to flat shoulder end
  const pF = localToGlobal(0.62 * L, 0);
  const cp9 = localToGlobal(0.60 * L, 0.1 * H_tab * s);
  const cp10 = localToGlobal(0.61 * L, 0);
  target.bezierCurveTo(cp9.x, cp9.y, cp10.x, cp10.y, pF.x, pF.y);

  // 7. Line to end of edge
  target.lineTo(p2.x, p2.y);
};

// Trace the complete closed path of a single piece clockwise
const drawPiecePath = (target, W, H, topType, rightType, bottomType, leftType) => {
  const TL = { x: 0, y: 0 };
  const TR = { x: W, y: 0 };
  const BR = { x: W, y: H };
  const BL = { x: 0, y: H };

  target.moveTo(TL.x, TL.y);
  drawEdge(target, TL, TR, topType);
  drawEdge(target, TR, BR, rightType);
  drawEdge(target, BR, BL, bottomType);
  drawEdge(target, BL, TL, leftType);
};

// Create an offscreen canvas containing only the cropped piece
const createPieceCanvas = (img, cropX, cropY, W, H, topType, rightType, bottomType, leftType) => {
  const H_tab = Math.min(W, H) * 0.20;
  const bleed = H_tab * 1.15;

  const minX = leftType === 1 ? -bleed : 0;
  const maxX = rightType === 1 ? W + bleed : W;
  const minY = topType === 1 ? -bleed : 0;
  const maxY = bottomType === 1 ? H + bleed : H;

  const canvasW = Math.ceil(maxX - minX);
  const canvasH = Math.ceil(maxY - minY);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  const shiftX = -minX;
  const shiftY = -minY;

  ctx.beginPath();
  const shiftTarget = {
    moveTo: (x, y) => ctx.moveTo(x + shiftX, y + shiftY),
    lineTo: (x, y) => ctx.lineTo(x + shiftX, y + shiftY),
    bezierCurveTo: (cp1x, cp1y, cp2x, cp2y, x, y) => 
      ctx.bezierCurveTo(cp1x + shiftX, cp1y + shiftY, cp2x + shiftX, cp2y + shiftY, x + shiftX, y + shiftY)
  };

  drawPiecePath(shiftTarget, W, H, topType, rightType, bottomType, leftType);
  ctx.closePath();
  ctx.clip();

  // Draw original image relative to the crop point and drawing offsets
  ctx.drawImage(img, shiftX - cropX, shiftY - cropY);

  return {
    dataUrl: canvas.toDataURL(),
    minX,
    maxX,
    minY,
    maxY,
    canvasW,
    canvasH
  };
};

// Post-processes ExtrudeGeometry to separate front cap, sides, and back cap into distinct material indices
const splitExtrudeGroups = (geometry) => {
  const indexAttr = geometry.getIndex();
  const positionAttr = geometry.getAttribute('position');
  
  if (!indexAttr || !positionAttr) return;
  
  const indices = indexAttr.array;
  const positions = positionAttr.array;
  
  const frontIndices = [];
  const sideIndices = [];
  const backIndices = [];
  
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    
    vA.fromArray(positions, a * 3);
    vB.fromArray(positions, b * 3);
    vC.fromArray(positions, c * 3);
    
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab);
    cb.normalize();
    
    if (cb.z > 0.0001) {
      frontIndices.push(a, b, c);
    } else if (cb.z < -0.0001) {
      backIndices.push(a, b, c);
    } else {
      sideIndices.push(a, b, c);
    }
  }
  
  const newIndices = new indices.constructor(
    frontIndices.length + sideIndices.length + backIndices.length
  );
  
  newIndices.set(frontIndices, 0);
  newIndices.set(sideIndices, frontIndices.length);
  newIndices.set(backIndices, frontIndices.length + sideIndices.length);
  
  geometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
  
  geometry.clearGroups();
  geometry.addGroup(0, frontIndices.length, 0);
  geometry.addGroup(frontIndices.length, sideIndices.length, 1);
  geometry.addGroup(frontIndices.length + sideIndices.length, backIndices.length, 2);
};

// 3D Piece component inside the R3F Canvas
const ThreeDPiece = ({ piece, imageSize, thickness, sideColor, autoRotate }) => {
  const meshRef = useRef();

  // Draw the THREE.Shape using the exact same path drawing logic, shifted to align with the cropped texture
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const shiftX = -piece.minX;
    const shiftY = -piece.minY;
    const shiftTarget = {
      moveTo: (x, y) => s.moveTo(x + shiftX, y + shiftY),
      lineTo: (x, y) => s.lineTo(x + shiftX, y + shiftY),
      bezierCurveTo: (cp1x, cp1y, cp2x, cp2y, x, y) => 
        s.bezierCurveTo(cp1x + shiftX, cp1y + shiftY, cp2x + shiftX, cp2y + shiftY, x + shiftX, y + shiftY)
    };
    drawPiecePath(
      shiftTarget,
      piece.width,
      piece.height,
      piece.edges.top,
      piece.edges.right,
      piece.edges.bottom,
      piece.edges.left
    );
    return s;
  }, [piece]);

  // Configure extrusion settings
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.3,
    bevelOffset: 0,
    bevelSegments: 3,
  }), [thickness]);

  // Instantiate, split groups, and center geometry in useMemo before R3F binds to GPU
  const geometry = useMemo(() => {
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    splitExtrudeGroups(geom);
    geom.center();
    return geom;
  }, [shape, extrudeSettings]);

  // Generate THREE.Texture from the original solid image, using UV offset/repeat to map the segment
  const texture = useMemo(() => {
    if (!piece || !piece.src || !imageSize.width || !imageSize.height) return null;
    
    const loader = new THREE.TextureLoader();
    const tex = loader.load(piece.src);
    tex.colorSpace = THREE.SRGBColorSpace;
    
    // Enable repeat wrapping
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    const imgW = imageSize.width;
    const imgH = imageSize.height;
    
    // Calculate the crop coordinates relative to the column and row of the 4x4 grid
    const pieceWidth = imgW / 4;
    const pieceHeight = imgH / 4;
    const cropX = piece.col * pieceWidth;
    const cropY = piece.row * pieceHeight;
    
    const shiftX = -piece.minX;
    const shiftY = -piece.minY;
    
    // Scale UV coordinates to [0, 1] relative to the full image size
    // We invert Y because WebGL textures start from the bottom-left
    tex.repeat.set(1 / imgW, -1 / imgH);
    
    // Offset translates to the correct piece segment in the texture atlas
    // We adjust for the shape's coordinate shift (shiftX, shiftY)
    const offsetX = (cropX - shiftX) / imgW;
    const offsetY = (imgH - cropY + shiftY) / imgH;
    tex.offset.set(offsetX, offsetY);
    
    return tex;
  }, [piece, imageSize]);

  // Compile materials directly as a flat array to bypass any dynamic attachment bugs in R3F
  const materials = useMemo(() => {
    const capMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.7,
      metalness: 0.1,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      color: '#8c7355', // cardboard brown
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    return [capMaterial, sideMaterial, backMaterial];
  }, [texture, sideColor]);

  // Calculate dynamic scale factor so piece fits beautifully in 3D frame
  const scale = useMemo(() => {
    const maxDim = Math.max(piece.width, piece.height);
    return 3.5 / maxDim;
  }, [piece.width, piece.height]);

  // Optional auto-rotation animation loop
  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80';

const JigsawPuzzlePage = () => {
  // Zustand Store integrations
  const pieces = usePuzzleStore((state) => state.pieces);
  const selectedPiece = usePuzzleStore((state) => state.selectedPiece);
  const initPuzzle = usePuzzleStore((state) => state.initPuzzle);
  const updatePiecePosition = usePuzzleStore((state) => state.updatePiecePosition);
  const checkSnapping = usePuzzleStore((state) => state.checkSnapping);
  const selectPiece = usePuzzleStore((state) => state.selectPiece);

  // Local component states
  const [boardSize, setBoardSize] = useState({ width: 800, height: 500 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageType, setImageSizeSource] = useState('landscape'); // 'landscape' or 'gradient'
  const [thickness, setThickness] = useState(6);
  const [sideColor, setSideColor] = useState('#d2b48c'); // standard wood
  const [autoRotate, setAutoRotate] = useState(true);
  const [isGridCollapsed, setIsGridCollapsed] = useState(false);

  const fileInputRef = useRef(null);
  const boardRef = useRef(null);

  // Handle board resizing on mount
  useEffect(() => {
    if (boardRef.current) {
      const w = boardRef.current.offsetWidth || 800;
      const h = boardRef.current.offsetHeight || 500;
      setBoardSize({ width: w, height: h });
    }
  }, []);

  // Auto collapse the grid when a piece is selected
  useEffect(() => {
    if (selectedPiece) {
      setIsGridCollapsed(true);
    }
  }, [selectedPiece]);

  // Generate fallback/procedural gradient image
  const generateFallbackImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 500, 380);
    grad.addColorStop(0, '#3b82f6'); // modern blue
    grad.addColorStop(0.3, '#8b5cf6'); // vibrant purple
    grad.addColorStop(0.6, '#ec4899'); // modern pink
    grad.addColorStop(1, '#f59e0b'); // amber yellow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 380);

    // Decorative procedural geometry
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(120, 120, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(380, 260, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(50, 300);
    ctx.lineTo(450, 80);
    ctx.stroke();

    // Center Branding Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3D JIGSAW PUZZLE', 250, 190);

    return canvas.toDataURL();
  };

  // Load image and partition into 16 interlocking pieces (4x4)
  const createPieces = useCallback((imageSrc) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const maxDim = 500;
      let imgW = img.width;
      let imgH = img.height;
      if (imgW > maxDim || imgH > maxDim) {
        if (imgW > imgH) {
          imgH = (imgH / imgW) * maxDim;
          imgW = maxDim;
        } else {
          imgW = (imgW / imgH) * maxDim;
          imgH = maxDim;
        }
      }

      // Keep dimensions rounded
      imgW = Math.round(imgW);
      imgH = Math.round(imgH);
      setImageSize({ width: imgW, height: imgH });

      // Clean resized offscreen image to handle dragging nicely
      const resizeCanvas = document.createElement('canvas');
      resizeCanvas.width = imgW;
      resizeCanvas.height = imgH;
      const rCtx = resizeCanvas.getContext('2d');
      rCtx.drawImage(img, 0, 0, imgW, imgH);

      const fittedImg = new window.Image();
      fittedImg.src = resizeCanvas.toDataURL();
      fittedImg.onload = () => {
        const pieceWidth = imgW / 4;
        const pieceHeight = imgH / 4;

        // Generate matching interlocking internal edge types
        const horizontalEdges = [];
        for (let r = 0; r <= 4; r++) {
          horizontalEdges.push([]);
          for (let c = 0; c < 4; c++) {
            if (r === 0 || r === 4) {
              horizontalEdges[r].push(0);
            } else {
              horizontalEdges[r].push(Math.random() < 0.5 ? 1 : -1);
            }
          }
        }

        const verticalEdges = [];
        for (let r = 0; r < 4; r++) {
          verticalEdges.push([]);
          for (let c = 0; c <= 4; c++) {
            if (c === 0 || c === 4) {
              verticalEdges[r].push(0);
            } else {
              verticalEdges[r].push(Math.random() < 0.5 ? 1 : -1);
            }
          }
        }

        const newPieces = [];
        const boardW = boardSize.width || 800;
        const boardH = boardSize.height || 500;

        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const cropX = col * pieceWidth;
            const cropY = row * pieceHeight;

            const topType = -horizontalEdges[row][col];
            const bottomType = horizontalEdges[row + 1][col];
            const leftType = -verticalEdges[row][col];
            const rightType = verticalEdges[row][col + 1];

            const canvasResult = createPieceCanvas(
              fittedImg,
              cropX,
              cropY,
              pieceWidth,
              pieceHeight,
              topType,
              rightType,
              bottomType,
              leftType
            );

            // Scatter pieces with some padding inside the stage area
            const scatterX = Math.random() * (boardW - pieceWidth * 1.5) + pieceWidth * 0.25;
            const scatterY = Math.random() * (boardH - pieceHeight * 1.5) + pieceHeight * 0.25;

            newPieces.push({
              id: `${col}-${row}`,
              col,
              row,
              correctX: cropX + (boardW - imgW) / 2,
              correctY: cropY + (boardH - imgH) / 2,
              currentX: scatterX,
              currentY: scatterY,
              width: pieceWidth,
              height: pieceHeight,
              minX: canvasResult.minX,
              maxX: canvasResult.maxX,
              minY: canvasResult.minY,
              maxY: canvasResult.maxY,
              canvasW: canvasResult.canvasW,
              canvasH: canvasResult.canvasH,
              dataUrl: canvasResult.dataUrl,
              edges: {
                top: topType,
                right: rightType,
                bottom: bottomType,
                left: leftType,
              },
              groupId: null,
            });
          }
        }

        initPuzzle(newPieces);
      };
    };
  }, [boardSize, initPuzzle]);

  // Triggers when user selects default background styles
  useEffect(() => {
    if (boardSize.width > 0) {
      if (imageType === 'landscape') {
        createPieces(DEFAULT_IMAGE_URL);
      } else {
        createPieces(generateFallbackImage());
      }
    }
  }, [imageType, boardSize.width, createPieces]);

  // Handle custom image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      createPieces(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Solve the puzzle automatically by aligning pieces correctly
  const handleAutoSolve = () => {
    if (pieces.length === 0) return;
    const solvedPieces = pieces.map((p) => ({
      ...p,
      currentX: p.correctX,
      currentY: p.correctY,
      groupId: 'solved-group',
    }));
    initPuzzle(solvedPieces);
  };

  // Scramble the current board pieces
  const handleScramble = () => {
    if (pieces.length === 0) return;
    const boardW = boardSize.width;
    const boardH = boardSize.height;
    
    const scrambled = pieces.map((p) => {
      const scatterX = Math.random() * (boardW - p.width * 1.5) + p.width * 0.25;
      const scatterY = Math.random() * (boardH - p.height * 1.5) + p.height * 0.25;
      return {
        ...p,
        currentX: scatterX,
        currentY: scatterY,
        groupId: null,
      };
    });
    initPuzzle(scrambled);
  };

  // Decode the boundary types for textual display in the inspector card
  const getEdgeLabel = (val) => {
    if (val === 1) return 'Tab (Outwards)';
    if (val === -1) return 'Blank (Inwards)';
    return 'Flat Boundary';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Standalone Navigation Header */}
      <header className="navbar bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧩</span>
          <span className="text-xl font-black tracking-tight text-white uppercase">3D Jigsaw Studio</span>
        </div>
        <div>
          <Link to="/" className="btn btn-outline btn-sm hover:bg-white hover:text-black transition-colors gap-2">
            &larr; Back to Portfolio
          </Link>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">3D Jigsaw Puzzle</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Dynamically slices uploaded or generated images into interlocking jigsaw pieces. Fully simulated in 3D!
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleScramble} className="btn btn-warning btn-sm">
            Scramble Board
          </button>
          <button onClick={handleAutoSolve} className="btn btn-success btn-sm">
            Solve Puzzle
          </button>
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="card bg-slate-850 border border-slate-800 p-4 rounded-xl flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-gray-500 uppercase">Image:</span>
            <button
              onClick={() => setImageSizeSource('landscape')}
              className={`btn btn-xs ${imageType === 'landscape' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Scenic Landscape
            </button>
            <button
              onClick={() => setImageSizeSource('gradient')}
              className={`btn btn-xs ${imageType === 'gradient' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Gradient fallbacks
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Upload custom:</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="file-input file-input-bordered file-input-xs max-w-xs text-xs"
            />
          </div>
        </div>
        <span className="text-xs text-slate-500 hidden lg:inline">
          Tip: Select a piece to rotate and inspect in 3D depth!
        </span>
      </div>

      {/* Two-Column split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: 2D Board Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-300">2D Assemble Board</span>
            {pieces.length > 0 && (
              <span className="text-xs text-slate-400">
                Total group connections: {new Set(pieces.map(p => p.groupId).filter(Boolean)).size} / 16
              </span>
            )}
          </div>
          
          <div
            ref={boardRef}
            className="w-full h-[520px] bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {pieces.length > 0 ? (
              <Stage width={boardSize.width} height={boardSize.height}>
                <Layer>
                  {/* Visual align guidelines in center of screen */}
                  <Rect
                    x={(boardSize.width - imageSize.width) / 2}
                    y={(boardSize.height - imageSize.height) / 2}
                    width={imageSize.width}
                    height={imageSize.height}
                    stroke="#334155"
                    strokeWidth={2}
                    dash={[8, 4]}
                    fill="#0f172a"
                    opacity={0.5}
                  />

                  {/* Render interlocking jigsaw components */}
                  {pieces.map((piece) => (
                    <PuzzlePiece
                      key={piece.id}
                      piece={piece}
                      isSelected={selectedPiece?.id === piece.id}
                      onDragMove={(x, y) => updatePiecePosition(piece.id, x, y)}
                      onDragEnd={() => checkSnapping(piece.id)}
                      onClick={() => selectPiece(piece)}
                    />
                  ))}
                </Layer>
              </Stage>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-2 text-sm font-medium">Slicing puzzle image...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3D Inspector Frame */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3.5 flex justify-between items-center">
              <h2 className="text-md font-extrabold text-white uppercase tracking-wider">3D Piece Inspector</h2>
              <div className="flex items-center gap-2">
                {isGridCollapsed && (
                  <button
                    onClick={() => setIsGridCollapsed(false)}
                    className="btn btn-outline btn-primary btn-xs font-bold gap-1 shadow"
                  >
                    🧩 Show Grid
                  </button>
                )}
                {selectedPiece && (
                  <div className="badge badge-accent badge-sm font-bold">
                    Piece {selectedPiece.col + 1}, {selectedPiece.row + 1}
                  </div>
                )}
              </div>
            </div>

            {/* Selection Grid for Pieces (collapsible) */}
            {!isGridCollapsed && pieces.length > 0 && (
              <div className="p-4 border-b border-slate-800 bg-slate-950 transition-all duration-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Quick Select Piece from Grid:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {pieces.map((piece) => (
                    <button
                      key={piece.id}
                      onClick={() => selectPiece(piece)}
                      className={`aspect-square p-1 rounded border overflow-hidden flex items-center justify-center transition-all bg-slate-900 hover:bg-slate-800 ${
                        selectedPiece?.id === piece.id
                          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-slate-900 scale-105'
                          : 'border-slate-800'
                      }`}
                    >
                      <img
                        src={piece.dataUrl}
                        alt={piece.id}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* R3F 3D Viewport container (dynamic height) */}
            <div className={`bg-slate-950 relative flex items-center justify-center transition-all duration-300 ${isGridCollapsed ? 'h-[500px]' : 'h-[320px]'}`}>
              {selectedPiece ? (
                <div className="w-full h-full">
                  <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                    <Suspense fallback={null}>
                      <ambientLight intensity={0.7} />
                      <pointLight position={[-10, -10, -10]} intensity={0.5} />
                      <directionalLight
                        position={[8, 12, 10]}
                        intensity={1.0}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                      />
                      <ThreeDPiece
                        piece={selectedPiece}
                        imageSize={imageSize}
                        thickness={thickness}
                        sideColor={sideColor}
                        autoRotate={autoRotate}
                      />
                      <OrbitControls enablePan={true} enableZoom={true} />
                    </Suspense>
                  </Canvas>
                  <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                    Left-click + Drag to rotate. Scroll to zoom.
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 max-w-[250px]">
                  <div className="text-slate-600 text-5xl mb-3">🧩</div>
                  <p className="text-xs font-semibold text-slate-400">No Piece Selected</p>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Click any jigsaw piece on the 2D assemble board or select one from the grid above to inspect its complete 3D extrusion structure here.
                  </p>
                </div>
              )}
            </div>

            {/* Selected piece settings controls */}
            {selectedPiece && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-4 text-xs">
                {/* Auto Rotate Control */}
                <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="font-semibold text-gray-300">Auto Rotate</span>
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="toggle toggle-primary toggle-xs"
                  />
                </div>

                {/* Thickness Depth Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-gray-400 font-semibold">
                    <span>Cardboard Thickness:</span>
                    <span className="text-primary font-bold">{thickness} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="range range-xs range-primary"
                  />
                </div>

                {/* Side Solid Wood Color selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-400 font-semibold">Edge Side Color:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { hex: '#d2b48c', name: 'Tan Wood' },
                      { hex: '#8b5a2b', name: 'Dark Oak' },
                      { hex: '#475569', name: 'Slate Gray' },
                      { hex: '#1e293b', name: 'Ink Blue' },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setSideColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        className={`h-6 rounded-lg transition-transform border border-black/20 ${
                          sideColor === color.hex ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-102'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Edge contours properties details */}
                <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1">
                  <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    Contour Edge Topologies:
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-gray-400">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-semibold">Top:</span>
                      <span className="font-bold text-gray-300">{getEdgeLabel(selectedPiece.edges.top)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-semibold">Right:</span>
                      <span className="font-bold text-gray-300">{getEdgeLabel(selectedPiece.edges.right)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-semibold">Bottom:</span>
                      <span className="font-bold text-gray-300">{getEdgeLabel(selectedPiece.edges.bottom)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-semibold">Left:</span>
                      <span className="font-bold text-gray-300">{getEdgeLabel(selectedPiece.edges.left)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Snapping Group:</span>
                    <span className="font-mono text-gray-400">
                      {selectedPiece.groupId ? selectedPiece.groupId.substring(0, 10) : 'None (Independent)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default JigsawPuzzlePage;
