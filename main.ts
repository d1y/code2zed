import type { ZedHighlightStyleContent, ZedPlayerColorContent, ZedStatusColorsContent, ZedThemeColorsContent } from './zed'
interface VsCodeTokenColor {

}

enum ThemeAppearanceJson {
  dark = "dark",
  light = "light",
}
interface VScodeTheme {
  $schema: string
  type: ThemeAppearanceJson
  semanticClass: string
  semanticHighlighting: boolean
  name: string

  author: string
  maintainers: Array<string>

  color: any/* TODO: codegen with zed rust-code */
  tokenColors: Array<VsCodeTokenColor> /* TODO: codegen with zed rust-code */
}

interface ThemeMetadata {
  name: string
  appearance: ThemeAppearanceJson
}

interface ZedThemeContent {
  name: string
  appearance: ThemeAppearanceJson
  style: ZedThemeStyleContent
}

interface ZedThemeStyleContent {
    colors: ZedThemeColorsContent,
    status: ZedStatusColorsContent,
    players: Array<ZedPlayerColorContent>,
    syntax: Map<string, ZedHighlightStyleContent>,
}

async function unsafeReadJSONFile<T>(file: string): Promise<T> {
  return (await Bun.file(file).json()) as T
}

async function main() {
  const [,,input, output] = Bun.argv  
  // 1. read vscode json file
  const vscodeTheme = await unsafeReadJSONFile<VScodeTheme>(input)
  const metadata: ThemeMetadata = {
    name: vscodeTheme.name,
    appearance: vscodeTheme.type,
  }
  // 2. converting
}

main()