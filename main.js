var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
__export(exports, {
  default: () => main_default
});
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_PROPERTY_MAPPINGS = {
  "full_name": "\u540D\u79F0",
  "rel-group": "\u5173\u8054\u7EC4\u7EC7",
  "rel-person": "\u5173\u8054\u4EBA\u5458",
  "rel-event": "\u5173\u8054\u4E8B\u4EF6",
  "rel-location": "\u5173\u8054\u5730\u70B9",
  "rel-country": "\u5173\u8054\u56FD\u5BB6",
  "birth": "\u51FA\u751F\u65E5\u671F",
  "gender": "\u6027\u522B",
  "code": "\u4EE3\u7801",
  "description": "\u63CF\u8FF0"
};
var ENTITY_DISPLAY_NAMES = {
  "event": "Event",
  "person": "Person",
  "organization": "Organization",
  "location": "Location",
  "country": "Country"
};
var DEFAULT_ENTITY_CONFIGS = {
  "event": {
    notePath: "Events",
    templatePath: "_Templates/Temp-Event.md",
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  "person": {
    notePath: "Person",
    templatePath: "_Templates/Temp-Person.md",
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  "organization": {
    notePath: "Organization",
    templatePath: "_Templates/Temp-Group.md",
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  "location": {
    notePath: "Location",
    templatePath: "_Templates/Temp-Location.md",
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  },
  "country": {
    notePath: "Country",
    templatePath: "_Templates/Temp-Country.md",
    propertyMappings: DEFAULT_PROPERTY_MAPPINGS
  }
};
function parseYamlFrontMatter(content) {
  const yamlRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(yamlRegex);
  if (!match) {
    return {};
  }
  const yamlContent = match[1];
  const properties = {};
  yamlContent.split("\n").forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split(":");
      if (key) {
        const value = valueParts.join(":").trim();
        properties[key.trim()] = value;
      }
    }
  });
  return properties;
}
function getTemplateProperties(content) {
  const properties = parseYamlFrontMatter(content);
  return Object.keys(properties).filter((key) => key !== "entity-type");
}
function getDisplayName(property, mappings) {
  return mappings[property] || property;
}
var EntityModal = class extends import_obsidian.Modal {
  constructor(app, plugin, entityType, onSubmit) {
    super(app);
    this.inputFields = {};
    this.templateProperties = [];
    this.plugin = plugin;
    this.entityType = entityType;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    return __async(this, null, function* () {
      const { contentEl } = this;
      const displayName = ENTITY_DISPLAY_NAMES[this.entityType];
      contentEl.createEl("h2", { text: `Create Entity-${displayName}` });
      try {
        const entityConfig = this.plugin.settings.entities[this.entityType];
        if (!entityConfig) {
          contentEl.createEl("div", { text: `No configuration found for entity type: ${this.entityType}`, cls: "error" });
          return;
        }
        const templatePath = entityConfig.templatePath;
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (!templateFile || !(templateFile instanceof import_obsidian.TFile)) {
          contentEl.createEl("div", { text: `Template file not found: ${templatePath}`, cls: "error" });
          return;
        }
        const templateContent = yield this.app.vault.read(templateFile);
        this.templateProperties = getTemplateProperties(templateContent);
        if (this.templateProperties.length === 0) {
          contentEl.createEl("div", { text: "No properties found in template", cls: "error" });
          return;
        }
        const form = contentEl.createEl("form");
        form.style.display = "flex";
        form.style.flexDirection = "column";
        form.style.gap = "10px";
        this.templateProperties.forEach((property) => {
          const displayName2 = getDisplayName(property, entityConfig.propertyMappings);
          form.createEl("label", { text: displayName2 });
          const input = new import_obsidian.TextComponent(form);
          input.setPlaceholder(`Enter ${property}`);
          this.inputFields[property] = input;
        });
        const buttonContainer = form.createEl("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "flex-end";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.marginTop = "10px";
        const cancelBtn = buttonContainer.createEl("button", { text: "Cancel", type: "button" });
        cancelBtn.addEventListener("click", () => {
          this.close();
        });
        const submitBtn = buttonContainer.createEl("button", { text: "Create", type: "submit" });
        submitBtn.style.marginLeft = "auto";
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const result = {};
          this.templateProperties.forEach((property) => {
            result[property] = this.inputFields[property].getValue();
          });
          this.onSubmit(result);
          this.close();
        });
      } catch (error) {
        console.error("Error loading template:", error);
        contentEl.createEl("div", { text: "Error loading template", cls: "error" });
      }
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.inputFields = {};
    this.templateProperties = [];
  }
};
var EntityCreatorSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.activeTab = "event";
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Entity Creator Settings" });
    const tabContainer = containerEl.createEl("div");
    tabContainer.style.display = "flex";
    tabContainer.style.flexDirection = "column";
    tabContainer.style.gap = "10px";
    const tabNav = tabContainer.createEl("div");
    tabNav.style.display = "flex";
    tabNav.style.gap = "5px";
    tabNav.style.borderBottom = "1px solid var(--background-modifier-border)";
    tabNav.style.paddingBottom = "5px";
    const tabContent = tabContainer.createEl("div");
    Object.keys(ENTITY_DISPLAY_NAMES).forEach((entityTypeStr) => {
      const entityType = entityTypeStr;
      const displayName = ENTITY_DISPLAY_NAMES[entityType];
      const tabButton = tabNav.createEl("button", { text: displayName });
      tabButton.style.padding = "5px 10px";
      tabButton.style.border = "1px solid var(--background-modifier-border)";
      tabButton.style.borderRadius = "4px 4px 0 0";
      tabButton.style.background = this.activeTab === entityType ? "var(--background-primary)" : "var(--background-secondary)";
      tabButton.style.cursor = "pointer";
      tabButton.addEventListener("click", () => {
        this.activeTab = entityType;
        this.display();
      });
    });
    this.renderTabContent(tabContent, this.activeTab);
  }
  renderTabContent(containerEl, entityType) {
    const displayName = ENTITY_DISPLAY_NAMES[entityType];
    const entityConfig = this.plugin.settings.entities[entityType];
    if (!entityConfig) {
      containerEl.createEl("div", { text: `No configuration found for ${displayName}` });
      return;
    }
    containerEl.createEl("h3", { text: `${displayName} Settings` });
    new import_obsidian.Setting(containerEl).setName(`${displayName} Note Path`).setDesc(`Path where ${displayName} notes will be created`).addText((text) => text.setPlaceholder(`${displayName}s`).setValue(entityConfig.notePath).onChange((value) => __async(this, null, function* () {
      entityConfig.notePath = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName(`${displayName} Template File Path`).setDesc(`Path to the ${displayName} template file`).addText((text) => text.setPlaceholder(`_Templates/Temp-${displayName}.md`).setValue(entityConfig.templatePath).onChange((value) => __async(this, null, function* () {
      entityConfig.templatePath = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h4", { text: `${displayName} Property Mappings` });
    containerEl.createEl("p", { text: "Map template properties to display names in the modal" });
    Object.entries(entityConfig.propertyMappings).forEach(([property, displayName2]) => {
      const setting = new import_obsidian.Setting(containerEl).setName(property).setDesc(`Display name: ${displayName2}`).addText((text) => text.setValue(displayName2).onChange((value) => __async(this, null, function* () {
        entityConfig.propertyMappings[property] = value;
        yield this.plugin.saveSettings();
        this.display();
      })));
    });
    const addMappingSetting = new import_obsidian.Setting(containerEl).setName("Add New Mapping").setDesc("Add a new property mapping").addText((text) => text.setPlaceholder("property-name").setValue("")).addText((text2) => text2.setPlaceholder("Display Name").setValue("")).addButton((button) => button.setButtonText("Add").onClick(() => __async(this, null, function* () {
      const propertyInput = addMappingSetting.components[0];
      const displayNameInput = addMappingSetting.components[1];
      const property = propertyInput.getValue().trim();
      const displayName2 = displayNameInput.getValue().trim();
      if (property && displayName2) {
        entityConfig.propertyMappings[property] = displayName2;
        yield this.plugin.saveSettings();
        propertyInput.setValue("");
        displayNameInput.setValue("");
        this.display();
      }
    })));
  }
};
var EntityCreatorPlugin = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      Object.keys(DEFAULT_ENTITY_CONFIGS).forEach((entityTypeStr) => {
        const entityType = entityTypeStr;
        const displayName = ENTITY_DISPLAY_NAMES[entityType];
        this.addCommand({
          id: `create-entity-${entityType}`,
          name: `Create Entity-${displayName}`,
          callback: () => {
            new EntityModal(this.app, this, entityType, (result) => __async(this, null, function* () {
              yield this.createEntityNote(entityType, result);
            })).open();
          }
        });
      });
      this.addSettingTab(new EntityCreatorSettingTab(this.app, this));
    });
  }
  onunload() {
    return __async(this, null, function* () {
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      const loadedSettings = yield this.loadData();
      this.settings = {
        entities: {
          event: DEFAULT_ENTITY_CONFIGS.event,
          person: DEFAULT_ENTITY_CONFIGS.person,
          organization: DEFAULT_ENTITY_CONFIGS.organization,
          location: DEFAULT_ENTITY_CONFIGS.location,
          country: DEFAULT_ENTITY_CONFIGS.country
        }
      };
      Object.keys(DEFAULT_ENTITY_CONFIGS).forEach((entityTypeStr) => {
        var _a;
        const entityType = entityTypeStr;
        if ((_a = loadedSettings == null ? void 0 : loadedSettings.entities) == null ? void 0 : _a[entityType]) {
          this.settings.entities[entityType] = __spreadValues(__spreadValues({}, this.settings.entities[entityType]), loadedSettings.entities[entityType]);
        }
      });
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
  createEntityNote(entityType, data) {
    return __async(this, null, function* () {
      try {
        const entityConfig = this.settings.entities[entityType];
        if (!entityConfig) {
          console.error(`No configuration found for entity type: ${entityType}`);
          return;
        }
        const templatePath = entityConfig.templatePath;
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (!templateFile || !(templateFile instanceof import_obsidian.TFile)) {
          console.error(`Template file not found at: ${templatePath}`);
          return;
        }
        const templateContent = yield this.app.vault.read(templateFile);
        let content = templateContent;
        Object.entries(data).forEach(([key, value]) => {
          const regex = new RegExp(`${key}:`, "g");
          content = content.replace(regex, `${key}: ${value}`);
        });
        const path = entityConfig.notePath;
        let folder = this.app.vault.getAbstractFileByPath(path);
        if (!folder) {
          console.log(`Creating folder: ${path}`);
          yield this.app.vault.createFolder(path);
          folder = this.app.vault.getAbstractFileByPath(path);
        }
        if (!folder) {
          console.error(`Failed to create folder: ${path}`);
          return;
        }
        const fileName = `${data["full_name"] || "Untitled"}.md`;
        const notePath = `${path}/${fileName}`;
        console.log(`Creating note at: ${notePath}`);
        yield this.app.vault.create(notePath, content);
        console.log(`Note created successfully: ${notePath}`);
      } catch (error) {
        console.error(`Error creating ${entityType} note:`, error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    });
  }
};
var main_default = EntityCreatorPlugin;
