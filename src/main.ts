import { App, Plugin, TFile } from 'obsidian';
import { EntityType, EntityCreatorSettings, DEFAULT_ENTITIES, DEFAULT_ENTITY_TYPES, DEFAULT_PROPERTY_MAPPINGS, DEFAULT_SETTINGS, getEntityDisplayName } from './types';
import { EntityModal } from './ui/EntityModal';
import { EntityCreatorSettingTab } from './ui/EntityCreatorSettingTab';

// 插件主类
class EntityCreatorPlugin extends Plugin {
  settings!: EntityCreatorSettings; // 使用非空断言，确保在使用前已初始化

  async onload() {
    await this.loadSettings();

    // 为每个实体类型注册命令
    this.registerEntityCommands();

    // 注册配置页面
    this.addSettingTab(new EntityCreatorSettingTab(this.app, this));
  }

  // 注册实体命令
  registerEntityCommands() {
    // 为每个实体类型注册命令
    Object.keys(this.settings.entityTypes).forEach((entityType) => {
      const displayName = this.settings.entityTypes[entityType];
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
  }

  async onunload() {
    // 插件卸载时的清理工作
  }

  async loadSettings() {
    const loadedSettings = await this.loadData();
    // 合并默认配置和加载的配置
    this.settings = {
      entityTypes: { ...DEFAULT_ENTITY_TYPES },
      entities: { ...DEFAULT_ENTITIES },
      propertyMappings: { ...DEFAULT_PROPERTY_MAPPINGS }
    };
    
    // 合并加载的实体类型
    if (loadedSettings?.entityTypes) {
      this.settings.entityTypes = {
        ...this.settings.entityTypes,
        ...loadedSettings.entityTypes
      };
    }
    
    // 合并加载的实体配置
    if (loadedSettings?.entities) {
      this.settings.entities = {
        ...this.settings.entities,
        ...loadedSettings.entities
      };
    }
    
    // 合并加载的propertyMappings
    if (loadedSettings?.propertyMappings) {
      this.settings.propertyMappings = {
        ...this.settings.propertyMappings,
        ...loadedSettings.propertyMappings
      };
    }
    
    // 兼容旧版本设置，将旧的实体propertyMappings合并到顶层
    if (loadedSettings?.entities) {
      Object.keys(loadedSettings.entities).forEach((entityTypeStr) => {
        const entityType = entityTypeStr as EntityType;
        if (loadedSettings.entities[entityType]?.propertyMappings) {
          this.settings.propertyMappings = {
            ...this.settings.propertyMappings,
            ...loadedSettings.entities[entityType].propertyMappings
          };
        }
      });
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // 重新注册命令，以反映实体类型的变化
    this.registerEntityCommands();
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
