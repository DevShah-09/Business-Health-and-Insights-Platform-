/**
 * Chat Service — wraps POST /chat
 */
import api from './api';

/**
 * Send a message to the AI assistant.
 * @param {string} message - User's message
 * @param {Array}  history - Previous messages [ { role, content } ]
 */
export const sendChatMessage = (message, history = []) =>
  api.post('/chat', { message, history }).then((r) => r.data);
