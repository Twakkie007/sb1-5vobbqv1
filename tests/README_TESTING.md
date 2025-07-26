# README Link Testing Documentation

## Overview
This test suite validates the README.md file for:
- Proper markdown structure
- Valid links and URLs
- Complete documentation sections
- Code block formatting
- Environment variable documentation
- Project structure accuracy

## Running Tests

### Using Node.js directly
```bash
node tests/test_readme_links.js
```

### Using npm (if Jest is configured)
```bash
npm test -- tests/test_readme_links.js
```

## Test Categories

1. **File Structure and Content Validation**
   - README file existence and content
   - Markdown header structure
   - Required sections presence
   - Emoji usage in headers

2. **Link Extraction and Validation**
   - Link extraction from markdown
   - URL format validation
   - Markdown link syntax validation
   - Relative link validation

3. **Code Block Validation**
   - Proper code block formatting
   - Language-specific blocks
   - Command syntax validation

4. **Environment Variables Validation**
   - Required environment variables documentation
   - Proper variable format

5. **Technology Stack Validation**
   - Major technologies listing
   - Version specifications

6. **Project Structure Validation**
   - Directory structure documentation
   - Tree structure formatting

## Adding to Existing Test Suite

If you have Jest configured, add this to your package.json:

```json
{
  "scripts": {
    "test:readme": "node tests/test_readme_links.js",
    "test:all": "npm test && npm run test:readme"
  }
}
```

## Dependencies
- No external dependencies required
- Uses Node.js built-in modules: fs, path, https, http
- Compatible with Jest if available