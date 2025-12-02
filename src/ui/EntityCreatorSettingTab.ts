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
    Object.entries(this.plugin.settings.propertyMappings).forEach(([property, mapping]) => {
      const setting = new Setting(containerEl)
        .setName(property)
        .setDesc(`Display name: ${mapping.displayName}, Type: ${mapping.type}`)
        .addText(text => text
          .setValue(mapping.displayName)
          .onChange(async (value) => {
            this.plugin.settings.propertyMappings[property].displayName = value;
            await this.plugin.saveSettings();
            // 重新渲染设置页面，以显示更新后的映射
            this.display();
          }))
        .addDropdown(dropdown => dropdown
          .addOption('Checkbox', 'Checkbox')
          .addOption('Citation', 'Citation')
          .addOption('Date', 'Date')
          .addOption('Date & time', 'Date & time')
          .addOption('Enum', 'Enum')
          .addOption('List', 'List')
          .addOption('Number', 'Number')
          .addOption('Text', 'Text')
          .setValue(mapping.type)
          .onChange(async (value) => {
            this.plugin.settings.propertyMappings[property].type = value as any;
            // 如果从其他类型切换到Enum，初始化enumOptions数组
            if (value === 'Enum' && !this.plugin.settings.propertyMappings[property].enumOptions) {
              this.plugin.settings.propertyMappings[property].enumOptions = [];
            }
            // 如果从其他类型切换到Citation，初始化citationConfig对象
            if (value === 'Citation' && !this.plugin.settings.propertyMappings[property].citationConfig) {
              this.plugin.settings.propertyMappings[property].citationConfig = {
                propertyName: 'entity-type',
                propertyValue: ''
              };
            }
            await this.plugin.saveSettings();
            // 重新渲染设置页面
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
      
      // 如果是Enum类型，添加额外的配置组件
      if (mapping.type === 'Enum') {
        // 确保enumOptions数组存在
        if (!mapping.enumOptions) {
          mapping.enumOptions = [];
        }
        
        // 创建Enum配置容器
        const enumContainer = containerEl.createEl('div');
        enumContainer.style.marginLeft = '20px';
        enumContainer.style.marginBottom = '10px';
        enumContainer.style.padding = '10px';
        enumContainer.style.border = '1px solid var(--background-modifier-border)';
        enumContainer.style.borderRadius = '4px';
        enumContainer.style.background = 'var(--background-secondary)';
        
        // 创建Enum标题
        enumContainer.createEl('h4', { text: 'Enum Options' });
        
        // 创建添加Enum选项的输入框和按钮
        const addEnumContainer = enumContainer.createEl('div');
        addEnumContainer.style.display = 'flex';
        addEnumContainer.style.gap = '8px';
        addEnumContainer.style.marginBottom = '10px';
        
        const enumNameInput = addEnumContainer.createEl('input');
        enumNameInput.type = 'text';
        enumNameInput.placeholder = 'Enum-Name';
        enumNameInput.style.flex = '1';
        enumNameInput.style.padding = '8px';
        enumNameInput.style.border = '1px solid var(--background-modifier-border)';
        enumNameInput.style.borderRadius = '4px';
        enumNameInput.style.background = 'var(--background-primary)';
        enumNameInput.style.color = 'var(--text-normal)';
        
        const addEnumButton = addEnumContainer.createEl('button', { text: 'Enum-Add' });
        addEnumButton.style.padding = '8px 16px';
        addEnumButton.style.border = '1px solid var(--background-modifier-border)';
        addEnumButton.style.borderRadius = '4px';
        addEnumButton.style.background = 'var(--background-secondary)';
        addEnumButton.style.color = 'var(--text-normal)';
        addEnumButton.style.cursor = 'pointer';
        
        // 添加Enum选项的点击事件
        addEnumButton.addEventListener('click', async () => {
          const enumName = enumNameInput.value.trim();
          if (enumName && !mapping.enumOptions?.includes(enumName)) {
            mapping.enumOptions?.push(enumName);
            await this.plugin.saveSettings();
            enumNameInput.value = '';
            this.display(); // 重新渲染设置页面
          }
        });
        
        // 显示已有的Enum选项
        mapping.enumOptions.forEach((option, index) => {
          const optionContainer = enumContainer.createEl('div');
          optionContainer.style.display = 'flex';
          optionContainer.style.alignItems = 'center';
          optionContainer.style.gap = '8px';
          optionContainer.style.marginBottom = '4px';
          
          const optionText = optionContainer.createEl('span');
          optionText.textContent = option;
          optionText.style.flex = '1';
          optionText.style.padding = '4px 8px';
          optionText.style.border = '1px solid var(--background-modifier-border)';
          optionText.style.borderRadius = '4px';
          
          const deleteEnumButton = optionContainer.createEl('button', { text: 'Enum-Delete' });
          deleteEnumButton.style.padding = '4px 8px';
          deleteEnumButton.style.border = '1px solid var(--background-modifier-border)';
          deleteEnumButton.style.borderRadius = '4px';
          deleteEnumButton.style.background = 'var(--background-secondary)';
          deleteEnumButton.style.color = 'var(--text-normal)';
          deleteEnumButton.style.cursor = 'pointer';
          
          // 删除Enum选项的点击事件
          deleteEnumButton.addEventListener('click', async () => {
            mapping.enumOptions?.splice(index, 1);
            await this.plugin.saveSettings();
            this.display(); // 重新渲染设置页面
          });
        });
      } 
      // 如果是Citation类型，添加额外的配置组件
      else if (mapping.type === 'Citation') {
        // 确保citationConfig对象存在
        if (!mapping.citationConfig) {
          mapping.citationConfig = {
            propertyName: 'entity-type',
            propertyValue: ''
          };
        }
        
        // 创建Citation配置容器
        const citationContainer = containerEl.createEl('div');
        citationContainer.style.marginLeft = '20px';
        citationContainer.style.marginBottom = '10px';
        citationContainer.style.padding = '10px';
        citationContainer.style.border = '1px solid var(--background-modifier-border)';
        citationContainer.style.borderRadius = '4px';
        citationContainer.style.background = 'var(--background-secondary)';
        
        // 创建Citation标题
        citationContainer.createEl('h4', { text: 'Citation Configuration' });
        
        // 创建Property-Name输入框
        const propertyNameContainer = citationContainer.createEl('div');
        propertyNameContainer.style.display = 'flex';
        propertyNameContainer.style.alignItems = 'center';
        propertyNameContainer.style.gap = '8px';
        propertyNameContainer.style.marginBottom = '8px';
        
        propertyNameContainer.createEl('label', { text: 'Property-Name:' });
        const propertyNameInput = propertyNameContainer.createEl('input');
        propertyNameInput.type = 'text';
        propertyNameInput.value = mapping.citationConfig.propertyName;
        propertyNameInput.style.flex = '1';
        propertyNameInput.style.padding = '8px';
        propertyNameInput.style.border = '1px solid var(--background-modifier-border)';
        propertyNameInput.style.borderRadius = '4px';
        propertyNameInput.style.background = 'var(--background-primary)';
        propertyNameInput.style.color = 'var(--text-normal)';
        
        // Property-Name输入框变化事件
        propertyNameInput.addEventListener('change', async () => {
          mapping.citationConfig.propertyName = propertyNameInput.value.trim();
          await this.plugin.saveSettings();
          this.display(); // 重新渲染设置页面
        });
        
        // 创建Property-Value输入框
        const propertyValueContainer = citationContainer.createEl('div');
        propertyValueContainer.style.display = 'flex';
        propertyValueContainer.style.alignItems = 'center';
        propertyValueContainer.style.gap = '8px';
        
        propertyValueContainer.createEl('label', { text: 'Property-Value:' });
        const propertyValueInput = propertyValueContainer.createEl('input');
        propertyValueInput.type = 'text';
        propertyValueInput.value = mapping.citationConfig.propertyValue;
        propertyValueInput.style.flex = '1';
        propertyValueInput.style.padding = '8px';
        propertyValueInput.style.border = '1px solid var(--background-modifier-border)';
        propertyValueInput.style.borderRadius = '4px';
        propertyValueInput.style.background = 'var(--background-primary)';
        propertyValueInput.style.color = 'var(--text-normal)';
        
        // Property-Value输入框变化事件
        propertyValueInput.addEventListener('change', async () => {
          mapping.citationConfig.propertyValue = propertyValueInput.value.trim();
          await this.plugin.saveSettings();
          this.display(); // 重新渲染设置页面
        });
      }
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
      .addDropdown(dropdown => dropdown
        .addOption('Checkbox', 'Checkbox')
        .addOption('Citation', 'Citation')
        .addOption('Date', 'Date')
        .addOption('Date & time', 'Date & time')
        .addOption('Enum', 'Enum')
        .addOption('List', 'List')
        .addOption('Number', 'Number')
        .addOption('Text', 'Text')
        .setValue('Text'))
      .addButton(button => button
        .setButtonText('Add')
        .onClick(async () => {
          const propertyInput = addMappingSetting.components[0] as TextComponent;
          const displayNameInput = addMappingSetting.components[1] as TextComponent;
          const typeDropdown = addMappingSetting.components[2] as any;
          const property = propertyInput.getValue().trim();
          const displayName2 = displayNameInput.getValue().trim();
          const type = typeDropdown.getValue();
          
          if (property && displayName2) {
            const newMapping: any = {
              displayName: displayName2,
              type: type as any
            };
            
            // 如果是Enum类型，初始化enumOptions数组
            if (type === 'Enum') {
              newMapping.enumOptions = [];
            }
            // 如果是Citation类型，初始化citationConfig对象
            if (type === 'Citation') {
              newMapping.citationConfig = {
                propertyName: 'entity-type',
                propertyValue: ''
              };
            }
            
            this.plugin.settings.propertyMappings[property] = newMapping;
            await this.plugin.saveSettings();
            // 清空输入框
            propertyInput.setValue('');
            displayNameInput.setValue('');
            typeDropdown.setValue('Text');
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
