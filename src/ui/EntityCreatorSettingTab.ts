import { App, PluginSettingTab, Setting, TextComponent, Notice } from 'obsidian';
import { EntityType, EntityCreatorSettings } from '../types';
import { EntityTypeManager } from '../utils/EntityTypeManager';
import { PropertyConfigRenderer } from './PropertyConfigRenderer';
import { PROPERTY_TYPES } from './PropertyTypeManager';

// 配置页面
export class EntityCreatorSettingTab extends PluginSettingTab {
  plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> };
  // 当前激活的选项卡
  activeTab: EntityType;

  constructor(app: App, plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> }) {
    super(app, plugin as any);
    this.plugin = plugin;
    // 默认激活第一个实体类型选项卡
    this.activeTab = Object.keys(plugin.settings.entityTypes)[0] || 'event';
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
    Object.entries(this.plugin.settings.entityTypes).forEach(([entityType, displayName]) => {
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

    // 实体类型管理
    containerEl.createEl('h3', { text: 'Entity Types Management' });
    containerEl.createEl('p', { text: 'Add, edit, and delete entity types' });
    
    // 显示当前实体类型列表
    Object.entries(this.plugin.settings.entityTypes).forEach(([entityType, displayName]) => {
      const setting = new Setting(containerEl)
        .setName(entityType)
        .setDesc(`Display name: ${displayName}`)
        .addText(text => text
          .setValue(displayName)
          .onChange(async (value) => {
            this.plugin.settings.entityTypes[entityType] = value;
            await this.plugin.saveSettings();
            this.display(); // 重新渲染页面
          }))
        .addButton(button => button
          .setButtonText('Delete')
          .setWarning()
          .onClick(async () => {
            // 删除实体类型
            delete this.plugin.settings.entityTypes[entityType];
            // 删除对应的实体配置
            delete this.plugin.settings.entities[entityType];
            await this.plugin.saveSettings();
            this.display(); // 重新渲染页面
            
            // 通知用户需要重启插件以更新命令列表
            new Notice('Please restart Obsidian or reload the plugin to update the command list.');
          }));
    });
    
    // 添加新实体类型
    const addEntityTypeSetting = new Setting(containerEl)
      .setName('Add New Entity Type')
      .setDesc('Add a new entity type')
      .addText(text => text
        .setPlaceholder('entity-type-id')
        .setValue(''))
      .addText(text2 => text2
        .setPlaceholder('Display Name')
        .setValue(''))
      .addButton(button => button
        .setButtonText('Add')
        .onClick(async () => {
          const entityTypeIdInput = addEntityTypeSetting.components[0] as TextComponent;
          const displayNameInput = addEntityTypeSetting.components[1] as TextComponent;
          const entityTypeId = entityTypeIdInput.getValue().trim();
          const displayName = displayNameInput.getValue().trim();
          
          if (entityTypeId && displayName) {
            // 添加实体类型
            this.plugin.settings.entityTypes[entityTypeId] = displayName;
            // 添加默认实体配置
            this.plugin.settings.entities[entityTypeId] = {
              notePath: displayName,
              templatePath: `_Templates/Temp-${displayName}.md`
            };
            await this.plugin.saveSettings();
            // 清空输入框
            entityTypeIdInput.setValue('');
            displayNameInput.setValue('');
            this.display(); // 重新渲染页面
          }
        }));
    
    // 属性映射设置（所有实体共用）
    containerEl.createEl('h3', { text: 'Property Mappings' });
    containerEl.createEl('p', { text: 'Map template properties to display names in the modal (shared by all entities)' });

    // 创建属性配置渲染器
    const propertyConfigRenderer = new PropertyConfigRenderer(this.plugin);

    // 显示当前映射
    Object.entries(this.plugin.settings.propertyMappings).forEach(([property, mapping]) => {
      // 使用属性配置渲染器渲染基础属性配置
      propertyConfigRenderer.renderPropertyConfig(containerEl, property, mapping, () => this.display());
      
      // 如果是Enum类型，使用属性配置渲染器渲染额外配置
      if (mapping.type === 'Enum') {
        propertyConfigRenderer.renderEnumConfig(containerEl, property, mapping, () => this.display());
      } 
      // 如果是Citation类型，使用属性配置渲染器渲染额外配置
      else if (mapping.type === 'Citation') {
        propertyConfigRenderer.renderCitationConfig(containerEl, property, mapping, () => this.display());
      }
    });

    // 使用属性配置渲染器渲染添加新映射的表单
    propertyConfigRenderer.renderAddMappingForm(containerEl, () => this.display());
  }

  // 渲染选项卡内容
  renderTabContent(containerEl: HTMLElement, entityType: EntityType): void {
    const displayName = this.plugin.settings.entityTypes[entityType];
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
