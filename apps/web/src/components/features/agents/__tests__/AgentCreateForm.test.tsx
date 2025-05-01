// src/components/features/agents/__tests__/AgentCreateForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AgentCreateForm from '../AgentCreateForm';
import * as agentService from '@/lib/services/agentService'; // Adjust path as needed

// Mock the agentService module
jest.mock('@/lib/services/agentService');

const mockCreateAgent = agentService.createAgent as jest.Mock;

describe('AgentCreateForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockCreateAgent.mockClear();
  });

  test('renders the form fields correctly', () => {
    render(<AgentCreateForm onSuccess={() => {}} />);

    expect(screen.getByLabelText(/Agent Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/System Prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model Config \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Agent/i })).toBeInTheDocument();
  });

  test('allows user to input data into form fields', async () => {
    const user = userEvent.setup();
    render(<AgentCreateForm onSuccess={() => {}} />);

    const nameInput = screen.getByLabelText(/Agent Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const promptInput = screen.getByLabelText(/System Prompt/i);
    const configInput = screen.getByLabelText(/Model Config \(JSON\)/i);

    await user.type(nameInput, 'New Test Agent');
    await user.type(descriptionInput, 'A description for the new agent.');
    await user.type(promptInput, 'You are a new test agent.');
    await user.type(configInput, '{"model": "gpt-4o-mini"}');

    expect(nameInput).toHaveValue('New Test Agent');
    expect(descriptionInput).toHaveValue('A description for the new agent.');
    expect(promptInput).toHaveValue('You are a new test agent.');
    expect(configInput).toHaveValue('{"model": "gpt-4o-mini"}');
  });

  test('submits the form and calls createAgent on success', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const newAgentData = {
        name: 'Submit Agent',
        description: 'Submit description',
        system_prompt: 'Submit prompt',
        config: { model: 'submit-model' },
    };
    mockCreateAgent.mockResolvedValue({ ...newAgentData, id: 'agent-new', created_at: '', updated_at: '', teams: [] }); // Mock successful creation

    render(<AgentCreateForm onSuccess={mockOnSuccess} />);

    // Fill the form
    await user.type(screen.getByLabelText(/Agent Name/i), newAgentData.name);
    await user.type(screen.getByLabelText(/Description/i), newAgentData.description);
    await user.type(screen.getByLabelText(/System Prompt/i), newAgentData.system_prompt);
    await user.type(screen.getByLabelText(/Model Config \(JSON\)/i), JSON.stringify(newAgentData.config));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Agent/i });
    await user.click(submitButton);

    // Check if createAgent was called with the correct data
    await waitFor(() => {
      expect(mockCreateAgent).toHaveBeenCalledTimes(1);
      expect(mockCreateAgent).toHaveBeenCalledWith({
        name: newAgentData.name,
        description: newAgentData.description,
        system_prompt: newAgentData.system_prompt,
        config: newAgentData.config,
      });
    });

    // Check if onSuccess callback was called
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  test('shows an error message if form submission fails', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const errorMessage = 'Failed to create agent';
    mockCreateAgent.mockRejectedValue(new Error(errorMessage)); // Mock failed creation

    render(<AgentCreateForm onSuccess={mockOnSuccess} />);

    // Fill the form (minimum required)
    await user.type(screen.getByLabelText(/Agent Name/i), 'Fail Agent');
    await user.type(screen.getByLabelText(/System Prompt/i), 'Fail prompt');
    await user.type(screen.getByLabelText(/Model Config \(JSON\)/i), '{}');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Agent/i });
    await user.click(submitButton);

    // Check if error message is displayed (adjust selector based on actual implementation)
    await waitFor(() => {
      // Assuming the form shows an error message near the button or top
      // This requires the component to handle and display the error.
      // Example: expect(screen.getByText(/Error creating agent/i)).toBeInTheDocument();
      // For now, just check that onSuccess was NOT called
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockCreateAgent).toHaveBeenCalledTimes(1);
    });
     // TODO: Add assertion for visible error message once implemented in the component
  });

   test('validates JSON config input', async () => {
    const user = userEvent.setup();
    render(<AgentCreateForm onSuccess={() => {}} />);

    const configInput = screen.getByLabelText(/Model Config \(JSON\)/i);
    const submitButton = screen.getByRole('button', { name: /Create Agent/i });

    // Fill other required fields
    await user.type(screen.getByLabelText(/Agent Name/i), 'JSON Test Agent');
    await user.type(screen.getByLabelText(/System Prompt/i), 'JSON test prompt');

    // Input invalid JSON
    await user.type(configInput, '{"model": invalid}');

    // Attempt to submit
    await user.click(submitButton);

    // Check that createAgent was not called
    expect(mockCreateAgent).not.toHaveBeenCalled();

    // Check for a validation error message (assuming the component shows one)
    // Example: expect(screen.getByText(/Invalid JSON format/i)).toBeInTheDocument();
    // TODO: Add assertion for visible validation error message once implemented
  });

});

