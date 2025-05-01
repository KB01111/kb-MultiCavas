// src/components/features/builder/components/workflow-block/workflow-block.tsx
// Placeholder for the WorkflowBlock component adapted from simstudioai/sim
// This will render the custom nodes in the React Flow canvas.

import React from 'react';

// TODO: Adapt the WorkflowBlock implementation from 
// /home/ubuntu/temp_sim_template/sim/app/w/[id]/components/workflow-block/workflow-block.tsx

interface WorkflowBlockProps {
  data: {
    type: string;
    config: any; // Block configuration
    name: string;
    isActive: boolean;
    isPending: boolean;
  };
  // Add other props passed by React Flow (id, selected, etc.) if needed
}

export function WorkflowBlock({ data }: WorkflowBlockProps) {
  // Placeholder rendering
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 5, background: '#fff' }}>
      <div><strong>{data.name}</strong> ({data.type})</div>
      {data.isActive && <div style={{ color: 'green' }}>Active</div>}
      {data.isPending && <div style={{ color: 'orange' }}>Pending</div>}
      {/* TODO: Implement the actual rendering based on simstudioai/sim */}
    </div>
  );
}

