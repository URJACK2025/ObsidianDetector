import { App, Plugin, PluginSettingTab, Setting, Modal, TextComponent } from 'obsidian';

// 插件设置接口
interface EntityCreatorSettings {
  eventNotePath: string;
  templatePath: string;
  propertyMappings: Record<string, string>;
}

// 默认属性映射
const DEFAULT_PROPERTY_MAPPINGS: Record<string, string> = {
  'full_name': '事件主要内容',
  'rel-group': '关联组织',
  'rel-person': '关联人员',
  'rel-event': '关联事件',
  'rel-location': '关联地点',
  'rel-country': '关联国家',
  'birth': '出生日期',
  'gender': '性别',
  'code': '代码'
};

// 默认设置
const DEFAULT_SETTINGS: EntityCreatorSettings = {
  eventNotePath: 'Events',
  templatePath: '_Templates/Temp-Event.md',
  propertyMappings: DEFAULT_PROPERTY_MAPPINGS
};

// YAML front matter解析函数
function parseYamlFrontMatter(content: string): Record<string, string> {
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
function getTemplateProperties(content: string): string[] {
  const properties = parseYamlFrontMatter(content);
  // 过滤掉entity-type等系统属性
  return Object.keys(properties).filter(key => key !== 'entity-type');
}

// 获取显示名称
function getDisplayName(property: string, mappings: Record<string, string>): string {
  return mappings[property] || property;
}

// 事件创建弹窗
class EventModal extends Modal {
  // 插件引用
  plugin: EntityCreatorPlugin;
  // 输入框引用映射
  inputFields: Record<string, TextComponent> = {};
  // 模板属性
  templateProperties: string[] = [];
  // 回调函数
  onSubmit: (result: Record<string, string>) => void;

  constructor(app: App, plugin: EntityCreatorPlugin, onSubmit: (result: Record<string, string>) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
  }

  async onOpen() {
    const { contentEl } = this;

    // 设置标题
    contentEl.createEl('h2', { text: 'Create Entity-Event' });

    try {
      // 读取模板文件
      const templatePath = this.plugin.settings.templatePath;
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      
      if (!templateFile) {
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
      form.addEventListener('submit', (e) => {
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

// 配置页面
class EntityCreatorSettingTab extends PluginSettingTab {
  plugin: EntityCreatorPlugin;

  constructor(app: App, plugin: EntityCreatorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Entity Creator Settings' });

    // Entity-Event 生成路径设置
    new Setting(containerEl)
      .setName('Entity-Event Note Path')
      .setDesc('Path where Event notes will be created')
      .addText(text => text
        .setPlaceholder('Events')
        .setValue(this.plugin.settings.eventNotePath)
        .onChange(async (value) => {
          this.plugin.settings.eventNotePath = value;
          await this.plugin.saveSettings();
        }));

    // 模板文件路径设置
    new Setting(containerEl)
      .setName('Template File Path')
      .setDesc('Path to the Event template file')
      .addText(text => text
        .setPlaceholder('_Templates/Temp-Event.md')
        .setValue(this.plugin.settings.templatePath)
        .onChange(async (value) => {
          this.plugin.settings.templatePath = value;
          await this.plugin.saveSettings();
        }));

    // 属性映射设置
    containerEl.createEl('h3', { text: 'Property Mappings' });
    containerEl.createEl('p', { text: 'Map template properties to display names in the modal' });

    // 显示当前映射
    Object.entries(this.plugin.settings.propertyMappings).forEach(([property, displayName]) => {
      const setting = new Setting(containerEl)
        .setName(property)
        .setDesc(`Display name: ${displayName}`)
        .addText(text => text
          .setValue(displayName)
          .onChange(async (value) => {
            this.plugin.settings.propertyMappings[property] = value;
            await this.plugin.saveSettings();
            // 重新渲染设置页面，以显示更新后的映射
            this.display();
          }));
    });

    // 添加新映射
    const addMappingSetting = new Setting(containerEl)
      .setName('Add New Mapping')
      .setDesc('Add a new property mapping')
      .addText(text => text
        .setPlaceholder('property-name')
        .setValue(''))
      .addText(text2 => text2
        .setPlaceholder('Display Name')
        .setValue(''))
      .addButton(button => button
        .setButtonText('Add')
        .onClick(async () => {
          const propertyInput = addMappingSetting.components[0] as TextComponent;
          const displayNameInput = addMappingSetting.components[1] as TextComponent;
          const property = propertyInput.getValue().trim();
          const displayName = displayNameInput.getValue().trim();
          
          if (property && displayName) {
            this.plugin.settings.propertyMappings[property] = displayName;
            await this.plugin.saveSettings();
            // 清空输入框
            propertyInput.setValue('');
            displayNameInput.setValue('');
            // 重新渲染设置页面
            this.display();
          }
        }));
  }
}

// 插件主类
class EntityCreatorPlugin extends Plugin {
  settings: EntityCreatorSettings;

  async onload() {
    await this.loadSettings();

    // 注册命令：Create Entity-Event
    this.addCommand({
      id: 'create-entity-event',
      name: 'Create Entity-Event',
      callback: () => {
        new EventModal(this.app, this, async (result) => {
          await this.createEventNote(result);
        }).open();
      }
    });

    // 注册配置页面
    this.addSettingTab(new EntityCreatorSettingTab(this.app, this));
  }

  async onunload() {
    // 插件卸载时的清理工作
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 创建事件笔记
  async createEventNote(data: Record<string, string>) {
    try {
      // 读取模板文件
      const templatePath = this.settings.templatePath;
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      
      if (!templateFile) {
        console.error(`Template file not found at: ${templatePath}`);
        return;
      }
      
      const templateContent = await this.app.vault.read(templateFile);

      // 动态替换模板变量
      let content = templateContent;
      Object.entries(data).forEach(([key, value]) => {
        // 使用正则表达式替换所有匹配的属性
        const regex = new RegExp(`${key}:`, 'g');
        content = content.replace(regex, `${key}: ${value}`);
      });

      // 确保路径存在
      const path = this.settings.eventNotePath;
      let folder = this.app.vault.getAbstractFileByPath(path);
      
      if (!folder) {
        console.log(`Creating folder: ${path}`);
        await this.app.vault.createFolder(path);
        folder = this.app.vault.getAbstractFileByPath(path);
      }
      
      if (!folder) {
        console.error(`Failed to create folder: ${path}`);
        return;
      }

      // 生成文件名，优先使用full_name，否则使用Untitled
      const fileName = `${data['full_name'] || 'Untitled'}.md`;
      const notePath = `${path}/${fileName}`;
      
      console.log(`Creating note at: ${notePath}`);
      await this.app.vault.create(notePath, content);
      console.log(`Note created successfully: ${notePath}`);
    } catch (error) {
      console.error('Error creating event note:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  }
}

export default EntityCreatorPlugin;
