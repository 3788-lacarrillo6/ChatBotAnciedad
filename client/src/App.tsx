import React, { useState, useEffect, useRef } from 'react';
import './index.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const modules: Module[] = [
  {
    id: 'chat',
    name: 'Chat',
    icon: 'chat',
    description: 'AI Assistant'
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'document',
    description: 'Document Analysis'
  },
  {
    id: 'code',
    name: 'Code',
    icon: 'code',
    description: 'Code Assistant'
  },
  {
    id: 'images',
    name: 'Images',
    icon: 'image',
    description: 'Image Generation'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    description: 'Configuration'
  }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId] = useState<number>(Math.floor(Math.random() * 1000000));
  const [activeModule, setActiveModule] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const createMessage = (content: string, sender: 'user' | 'ai'): Message => ({
    id: `${Date.now()}_${Math.random()}`,
    content,
    sender,
    timestamp: new Date()
  });

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = createMessage(input.trim(), 'user');
    const currentInput = input.trim();
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          thread_id: threadId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

 const aiResponse = await response.json(); // Usar .json() en lugar de .text()
const aiMessage = createMessage(aiResponse.response, 'ai');
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = createMessage(
        'Sorry, I encountered an error. Please try again.',
        'ai'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (iconName: string) => {
    const icons = {
      chat: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      document: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
      code: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      image: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="m12 1 0 6m0 6 0 6m11-7-6 0m-6 0-6 0" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6.73 17.73c-1.18-1.18-1.18-3.05 0-4.24l.71-.7M6.73 6.27c-1.18 1.18-1.18 3.05 0 4.24l.71.71M17.27 6.27c1.18 1.18 1.18 3.05 0 4.24l-.71.71M17.27 17.73c1.18-1.18 1.18-3.05 0-4.24l-.71-.7" />
        </svg>
      ),
      menu: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )
    };
    return icons[iconName as keyof typeof icons] || icons.chat;
  };

  const renderModuleContent = () => {
    if (activeModule === 'chat') {
      return (
        <>
          <div className="chat-container" ref={chatContainerRef}>
            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p>Start a conversation with AI</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="message ai loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="send-button"
              >
                {loading ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" className="loading-spinner" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22,2 15,22 11,13 2,9 22,2" />
                  </svg>
                )}
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </>
      );
    }

    // Other modules placeholder
    return (
      <div className="module-placeholder">
        <div className="placeholder-icon">
          {getIcon(modules.find(m => m.id === activeModule)?.icon || 'chat')}
        </div>
        <h2>{modules.find(m => m.id === activeModule)?.name}</h2>
        <p>{modules.find(m => m.id === activeModule)?.description}</p>
        <div className="coming-soon">Coming Soon</div>
      </div>
    );
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {getIcon('menu')}
          </button>
          {!sidebarCollapsed && (
            <div className="sidebar-title">
              <h1>AI Assistant</h1>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
              onClick={() => setActiveModule(module.id)}
              title={sidebarCollapsed ? module.name : ''}
            >
              <div className="nav-icon">
                {getIcon(module.icon)}
              </div>
              {!sidebarCollapsed && (
                <div className="nav-content">
                  <span className="nav-name">{module.name}</span>
                  <span className="nav-description">{module.description}</span>
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderModuleContent()}
      </div>
    </div>
  );
};

export default App;