import { App, TFile } from 'obsidian';
import { EntityCreatorSettings, PropertyType } from '../types';
import { getDisplayName } from '../utils/yaml';

// 控件引用接口
export interface ControlReference {
  type: PropertyType;
  element?: HTMLElement;
  getValues?: () => any[];
  addValue?: (value: string) => void;
  getValue?: () => any;
}

// 属性控件渲染器类
export class PropertyControlRenderer {
  app: App;
  plugin: { settings: EntityCreatorSettings };

  constructor(app: App, plugin: { settings: EntityCreatorSettings }) {
    this.app = app;
    this.plugin = plugin;
  }

  // 根据属性类型渲染控件
  renderControl(
    container: HTMLElement,
    property: string
  ): ControlReference {
    const propertyMapping = this.plugin.settings.propertyMappings[property];
    const displayName = getDisplayName(property, this.plugin.settings.propertyMappings);
    const propertyType = propertyMapping?.type || 'Text';

    // 创建控件容器
    const controlContainer = container.createEl('div');
    controlContainer.style.display = 'flex';
    controlContainer.style.flexDirection = 'column';

    // 创建标签
    const label = controlContainer.createEl('label');
    label.textContent = displayName;
    label.style.marginBottom = '5px';
    label.style.fontWeight = 'bold';

    // 根据属性类型创建不同的控件
    switch (propertyType) {
      case 'Checkbox':
        return this.renderCheckboxControl(controlContainer, propertyType);
      case 'Citation':
        return this.renderCitationControl(controlContainer, propertyType, propertyMapping?.citationConfig);
      case 'Enum':
        return this.renderEnumControl(controlContainer, propertyType, propertyMapping?.enumOptions);
      case 'List':
        return this.renderListControl(controlContainer, propertyType);
      case 'Date':
      case 'Date & time':
      case 'Number':
      case 'Text':
      default:
        return this.renderInputControl(controlContainer, propertyType);
    }
  }

  // 渲染Checkbox控件
  private renderCheckboxControl(container: HTMLElement, type: PropertyType): ControlReference {
    // 创建checkbox容器
    const checkboxContainer = container.createEl('div');
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

    return {
      type,
      element: checkbox,
      getValue: () => checkbox.checked
    };
  }

  // 渲染Citation控件
  private renderCitationControl(
    container: HTMLElement,
    type: PropertyType,
    citationConfig?: { propertyName: string; propertyValue: string }
  ): ControlReference {
    // 使用默认配置如果没有提供
    const config = citationConfig || { propertyName: 'entity-type', propertyValue: '' };

    // 创建引用容器
    const citationContainer = container.createEl('div');
    citationContainer.style.display = 'flex';
    citationContainer.style.flexDirection = 'column';
    citationContainer.style.gap = '8px';

    // 创建搜索容器
    const searchContainer = citationContainer.createEl('div');
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '8px';

    // 创建搜索输入框
    const searchInput = searchContainer.createEl('input');
    searchInput.type = 'text';
    searchInput.placeholder = `Search`;
    searchInput.style.flex = '1';
    searchInput.style.padding = '8px';
    searchInput.style.border = '1px solid var(--background-modifier-border)';
    searchInput.style.borderRadius = '4px';
    searchInput.style.background = 'var(--background-primary)';
    searchInput.style.color = 'var(--text-normal)';

    // 创建搜索按钮
    const searchButton = searchContainer.createEl('button', { text: 'Search' });
    searchButton.type = 'button';
    searchButton.style.padding = '8px 16px';
    searchButton.style.border = '1px solid var(--background-modifier-border)';
    searchButton.style.borderRadius = '4px';
    searchButton.style.background = 'var(--background-secondary)';
    searchButton.style.color = 'var(--text-normal)';
    searchButton.style.cursor = 'pointer';

    // 创建搜索结果容器
    const resultsContainer = citationContainer.createEl('div');
    resultsContainer.style.maxHeight = '200px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.border = '1px solid var(--background-modifier-border)';
    resultsContainer.style.borderRadius = '4px';
    resultsContainer.style.padding = '8px';
    resultsContainer.style.background = 'var(--background-primary)';
    resultsContainer.style.display = 'none'; // 默认隐藏

    // 创建已选择引用容器
    const selectedContainer = citationContainer.createEl('div');
    selectedContainer.style.display = 'flex';
    selectedContainer.style.flexDirection = 'column';
    selectedContainer.style.gap = '4px';

    // 存储已选择的引用
    const selectedCitations: string[] = [];

    // 搜索函数
    const searchCitations = async () => {
      const searchTerm = searchInput.value.trim();
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'block';

      if (!searchTerm) {
        resultsContainer.createEl('div', { text: 'Please enter a search term' });
        return;
      }

      try {
        // 使用Obsidian的API获取所有文件
        const allFiles = this.app.vault.getFiles();

        // 过滤符合条件的文件
        const filteredFiles = allFiles.filter(file => {
          // 检查文件名是否包含搜索词
          if (!file.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }

          // 只处理markdown文件
          return file.extension === 'md';
        });

        if (filteredFiles.length === 0) {
          resultsContainer.createEl('div', { text: 'No results found' });
          return;
        }

        // 显示搜索结果
        filteredFiles.forEach(file => {
          const resultItem = resultsContainer.createEl('div');
          resultItem.style.padding = '8px';
          resultItem.style.borderBottom = '1px solid var(--background-modifier-border)';
          resultItem.style.cursor = 'pointer';
          resultItem.style.borderRadius = '4px';
          resultItem.style.transition = 'background-color 0.2s';

          // 显示文件名，不包含扩展名
          const fileName = file.name.replace(/\.md$/, '');
          resultItem.textContent = fileName;

          // 添加悬停效果
          resultItem.addEventListener('mouseenter', () => {
            resultItem.style.background = 'var(--background-secondary)';
          });

          resultItem.addEventListener('mouseleave', () => {
            resultItem.style.background = 'transparent';
          });

          // 添加点击事件
          resultItem.addEventListener('click', () => {
            // 使用相对路径作为引用
            const notePath = file.path;
            if (!selectedCitations.includes(notePath)) {
              selectedCitations.push(notePath);
              renderSelectedCitations();
            }
            resultsContainer.style.display = 'none';
          });
        });
      } catch (error) {
        console.error('Error searching citations:', error);
        resultsContainer.createEl('div', { text: `Error searching citations: ${(error as Error).message}` });
      }
    };

    // 渲染已选择的引用
    const renderSelectedCitations = () => {
      selectedContainer.innerHTML = '';

      selectedCitations.forEach((citation, index) => {
        const citationItem = selectedContainer.createEl('div');
        citationItem.style.display = 'flex';
        citationItem.style.alignItems = 'center';
        citationItem.style.gap = '8px';
        citationItem.style.padding = '4px 8px';
        citationItem.style.border = '1px solid var(--background-modifier-border)';
        citationItem.style.borderRadius = '4px';
        citationItem.style.background = 'var(--background-secondary)';

        const citationText = citationItem.createEl('span');
        citationText.textContent = citation;
        citationText.style.flex = '1';

        const removeButton = citationItem.createEl('button', { text: '×' });
        removeButton.type = 'button';
        removeButton.style.width = '24px';
        removeButton.style.height = '24px';
        removeButton.style.display = 'flex';
        removeButton.style.alignItems = 'center';
        removeButton.style.justifyContent = 'center';
        removeButton.style.border = '1px solid var(--background-modifier-border)';
        removeButton.style.borderRadius = '4px';
        removeButton.style.background = 'var(--background-primary)';
        removeButton.style.color = 'var(--text-normal)';
        removeButton.style.cursor = 'pointer';

        // 删除引用的点击事件
        removeButton.addEventListener('click', () => {
          selectedCitations.splice(index, 1);
          renderSelectedCitations();
        });
      });
    };

    // 搜索按钮点击事件
    searchButton.addEventListener('click', searchCitations);

    // 回车键搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchCitations();
      }
    });

    // 点击外部关闭搜索结果
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target as Node) && !resultsContainer.contains(e.target as Node)) {
        resultsContainer.style.display = 'none';
      }
    });

    return {
      type,
      getValues: () => selectedCitations
    };
  }

  // 渲染Enum控件
  private renderEnumControl(
    container: HTMLElement,
    type: PropertyType,
    enumOptions?: string[]
  ): ControlReference {
    // 使用空数组如果没有提供选项
    const options = enumOptions || [];

    const selectElement = document.createElement('select');
    selectElement.style.padding = '8px';
    selectElement.style.border = '1px solid var(--background-modifier-border)';
    selectElement.style.borderRadius = '4px';
    selectElement.style.background = 'var(--background-primary)';
    selectElement.style.color = 'var(--text-normal)';

    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Select`;
    selectElement.appendChild(defaultOption);

    // 添加Enum选项
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    });

    // 添加到容器
    container.appendChild(selectElement);

    return {
      type,
      element: selectElement,
      getValue: () => selectElement.value
    };
  }

  // 渲染List控件
  private renderListControl(container: HTMLElement, type: PropertyType): ControlReference {
    const listContainer = container.createEl('div');
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
    newInput.placeholder = `Add value`;
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

    addContainer.appendChild(newInput);
    addContainer.appendChild(addButton);

    return {
      type,
      addValue,
      getValues: () => values
    };
  }

  // 渲染输入控件（Date, Date & time, Number, Text）
  private renderInputControl(container: HTMLElement, type: PropertyType): ControlReference {
    let inputElement: HTMLInputElement;

    switch (type) {
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
        inputElement.placeholder = `Enter value`;
        break;
    }

    // 添加通用样式
    inputElement.style.padding = '8px';
    inputElement.style.border = '1px solid var(--background-modifier-border)';
    inputElement.style.borderRadius = '4px';
    inputElement.style.background = 'var(--background-primary)';
    inputElement.style.color = 'var(--text-normal)';

    // 添加到容器
    container.appendChild(inputElement);

    return {
      type,
      element: inputElement,
      getValue: () => inputElement.value
    };
  }
}
