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
          
          // 创建输入元素
          let inputElement: HTMLInputElement | HTMLSelectElement;
          
          switch (propertyType) {
            case 'Checkbox':
              // 使用原生checkbox
              inputElement = document.createElement('input');
              inputElement.type = 'checkbox';
              break;
            
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
            
            case 'List':
              // 使用原生select
              inputElement = document.createElement('select');
              // 添加默认选项
              const defaultOption = document.createElement('option');
              defaultOption.value = '';
              defaultOption.textContent = 'Select a value';
              inputElement.appendChild(defaultOption);
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
          const { type, element } = this.inputFields[property];
          let value: string;
          
          switch (type) {
            case 'Checkbox':
              value = (element as HTMLInputElement).checked ? 'true' : 'false';
              break;
            
            case 'Date':
            case 'Date & time':
            case 'Number':
            case 'Text':
              value = (element as HTMLInputElement).value;
              break;
            
            case 'List':
              value = (element as HTMLSelectElement).value;
              break;
            
            default:
              value = (element as HTMLInputElement).value;
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
