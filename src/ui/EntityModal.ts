import { App, Modal, TextComponent, TFile } from 'obsidian';
import { EntityType, EntityCreatorSettings, ENTITY_DISPLAY_NAMES } from '../types';
import { getTemplateProperties, getDisplayName } from '../utils/yaml';

// 实体创建弹窗
export class EntityModal extends Modal {
  // 插件引用
  plugin: { settings: EntityCreatorSettings };
  // 实体类型
  entityType: EntityType;
  // 输入框引用映射
  inputFields: Record<string, TextComponent> = {};
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
      form.style.gap = '10px';

      // 动态生成输入框
      this.templateProperties.forEach(property => {
        const displayName = getDisplayName(property, this.plugin.settings.propertyMappings);
        
        // 创建标签
        form.createEl('label', { text: displayName });
        
        // 创建输入框
        const input = new TextComponent(form);
        input.setPlaceholder(`Enter ${property}`);
        
        // 存储输入框引用
        this.inputFields[property] = input;
      });

      // 创建按钮容器
      const buttonContainer = form.createEl('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'flex-end';
      buttonContainer.style.gap = '10px';
      buttonContainer.style.marginTop = '10px';

      // 取消按钮
      const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel', type: 'button' });
      cancelBtn.addEventListener('click', () => {
        this.close();
      });

      // 提交按钮
      const submitBtn = buttonContainer.createEl('button', { text: 'Create', type: 'submit' });
      submitBtn.style.marginLeft = 'auto';

      // 表单提交处理
      form.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        
        // 收集所有输入值
        const result: Record<string, string> = {};
        this.templateProperties.forEach(property => {
          result[property] = this.inputFields[property].getValue();
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
    // 清空输入框引用
    this.inputFields = {};
    this.templateProperties = [];
  }
}
