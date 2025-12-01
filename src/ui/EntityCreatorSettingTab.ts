import { App, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import { EntityType, EntityCreatorSettings, ENTITY_DISPLAY_NAMES } from '../types';

// 配置页面
export class EntityCreatorSettingTab extends PluginSettingTab {
  plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> };
  // 当前激活的选项卡
  activeTab: EntityType;

  constructor(app: App, plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> }) {
    super(app, plugin as any);
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

    // 属性映射设置（所有实体共用）
    containerEl.createEl('h3', { text: 'Property Mappings' });
    containerEl.createEl('p', { text: 'Map template properties to display names in the modal (shared by all entities)' });

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
          }))
        .addButton(button => button
          .setButtonText('Delete')
          .setWarning()
          .onClick(async () => {
            delete this.plugin.settings.propertyMappings[property];
            await this.plugin.saveSettings();
            // 重新渲染设置页面
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
            this.plugin.settings.propertyMappings[property] = displayName2;
            await this.plugin.saveSettings();
            // 清空输入框
            propertyInput.setValue('');
            displayNameInput.setValue('');
            // 重新渲染设置页面
            this.display();
          }
        }));
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
  }
}
