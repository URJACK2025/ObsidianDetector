// 属性值格式化工具类
export class PropertyValueFormatter {
  // 根据属性类型格式化值
  static formatValue(type: string, value: any): string {
    switch (type) {
      case 'Checkbox':
        // Checkbox类型：转换为true/false字符串
        return value ? 'true' : 'false';
      
      case 'Citation':
        // Citation类型：格式化为YAML数组，使用Obsidian的[[...]]引用符号
        if (!value || value.length === 0) {
          return '';
        }
        return '\n' + value.map((v: string) => `  - "[[${v}]]"`).join('\n');
      
      case 'Enum':
        // Enum类型：直接返回值
        return value;
      
      case 'List':
        // List类型：格式化为YAML数组
        if (!value || value.length === 0) {
          return '';
        }
        return '\n' + value.map((v: string) => `  - "${v}"`).join('\n');
      
      case 'Date':
      case 'Date & time':
      case 'Number':
      case 'Text':
      default:
        // 其他类型：直接返回字符串值
        return String(value);
    }
  }

  // 从HTML元素获取值（用于表单提交）
  static getValueFromElement(type: string, element: any): any {
    switch (type) {
      case 'Checkbox':
        return element.checked;
      
      case 'Citation':
        return element.getValues ? element.getValues() : [];
      
      case 'Enum':
        return element.value;
      
      case 'List':
        return element.getValues ? element.getValues() : [];
      
      case 'Date':
      case 'Date & time':
      case 'Number':
      case 'Text':
      default:
        return element.value;
    }
  }
}
