import { App, Plugin, PluginSettingTab, Setting, Modal, TextComponent, TFile } from 'obsidian';

// 实体类型枚举
type EntityType = 'event' | 'person' | 'organization' | 'location' | 'country';

// 单个实体配置接口
interface EntityConfig {
  notePath: string;
  templatePath: string;
  propertyMappings: Record<string, string>;
}

// 插件设置接口
interface EntityCreatorSettings {
  entities: Record<EntityType, EntityConfig>;
}

// 默认属性映射
const DEFAULT_PROPERTY_MAPPINGS: Record<string, string> = {
  'full_name': '名称',
  'rel-group': '关联组织',
  'rel-person': '关联人员',
  'rel-event': '关联事件',
  'rel-location': '关联地点',
  'rel-country': '关联国家',
  'birth': '出生日期',
  'gender': '性别',
  'code': '代码',
  'description': '描述'
};

// 实体类型显示名称映射
const ENTITY_DISPLAY_NAMES: Record<EntityType, string> = {
  'event': 'Event',
  'person': 'Person',
  'organization': 'Organization',
  'location': 'Location',
  'country': 'Country'
};

// 默认实体配置
const DEFAULT_ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  'event': {
    notePath: 'Events',
    templatePath: '_Templates/Temp-Event.md',
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  'person': {
    notePath: 'Person',
    templatePath: '_Templates/Temp-Person.md',
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  'organization': {
    notePath: 'Organization',
    templatePath: '_Templates/Temp-Group.md',
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  'location': {
    notePath: 'Location',
    templatePath: '_Templates/Temp-Location.md',
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  'country': {
    notePath: 'Country',
    templatePath: '_Templates/Temp-Country.md',
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  }
};

// 默认设置
const DEFAULT_SETTINGS: EntityCreatorSettings = {
  entities: DEFAULT_ENTITY_CONFIGS
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

// 实体创建弹窗
class EntityModal extends Modal {
  // 插件引用
  plugin: EntityCreatorPlugin;
  // 实体类型
  entityType: EntityType;
  // 输入框引用映射
  inputFields: Record<string, TextComponent> = {};
  // 模板属性
  templateProperties: string[] = [];
  // 回调函数
  onSubmit: (result: Record<string, string>) => void;

  constructor(app: App, plugin: EntityCreatorPlugin, entityType: EntityType, onSubmit: (result: Record<string, string>) => void) {
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
        const displayName = getDisplayName(property, entityConfig.propertyMappings);
        
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

// 配置页面
class EntityCreatorSettingTab extends PluginSettingTab {
  plugin: EntityCreatorPlugin;
  // 当前激活的选项卡
  activeTab: EntityType;

  constructor(app: App, plugin: EntityCreatorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.activeTab = 'event'; // 默认激活Event选项卡
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Entity Creator Settings' });

    // 创建选项卡容器
    const tabContainer = containerEl.createEl('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.flexDirection = 'column';
    tabContainer.style.gap = '10px';

    // 创建选项卡导航
    const tabNav = tabContainer.createEl('div');
    tabNav.style.display = 'flex';
    tabNav.style.gap = '5px';
    tabNav.style.borderBottom = '1px solid var(--background-modifier-border)';
    tabNav.style.paddingBottom = '5px';

    // 创建选项卡内容区域
    const tabContent = tabContainer.createEl('div');

    // 为每个实体类型创建选项卡
    Object.keys(ENTITY_DISPLAY_NAMES).forEach((entityTypeStr) => {
      const entityType = entityTypeStr as EntityType;
      const displayName = ENTITY_DISPLAY_NAMES[entityType];
      
      // 创建选项卡按钮
      const tabButton = tabNav.createEl('button', { text: displayName });
      tabButton.style.padding = '5px 10px';
      tabButton.style.border = '1px solid var(--background-modifier-border)';
      tabButton.style.borderRadius = '4px 4px 0 0';
      tabButton.style.background = this.activeTab === entityType ? 'var(--background-primary)' : 'var(--background-secondary)';
      tabButton.style.cursor = 'pointer';
      
      // 添加选项卡点击事件
      tabButton.addEventListener('click', () => {
        this.activeTab = entityType;
        this.display(); // 重新渲染页面
      });
    });

    // 显示当前选项卡内容
    this.renderTabContent(tabContent, this.activeTab);
  }

  // 渲染选项卡内容
  renderTabContent(containerEl: HTMLElement, entityType: EntityType): void {
    const displayName = ENTITY_DISPLAY_NAMES[entityType];
    const entityConfig = this.plugin.settings.entities[entityType];
    
    if (!entityConfig) {
      containerEl.createEl('div', { text: `No configuration found for ${displayName}` });
      return;
    }

    // 创建选项卡标题
    containerEl.createEl('h3', { text: `${displayName} Settings` });

    // 实体笔记生成路径设置
    new Setting(containerEl)
      .setName(`${displayName} Note Path`)
      .setDesc(`Path where ${displayName} notes will be created`)
      .addText(text => text
        .setPlaceholder(`${displayName}s`)
        .setValue(entityConfig.notePath)
        .onChange(async (value) => {
          entityConfig.notePath = value;
          await this.plugin.saveSettings();
        }));

    // 模板文件路径设置
    new Setting(containerEl)
      .setName(`${displayName} Template File Path`)
      .setDesc(`Path to the ${displayName} template file`)
      .addText(text => text
        .setPlaceholder(`_Templates/Temp-${displayName}.md`)
        .setValue(entityConfig.templatePath)
        .onChange(async (value) => {
          entityConfig.templatePath = value;
          await this.plugin.saveSettings();
        }));

    // 属性映射设置
    containerEl.createEl('h4', { text: `${displayName} Property Mappings` });
    containerEl.createEl('p', { text: 'Map template properties to display names in the modal' });

    // 显示当前映射
    Object.entries(entityConfig.propertyMappings).forEach(([property, displayName2]) => {
      const setting = new Setting(containerEl)
        .setName(property)
        .setDesc(`Display name: ${displayName2}`)
        .addText(text => text
          .setValue(displayName2)
          .onChange(async (value) => {
            entityConfig.propertyMappings[property] = value;
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
          const displayName2 = displayNameInput.getValue().trim();
          
          if (property && displayName2) {
            entityConfig.propertyMappings[property] = displayName2;
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
  settings!: EntityCreatorSettings; // 使用非空断言，确保在使用前已初始化

  async onload() {
    await this.loadSettings();

    // 为每个实体类型注册命令
    Object.keys(DEFAULT_ENTITY_CONFIGS).forEach((entityTypeStr) => {
      const entityType = entityTypeStr as EntityType;
      const displayName = ENTITY_DISPLAY_NAMES[entityType];
      this.addCommand({
        id: `create-entity-${entityType}`,
        name: `Create Entity-${displayName}`,
        callback: () => {
          new EntityModal(this.app, this, entityType, async (result) => {
            await this.createEntityNote(entityType, result);
          }).open();
        }
      });
    });

    // 注册配置页面
    this.addSettingTab(new EntityCreatorSettingTab(this.app, this));
  }

  async onunload() {
    // 插件卸载时的清理工作
  }

  async loadSettings() {
    const loadedSettings = await this.loadData();
    // 合并默认配置和加载的配置
    this.settings = {
      entities: {
        event: DEFAULT_ENTITY_CONFIGS.event,
        person: DEFAULT_ENTITY_CONFIGS.person,
        organization: DEFAULT_ENTITY_CONFIGS.organization,
        location: DEFAULT_ENTITY_CONFIGS.location,
        country: DEFAULT_ENTITY_CONFIGS.country
      }
    };
    
    // 为每个实体类型合并加载的配置
    Object.keys(DEFAULT_ENTITY_CONFIGS).forEach((entityTypeStr) => {
      const entityType = entityTypeStr as EntityType;
      if (loadedSettings?.entities?.[entityType]) {
        this.settings.entities[entityType] = {
          ...this.settings.entities[entityType],
          ...loadedSettings.entities[entityType]
        };
      }
    });
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 创建实体笔记
  async createEntityNote(entityType: EntityType, data: Record<string, string>) {
    try {
      // 获取实体配置
      const entityConfig = this.settings.entities[entityType];
      
      if (!entityConfig) {
        console.error(`No configuration found for entity type: ${entityType}`);
        return;
      }
      
      // 读取模板文件
      const templatePath = entityConfig.templatePath;
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      
      if (!templateFile || !(templateFile instanceof TFile)) {
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
      const path = entityConfig.notePath;
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
      console.error(`Error creating ${entityType} note:`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  }
}

export default EntityCreatorPlugin;
