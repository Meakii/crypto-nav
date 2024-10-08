import rawTokens from '../../tokens/tokens.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';

// Ensure necessary directories exist for file paths
ensureDirectoryExistence(['./lib/tokens']);

// Mapping of set names to file names
const tokenSets = {
    'base': 'base',
    'theme/dark': 'theme-dark',
    'theme/light': 'theme-light',
    // 'text-fluid/desktops-md': 'text-md',
    // 'text-fluid/touchscreens-sm': 'text-sm',
    // 'text-fluid/desktops-lg': 'text-lg',
    // 'space-fluid/desktops-lg': 'space-lg',
    // 'space-fluid/desktops-md': 'space-md',
    // 'space-fluid/touchscreens-sm': 'space-sm',
    // 'space-fixed': 'space-fixed',
    // 'shape': 'shape'
};

// Process each token set
Object.entries(tokenSets).forEach(([setName, fileName]) => {
    const tokens = filterTokensBySetName(rawTokens, setName);
    const prefixedTokens = addPrefixToTokens(tokens, 'base');
    const mergedTokens = setName === 'base' ? prefixedTokens : { ...filterTokensBySetName(rawTokens, 'base'), ...prefixedTokens };
    fs.writeFileSync(`./lib/tokens/${fileName}.json`, JSON.stringify(mergedTokens, null, 2));
});

// Function to filter tokens by set name
function filterTokensBySetName(tokens, setName) {
  const filtered = {};
  Object.keys(tokens).forEach(key => {
    if (key.startsWith(setName)) {
      filtered[key] = tokens[key];
    }
  });
  return filtered;
}

// function addPrefixToTokens(obj, prefix) {
//   Object.keys(obj).forEach((key) => {
//     if (typeof obj[key] === 'string') {
//       // Check if the string includes 'color.', 'text.sizes', or 'space'
//       if (obj[key].includes('color.') || obj[key].includes('text.sizes') || obj[key].includes('{size.') || obj[key].includes('{border-width')   ) {
//         obj[key] = `{${prefix}.${obj[key].slice(1, -1)}}`;
//       }
//     } else if (obj[key] !== null && typeof obj[key] === 'object') {
//       // Recursively apply the function to nested objects
//       addPrefixToTokens(obj[key], prefix);
//     }
//   });
//   return obj;
// }

function addPrefixToTokens(obj) {
  Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string' && obj[key].startsWith('{') && obj[key].endsWith('}')) {
          // Remove existing braces and add the base prefix
          const tokenPath = obj[key].slice(1, -1);
          obj[key] = `{base.${tokenPath}}`;
      } else if (obj[key] !== null && typeof obj[key] === 'object') {
          // Recursively apply the function to nested objects
          addPrefixToTokens(obj[key]);
      }
  });
  return obj;
}

// Function to recursively ensure the existence of directories for given file paths
function ensureDirectoryExistence(filePaths) {
  filePaths.forEach((filePath) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      ensureDirectoryExistence([dirname]);
      fs.mkdirSync(dirname);
    }
  });
}
