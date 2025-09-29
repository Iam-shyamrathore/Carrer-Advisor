import { useState, useEffect, useRef, FormEvent } from 'react';
import api from '../lib/api';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneText: string;
  userId: string;
}

export default function ChatModal({ isOpen, onClose, milestoneText, userId }: ChatModalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Create a new chat session when the modal opens for a new milestone
    if (isOpen && userId && milestoneText && !sessionId) {
      const createSession = async () => {
        try {
          const response = await api.post('/api/v1/troubleshooting/sessions', {
            userId,
            milestoneText,
          });
          setSessionId(response.data.id);
          setMessages([]); // Clear previous messages
        } catch (error) {
          console.error("Failed to create chat session", error);
        }
      };
      createSession();
    } else if (!isOpen) {
      // Reset session when modal is closed
      setSessionId(null);
    }
  }, [isOpen, userId, milestoneText, sessionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post(`/api/v1/troubleshooting/sessions/${sessionId}/messages`, {
        content: userMessage.content,
      });
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-3/4 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Coach for: <span className="italic text-blue-300">{milestoneText}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <p className="text-white whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700">
                <p className="text-white italic">Coach is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            <button type="submit" disabled={isLoading} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}