// src/components/features/conversations/__tests__/ConversationList.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationList from '../ConversationList';
import * as conversationService from '@/lib/services/conversationService'; // Adjust path as needed
import { Conversation } from '@/app/types'; // Adjust path as needed

// Mock the conversationService module
jest.mock('@/lib/services/conversationService');

const mockGetConversations = conversationService.getConversations as jest.Mock;

describe('ConversationList Component', () => {
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      name: 'Test Conversation 1',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      updated_at: new Date().toISOString(),
      metadata: { topic: 'testing' },
      messages: [], // Assuming messages might be part of the type
      agent_states: [], // Assuming agent_states might be part of the type
    },
    {
      id: 'conv-2',
      name: 'Another Conversation',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      metadata: {},
      messages: [],
      agent_states: [],
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockGetConversations.mockClear();
  });

  test('renders loading state initially', () => {
    // Mock the service to be in a pending state
    mockGetConversations.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<ConversationList onSelectConversation={() => {}} />); // Pass dummy prop
    // Check for a loading indicator (adjust selector as needed)
    expect(screen.getByText(/Loading conversations.../i)).toBeInTheDocument();
  });

  test('renders conversation list when data is loaded', async () => {
    // Mock the service to return data successfully
    mockGetConversations.mockResolvedValue(mockConversations);
    render(<ConversationList onSelectConversation={() => {}} />);

    // Wait for the loading state to disappear and data to appear
    await waitFor(() => {
      expect(screen.queryByText(/Loading conversations.../i)).not.toBeInTheDocument();
    });

    // Check if conversation names are rendered
    expect(screen.getByText('Test Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Another Conversation')).toBeInTheDocument();
    // Optionally check for timestamps or other details if displayed
  });

  test('renders error message when data fetching fails', async () => {
    // Mock the service to throw an error
    const errorMessage = 'Failed to fetch conversations';
    mockGetConversations.mockRejectedValue(new Error(errorMessage));
    render(<ConversationList onSelectConversation={() => {}} />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading conversations/i)).toBeInTheDocument();
    });

    // Check that loading and conversation data are not present
    expect(screen.queryByText(/Loading conversations.../i)).not.toBeInTheDocument();
    expect(screen.queryByText('Test Conversation 1')).not.toBeInTheDocument();
  });

  test('renders "No conversations found" when the list is empty', async () => {
    // Mock the service to return an empty array
    mockGetConversations.mockResolvedValue([]);
    render(<ConversationList onSelectConversation={() => {}} />);

    await waitFor(() => {
        expect(screen.queryByText(/Loading conversations.../i)).not.toBeInTheDocument();
    });

    // Check for the empty state message
    expect(screen.getByText(/No conversations found/i)).toBeInTheDocument();
  });

  test('calls onSelectConversation when a conversation is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();
    mockGetConversations.mockResolvedValue(mockConversations);
    render(<ConversationList onSelectConversation={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Test Conversation 1')).toBeInTheDocument();
    });

    // Click on the first conversation item (adjust selector if needed)
    const firstConversationItem = screen.getByText('Test Conversation 1');
    await user.click(firstConversationItem);

    // Check if the callback was called with the correct conversation ID
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('conv-1');
  });
});

// Need to import userEvent for the click test
import userEvent from '@testing-library/user-event';

