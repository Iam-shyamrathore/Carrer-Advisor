import { useState, useEffect, useRef, FormEvent } from 'react';
import api from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && userId && milestoneText && !sessionId) {
      const createSession = async () => {
        setIsLoading(true);
        try {
          const response = await api.post('/api/v1/troubleshooting/sessions', {
            userId,
            milestoneText,
          });
          setSessionId(response.data.id);
          setMessages([]);
        } catch (error) {
          console.error("Failed to create chat session", error);
          onClose(); // Close modal if session creation fails
        } finally {
          setIsLoading(false);
        }
      };
      createSession();
    } else if (!isOpen) {
      setSessionId(null); // Reset session when modal is closed
    }
  }, [isOpen, userId, milestoneText, sessionId, onClose]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[85vh] max-w-4xl flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <DialogHeader className="pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                AI Career Coach
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-normal">Online</span>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-sm text-slate-400">
                  Getting help with: <span className="text-cyan-400 font-medium italic">{milestoneText}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 my-4 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && sessionId && (
            <div className="flex justify-start">
              <div className="max-w-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-slate-700/30">
                    <p className="text-slate-200 leading-relaxed">
                      👋 Hi! I'm your AI Career Coach. I'm here to help you with "<span className="text-cyan-400 font-medium">{milestoneText}</span>".
                    </p>
                    <p className="text-slate-300 mt-2 text-sm">
                      Feel free to ask me:
                    </p>
                    <ul className="text-slate-400 text-sm mt-2 space-y-1 list-disc list-inside pl-2">
                      <li>Specific questions about this milestone</li>
                      <li>What steps to take next</li>
                      <li>Resources or tools you might need</li>
                      <li>How to overcome challenges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start gap-3">
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className={`${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-sm order-1' 
                      : 'bg-slate-800/60 backdrop-blur-sm text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/30 order-2'
                  } p-4 shadow-lg`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
                <div className={`text-xs text-slate-500 mt-1 ${msg.role === 'user' ? 'text-right pr-11' : 'text-left pl-11'}`}>
                  {msg.role === 'user' ? 'You' : 'AI Coach'} • just now
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-slate-700/30">
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm italic">AI Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <DialogFooter className="border-t border-slate-700/50 pt-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sessionId ? "Ask me anything about this milestone..." : "Initializing chat..."}
                disabled={isLoading || !sessionId}
                className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 pr-12 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300 h-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs">Enter</kbd>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !sessionId || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-0.5 h-12 px-6"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </div>
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI responses may not always be accurate. Use your best judgment.
            </div>
            <div className="flex items-center gap-1">
              {sessionId && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected</span>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(51 65 85 / 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.6);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105 / 0.8);
        }
      `}</style>
    </Dialog>
  );
}