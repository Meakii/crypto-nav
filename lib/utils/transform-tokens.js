import StyleDictionaryPackage from "style-dictionary";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

export const kebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("-");

// find values with px unit
export function isPx(value) {
  return /[\d\.]+px$/.test(value);
}

// Helper to check if a value is a hex color
function isHex(value) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

const BASE_REM = 16;

const needsPxSuffix = (tokenName) => {
  return (
    tokenName.startsWith("text-size") ||
    tokenName.startsWith("radius") ||
    tokenName.startsWith("border-width") ||
    tokenName.startsWith("space")
  );
};

// Helper to convert px to rem
const pxToRem = (value) => {
  const BASE_FONT_SIZE = 16;

  // Extract numeric value whether it's a px string or number
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace("px", ""))
      : parseFloat(value);

  // Handle special cases
  if (isNaN(numValue) || numValue === 0) return "0";

  // Convert to rem and remove trailing zeros
  const remValue = numValue / BASE_FONT_SIZE;

  // Convert to string with up to 4 decimal places
  const remString = remValue.toFixed(4);

  // Remove trailing zeros and decimal point if whole number
  return remString.replace(/\.?0+$/, "");
};

StyleDictionaryPackage.registerFormat({
  name: "css/variables",
  formatter: function (dictionary) {
    return `${this.selector} {
        ${dictionary.allProperties
          .map(
            (prop) =>
              `  --${prop.name.replace("colour", "color")}: ${prop.value};`
          )
          .join("\n")}
      }`;
  },
});

// Register the color transform
StyleDictionaryPackage.registerTransform({
  name: "color/hex",
  type: "value",
  matcher: function (token) {
    return isHex(token.value); // Only match tokens with hex color values
  },
  transformer: function (token) {
    return token.value.toLowerCase(); // Return the hex value in lowercase to normalize
  },
});

StyleDictionaryPackage.registerTransform({
  name: "spacing/spacing-shorthand",
  type: "name",
  transitive: true,
  matcher: (token) => token.type === "spacing",
  transformer: (token) => {
    // transform 2-xl into 2xl
    return token.name.replace(/(\d)(?:-)(xl|lg|sm)/, "$1$2");
  },
});

// Updated PX suffix transform with clean decimal handling
StyleDictionaryPackage.registerTransform({
  name: "value/pxSuffix",
  type: "value",
  matcher: function (token) {
    return (
      token.name.startsWith("text-size") ||
      token.name.startsWith("radius") ||
      token.name.startsWith("border-width") ||
      token.name.startsWith("space")
    );
  },
  transformer: function (token) {
    // Handle zero values
    if (token.value === 0 || token.value === "0") {
      return "0";
    }

    // Convert to rem with clean decimals
    return `${pxToRem(token.value)}rem`;
  },
});

StyleDictionaryPackage.registerTransform({
  name: "shadow/css",
  type: "value",
  transitive: true,
  matcher: (token) => token.type === "boxShadow",
  transformer: (token) => {
    try {
      const shadows = Array.isArray(token.value) ? token.value : [token.value];
      return shadows
        .map(({ x, y, blur, spread, color, type }) => {
          // Convert each measurement to rem
          const xRem = pxToRem(x);
          const yRem = pxToRem(y);
          const blurRem = pxToRem(blur);
          const spreadRem = spread ? ` ${pxToRem(spread)}rem` : ""; // Optional spread value

          return `${
            type === "innerShadow" ? "inset " : ""
          }${xRem}rem ${yRem}rem ${blurRem}rem${spreadRem} ${color}`;
        })
        .join(", ");
    } catch (error) {
      console.error("Error transforming shadow:", error);
      return "none";
    }
  },
});

const prefixes = ["theme-dark-", "base-", "theme-light-"];
const regex = new RegExp(`^(${prefixes.join("|")})`, "g");

StyleDictionaryPackage.registerTransform({
  name: "name/cleanPrefix",
  type: "name",
  matcher: function (token) {
    return true; // Apply this transform to all tokens
  },
  transformer: function (token) {
    let name = token.name;

    // Specific replacement for tokens of type 'spacing'
    if (token.type === "color") {
      name = name.replace(/-fixed-fixed-/g, "-fixed-");
    }

    // General replacement for other prefixes and suffixes
    return name.replace(regex, "");
  },
});

StyleDictionaryPackage.registerFormat({
  name: "css/variables",
  formatter: function (dictionary) {
    return `${this.selector} {
      ${dictionary.allProperties
        .filter((token) => !token.name.startsWith("btcm")) // Filter out btcm tokens
        .map((token) => {
          // Handle token references only if the token value is a string
          if (
            typeof token.value === "string" &&
            dictionary.usesReference(token.original.value)
          ) {
            const refs = dictionary.getReferences(token.original.value);
            refs.forEach((ref) => {
              token.value = token.value.replace(
                ref.value,
                `var(--${ref.name.replace(/base/g, "")})`
              );
            });
          }

          // Handle object values (like typography tokens) by skipping the reference replacement
          if (typeof token.value === "object") {
            return `  --${token.name}: ${JSON.stringify(token.value)};`;
          }

          return `  --${token.name}: ${token.value};`;
        })
        .join("\n")}
    }`;
  },
});

// Process the btcm tokens from the JSON file
function extractBtcmTokens(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(`Error reading ${filePath}: ${err}`);
      } else {
        try {
          const tokens = JSON.parse(data);
          console.log("Full tokens from base.json:", tokens); // DEBUG: Log the full tokens object

          // Access the btcm tokens nested within the base group
          const btcmTokens = tokens.base?.btcm || {};
          console.log("btcmTokens extracted:", btcmTokens); // DEBUG: Log the extracted btcm group

          if (Object.keys(btcmTokens).length === 0) {
            console.warn("Warning: No btcm tokens found in base.json."); // Warn if btcmTokens is empty
          }

          resolve(btcmTokens);
        } catch (parseError) {
          reject(`Error parsing ${filePath}: ${parseError}`);
        }
      }
    });
  });
}

// function createThemerSCSS() {
//   const __dirname = fileURLToPath(new URL(".", import.meta.url));
//   const baseDir = path.dirname(__dirname);
//   const paths = {
//     themeDark: path.join(baseDir, "styles/generated-styles", "theme-dark.scss"),
//     themeLight: path.join(
//       baseDir,
//       "styles/generated-styles",
//       "theme-light.scss"
//     ),
//     base: path.join(baseDir, "styles/generated-styles", "base.scss"),
//   };
//   const themerPath = path.join(baseDir, "styles", "btcm-theme.scss");

//   // Helper function to extract and filter content from a theme file
//   function extractFilteredContent(filePath) {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) {
//           reject(`Error reading ${filePath}: ${err}`);
//         } else {
//           const rootStart = data.indexOf(":root {") + 8;
//           const rootEnd = data.lastIndexOf("}");
//           const rootContent = data.substring(rootStart, rootEnd).trim();
//           // Process each line to remove --base- prefix
//           const processedContent = rootContent
//             .split("\n")
//             .map((line) => line.replace(/--base-/g, "--"))
//             .join("\n");
//           resolve(processedContent);
//         }
//       });
//     });
//   }

//   // Process all theme files and combine the results
//   Promise.all([
//     extractFilteredContent(paths.themeDark),
//     extractFilteredContent(paths.themeLight),
//     extractFilteredContent(paths.base),
//   ])
//     .then(([darkThemeVariables, lightThemeVariables, baseStyles]) => {
//       return extractBtcmTokens(path.join(baseDir, "tokens/base.json")).then(
//         (btcmTokens) => {
//           let btcmClasses = [];

//           // Generate classes from btcm tokens
//           for (const [key, styles] of Object.entries(btcmTokens)) {
//             for (const [styleKey, styleValue] of Object.entries(styles)) {
//               if (styleValue.value) {
//                 // Remove spaces and replace with hyphens, and convert to lowercase
//                 const className = `btcm-${key
//                   .replace(/\s+/g, "-")
//                   .toLowerCase()}-${styleKey
//                   .replace(/\s+/g, "-")
//                   .toLowerCase()}`;

//                 const styleRules = Object.entries(styleValue.value)
//                   .map(([prop, value]) => {
//                     // Convert property to kebab case and lowercase
//                     const cssProp = kebabCase(prop).toLowerCase();

//                     // Process the value to ensure proper variable references
//                     const cssValue = value
//                       .replace(/base/g, "-")
//                       .replace(/SemiBold/g, "semi-bold")
//                       .replace(/[{}]/g, "")
//                       .replace(/\./g, "-")
//                       .trim()
//                       .toLowerCase(); // Convert value to lowercase

//                     // Ensure variable reference is lowercase
//                     const varRef = cssValue.startsWith("--")
//                       ? cssValue
//                       : `--${cssValue}`;
//                     return `${cssProp}: var(${varRef});`;
//                   })
//                   .join("\n  ");

//                 btcmClasses.push(`.${className} {\n  ${styleRules}\n}`);
//               }
//             }
//           }
//           const themedData = `// This file has been auto-generated from the convert-design-tokens / transform-tokens process. Don't edit directly.

// :root {${baseStyles}}
// :root.light {${lightThemeVariables}}
// :root.dark {${darkThemeVariables}}
// /* BTCM Token Classes */
// ${btcmClasses.join("\n\n")}
// `;
//           fs.writeFile(themerPath, themedData, "utf8", (err) => {
//             if (err) {
//               console.error(`Error writing to btcm-theme.scss: ${err}`);
//             } else {
//               console.log(
//                 "btcm-theme.scss created successfully with variables under :root, :root.light, :root.dark, and btcm classes."
//               );
//             }
//           });
//         }
//       );
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

function createThemerSCSS() {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const baseDir = path.dirname(__dirname);
  const paths = {
    themeDark: path.join(baseDir, "styles/generated-styles", "theme-dark.scss"),
    themeLight: path.join(baseDir, "styles/generated-styles", "theme-light.scss"),
    base: path.join(baseDir, "styles/generated-styles", "base.scss"),
  };
  const themerPath = path.join(baseDir, "styles", "btcm-theme.scss");

  // Helper function to convert values to lowercase where appropriate
  function processValue(name, value) {
    // Remove any existing semicolon from the value
    value = value.replace(/;$/, '');
    
    // Check if the variable is a system or brand token
    if (name.includes('system') || name.includes('brand: ')) {
      // Convert the entire value to lowercase and replace spaces with hyphens
      if (value.startsWith('#')) {
        value = `var(${value})`;
      } else {
        value = `var(--${value.toLowerCase().replace(/\s+/g, '-')})`;
      }
    }
    return value;
  }

  // Helper function to format CSS variable blocks without internal line breaks
  function formatCSSBlock(variables, indent = 2) {
    if (!variables) return "";
    
    // Split into lines, remove empty lines, and trim whitespace
    const lines = variables
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Split only on the first colon to preserve any others in the value
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return line.trim();
        
        const name = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/;$/, '');
        
        return `${name}: ${processValue(name, value)};`;
      });

    // Join all lines with consistent indentation
    const indentStr = ' '.repeat(indent);
    return lines.map(line => `${indentStr}${line}`).join('\n');
  }

  // Helper function to extract and filter content from a theme file
  function extractFilteredContent(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(`Error reading ${filePath}: ${err}`);
        } else {
          const rootStart = data.indexOf(":root {") + 8;
          const rootEnd = data.lastIndexOf("}");
          const rootContent = data.substring(rootStart, rootEnd).trim();
          // Process each line to remove --base- prefix
          const processedContent = rootContent
            .split("\n")
            .map(line => line.replace(/--base-/g, "--"))
            .join("\n");
          resolve(processedContent);
        }
      });
    });
  }

  // Process all theme files and combine the results
  Promise.all([
    extractFilteredContent(paths.themeDark),
    extractFilteredContent(paths.themeLight),
    extractFilteredContent(paths.base)
  ])
    .then(([darkThemeVariables, lightThemeVariables, baseStyles]) => {
      return extractBtcmTokens(path.join(baseDir, "tokens/base.json")).then(btcmTokens => {
        let btcmClasses = [];

        // Generate BTCM classes
        for (const [key, styles] of Object.entries(btcmTokens)) {
          for (const [styleKey, styleValue] of Object.entries(styles)) {
            if (styleValue.value) {
              const className = `btcm-${key.replace(/\s+/g, '-').toLowerCase()}-${styleKey.replace(/\s+/g, '-').toLowerCase()}`;

              const styleRules = Object.entries(styleValue.value)
                .map(([prop, value]) => {
                  const cssProp = kebabCase(prop).toLowerCase();
                  const cssValue = value
                    .replace(/base/g, "-")
                    .replace(/SemiBold/g, "semi-bold")
                    .replace(/color/g, "")
                    .replace(/[{}]/g, "")
                    .replace(/\./g, "-")
                    .trim()
                    .toLowerCase();

                  const varRef = cssValue.startsWith("--") ? cssValue : `--${cssValue}`;
                  return `  ${cssProp}: var(${varRef});`;
                })
                .join('\n');

              btcmClasses.push(`.${className} {\n${styleRules}\n}`);
            }
          }
        }

        // Add font family variable to the beginning of baseStyles
        const fontFamilyVariable = "  --ibm-plex-sans: 'IBM Plex Sans', sans-serif;\n";
        const baseStylesWithFont = fontFamilyVariable + formatCSSBlock(baseStyles);

        // Format the final SCSS content with proper spacing
        const themedData = `// This file has been auto-generated from the convert-design-tokens / transform-tokens process. Don't edit directly.

:root {
${baseStylesWithFont}
}

:root.light {
${formatCSSBlock(lightThemeVariables)}
}

:root.dark {
${formatCSSBlock(darkThemeVariables)}
}

/* BTCM Token Classes */
${btcmClasses.join('\n\n')}
`;

        fs.writeFile(themerPath, themedData, "utf8", (err) => {
          if (err) {
            console.error(`Error writing to btcm-theme.scss: ${err}`);
          } else {
            console.log(
              "btcm-theme.scss created successfully with properly formatted variables and classes."
            );
          }
        });
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateSCSSFile(theme, content) {
  return new Promise((resolve, reject) => {
    const headerComment =
      "/* This file has been auto-generated from the convert-design-tokens / transform-tokens process. Don't edit directly. */\n";
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const baseDir = path.dirname(__dirname);
    const scssPath = path.join(
      baseDir,
      "styles/generated-styles",
      `${theme}.scss`
    );

    fs.writeFile(scssPath, headerComment + content, "utf8", (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
        reject(err);
      } else {
        console.log(`${theme}.scss updated successfully.`);
        resolve();
      }
    });
  });
}

function filterSCSSLines(lines, theme) {
  return lines
    .map((line) => {
      // // Remove `--base-` prefix from each line
      // line = line.replace(/--base-/g, '--');
      // line = line.replace(/--color-component-/g, "--color-");
      line = line.replace(/--color/g, "-");

      // Filter and process lines as necessary
      if (
        line.includes(":root {") ||
        line.trim() === "}" ||
        line.includes("shadow") ||
        line.includes("var(") ||
        (line.includes("--color-") && line.includes("rgba")) ||
        (line.includes("--color-") && line.includes("#"))
      ) {
        return line;
      }
      return null; // Filter out lines that don't meet criteria
    })
    .filter((line) => line !== null)
    .join("\n");
}

// Refactored cleanSCSSFiles function
function cleanSCSSFiles(theme) {
  return new Promise((resolve, reject) => {
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const baseDir = path.dirname(__dirname);
    const scssPath = path.join(
      baseDir,
      "styles/generated-styles",
      `${theme}.scss`
    );

    fs.readFile(scssPath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file from disk: ${err}`);
        reject(err);
      } else {
        const lines = data.split("\n");

        let finalContent;
        if (theme === "base") {
          // Simply append the original content for the base theme
          finalContent = data;
        } else {
          finalContent = filterSCSSLines(lines, theme);
        }

        updateSCSSFile(theme, finalContent)
          .then(() => resolve())
          .catch((err) => reject(err));
      }
    });
  });
}

function getStyleDictionaryConfig(theme) {
  return {
    source: [`lib/tokens/${theme}.json`],
    platforms: {
      web: {
        files: [
          {
            destination: `${theme}.scss`,
            format: "css/variables",
            selector: `:root`,
            options: {
              outputReferences: true,
            },
          },
        ],
        transforms: [
          "attribute/cti",
          "name/cti/kebab",
          "spacing/spacing-shorthand",
          "name/cleanPrefix",
          "shadow/css",
          "color/hex",
          "value/pxSuffix",
        ],
        buildPath: `lib/styles/generated-styles/`,
      },
    },
  };
}

async function processThemes() {
  console.log("Build started...");

  const themes = ["base", "theme-dark", "theme-light"];
  // const themes = ["base", "theme-dark", "theme-light", "text-sm", "text-md", "text-lg", "space-lg", "space-md", "space-sm", "space-fixed", "shape"];
  for (const theme of themes) {
    const StyleDictionary = StyleDictionaryPackage.extend(
      getStyleDictionaryConfig(theme)
    );
    StyleDictionary.buildPlatform("web");
    await cleanSCSSFiles(theme); // Await the cleaning process
  }
  createThemerSCSS(); // Once all themes are processed, create Themer SCSS
}

console.log("Build started...");
processThemes().then(() => {
  console.log("\n==============================================");
  console.log("\nBuild completed!");
});
