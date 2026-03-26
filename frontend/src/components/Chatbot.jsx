import React, { useState, useRef, useEffect, useMemo } from 'react';
import API from '../services/api';

const Chatbot = ({ activePortfolio, portfolios = [] }) => {
  const accentColor = 'oklch(84.5% 0.143 164.978)';
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const activePortfolioMeta = useMemo(() => {
    if (!activePortfolio) return null;
    return portfolios.find(
      (portfolio) => String(portfolio.id) === String(activePortfolio)
    ) || null;
  }, [activePortfolio, portfolios]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async (e, customMessage = null, isRecommendation = false) => {
    if (e) e.preventDefault();
    const finalMessage = customMessage || message;
    if (!finalMessage.trim() && !isRecommendation) return;

    const userMessage = { role: 'user', content: isRecommendation ? "💡 Get Recommendations" : finalMessage };
    setHistory(prev => [...prev, userMessage]);
    if (!customMessage) setMessage('');
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("user_id");
      const response = await API.post('chatbot/chat/', {
        message: isRecommendation ? "Please provide some stock recommendations for me." : finalMessage,
        history: history,
        user_id: userId,
        recommendation: isRecommendation,
        current_portfolio_id: activePortfolio || null,
        current_portfolio_name: activePortfolioMeta?.name || null,
        current_portfolio_type: activePortfolioMeta?.type || null,
      });
      const botMessage = { role: 'assistant', content: response.data.response };
      setHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: accentColor }}
        className="text-black p-4 rounded-full shadow-lg transition-all duration-300 hover:opacity-90"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div style={{ backgroundColor: accentColor }} className="p-4 text-black font-bold flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>StockSense</span>
              </div>
              {activePortfolioMeta?.name && (
                <p className="text-[11px] font-medium text-black/75 mt-1">
                  Focus: {activePortfolioMeta.name}
                </p>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black hover:text-black/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {history.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p className="mb-4">Hello! How can I help you with your stock portfolio today?</p>
                <button
                  onClick={() => handleSend(null, null, true)}
                  style={{ color: 'black', borderColor: accentColor, backgroundColor: 'color-mix(in srgb, oklch(84.5% 0.143 164.978) 12%, white)' }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center gap-2 mx-auto hover:bg-[rgba(129,140,248,0.1)]"
                >
                  <span>💡 Get Recommendations</span>
                </button>
              </div>
            )}
            {history.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  style={msg.role === 'user' ? { backgroundColor: accentColor, color: 'black' } : {}}
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => handleSend(null, null, true)}
                className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>💡 Get Recommendations</span>
              </button>
              <button
                onClick={() => handleSend(null, "How is the market performing today?")}
                className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 transition-colors whitespace-nowrap"
              >
                📊 Market Status
              </button>
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about stocks, portfolios..."
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm text-gray-900 focus:ring-2 outline-none"
                style={{ '--tw-ring-color': accentColor }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                style={{ backgroundColor: accentColor }}
                className="disabled:opacity-50 text-black p-2 rounded-xl transition-colors shadow-md hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
