'use client';

import { useState, useRef } from 'react';
import { ChatMessage } from '@/types/llama';
import Navigation from '@/components/Navigation';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setSelectedImage(base64);
      setError('');
    } catch (error) {
      console.error('Failed to process image:', error);
      setError('Failed to process image');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input || 'What does this image contain?',
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    const imageData = selectedImage;
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);
    setError('');

    try {
      const requestBody: { message?: string; image?: string } = {};
      if (messageText) requestBody.message = messageText;
      if (imageData) requestBody.image = imageData;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metrics: data.metrics,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-5xl mx-auto">
        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Start a conversation</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Ask questions, request analysis, or upload images for AI-powered insights.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className="group">
                      <div className="flex items-start space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          message.role === 'user' 
                            ? 'bg-[#3b82f6] text-white' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {message.role === 'user' ? 'U' : 'L'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-200">
                              {message.role === 'user' ? 'You' : 'Llama'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {message.image && (
                            <div className="mb-3">
                              <img
                                src={`data:image/jpeg;base64,${message.image}`}
                                alt="Uploaded"
                                className="max-w-sm h-auto rounded-md border border-gray-700"
                              />
                            </div>
                          )}
                          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.metrics && (
                            <div className="mt-3 p-3 bg-gray-800 rounded-md border border-gray-700">
                              <div className="text-xs text-gray-400 mb-2">API Metrics</div>
                              <div className="grid grid-cols-2 gap-4">
                                {message.metrics.map((metric, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-xs text-gray-400 capitalize">
                                      {metric.metric.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="text-xs text-gray-300">
                                      {metric.value} {metric.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="group">
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-medium">
                          L
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-200">Llama</span>
                            <span className="text-xs text-gray-500">thinking...</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-800">
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Image Upload Area */}
              {!selectedImage && (
                <div 
                  className={`mb-4 border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-[#FEC601] bg-[#FEC601]/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400 mb-2">
                    Drag and drop an image here, or
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#FEC601] hover:text-[#E6B301] text-sm underline font-medium"
                  >
                    click to select
                  </button>
                </div>
              )}

              {/* Selected Image Preview */}
              {selectedImage && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={`data:image/jpeg;base64,${selectedImage}`}
                    alt="Selected"
                    className="max-w-xs h-auto rounded-md border border-gray-700"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Text Input */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedImage ? "Ask a question about this image..." : "Type your message..."}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#FEC601] focus:border-transparent resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="px-6 py-3 bg-[#FEC601] hover:bg-[#E6B301] disabled:bg-gray-700 disabled:cursor-not-allowed text-black rounded-md font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md disabled:shadow-none disabled:text-gray-400"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 