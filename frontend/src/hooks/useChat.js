/**
 * useChat — handles chat interactions with the AI financial advisor
 */
import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/chatService';

export function useChat(businessId = '550e8400-e29b-41d4-a716-446655440001') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    try {
      setLoading(true);
      setError(null);

      // Add user message to history
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }]);

      // Get AI response
      const response = await sendChatMessage(businessId, userMessage, messages);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }]);

      return response.message;
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      const fallbackMessage = "I'm having trouble connecting right now. Please try again.";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date()
      }]);
      return fallbackMessage;
    } finally {
      setLoading(false);
    }
  }, [businessId, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}
