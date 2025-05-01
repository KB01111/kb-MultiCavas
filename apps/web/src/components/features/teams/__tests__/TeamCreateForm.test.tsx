// src/components/features/teams/__tests__/TeamCreateForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import TeamCreateForm from '../TeamCreateForm';
import * as teamService from '@/lib/services/teamService'; // Adjust path as needed
import * as agentService from '@/lib/services/agentService'; // Adjust path for fetching agents
import { Agent } from '@/app/types'; // Adjust path as needed

// Mock the services
jest.mock('@/lib/services/teamService');
jest.mock('@/lib/services/agentService');

const mockCreateTeam = teamService.createTeam as jest.Mock;
const mockGetAgents = agentService.getAgents as jest.Mock;

describe('TeamCreateForm Component', () => {
  const mockAgents: Agent[] = [
    { id: 'agent-1', name: 'Agent One', description: '', system_prompt: '', config: {}, created_at: '', updated_at: '', teams: [] },
    { id: 'agent-2', name: 'Agent Two', description: '', system_prompt: '', config: {}, created_at: '', updated_at: '', teams: [] },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockCreateTeam.mockClear();
    mockGetAgents.mockClear();
    // Mock getAgents to return successfully by default for agent selection
    mockGetAgents.mockResolvedValue(mockAgents);
  });

  test('renders the form fields correctly', async () => {
    render(<TeamCreateForm onSuccess={() => {}} />);

    // Wait for agents to load for the multi-select
    await waitFor(() => {
      expect(screen.getByLabelText(/Team Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Agents/i)).toBeInTheDocument(); // Assuming a label for agent selection
    expect(screen.getByRole('button', { name: /Create Team/i })).toBeInTheDocument();

    // Check if agent options are potentially available (might need more specific selectors)
    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('Agent Two')).toBeInTheDocument();
  });

  test('allows user to input data and select agents', async () => {
    const user = userEvent.setup();
    render(<TeamCreateForm onSuccess={() => {}} />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent One')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Team Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    // Assuming a multi-select component - interaction might differ
    // This example assumes clicking the agent names selects them
    const agentOneOption = screen.getByText('Agent One');

    await user.type(nameInput, 'New Test Team');
    await user.type(descriptionInput, 'A description for the new team.');
    await user.click(agentOneOption); // Simulate selecting Agent One

    expect(nameInput).toHaveValue('New Test Team');
    expect(descriptionInput).toHaveValue('A description for the new team.');
    // Add assertion for selected agent if possible (depends on component implementation)
  });

  test('submits the form and calls createTeam on success', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const newTeamData = {
        name: 'Submit Team',
        description: 'Submit description',
        agent_ids: ['agent-1'], // User selects Agent One
    };
    // Mock successful creation
    mockCreateTeam.mockResolvedValue({ ...newTeamData, id: 'team-new', created_at: '', updated_at: '', agents: [mockAgents[0]] });

    render(<TeamCreateForm onSuccess={mockOnSuccess} />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent One')).toBeInTheDocument();
    });

    // Fill the form
    await user.type(screen.getByLabelText(/Team Name/i), newTeamData.name);
    await user.type(screen.getByLabelText(/Description/i), newTeamData.description);
    // Select Agent One (assuming clicking the text works)
    await user.click(screen.getByText('Agent One'));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Team/i });
    await user.click(submitButton);

    // Check if createTeam was called with the correct data
    await waitFor(() => {
      expect(mockCreateTeam).toHaveBeenCalledTimes(1);
      expect(mockCreateTeam).toHaveBeenCalledWith({
        name: newTeamData.name,
        description: newTeamData.description,
        agent_ids: newTeamData.agent_ids,
      });
    });

    // Check if onSuccess callback was called
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  test('shows an error message if fetching agents fails', async () => {
    const errorMessage = 'Failed to fetch agents for selection';
    mockGetAgents.mockRejectedValue(new Error(errorMessage)); // Mock agent fetch failure

    render(<TeamCreateForm onSuccess={() => {}} />);

    // Check if an error message related to fetching agents is displayed
    await waitFor(() => {
      // Adjust selector based on how the error is displayed
      expect(screen.getByText(/Error loading agents for selection/i)).toBeInTheDocument();
    });

    // Ensure form might be disabled or submit button not effective
    expect(screen.queryByRole('button', { name: /Create Team/i })).toBeDisabled(); // Assuming button is disabled
  });

  test('shows an error message if form submission fails', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const errorMessage = 'Failed to create team';
    mockCreateTeam.mockRejectedValue(new Error(errorMessage)); // Mock failed creation

    render(<TeamCreateForm onSuccess={mockOnSuccess} />);

     // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent One')).toBeInTheDocument();
    });

    // Fill the form (minimum required)
    await user.type(screen.getByLabelText(/Team Name/i), 'Fail Team');
    await user.click(screen.getByText('Agent One')); // Select an agent

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Team/i });
    await user.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      // Assuming the form shows an error message
      // Example: expect(screen.getByText(/Error creating team/i)).toBeInTheDocument();
      // For now, just check that onSuccess was NOT called
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockCreateTeam).toHaveBeenCalledTimes(1);
    });
    // TODO: Add assertion for visible error message once implemented in the component
  });
});

