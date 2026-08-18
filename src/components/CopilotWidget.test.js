import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CopilotWidget from './CopilotWidget';
import { executeAgentPipeline } from '../services/llm';

// Mock the async LLM pipeline
jest.mock('../services/llm', () => ({
  executeAgentPipeline: jest.fn()
}));

// Mock the custom hook to prevent React Router side-effects
jest.mock('../hooks/useAgentActions', () => ({
  useAgentActions: () => ({
    executeActions: jest.fn()
  })
}));

describe('CopilotWidget UI Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('renders the floating action button (FAB) by default', () => {
    render(<CopilotWidget />);
    // Chat starts open by default on the first visit
    expect(screen.getByText('Portfolio Copilot')).toBeInTheDocument();
    expect(screen.getByText('WebLLM Engine Active')).toBeInTheDocument();
  });

  test('can collapse and open the chat window when clicking the FAB', () => {
    render(<CopilotWidget />);
    
    // Locate and click the close button inside the header (multiple '✕' buttons exist when open)
    const closeButtons = screen.getAllByRole('button', { name: '✕' });
    // The second button is the close button in the header drawer
    fireEvent.click(closeButtons[1]);

    // Verify chat window is closed and only the FAB remains
    expect(screen.queryByText('Portfolio Copilot')).not.toBeInTheDocument();

    // Click the FAB button to re-open
    const openBtn = screen.getByRole('button');
    fireEvent.click(openBtn);

    // Verify chat is open again
    expect(screen.getByText('Portfolio Copilot')).toBeInTheDocument();
  });

  test('displays suggested quick inquiries and appends answers when clicked', async () => {
    jest.useFakeTimers();
    render(<CopilotWidget />);

    // Check that suggestion pills exist
    const thesisPill = screen.getByText('📚 Read his MS Thesis');
    expect(thesisPill).toBeInTheDocument();

    // Click the thesis suggestion pill
    fireEvent.click(thesisPill);

    // Verify that the user query is appended to messages
    expect(screen.getByText("Tell me about David's Master's Thesis topic and findings.")).toBeInTheDocument();

    // Fast-forward mock timer to skip simulated pipeline logging step timings (1.2 seconds total)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Verify the bot answer bubble is successfully appended
    await waitFor(() => {
      expect(screen.getByText(/Throughput Prediction on Parallel File Systems using Machine Learning/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('allows typing and sending a custom query, triggering the LLM pipeline', async () => {
    executeAgentPipeline.mockResolvedValue({
      success: true,
      answer: "This is a mock response from the unblocked client-side LLM engine.",
      actions: []
    });

    render(<CopilotWidget />);

    // Locate custom prompt input and submit button
    const input = screen.getByPlaceholderText('Ask a custom question...');
    const submitBtn = screen.getByRole('button', { name: 'Ask' });

    // Type a custom query
    fireEvent.change(input, { target: { value: "Where is David working?" } });
    fireEvent.click(submitBtn);

    // Verify user query is logged in-chat
    expect(screen.getByText("Where is David working?")).toBeInTheDocument();

    // Verify LLM pipeline function was called with conversational memory history
    expect(executeAgentPipeline).toHaveBeenCalledWith("Where is David working?", expect.any(Function), expect.any(Array));

    // Verify mock response is appended after promise resolution
    await waitFor(() => {
      expect(screen.getByText("This is a mock response from the unblocked client-side LLM engine.")).toBeInTheDocument();
    });
  });
});
