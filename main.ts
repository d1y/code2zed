interface VsCodeTokenColor {

}
interface VScodeTheme {
  $schema: string
  name: string
  author: string
  maintainers: Array<string>
  semanticClass: string
  semanticHighlighting: boolean
  color: any/* TODO: codegen with zed rust-code */
  tokenColors: Array<VsCodeTokenColor> /* TODO: codegen with zed rust-code */
}

function main() {
  console.log("// TODO: impl this")
}