import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {
    ignores: ["**/dist/*"],
  },
  {
    // Ignore the dist folder
    files: ["**/*.{ts, js}"]
  },
  {
    "rules": {
      "quotes": ["error", "single"],
      // we want to force semicolons
      "semi": ["error", "always"],
      // we use 2 spaces to indent our code
      "indent": ["error", 2],
      // we want to avoid extraneous spaces
      "no-multi-spaces": ["error"]
    }
  },    
  { 
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];