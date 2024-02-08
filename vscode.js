// TODO: impl this
// copy by ChatGPT

// 导入必要的模块
const fs = require("fs")

function format_ident(raw) {
  return `"${raw}"`
}

const IndexMap = Map

// 定义 ThemeColor 结构体
class ThemeColor {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

// 解析主题颜色
function parseThemeColors(src) {
    const colors = new IndexMap();

    const lines = src.split('\n');

    for (const line of lines) {
        if (line.startsWith("- `") && line.includes("`:")) {
            const [name, description] = line.split("`:");
            const color = new ThemeColor(name.trim().substring(3), description.trim());

            colors.set(color.name, color);
        }
    }

    return colors;
}

// 分组颜色
function groupColors(colors) {
    const groupedColors = new IndexMap();

    for (const [colorName, color] of colors) {
        const group = colorName.split('.')[0];

        if (!groupedColors.has(group)) {
            groupedColors.set(group, []);
        }

        groupedColors.get(group).push(color);
    }

    return groupedColors;
}

// 生成颜色字段
function colorField(group, color) {
    const jsonName = color.name;
    const name = group ? color.name.replace(`${group}.`, "") : color.name;
    const description = ` ${color.description}`;

    return {
        description,
        [name]: null
    };
}

// 生成颜色组结构体
function colorGroupStruct(group, colors) {
    const name = group.charAt(0).toUpperCase() + group.slice(1) + "Colors";
    const fields = colors.map(color => colorField(group, color));

    return {
        name,
        fields
    };
}

// 主函数
function main() {
    const themeColorSrc = fs.readFileSync('./theme-color.md', 'utf8');
    const colors = parseThemeColors(themeColorSrc);
    const groupedColors = groupColors(colors);

    let colorFields = [];
    let structs = [];

    for (const [group, colors] of groupedColors) {
        if (group) {
            const fieldName = format_ident(group);

            const { name: structName, fields: structFields } = colorGroupStruct(group, colors);

            structs.push(structName);

            colorFields.push({
                [fieldName]: structName
            });
        } else {
            for (const color of colors) {
                colorFields.push(colorField(null, color));
            }
        }
    }

    const m = `
        const Colors = {
            ${colorFields.map(field => `${Object.keys(field)}: ${Object.values(field)}`).join(',\n')}
        };

        ${structs.map(struct => `const ${struct} = {};`).join('\n')}
    `;

    fs.writeFileSync('demo.ts', m);
}

main();