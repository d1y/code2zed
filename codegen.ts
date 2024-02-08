import * as filepath from 'path'

function toUpperFirst(str: string) {
  return str.replace(/_(\w)/g, (match, p1) => p1.toUpperCase())
}

async function parse(rootRepo: string) {
  
  async function getVSCodeTypes() {
    const schemaFile = filepath.join(rootRepo, "crates/theme/src/schema.rs")
    const content = await Bun.file(schemaFile).text()
    const sybs = `ThemeColorsContent StatusColorsContent PlayerColorContent HighlightStyleContent`.split(" ")
    let result1 = `// AUTO GENERATED. DON'T EDIT\n\n`
    sybs.forEach(item=> {
      const reg = new RegExp(`pub struct ${item.trim()} {([\\s\\S]+?)}`)
      result1 += `export interface Zed${item.trim()} {\n`
      const result = content.match(reg)
      if (!result) return
      const [ , rawCode ] = result
      rawCode.split("\n").filter(item=> {
        if (!item) return false
        if (item.trim().startsWith("//")) return false
        if (item.trim().startsWith("#")) return false
        return true
      }).map(item=> item.trim()).forEach(item=> {
        const newVal = item.match(/pub (.*):/)
        if (!newVal) return
        let [ , zedVar ] = newVal
        if (zedVar.includes("_")) {
          zedVar = zedVar.replaceAll("_", ".")
        }
        result1 += `  '${zedVar}': string\n`
      })
      result1 += "}\n\n"
      Bun.write("zed.ts", result1.trim())
    })
  }

  const fixMap = new Map([
    ['hint', 'editorInlayHint.foreground || #969696ff'],
    ['border', 'panel.border'],
    ['background', 'editor.background']
  ])

  async function getThemeMap() {
    const convertFile = filepath.join(rootRepo, "crates/theme_importer/src/vscode/converter.rs")
    const content = await Bun.file(convertFile).text()
    let result = `// AUTO GENERATED. DON'T EDIT`
    ;['StatusColorsContent', 'ThemeColorsContent'].map(item=> {
      const reg = new RegExp(`Ok\\(${item} {([\\s\\S]+?})\\)`)
      const data = content.match(reg)
      if (!data) return
      let tag = `\n\nexport const ${item} = new Map([\n`
      const [ , val ] = data
      val.split(",").map(item=> item.trim()).filter(item=> !!item && !item.startsWith("..") && !item.startsWith("//")).map(item=> {
        const sybs = item.split(":")
        let [ _zed, _vscode ] = sybs
        _zed = _zed.trim()
        _vscode = _vscode.trim()
        let zed = ''
        let vscode = ''
        zed = _zed.replaceAll("_", ".")
        const __vscode = _vscode.replace(/\s/g, "").replace("vscode_colors.","").replace(".clone()","")
        if (_vscode.includes("vscode_colors")) {
          vscode = __vscode
          vscode = vscode.split(".").map(toUpperFirst).join(".")
        }
        if (_vscode.includes("vscode_panel_border")) {
          vscode = 'panel.border'
        }
        tag += `  ['${zed}', '${vscode}'],\n`
      })
      tag += '])'
      result += tag
    })
    Bun.write("map.ts", result)
  }

  await getVSCodeTypes()
  await getThemeMap()
}

await parse("/Users/d1y/github/zed")