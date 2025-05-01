// src/components/features/conversations/__tests__/ConversationView.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ConversationView from '../ConversationView';
import * as messageService from '@/lib/services/messageService'; // Adjust path as needed
import * as conversationService from '@/lib/services/conversationService'; // For potentially fetching conversation details
import { Message, Conversation } from '@/app/types'; // Adjust path as needed

// Mock the services
jest.mock('@/lib/services/messageService');
jest.mock('@/lib/services/conversationService');

const mockGetMessages = messageService.getMessagesForConversation as jest.Mock;
const mockCreateMessage = messageService.createMessage as jest.Mock;
const mockGetConversation = conversationService.getConversation as jest.Mock; // If needed

describe('ConversationView Component', () => {
  const conversationId = 'conv-active-1';
  const mockConversation: Conversation = {
    id: conversationId,
    name: 'Active Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {},
    messages: [],
    agent_states: [],
  };
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      conversation_id: conversationId,
      sender_type: 'user',
      content: 'Hello Agent!',
      created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      metadata: {},
      evaluation_results: [],
    },
    {
      id: 'msg-2',
      conversation_id: conversationId,
      sender_type: 'assistant',
      content: 'Hello User! How can I help?',
      created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      metadata: {},
      evaluation_results: [],
    },
  ];

  beforeEach(() => {
    // Reset mocks
    mockGetMessages.mockClear();
    mockCreateMessage.mockClear();
    mockGetConversation.mockClear();
    // Default mocks for successful loading
    mockGetConversation.mockResolvedValue(mockConversation); // Mock fetching conversation details if component does it
    mockGetMessages.mockResolvedValue(mockMessages);
    mockCreateMessage.mockResolvedValue({ /* new message object */ });
  });

  test('renders loading state initially for messages', () => {
    mockGetMessages.mockImplementation(() => new Promise(() => {})); // Pending state
    render(<ConversationView conversationId={conversationId} />);
    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
  });

  test('renders conversation messages when loaded', async () => {
    render(<ConversationView conversationId={conversationId} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    });

    // Check if messages are displayed
    expect(screen.getByText('Hello Agent!')).toBeInTheDocument();
    expect(screen.getByText('Hello User! How can I help?')).toBeInTheDocument();
    // Check for input area
    expect(screen.getByPlaceholderText(/Type your message.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  test('renders error message if fetching messages fails', async () => {
    const errorMessage = 'Failed to load messages';
    mockGetMessages.mockRejectedValue(new Error(errorMessage));
    render(<ConversationView conversationId={conversationId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading messages/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Hello Agent!')).not.toBeInTheDocument();
    // Input might still be rendered, or might be disabled
  });

  test('allows user to type and send a new message', async () => {
    const user = userEvent.setup();
    render(<ConversationView conversationId={conversationId} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    });

    const inputField = screen.getByPlaceholderText(/Type your message.../i);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    const newMessageContent = 'This is a new message from the user.';

    // Type message
    await user.type(inputField, newMessageContent);
    expect(inputField).toHaveValue(newMessageContent);

    // Click send
    await user.click(sendButton);

    // Check if createMessage was called
    await waitFor(() => {
      expect(mockCreateMessage).toHaveBeenCalledTimes(1);
      expect(mockCreateMessage).toHaveBeenCalledWith({
        conversation_id: conversationId,
        content: newMessageContent,
        sender_type: 'user', // Assuming sender_type is set correctly
        // metadata might be added automatically
      });
    });

    // Check if input field is cleared after sending (assuming this behavior)
    expect(inputField).toHaveValue('');
  });

  test('shows error if sending message fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to send message';
    mockCreateMessage.mockRejectedValue(new Error(errorMessage));
    render(<ConversationView conversationId={conversationId} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    });

    const inputField = screen.getByPlaceholderText(/Type your message.../i);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    const newMessageContent = 'This message will fail.';

    await user.type(inputField, newMessageContent);
    await user.click(sendButton);

    // Check if createMessage was called
    await waitFor(() => {
      expect(mockCreateMessage).toHaveBeenCalledTimes(1);
    });

    // Check if an error message is displayed (requires component implementation)
    // Example: expect(screen.getByText(/Error sending message/i)).toBeInTheDocument();

    // Check if input field is NOT cleared
    expect(inputField).toHaveValue(newMessageContent);
     // TODO: Add assertion for visible error message once implemented
  });

  test('disables send button when input is empty', async () => {
    render(<ConversationView conversationId={conversationId} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /Send/i });
    expect(sendButton).toBeDisabled(); // Assuming button is disabled when input is empty
  });
});

