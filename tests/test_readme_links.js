const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Testing framework: Node.js built-in assertions with custom test runner
// Using native Node.js modules to avoid introducing new dependencies

describe('README Link Validation Tests', () => {
  let readmeContent;
  
  beforeAll(() => {
    // Read README.md file
    const readmePath = path.join(__dirname, '..', 'README.md');
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    } else {
      throw new Error('README.md file not found');
    }
  });

  describe('File Structure and Content Validation', () => {
    test('should have README.md file present', () => {
      expect(readmeContent).toBeDefined();
      expect(readmeContent.length).toBeGreaterThan(0);
    });

    test('should have proper markdown structure with headers', () => {
      const headers = readmeContent.match(/^#{1,6}\s+.+$/gm);
      expect(headers).toBeTruthy();
      expect(headers.length).toBeGreaterThan(5);
    });

    test('should contain all required sections', () => {
      const requiredSections = [
        'Features',
        'Technology Stack',
        'Getting Started',
        'Installation',
        'Building for Production',
        'Project Structure',
        'Configuration',
        'Security',
        'Testing',
        'Contributing',
        'License',
        'Support'
      ];

      requiredSections.forEach(section => {
        expect(readmeContent).toMatch(new RegExp(`#{1,6}.*${section}`, 'i'));
      });
    });

    test('should have proper emoji usage in headers', () => {
      const emojiHeaders = readmeContent.match(/^#{1,6}\s+[🚀✨🤖👥🎧🛒💚📊🛠🔧🔒📈🌍🤝📄🆘]/gmu);
      expect(emojiHeaders).toBeTruthy();
      expect(emojiHeaders.length).toBeGreaterThan(10);
    });
  });

  describe('Link Extraction and Validation', () => {
    let extractedLinks;

    beforeAll(() => {
      // Extract all markdown links [text](url) and bare URLs
      const markdownLinks = readmeContent.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
      const bareUrls = readmeContent.match(/https?:\/\/[^\s\)]+/g) || [];
      
      extractedLinks = [
        ...markdownLinks.map(link => {
          const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          return { text: match[1], url: match[2], type: 'markdown' };
        }),
        ...bareUrls.map(url => ({ text: url, url: url, type: 'bare' }))
      ];
    });

    test('should extract links from README content', () => {
      expect(extractedLinks).toBeDefined();
      expect(extractedLinks.length).toBeGreaterThan(0);
    });

    test('should have valid URL formats', () => {
      extractedLinks.forEach(link => {
        if (link.url.startsWith('http')) {
          expect(link.url).toMatch(/^https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/);
        }
      });
    });

    test('should have proper markdown link syntax', () => {
      const markdownLinks = extractedLinks.filter(link => link.type === 'markdown');
      markdownLinks.forEach(link => {
        expect(link.text).toBeTruthy();
        expect(link.text.length).toBeGreaterThan(0);
        expect(link.url).toBeTruthy();
      });
    });

    test('should not have broken relative links', () => {
      const relativeLinks = extractedLinks.filter(link => 
        !link.url.startsWith('http') && !link.url.startsWith('#')
      );
      
      relativeLinks.forEach(link => {
        const filePath = path.join(__dirname, '..', link.url);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Code Block Validation', () => {
    let codeBlocks;

    beforeAll(() => {
      // Extract code blocks
      codeBlocks = readmeContent.match(/```[\s\S]*?```/g) || [];
    });

    test('should have properly formatted code blocks', () => {
      expect(codeBlocks.length).toBeGreaterThan(5);
      
      codeBlocks.forEach(block => {
        expect(block).toMatch(/^```/);
        expect(block).toMatch(/```$/);
      });
    });

    test('should have language-specific code blocks', () => {
      const bashBlocks = codeBlocks.filter(block => block.includes('```bash'));
      const typescriptBlocks = codeBlocks.filter(block => block.includes('```typescript'));
      
      expect(bashBlocks.length).toBeGreaterThan(3);
      expect(typescriptBlocks.length).toBeGreaterThan(0);
    });

    test('should have valid command syntax in bash blocks', () => {
      const bashBlocks = codeBlocks.filter(block => block.includes('```bash'));
      
      bashBlocks.forEach(block => {
        const commands = block.replace(/```bash\n?/, '').replace(/```$/, '').split('\n');
        commands.forEach(command => {
          if (command.trim() && !command.startsWith('#')) {
            // Basic validation for common command patterns
            expect(command).toMatch(/^(git|npm|eas|cp|cd)\s+/);
          }
        });
      });
    });
  });

  describe('Environment Variables Validation', () => {
    test('should document all required environment variables', () => {
      const envVars = [
        'EXPO_PUBLIC_SUPABASE_URL',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY',
        'EXPO_PUBLIC_APP_NAME',
        'EXPO_PUBLIC_EAS_PROJECT_ID'
      ];

      envVars.forEach(envVar => {
        expect(readmeContent).toContain(envVar);
      });
    });

    test('should have proper environment variable format', () => {
      const envVarPattern = /EXPO_PUBLIC_\w+=\w+/g;
      const matches = readmeContent.match(envVarPattern);
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('Technology Stack Validation', () => {
    test('should list all major technologies', () => {
      const technologies = [
        'React Native',
        'Expo',
        'Supabase',
        'OpenAI',
        'TypeScript'
      ];

      technologies.forEach(tech => {
        expect(readmeContent).toContain(tech);
      });
    });

    test('should have version specifications where appropriate', () => {
      expect(readmeContent).toContain('Node.js 18+');
      expect(readmeContent).toContain('Expo Router v5');
    });
  });

  describe('Project Structure Validation', () => {
    test('should document project directory structure', () => {
      const directories = [
        'app/',
        'assets/',
        'components/',
        'hooks/',
        'lib/',
        'supabase/',
        'utils/',
        'types/'
      ];

      directories.forEach(dir => {
        expect(readmeContent).toContain(dir);
      });
    });

    test('should have proper tree structure formatting', () => {
      const treePattern = /├──|└──/g;
      const matches = readmeContent.match(treePattern);
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThan(5);
    });
  });

  describe('Feature Documentation Validation', () => {
    test('should document all major features', () => {
      const features = [
        'Stackie AI Assistant',
        'Professional Community',
        'Media Hub',
        'HR Marketplace',
        'Wellness Hub',
        'Analytics Dashboard'
      ];

      features.forEach(feature => {
        expect(readmeContent).toContain(feature);
      });
    });

    test('should have proper feature descriptions', () => {
      // Each feature should have bullet points describing capabilities
      const bulletPoints = readmeContent.match(/^-\s+.+$/gm);
      expect(bulletPoints).toBeTruthy();
      expect(bulletPoints.length).toBeGreaterThan(15);
    });
  });

  describe('Contact Information Validation', () => {
    test('should have valid email format in support section', () => {
      const emailPattern = /support@stackie\.co\.za/;
      expect(readmeContent).toMatch(emailPattern);
    });

    test('should have documentation URL format', () => {
      const docPattern = /docs\.stackie\.co\.za/;
      expect(readmeContent).toMatch(docPattern);
    });
  });

  describe('Badge and Image Validation', () => {
    test('should have CodeRabbit badge with proper format', () => {
      expect(readmeContent).toContain('![CodeRabbit Pull Request Reviews]');
      expect(readmeContent).toContain('https://img.shields.io/coderabbit/prs');
    });

    test('should have valid badge URL structure', () => {
      const badgeUrls = readmeContent.match(/https:\/\/img\.shields\.io\/[^\)]+/g);
      expect(badgeUrls).toBeTruthy();
      expect(badgeUrls.length).toBeGreaterThan(0);
    });
  });

  describe('Installation Instructions Validation', () => {
    test('should have step-by-step installation process', () => {
      const steps = readmeContent.match(/^\d+\.\s+\*\*[^*]+\*\*/gm);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(4);
    });

    test('should include git clone command with proper format', () => {
      expect(readmeContent).toContain('git clone');
      expect(readmeContent).toMatch(/git clone https:\/\/github\.com\/[\w-]+\/[\w-]+\.git/);
    });

    test('should include npm install command', () => {
      expect(readmeContent).toContain('npm install');
    });
  });

  describe('Build and Deployment Instructions', () => {
    test('should document EAS build commands', () => {
      expect(readmeContent).toContain('eas build');
      expect(readmeContent).toContain('--profile development');
      expect(readmeContent).toContain('--profile production');
    });

    test('should document submission commands', () => {
      expect(readmeContent).toContain('eas submit');
      expect(readmeContent).toContain('--platform all');
    });
  });

  describe('Security Section Validation', () => {
    test('should document security measures', () => {
      const securityFeatures = [
        'Authentication',
        'Authorization',
        'Data Protection',
        'Input Validation',
        'Rate Limiting'
      ];

      securityFeatures.forEach(feature => {
        expect(readmeContent).toContain(feature);
      });
    });

    test('should mention POPIA compliance', () => {
      expect(readmeContent).toContain('POPIA compliance');
    });
  });
});

// Custom test runner for environments without Jest
function runTests() {
  const tests = [];
  let currentDescribe = null;
  let beforeAllCallbacks = [];
  let afterAllCallbacks = [];

  global.describe = (name, fn) => {
    currentDescribe = name;
    console.log(`\n📝 ${name}`);
    fn();
  };

  global.test = (name, fn) => {
    tests.push({ describe: currentDescribe, name, fn });
  };

  global.beforeAll = (fn) => {
    beforeAllCallbacks.push(fn);
  };

  global.afterAll = (fn) => {
    afterAllCallbacks.push(fn);
  };

  global.expect = (actual) => ({
    toBeDefined: () => {
      if (actual === undefined) throw new Error('Expected value to be defined');
    },
    toBeTruthy: () => {
      if (!actual) throw new Error('Expected value to be truthy');
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) throw new Error(`Expected ${actual} to be greater than ${expected}`);
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) throw new Error(`Expected "${actual}" to contain "${expected}"`);
    },
    toMatch: (pattern) => {
      if (!pattern.test(actual)) throw new Error(`Expected "${actual}" to match ${pattern}`);
    },
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${actual} to be ${expected}`);
    }
  });

  // Run beforeAll callbacks
  beforeAllCallbacks.forEach(fn => fn());

  // Run tests
  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test.fn();
      console.log(`  ✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`  ❌ ${test.name}: ${error.message}`);
      failed++;
    }
  });

  // Run afterAll callbacks
  afterAllCallbacks.forEach(fn => fn());

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Export for module usage or run directly
if (require.main === module) {
  // Load and run tests
  try {
    const success = runTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

module.exports = { runTests };