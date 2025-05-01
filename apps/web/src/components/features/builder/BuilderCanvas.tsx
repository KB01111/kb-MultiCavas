// src/components/features/builder/BuilderCanvas.tsx
"use client";

import React, { useCallback } from 'react'; // Removed unused imports
import ReactFlow, {
  Background,
  ConnectionLineType,
  EdgeTypes,
  NodeTypes,
  ReactFlowProvider,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import custom components
import { WorkflowBlock } from './components/workflow-block/workflow-block';
import { WorkflowEdge } from './components/workflow-edge/workflow-edge';
import { ControlBar } from './components/control-bar/control-bar';
import { Panel } from './components/panel/panel';
import { Toolbar } from './components/toolbar/toolbar';

// Import the store
import { useWorkflowStore } from '@/stores/builder/workflowStore';

// Define custom node and edge types
const nodeTypes: NodeTypes = {
  workflowBlock: WorkflowBlock, // Use the imported component
};
const edgeTypes: EdgeTypes = {
  workflowEdge: WorkflowEdge, // Use the imported component
};

function BuilderCanvasContent() {
  // Get state and actions from the store
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect
  } = useWorkflowStore();

  // TODO: Implement onDrop, onDragOver from workflow.tsx if needed
  // TODO: Fully implement store actions and state based on simstudioai/sim
  // TODO: Fully implement custom components based on simstudioai/sim

  return (
    <div style={{ height: 'calc(100vh - 60px)' }} className="relative w-full"> {/* Adjust height if needed */}
      <ControlBar />
      <Toolbar />
      <Panel />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        className="bg-background" // Optional: Add background class
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

// Wrap with ReactFlowProvider
export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasContent />
    </ReactFlowProvider>
  );
}

