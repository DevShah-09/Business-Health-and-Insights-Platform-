/**
 * Chat Service — wraps POST /businesses/{bid}/chat
 */
import api from './api';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';

/**
 * Send a message to the AI assistant.
 * @param {string} businessId - Business ID
 * @param {string} message - User's message
 * @param {Array}  history - Previous messages [ { role, content } ]
 */
export const sendChatMessage = (businessId = BUSINESS_ID, message, history = []) =>
  api.post(`/businesses/${businessId}/chat`, { 
    message, 
    conversation_history: history 
  }).then((r) => r.data);
