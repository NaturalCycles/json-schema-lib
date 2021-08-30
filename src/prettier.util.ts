import * as prettier from 'prettier'

const prettierConfig = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'avoid',
  proseWrap: 'always',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
} as const

export function prettify(s: string, parser = 'typescript'): string {
  return prettier.format(s, { ...prettierConfig, parser })
}
