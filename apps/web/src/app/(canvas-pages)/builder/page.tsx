// src/app/(canvas-pages)/builder/page.tsx
"use client";

import React from 'react';
// Assuming the 'sim' package code is placed in `packages/flow`
// Adjust the import path based on your project structure and tsconfig aliases
// If `@/` points to `src`, this path might need adjustment.
// Let's try a relative path first, assuming standard Next.js structure.
import { Flow } from '../../../../packages/flow/src/reactflow/Flow';

// Styles required by React Flow
// Ensure these are correctly imported or handled globally
// import '@xyflow/react/dist/style.css';
// Import styles from the sim package if they are self-contained
// import '../../../../packages/flow/src/styles.css'; // Adjust path as needed

export default function BuilderPage() {
  // TODO: Add logic to load/save flow data via API
  // TODO: Configure nodes/edges based on available agents/tools

  return (
    <div style={{ height: 'calc(100vh - 100px)', width: '100%' }}> {/* Adjust height as needed */}
      <h1 className="text-2xl font-semibold mb-4">Agent Workflow Builder</h1>
      {/* 
        The Flow component from simstudioai/sim likely needs configuration 
        (e.g., initial nodes/edges, node types, event handlers).
        Passing empty arrays for now as placeholders.
      */}
      <Flow 
        initialNodes={[]} 
        initialEdges={[]} 
        // Pass other necessary props based on the Flow component's definition
      />
      {/* 
        Ensure React Flow Provider wraps this or a parent component if needed.
        The Flow component itself might already include the provider.
        Check the simstudioai/sim implementation.
      */}
    </div>
  );
}

