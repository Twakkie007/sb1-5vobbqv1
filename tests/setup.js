// Test setup for README validation tests
const fs = require('fs');
const path = require('path');

// Global test utilities
global.testUtils = {
  readFile: (relativePath) => {
    const fullPath = path.join(__dirname, '..', relativePath);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : null;
  },
  
  fileExists: (relativePath) => {
    const fullPath = path.join(__dirname, '..', relativePath);
    return fs.existsSync(fullPath);
  },

  extractUrls: (content) => {
    const urlRegex = /https?:\/\/[^\s\)]+/g;
    return content.match(urlRegex) || [];
  },

  extractMarkdownLinks: (content) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }
    return links;
  }
};

// Set up test environment
console.log('🧪 Setting up README link validation tests...');