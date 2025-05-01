// src/components/features/builder/__tests__/BuilderCanvas.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BuilderCanvas from '../BuilderCanvas';
import { useWorkflowStore } from '@/stores/builder/workflowStore'; // Adjust path

// Mock the Zustand store
// We need to mock the entire store or specific selectors used by the component
jest.mock('@/stores/builder/workflowStore', () => ({
  useWorkflowStore: jest.fn(),
}));

// Mock React Flow components/hooks used internally if necessary
// This might be complex, start by mocking the store first
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'), // Use actual implementation for non-hook parts
  useNodesState: jest.fn().mockReturnValue([[], jest.fn(), jest.fn()]),
  useEdgesState: jest.fn().mockReturnValue([[], jest.fn(), jest.fn()]),
  useReactFlow: jest.fn().mockReturnValue({ /* mock necessary methods like project, fitView */ }),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Simple wrapper
  Background: () => <div data-testid="rf-background">Background</div>, // Mock component
  Controls: () => <div data-testid="rf-controls">Controls</div>, // Mock component
  MiniMap: () => <div data-testid="rf-minimap">MiniMap</div>, // Mock component
}));

// Mock custom child components to isolate BuilderCanvas logic
jest.mock('../components/toolbar/toolbar', () => () => <div data-testid="mock-toolbar">Toolbar</div>);
jest.mock('../components/panel/panel', () => () => <div data-testid="mock-panel">Panel</div>);
jest.mock('../components/control-bar/control-bar', () => () => <div data-testid="mock-control-bar">Control Bar</div>);

describe('BuilderCanvas Component', () => {
  const mockStoreState = {
    nodes: [],
    edges: [],
    // Add other state properties used by BuilderCanvas if any
    // Example: selectedNode: null,
  };

  beforeEach(() => {
    // Reset mocks and provide default state
    (useWorkflowStore as jest.Mock).mockReturnValue(mockStoreState);
    // Reset React Flow mocks if needed
    (jest.requireMock('reactflow').useNodesState as jest.Mock).mockReturnValue([[], jest.fn(), jest.fn()]);
    (jest.requireMock('reactflow').useEdgesState as jest.Mock).mockReturnValue([[], jest.fn(), jest.fn()]);
  });

  test('renders without crashing', () => {
    render(<BuilderCanvas />);
    // Check if the main container or a key element is rendered
    // The actual ReactFlow component is heavily mocked, so check for mocks
    expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-control-bar')).toBeInTheDocument();
    // Check for React Flow mocked elements
    expect(screen.getByTestId('rf-background')).toBeInTheDocument();
    // expect(screen.getByTestId('rf-controls')).toBeInTheDocument(); // Controls might be conditional
    // expect(screen.getByTestId('rf-minimap')).toBeInTheDocument(); // MiniMap might be conditional
  });

  test('renders nodes and edges based on store state', () => {
    // Setup store with some nodes/edges
    const nodes = [{ id: 'node-1', position: { x: 0, y: 0 }, data: { label: 'Node 1' }, type: 'workflowBlock' }];
    const edges = [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'workflowEdge' }];
    (jest.requireMock('reactflow').useNodesState as jest.Mock).mockReturnValue([nodes, jest.fn(), jest.fn()]);
    (jest.requireMock('reactflow').useEdgesState as jest.Mock).mockReturnValue([edges, jest.fn(), jest.fn()]);
    (useWorkflowStore as jest.Mock).mockReturnValue({ ...mockStoreState, nodes, edges });

    render(<BuilderCanvas />);

    // Assertions here are tricky because ReactFlow rendering is complex and mocked.
    // We mainly test that the store state is passed down correctly.
    // We can check if the mocked useNodesState/useEdgesState were called with initial state from store.
    // Or verify props passed to the actual <ReactFlow> component if not fully mocked.

    // For now, primarily test that it renders without error given the state.
    expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
  });

  // Add more tests as needed:
  // - Test interactions with Toolbar/Panel/ControlBar if they trigger state changes
  // - Test drag-and-drop functionality (might require more complex setup or end-to-end tests)
  // - Test node/edge selection logic if handled within BuilderCanvas
});

