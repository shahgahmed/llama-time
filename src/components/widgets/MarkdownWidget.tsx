'use client';

import { MarkdownData, MarkdownConfig } from '@/types/dashboard';

interface MarkdownWidgetProps {
  title: string;
  data?: MarkdownData;
  config: MarkdownConfig;
}

export default function MarkdownWidget({ title, data, config }: MarkdownWidgetProps) {
  const content = data?.content || config.content || 'No content available for this widget.';
  
  // Debug log to see what content we're getting
  console.log('MarkdownWidget content:', { 
    title, 
    dataContent: data?.content, 
    configContent: config.content,
    finalContent: content.substring(0, 100) + '...'
  });

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Markdown</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <div 
            className="text-gray-900 dark:text-gray-100 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced markdown renderer with Linear-inspired styling
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3 tracking-tight border-b border-gray-200 dark:border-gray-800 pb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4 tracking-tight">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 tracking-tight">$1</h1>')
    
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto my-4 leading-relaxed"><code>$1</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700">$1</code>')
    
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
    
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
    
    // Unordered lists
    .replace(/^\* (.+)$/gim, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300 leading-relaxed mb-1">$1</li>')
    
    // Ordered lists
    .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300 leading-relaxed mb-1">$1</li>')
    
    // Paragraphs (convert double newlines to paragraphs)
    .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">')
    
    // Single line breaks
    .replace(/\n/g, '<br/>')
    
    // Wrap in initial paragraph if content doesn't start with a heading
    .replace(/^(?!<[h1-6])/i, '<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">')
    
    // Close final paragraph
    + '</p>';
} 