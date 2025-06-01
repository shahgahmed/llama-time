'use client';

import { useState, useRef } from 'react';
import { ChatMessage } from '@/types/llama';
import Navigation from '@/components/Navigation';

export default function Home() {
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
                            ? 'bg-[#238636] text-white' 
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
                          <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.metrics && (
                            <div className="mt-3 pt-3 border-t border-gray-800">
                              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                {message.metrics.map((metric, i) => (
                                  <span key={i}>
                                    {metric.metric}: {metric.value} {metric.unit}
                                  </span>
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
                        <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-300">
                          L
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-200">Llama</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            <span className="text-sm text-gray-400 ml-2">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-6 py-3 bg-red-900/20 border-t border-red-800/30">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {selectedImage && (
              <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`data:image/jpeg;base64,${selectedImage}`}
                      alt="Selected"
                      className="w-10 h-10 object-cover rounded border border-gray-700"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-200">Image attached</p>
                      <p className="text-xs text-gray-400">Ready to send</p>
                    </div>
                  </div>
                  <button
                    onClick={removeImage}
                    className="text-gray-400 hover:text-gray-200 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-800 p-6">
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question or describe what you need..."
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#238636] resize-none text-sm"
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
                    isDragging
                      ? 'border-[#238636] bg-[#238636]/5'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-1">
                      <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">
                        Drop an image or click to upload
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>⌘ + Enter to send</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Connected</span>
                    </div>
                    <span>{messages.length} messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
