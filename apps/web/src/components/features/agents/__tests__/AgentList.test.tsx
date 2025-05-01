// src/components/features/agents/__tests__/AgentList.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentList from '../AgentList';
import * as agentService from '@/lib/services/agentService'; // Adjust path as needed
import { Agent } from '@/app/types'; // Adjust path as needed

// Mock the agentService module
jest.mock('@/lib/services/agentService');

// Mock TanStack Query's useQuery hook behavior if used directly in component
// Or mock the service function if it's called directly
const mockGetAgents = agentService.getAgents as jest.Mock;

describe('AgentList Component', () => {
  const mockAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Test Agent 1',
      description: 'Description for agent 1',
      system_prompt: 'Prompt 1',
      config: { model: 'gpt-4' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      teams: [], // Assuming teams might be part of the Agent type
    },
    {
      id: 'agent-2',
      name: 'Test Agent 2',
      description: 'Description for agent 2',
      system_prompt: 'Prompt 2',
      config: { model: 'gpt-3.5' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      teams: [],
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockGetAgents.mockClear();
  });

  test('renders loading state initially', () => {
    // Mock the service to be in a pending state
    mockGetAgents.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<AgentList />);
    // Check for a loading indicator (adjust selector as needed)
    expect(screen.getByText(/Loading agents.../i)).toBeInTheDocument();
  });

  test('renders agent list when data is loaded', async () => {
    // Mock the service to return data successfully
    mockGetAgents.mockResolvedValue(mockAgents);
    render(<AgentList />);

    // Wait for the loading state to disappear and data to appear
    await waitFor(() => {
      expect(screen.queryByText(/Loading agents.../i)).not.toBeInTheDocument();
    });

    // Check if agent names are rendered
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Description for agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    expect(screen.getByText('Description for agent 2')).toBeInTheDocument();
  });

  test('renders error message when data fetching fails', async () => {
    // Mock the service to throw an error
    const errorMessage = 'Failed to fetch agents';
    mockGetAgents.mockRejectedValue(new Error(errorMessage));
    render(<AgentList />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading agents/i)).toBeInTheDocument();
    });

    // Check that loading and agent data are not present
    expect(screen.queryByText(/Loading agents.../i)).not.toBeInTheDocument();
    expect(screen.queryByText('Test Agent 1')).not.toBeInTheDocument();
  });

  test('renders "No agents found" when the list is empty', async () => {
    // Mock the service to return an empty array
    mockGetAgents.mockResolvedValue([]);
    render(<AgentList />);

    await waitFor(() => {
        expect(screen.queryByText(/Loading agents.../i)).not.toBeInTheDocument();
    });

    // Check for the empty state message
    expect(screen.getByText(/No agents found/i)).toBeInTheDocument();
  });
});

