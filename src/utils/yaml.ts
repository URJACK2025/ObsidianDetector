// YAML front matter解析函数
export function parseYamlFrontMatter(content: string): Record<string, string> {
  const yamlRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(yamlRegex);
  
  if (!match) {
    return {};
  }
  
  const yamlContent = match[1];
  const properties: Record<string, string> = {};
  
  // 简单的YAML解析，仅支持key: value格式
  yamlContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split(':');
      if (key) {
        const value = valueParts.join(':').trim();
        properties[key.trim()] = value;
      }
    }
  });
  
  return properties;
}

// 获取模板属性
export function getTemplateProperties(content: string): string[] {
  const properties = parseYamlFrontMatter(content);
  // 过滤掉entity-type等系统属性
  return Object.keys(properties).filter(key => key !== 'entity-type');
}

// 获取显示名称
export function getDisplayName(property: string, mappings: Record<string, { displayName: string }>): string {
  return mappings[property]?.displayName || property;
}
