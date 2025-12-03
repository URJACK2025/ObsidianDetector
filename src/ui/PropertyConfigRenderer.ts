import { Setting, TextComponent } from 'obsidian';
import { EntityCreatorSettings, PropertyType } from '../types';
import { PROPERTY_TYPES } from './PropertyTypeManager';

// 属性配置渲染器类
export class PropertyConfigRenderer {
  plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> };

  constructor(plugin: { settings: EntityCreatorSettings; saveSettings: () => Promise<void> }) {
    this.plugin = plugin;
  }

  // 渲染属性配置
  renderPropertyConfig(
    containerEl: HTMLElement,
    property: string,
    mapping: any,
    onUpdate: () => void
  ): Setting {
    // 创建设置项
    const setting = new Setting(containerEl)
      .setName(property)
      .setDesc(`Display name: ${mapping.displayName}, Type: ${mapping.type}`)
      .addText(text => text
        .setValue(mapping.displayName)
        .onChange(async (value) => {
          this.plugin.settings.propertyMappings[property].displayName = value;
          await this.plugin.saveSettings();
          onUpdate();
        }))
      .addDropdown(dropdown => {
        // 添加所有属性类型选项
        PROPERTY_TYPES.forEach(type => {
          dropdown.addOption(type, type);
        });
        
        return dropdown
          .setValue(mapping.type)
          .onChange(async (value) => {
            this.plugin.settings.propertyMappings[property].type = value as PropertyType;
            
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
            onUpdate();
          });
      })
      .addButton(button => button
        .setButtonText('Delete')
        .setWarning()
        .onClick(async () => {
          delete this.plugin.settings.propertyMappings[property];
          await this.plugin.saveSettings();
          onUpdate();
        }));

    return setting;
  }

  // 渲染Enum类型额外配置
  renderEnumConfig(
    containerEl: HTMLElement,
    property: string,
    mapping: any,
    onUpdate: () => void
  ): void {
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
        onUpdate();
      }
    });

    // 显示已有的Enum选项
    mapping.enumOptions.forEach((option: string, index: number) => {
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
        onUpdate();
      });
    });
  }

  // 渲染Citation类型额外配置
  renderCitationConfig(
    containerEl: HTMLElement,
    property: string,
    mapping: any,
    onUpdate: () => void
  ): void {
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
      onUpdate();
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
      onUpdate();
    });
  }

  // 渲染添加新映射的表单
  renderAddMappingForm(
    containerEl: HTMLElement,
    onUpdate: () => void
  ): Setting {
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
      .addDropdown(dropdown => {
        // 添加所有属性类型选项
        PROPERTY_TYPES.forEach(type => {
          dropdown.addOption(type, type);
        });
        
        return dropdown.setValue('Text');
      })
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
              type: type as PropertyType
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
            
            onUpdate();
          }
        }));

    return addMappingSetting;
  }
}
