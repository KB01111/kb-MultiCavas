// src/components/features/teams/__tests__/TeamList.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamList from '../TeamList';
import * as teamService from '@/lib/services/teamService'; // Adjust path as needed
import { Team } from '@/app/types'; // Adjust path as needed

// Mock the teamService module
jest.mock('@/lib/services/teamService');

const mockGetTeams = teamService.getTeams as jest.Mock;

describe('TeamList Component', () => {
  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Test Team 1',
      description: 'Description for team 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      agents: [
        { id: 'agent-1', name: 'Agent 1', description: '', system_prompt: '', config: {}, created_at: '', updated_at: '', teams: [] },
      ],
    },
    {
      id: 'team-2',
      name: 'Test Team 2',
      description: 'Description for team 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      agents: [],
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockGetTeams.mockClear();
  });

  test('renders loading state initially', () => {
    // Mock the service to be in a pending state
    mockGetTeams.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<TeamList />);
    // Check for a loading indicator (adjust selector as needed)
    expect(screen.getByText(/Loading teams.../i)).toBeInTheDocument();
  });

  test('renders team list when data is loaded', async () => {
    // Mock the service to return data successfully
    mockGetTeams.mockResolvedValue(mockTeams);
    render(<TeamList />);

    // Wait for the loading state to disappear and data to appear
    await waitFor(() => {
      expect(screen.queryByText(/Loading teams.../i)).not.toBeInTheDocument();
    });

    // Check if team names are rendered
    expect(screen.getByText('Test Team 1')).toBeInTheDocument();
    expect(screen.getByText('Description for team 1')).toBeInTheDocument();
    expect(screen.getByText('Test Team 2')).toBeInTheDocument();
    expect(screen.getByText('Description for team 2')).toBeInTheDocument();
    // Check if agent count is displayed (assuming it is)
    expect(screen.getByText(/1 Agent/i)).toBeInTheDocument(); // For Team 1
    expect(screen.getByText(/0 Agents/i)).toBeInTheDocument(); // For Team 2
  });

  test('renders error message when data fetching fails', async () => {
    // Mock the service to throw an error
    const errorMessage = 'Failed to fetch teams';
    mockGetTeams.mockRejectedValue(new Error(errorMessage));
    render(<TeamList />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading teams/i)).toBeInTheDocument();
    });

    // Check that loading and team data are not present
    expect(screen.queryByText(/Loading teams.../i)).not.toBeInTheDocument();
    expect(screen.queryByText('Test Team 1')).not.toBeInTheDocument();
  });

  test('renders "No teams found" when the list is empty', async () => {
    // Mock the service to return an empty array
    mockGetTeams.mockResolvedValue([]);
    render(<TeamList />);

    await waitFor(() => {
        expect(screen.queryByText(/Loading teams.../i)).not.toBeInTheDocument();
    });

    // Check for the empty state message
    expect(screen.getByText(/No teams found/i)).toBeInTheDocument();
  });
});

