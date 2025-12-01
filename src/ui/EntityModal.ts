import { App, Modal, TextComponent, TFile } from 'obsidian';
import { EntityType, EntityCreatorSettings, ENTITY_DISPLAY_NAMES, PropertyType } from '../types';
import { getTemplateProperties, getDisplayName } from '../utils/yaml';

// 实体创建弹窗
export class EntityModal extends Modal {
  // 插件引用
  plugin: { settings: EntityCreatorSettings };
  // 实体类型
  entityType: EntityType;
  // 输入控件引用映射
  inputFields: Record<string, any> = {};
  // 模板属性
  templateProperties: string[] = [];
  // 回调函数
  onSubmit: (result: Record<string, string>) => void;

  constructor(app: App, plugin: { settings: EntityCreatorSettings }, entityType: EntityType, onSubmit: (result: Record<string, string>) => void) {
    super(app);
    this.plugin = plugin;
    this.entityType = entityType;
    this.onSubmit = onSubmit;
  }

  async onOpen() {
    const { contentEl } = this;
    const displayName = ENTITY_DISPLAY_NAMES[this.entityType];

    // 设置标题
    contentEl.createEl('h2', { text: `Create Entity-${displayName}` });

    try {
      // 获取实体配置
      const entityConfig = this.plugin.settings.entities[this.entityType];
      
      if (!entityConfig) {
        contentEl.createEl('div', { text: `No configuration found for entity type: ${this.entityType}`, cls: 'error' });
        return;
      }
      
      // 读取模板文件
      const templatePath = entityConfig.templatePath;
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      
      if (!templateFile || !(templateFile instanceof TFile)) {
        contentEl.createEl('div', { text: `Template file not found: ${templatePath}`, cls: 'error' });
        return;
      }
      
      const templateContent = await this.app.vault.read(templateFile);
      // 获取模板属性
      this.templateProperties = getTemplateProperties(templateContent);
      
      if (this.templateProperties.length === 0) {
        contentEl.createEl('div', { text: 'No properties found in template', cls: 'error' });
        return;
      }

      // 创建表单容器
      const form = contentEl.createEl('form');
      form.style.display = 'flex';
      form.style.flexDirection = 'column';
      form.style.gap = '15px';

      // 动态生成输入控件
      this.templateProperties.forEach(property => {
        try {
          const propertyMapping = this.plugin.settings.propertyMappings[property];
          const displayName = getDisplayName(property, this.plugin.settings.propertyMappings);
          const propertyType = propertyMapping?.type || 'Text';
          
          // 创建控件容器
          const controlContainer = form.createEl('div');
          controlContainer.style.display = 'flex';
          controlContainer.style.flexDirection = 'column';
          
          // 创建标签
          const label = controlContainer.createEl('label');
          label.textContent = displayName;
          label.style.marginBottom = '5px';
          label.style.fontWeight = 'bold';
          
          // 根据属性类型创建不同的控件
          if (propertyType === 'Checkbox') {
            // Checkbox类型：使用带标签的checkbox
            const checkboxContainer = controlContainer.createEl('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.gap = '8px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.margin = '0';
            
            // 创建checkbox标签
            const checkboxLabel = document.createElement('label');
            checkboxLabel.textContent = 'Yes';
            checkboxLabel.style.cursor = 'pointer';
            checkboxLabel.style.userSelect = 'none';
            
            // 将checkbox和标签添加到容器
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            
            // 存储输入控件引用
            this.inputFields[property] = { type: propertyType, element: checkbox };
          } else if (propertyType === 'Enum') {
            // Enum类型：使用下拉菜单
            const selectElement = document.createElement('select');
            selectElement.style.padding = '8px';
            selectElement.style.border = '1px solid var(--background-modifier-border)';
            selectElement.style.borderRadius = '4px';
            selectElement.style.background = 'var(--background-primary)';
            selectElement.style.color = 'var(--text-normal)';
            
            // 添加默认选项
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Select ${property}`;
            selectElement.appendChild(defaultOption);
            
            // 添加Enum选项
            const enumOptions = propertyMapping?.enumOptions || [];
            enumOptions.forEach(option => {
              const optionElement = document.createElement('option');
              optionElement.value = option;
              optionElement.textContent = option;
              selectElement.appendChild(optionElement);
            });
            
            // 添加到容器
            controlContainer.appendChild(selectElement);
            
            // 存储输入控件引用
            this.inputFields[property] = { type: propertyType, element: selectElement };
          } else if (propertyType === 'List') {
            // List类型：支持添加多个值
            const listContainer = controlContainer.createEl('div');
            listContainer.style.display = 'flex';
            listContainer.style.flexDirection = 'column';
            listContainer.style.gap = '8px';
            
            // 创建值列表容器
            const valuesContainer = listContainer.createEl('div');
            valuesContainer.style.display = 'flex';
            valuesContainer.style.flexDirection = 'column';
            valuesContainer.style.gap = '4px';
            
            // 创建添加新值的输入框和按钮
            const addContainer = listContainer.createEl('div');
            addContainer.style.display = 'flex';
            addContainer.style.gap = '8px';
            
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.placeholder = `Add ${property}`;
            newInput.style.flex = '1';
            newInput.style.padding = '8px';
            newInput.style.border = '1px solid var(--background-modifier-border)';
            newInput.style.borderRadius = '4px';
            newInput.style.background = 'var(--background-primary)';
            newInput.style.color = 'var(--text-normal)';
            
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = 'Add';
            addButton.style.padding = '8px 16px';
            addButton.style.border = '1px solid var(--background-modifier-border)';
            addButton.style.borderRadius = '4px';
            addButton.style.background = 'var(--background-secondary)';
            addButton.style.color = 'var(--text-normal)';
            addButton.style.cursor = 'pointer';
            
            // 添加到容器
            addContainer.appendChild(newInput);
            addContainer.appendChild(addButton);
            
            // 存储已添加的值
            const values: string[] = [];
            
            // 添加值的函数
            const addValue = (value: string) => {
              if (value.trim() && !values.includes(value.trim())) {
                const valueItem = valuesContainer.createEl('div');
                valueItem.style.display = 'flex';
                valueItem.style.alignItems = 'center';
                valueItem.style.gap = '8px';
                
                const valueText = document.createElement('span');
                valueText.textContent = value.trim();
                valueText.style.flex = '1';
                valueText.style.padding = '4px 8px';
                valueText.style.border = '1px solid var(--background-modifier-border)';
                valueText.style.borderRadius = '4px';
                valueText.style.background = 'var(--background-secondary)';
                
                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.textContent = '×';
                removeButton.style.width = '24px';
                removeButton.style.height = '24px';
                removeButton.style.display = 'flex';
                removeButton.style.alignItems = 'center';
                removeButton.style.justifyContent = 'center';
                removeButton.style.border = '1px solid var(--background-modifier-border)';
                removeButton.style.borderRadius = '4px';
                removeButton.style.background = 'var(--background-secondary)';
                removeButton.style.color = 'var(--text-normal)';
                removeButton.style.cursor = 'pointer';
                removeButton.style.fontSize = '16px';
                removeButton.style.lineHeight = '1';
                
                // 移除值的函数
                const removeValue = () => {
                  const index = values.indexOf(value.trim());
                  if (index > -1) {
                    values.splice(index, 1);
                  }
                  valueItem.remove();
                };
                
                removeButton.addEventListener('click', removeValue);
                
                valueItem.appendChild(valueText);
                valueItem.appendChild(removeButton);
                values.push(value.trim());
              }
            };
            
            // 添加按钮点击事件
            addButton.addEventListener('click', () => {
              addValue(newInput.value);
              newInput.value = '';
            });
            
            // 回车键添加值
            newInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                addValue(newInput.value);
                newInput.value = '';
              }
            });
            
            // 存储List控件引用
            this.inputFields[property] = { 
              type: propertyType, 
              addValue, 
              getValues: () => values 
            };
          } else {
            // 其他类型：使用原生输入元素
            let inputElement: HTMLInputElement;
            
            switch (propertyType) {
              case 'Date':
                // 使用原生date输入
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                break;
              
              case 'Date & time':
                // 使用原生datetime-local输入
                inputElement = document.createElement('input');
                inputElement.type = 'datetime-local';
                break;
              
              case 'Number':
                // 使用原生number输入
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                break;
              
              case 'Text':
              default:
                // 使用原生text输入
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = `Enter ${property}`;
                break;
            }
            
            // 添加通用样式
            inputElement.style.padding = '8px';
            inputElement.style.border = '1px solid var(--background-modifier-border)';
            inputElement.style.borderRadius = '4px';
            inputElement.style.background = 'var(--background-primary)';
            inputElement.style.color = 'var(--text-normal)';
            
            // 添加到容器
            controlContainer.appendChild(inputElement);
            
            // 存储输入控件引用
            this.inputFields[property] = { type: propertyType, element: inputElement };
          }
        } catch (error) {
          console.error(`Error creating control for property ${property}:`, error);
          throw error; // 重新抛出错误，以便外层try-catch捕获
        }
      });

      // 创建按钮容器
      const buttonContainer = form.createEl('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'flex-end';
      buttonContainer.style.gap = '10px';
      buttonContainer.style.marginTop = '20px';

      // 取消按钮
      const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel', type: 'button' });
      cancelBtn.style.padding = '8px 16px';
      cancelBtn.style.border = '1px solid var(--background-modifier-border)';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.style.background = 'var(--background-secondary)';
      cancelBtn.style.color = 'var(--text-normal)';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.addEventListener('click', () => {
        this.close();
      });

      // 提交按钮
      const submitBtn = buttonContainer.createEl('button', { text: 'Create', type: 'submit' });
      submitBtn.style.padding = '8px 16px';
      submitBtn.style.border = '1px solid var(--background-modifier-border)';
      submitBtn.style.borderRadius = '4px';
      submitBtn.style.background = 'var(--interactive-accent)';
      submitBtn.style.color = 'var(--text-on-accent)';
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.marginLeft = 'auto';

      // 表单提交处理
      form.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        
        // 收集所有输入值
        const result: Record<string, string> = {};
        this.templateProperties.forEach(property => {
          const field = this.inputFields[property];
          const { type } = field;
          let value: string;
          
          switch (type) {
            case 'Checkbox':
              // 获取checkbox的checked状态
              value = (field.element as HTMLInputElement).checked ? 'true' : 'false';
              break;
            
            case 'Enum':
              // 获取select元素的值
              value = (field.element as HTMLSelectElement).value;
              break;
            
            case 'List':
              // 获取所有添加的值并格式化为YAML数组
              const values = field.getValues();
              if (values.length === 0) {
                value = '';
              } else {
                // 格式化为YAML数组格式
                value = '\n' + values.map(v => `  - "${v}"`).join('\n');
              }
              break;
            
            case 'Date':
            case 'Date & time':
            case 'Number':
            case 'Text':
            default:
              // 获取输入值
              value = (field.element as HTMLInputElement).value;
              break;
          }
          
          result[property] = value;
        });
        
        this.onSubmit(result);
        this.close();
      });
    } catch (error) {
      console.error('Error loading template:', error);
      contentEl.createEl('div', { text: 'Error loading template', cls: 'error' });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    // 清空输入控件引用
    this.inputFields = {};
    this.templateProperties = [];
  }
}
