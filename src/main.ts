import { App, Plugin, PluginSettingTab, Setting, Modal, TextComponent } from 'obsidian';

// 插件设置接口
interface EntityCreatorSettings {
  eventNotePath: string;
  templatePath: string;
}

// 默认设置
const DEFAULT_SETTINGS: EntityCreatorSettings = {
  eventNotePath: 'Events',
  templatePath: '_Templates/Temp-Event.md'
};

// 事件创建弹窗
class EventModal extends Modal {
  // 输入框引用
  relGroupEl: TextComponent;
  relPersonEl: TextComponent;
  relEventEl: TextComponent;
  relLocationEl: TextComponent;
  relCountryEl: TextComponent;
  fullNameEl: TextComponent;
  
  // 回调函数
  onSubmit: (result: {
    relGroup: string;
    relPerson: string;
    relEvent: string;
    relLocation: string;
    relCountry: string;
    fullName: string;
  }) => void;

  constructor(app: App, onSubmit: (result: any) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    // 设置标题
    contentEl.createEl('h2', { text: 'Create Entity-Event' });

    // 创建表单容器
    const form = contentEl.createEl('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';

    // 关联组织
    form.createEl('label', { text: '关联组织' });
    this.relGroupEl = new TextComponent(form);
    this.relGroupEl.setPlaceholder('Enter related group');

    // 关联人员
    form.createEl('label', { text: '关联人员' });
    this.relPersonEl = new TextComponent(form);
    this.relPersonEl.setPlaceholder('Enter related person');

    // 关联事件
    form.createEl('label', { text: '关联事件' });
    this.relEventEl = new TextComponent(form);
    this.relEventEl.setPlaceholder('Enter related event');

    // 关联地点
    form.createEl('label', { text: '关联地点' });
    this.relLocationEl = new TextComponent(form);
    this.relLocationEl.setPlaceholder('Enter related location');

    // 关联国家
    form.createEl('label', { text: '关联国家' });
    this.relCountryEl = new TextComponent(form);
    this.relCountryEl.setPlaceholder('Enter related country');

    // 事件主要内容
    form.createEl('label', { text: '事件主要内容' });
    this.fullNameEl = new TextComponent(form);
    this.fullNameEl.setPlaceholder('Enter event name');

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
      this.onSubmit({
        relGroup: this.relGroupEl.getValue(),
        relPerson: this.relPersonEl.getValue(),
        relEvent: this.relEventEl.getValue(),
        relLocation: this.relLocationEl.getValue(),
        relCountry: this.relCountryEl.getValue(),
        fullName: this.fullNameEl.getValue()
      });
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
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
        new EventModal(this.app, async (result) => {
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
  async createEventNote(data: {
    relGroup: string;
    relPerson: string;
    relEvent: string;
    relLocation: string;
    relCountry: string;
    fullName: string;
  }) {
    try {
      // 读取模板文件
      const templatePath = this.settings.templatePath;
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      
      if (!templateFile) {
        console.error(`Template file not found at: ${templatePath}`);
        return;
      }
      
      const templateContent = await this.app.vault.read(templateFile);

      // 替换模板变量
      let content = templateContent
        .replace(/rel-group:/, `rel-group: ${data.relGroup}`)
        .replace(/rel-person:/, `rel-person: ${data.relPerson}`)
        .replace(/rel-event:/, `rel-event: ${data.relEvent}`)
        .replace(/rel-location:/, `rel-location: ${data.relLocation}`)
        .replace(/rel-country:/, `rel-country: ${data.relCountry}`)
        .replace(/full_name:/, `full_name: ${data.fullName}`);

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

      // 创建新笔记
      const fileName = `${data.fullName || 'Untitled'}.md`;
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
