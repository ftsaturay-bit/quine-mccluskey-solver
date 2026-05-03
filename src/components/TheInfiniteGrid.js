import React, { useRef } from "react";
import { cn } from "../lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame
} from "framer-motion";

export const InfiniteGrid = ({ mousePos }) => {
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Update motion values when mousePos changes
  React.useEffect(() => {
    if (!containerRef.current || !mousePos) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(mousePos.x - left);
    mouseY.set(mousePos.y - top);
  }, [mousePos, mouseX, mouseY]);

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % 40);
    gridOffsetY.set((currentY + speedY) % 40);
  });

  // Spotlight effect for the grid (White with low opacity)
  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  // Subtle white spotlight glow following the cursor
  const spotlightStyle = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.05), transparent)`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
      )}
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: spotlightStyle }}
      />

      {/* Base Grid Layer (Very Faint White) */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <GridPattern id="base-grid" offsetX={gridOffsetX} offsetY={gridOffsetY} color="text-white" />
      </div>

      {/* Revealed Grid Layer (White + Masked) */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern id="revealed-grid" offsetX={gridOffsetX} offsetY={gridOffsetY} color="text-white" />
      </motion.div>

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right Orange Glow — center anchored at corner */}
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-orange-600/25 blur-[130px]" />

        {/* Bottom Left Blue Glow — center anchored at corner */}
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-blue-700/25 blur-[130px]" />
      </div>

      {/* Very faint background noise/texture if needed, but keeping it clean for now */}
    </div>
  );
};

const GridPattern = ({ id, offsetX, offsetY, color }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={id}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className={color}
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

export default InfiniteGrid;
