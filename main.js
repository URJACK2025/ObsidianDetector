var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  "full_name": "\u4E8B\u4EF6\u4E3B\u8981\u5185\u5BB9",
  "rel-group": "\u5173\u8054\u7EC4\u7EC7",
  "rel-person": "\u5173\u8054\u4EBA\u5458",
  "rel-event": "\u5173\u8054\u4E8B\u4EF6",
  "rel-location": "\u5173\u8054\u5730\u70B9",
  "rel-country": "\u5173\u8054\u56FD\u5BB6",
  "birth": "\u51FA\u751F\u65E5\u671F",
  "gender": "\u6027\u522B",
  "code": "\u4EE3\u7801"
};
var DEFAULT_SETTINGS = {
  eventNotePath: "Events",
  templatePath: "_Templates/Temp-Event.md",
  propertyMappings: DEFAULT_PROPERTY_MAPPINGS
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
var EventModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.inputFields = {};
    this.templateProperties = [];
    this.plugin = plugin;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    return __async(this, null, function* () {
      const { contentEl } = this;
      contentEl.createEl("h2", { text: "Create Entity-Event" });
      try {
        const templatePath = this.plugin.settings.templatePath;
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (!templateFile) {
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
          const displayName = getDisplayName(property, this.plugin.settings.propertyMappings);
          form.createEl("label", { text: displayName });
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
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Entity Creator Settings" });
    new import_obsidian.Setting(containerEl).setName("Entity-Event Note Path").setDesc("Path where Event notes will be created").addText((text) => text.setPlaceholder("Events").setValue(this.plugin.settings.eventNotePath).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.eventNotePath = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Template File Path").setDesc("Path to the Event template file").addText((text) => text.setPlaceholder("_Templates/Temp-Event.md").setValue(this.plugin.settings.templatePath).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.templatePath = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h3", { text: "Property Mappings" });
    containerEl.createEl("p", { text: "Map template properties to display names in the modal" });
    Object.entries(this.plugin.settings.propertyMappings).forEach(([property, displayName]) => {
      const setting = new import_obsidian.Setting(containerEl).setName(property).setDesc(`Display name: ${displayName}`).addText((text) => text.setValue(displayName).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.propertyMappings[property] = value;
        yield this.plugin.saveSettings();
        this.display();
      })));
    });
    const addMappingSetting = new import_obsidian.Setting(containerEl).setName("Add New Mapping").setDesc("Add a new property mapping").addText((text) => text.setPlaceholder("property-name").setValue("")).addText((text2) => text2.setPlaceholder("Display Name").setValue("")).addButton((button) => button.setButtonText("Add").onClick(() => __async(this, null, function* () {
      const propertyInput = addMappingSetting.components[0];
      const displayNameInput = addMappingSetting.components[1];
      const property = propertyInput.getValue().trim();
      const displayName = displayNameInput.getValue().trim();
      if (property && displayName) {
        this.plugin.settings.propertyMappings[property] = displayName;
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
      this.addCommand({
        id: "create-entity-event",
        name: "Create Entity-Event",
        callback: () => {
          new EventModal(this.app, this, (result) => __async(this, null, function* () {
            yield this.createEventNote(result);
          })).open();
        }
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
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
  createEventNote(data) {
    return __async(this, null, function* () {
      try {
        const templatePath = this.settings.templatePath;
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (!templateFile) {
          console.error(`Template file not found at: ${templatePath}`);
          return;
        }
        const templateContent = yield this.app.vault.read(templateFile);
        let content = templateContent;
        Object.entries(data).forEach(([key, value]) => {
          const regex = new RegExp(`${key}:`, "g");
          content = content.replace(regex, `${key}: ${value}`);
        });
        const path = this.settings.eventNotePath;
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
        console.error("Error creating event note:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    });
  }
};
var main_default = EntityCreatorPlugin;
