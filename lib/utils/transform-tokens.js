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
export const kebabize = (str) => {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
};
// find values with px unit
export function isPx(value) {
  return /[\d\.]+px$/.test(value);
}

const BASE_REM = 16;
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

// transform: px to rem
StyleDictionaryPackage.registerTransform({
  name: "pxToRem",
  type: "value",
  transformer: (token) => {
    if (isPx(token.value)) {
      const baseFontSize = 16;
      const floatValue = parseFloat(token.value.replace("px", ""));
      if (isNaN(floatValue)) {
        return token.value;
      }
      if (floatValue === 0) {
        return "0";
      }
      return `${floatValue / baseFontSize}rem`;
    }
    return token.value;
  },
});

const prefixes = [
  "theme-dark-",
  "base-",
  "theme-light-",
  "helium-",
  "-desktops-lg-sizes",
  "-desktops-md-sizes",
  "-touchscreens-sm-sizes",
  "-fluid-touchscreens-sm",
  "-fluid-desktops-md",
  "-fluid-desktops-lg",
  "-fixed-default",
  "-sizes",
  "-dark",
  "-light",
  "shape-"
];

const regex = new RegExp(prefixes.join("|"), "g");

StyleDictionaryPackage.registerTransform({
  name: "name/cleanPrefix",
  type: "name",
  matcher: function (token) {
    return true; // Apply this transform to all tokens
  },
  transformer: function (token) {
    let name = token.name;
    
    // Specific replacement for tokens of type 'spacing'
    if (token.type === 'spacing') {
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
        .map((token) => {
          let tokenName = token.name;

          // Check if the token uses a reference
          if (dictionary.usesReference(token.original.value)) {
            const refs = dictionary.getReferences(token.original.value);
            refs.forEach((ref) => {
              // Replace the reference with the actual value using CSS variables
              token.value = token.value.replace(
                ref.value,
                `var(--${ref.name.replace(/base/g, "")})`
              );
            });
          }

          return `  --${tokenName}: ${token.value};`;
        })
        .join("\n")}
    }`;
  },
});

function cleanSCSSFiles(theme) {
  return new Promise((resolve, reject) => {
    const headerComment = "/* This file has been auto-generated from the convert-design-tokens / transform-tokens process. Don't edit directly. */\n";
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const baseDir = path.dirname(__dirname);
    const scssPath = path.join(baseDir, "styles/generated-styles", `${theme}.scss`);

    fs.readFile(scssPath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file from disk: ${err}`);
        reject(err);
      } else {
        let finalContent = headerComment; // Start with the header comment
        if (theme === "base") {
          // Simply append the original content for the base theme
          finalContent += data;
          fs.writeFile(scssPath, finalContent, "utf8", (err) => {
            if (err) {
              console.error(`Error writing file: ${err}`);
              reject(err);
            } else {
              console.log("base.scss updated successfully with header comment.");
              resolve();
            }
          });
        } else {
          // Handle other themes with additional processing
          let suffix = "";
          switch (theme) {
            case "text-sm":
              suffix = "-fluid-sm";
              break;
            case "text-lg":
              suffix = "-fluid-lg";
              break;
            case "space-lg":
              suffix = "-lg";
              break;
            case "space-sm":
              suffix = "-sm";
              break;
              case "space-md":
              suffix = "-md";
              break;
          }
          const lines = data.split("\n");
          const filteredLines = lines
            .map((line, index, arr) => {
              if (line.includes("--") && suffix) {
                line = line.replace(/(--[\w-]+):/g, `$1${suffix}:`);
              }
              if (line.includes(":root {") || line.trim() === "}" || line.includes("shadow") || line.includes("var(")) {
                return line;
              } else if (arr[index - 1].includes(":root {") && arr[index + 1].trim() === "}") {
                return "  /* No variables */"; // Avoid removing empty :root blocks
              }
              return null; // Filter out lines that don't include 'var('
            })
            .filter((line) => line !== null)
            .join("\n");

          finalContent += filteredLines; // Append processed content

          fs.writeFile(scssPath, finalContent, "utf8", (err) => {
            if (err) {
              console.error(`Error writing file: ${err}`);
              reject(err);
            } else {
              console.log(`${theme}.scss cleaned and updated successfully with '${suffix}' suffix.`);
              resolve();
            }
          });
        }
      }
    });
  });
}

function createThemerSCSS() {
  const __dirname = fileURLToPath(new URL(".", import.meta.url)); // Define __dirname using import.meta.url
  const baseDir = path.dirname(__dirname); // Get the base directory
  const paths = {
    themeDark: path.join(baseDir, "styles/generated-styles", "theme-dark.scss"),
    themeLight: path.join(baseDir, "styles/generated-styles", "theme-light.scss"),
    base: path.join(baseDir, "styles/generated-styles", "base.scss"),
    shape: path.join(baseDir, "styles/generated-styles", "shape.scss"),
    spaceFixed: path.join(baseDir, "styles/generated-styles", "space-fixed.scss"),
    spaceLg: path.join(baseDir, "styles/generated-styles", "space-lg.scss"),
    spaceMd: path.join(baseDir, "styles/generated-styles", "space-md.scss"),
    spaceSm: path.join(baseDir, "styles/generated-styles", "space-sm.scss"),
    textLg: path.join(baseDir, "styles/generated-styles", "text-lg.scss"),
    textMd: path.join(baseDir, "styles/generated-styles", "text-md.scss"),
    textSm: path.join(baseDir, "styles/generated-styles", "text-sm.scss"),
  };
  const themerPath = path.join(baseDir, "styles", "btcm-theme.scss"); // Path to the themer.scss file

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
          const filteredLines = rootContent
            .split("\n")
            .join("\n");
          resolve(filteredLines);
        }
      });
    });
  }

  // Process all theme files and combine the results
  Promise.all(Object.values(paths).map((path) => extractFilteredContent(path)))
    .then(([darkThemeVariables, lightThemeVariables, ...otherStyles]) => {
      const themedData = `// This file has been auto-generated from the convert-design-tokens / transform-tokens process. Don't edit directly.\n:root {\n${otherStyles.join("\n")}\n}\n:root.light {\n${lightThemeVariables}\n}\n:root.dark {\n${darkThemeVariables}\n}`;
      fs.writeFile(themerPath, themedData, "utf8", (err) => {
        if (err) {
          console.error(`Error writing to btcm-theme.scss: ${err}`);
        } else {
          console.log(
            "btcm-theme.scss created successfully with variables under :root, :root.light, and :root.dark."
          );
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

StyleDictionaryPackage.registerTransform({
  name: "shadow/css",
  type: "value",
  // necessary in case the color is an alias reference, or the shadows themselves are aliased
  transitive: true,
  matcher: (token) => token.type === 'boxShadow',
  transformer: (token) => {
    // allow both single and multi shadow tokens

    const shadow = Array.isArray(token.value) ? token.value : [token.value];
    const value = shadow.map((s) => {
      const { x, y, blur, color, type } = s;
      // support inset shadows as well
      return `${type === 'innerShadow' ? 'inset ' : ''}${x / BASE_REM}rem ${y / BASE_REM}rem ${blur  / BASE_REM}rem ${color} `;
    });
    return value.join(', ');
  },
});

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
          "pxToRem",
          "name/cleanPrefix",
          "shadow/css"
        ],
        buildPath: `lib/styles/generated-styles/`,
      },
    },
  };
}


async function processThemes() {
  console.log("Build started...");

  const themes = ["base", "theme-dark", "theme-light", "text-sm", "text-md", "text-lg", "space-lg", "space-md", "space-sm", "space-fixed", "shape"];
  for (const theme of themes) {
    const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(theme));
    StyleDictionary.buildPlatform("web");
    await cleanSCSSFiles(theme);  // Await the cleaning process
  }
  createThemerSCSS();  // Once all themes are processed, create Themer SCSS
}

console.log("Build started...");
processThemes().then(() => {
  console.log("\n==============================================");
  console.log("\nBuild completed!");
});