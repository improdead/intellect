"use client";

import React from "react";
import InteractiveSVG from "./interactive-svg";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  svgData?: string;
}

export function MarkdownRenderer({ content, className = "", svgData }: MarkdownRendererProps) {
  // Simple function to convert markdown-like syntax to HTML
  const formatText = (text: string) => {
    // Handle code blocks with SVG content
    const codeBlockRegex = /```html\n([\s\S]*?)\n```/g;
    text = text.replace(codeBlockRegex, (match, code) => {
      // If it's an SVG code block, wrap it in a div with special styling
      if (code.trim().startsWith('<svg') && code.trim().endsWith('</svg>')) {
        return `<div class="my-4 p-4 bg-muted/30 rounded-lg overflow-hidden interactive-svg">${code}</div>`;
      }
      // Otherwise, format as a regular code block
      return `<pre class="my-4 p-4 bg-muted/30 rounded-lg overflow-x-auto"><code>${code}</code></pre>`;
    });

    // Handle headers
    text = text.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>');

    // Handle bold and italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Handle links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

    // Handle lists
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul class="list-disc pl-6 my-2">$&</ul>');

    // Handle paragraphs (any line that's not a header or list)
    text = text.replace(/^([^<].+)$/gm, '<p class="my-2">$1</p>');

    // Handle line breaks
    text = text.replace(/\n/g, '');

    return text;
  };

  // If we have direct SVG data, render it using the InteractiveSVG component
  const renderSvgData = () => {
    if (!svgData) return null;

    // Add a title to the SVG container
    return (
      <div className="mt-8 mb-4">
        <h3 className="text-xl font-bold mb-3">Interactive Visualization</h3>
        <InteractiveSVG svgData={svgData} />
        <p className="text-sm text-muted-foreground mt-2">Interact with the visualization by hovering over or clicking on elements</p>
      </div>
    );
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: formatText(content) }} />
      {renderSvgData()}
    </div>
  );
}
