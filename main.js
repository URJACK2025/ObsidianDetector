var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var import_obsidian3 = __toModule(require("obsidian"));

// src/types.ts
var DEFAULT_PROPERTY_MAPPINGS = {
  "full_name": { displayName: "\u540D\u79F0", type: "Text" },
  "rel-group": { displayName: "\u5173\u8054\u7EC4\u7EC7", type: "Text" },
  "rel-person": { displayName: "\u5173\u8054\u4EBA\u5458", type: "Text" },
  "rel-event": { displayName: "\u5173\u8054\u4E8B\u4EF6", type: "Text" },
  "rel-location": { displayName: "\u5173\u8054\u5730\u70B9", type: "Text" },
  "rel-country": { displayName: "\u5173\u8054\u56FD\u5BB6", type: "Text" },
  "birth": { displayName: "\u51FA\u751F\u65E5\u671F", type: "Date" },
  "gender": { displayName: "\u6027\u522B", type: "Text" },
  "code": { displayName: "\u4EE3\u7801", type: "Text" },
  "description": { displayName: "\u63CF\u8FF0", type: "Text" }
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
    templatePath: "_Templates/Temp-Event.md"
  },
  "person": {
    notePath: "Person",
    templatePath: "_Templates/Temp-Person.md"
  },
  "organization": {
    notePath: "Organization",
    templatePath: "_Templates/Temp-Group.md"
  },
  "location": {
    notePath: "Location",
    templatePath: "_Templates/Temp-Location.md"
  },
  "country": {
    notePath: "Country",
    templatePath: "_Templates/Temp-Country.md"
  }
};

// src/ui/EntityModal.ts
var import_obsidian = __toModule(require("obsidian"));

// src/utils/yaml.ts
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
  var _a;
  return ((_a = mappings[property]) == null ? void 0 : _a.displayName) || property;
}

// src/ui/EntityModal.ts
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
        form.style.gap = "15px";
        this.templateProperties.forEach((property) => {
          try {
            const propertyMapping = this.plugin.settings.propertyMappings[property];
            const displayName2 = getDisplayName(property, this.plugin.settings.propertyMappings);
            const propertyType = (propertyMapping == null ? void 0 : propertyMapping.type) || "Text";
            const controlContainer = form.createEl("div");
            controlContainer.style.display = "flex";
            controlContainer.style.flexDirection = "column";
            const label = controlContainer.createEl("label");
            label.textContent = displayName2;
            label.style.marginBottom = "5px";
            label.style.fontWeight = "bold";
            if (propertyType === "Checkbox") {
              const checkboxContainer = controlContainer.createEl("div");
              checkboxContainer.style.display = "flex";
              checkboxContainer.style.alignItems = "center";
              checkboxContainer.style.gap = "8px";
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.style.margin = "0";
              const checkboxLabel = document.createElement("label");
              checkboxLabel.textContent = "Yes";
              checkboxLabel.style.cursor = "pointer";
              checkboxLabel.style.userSelect = "none";
              checkboxContainer.appendChild(checkbox);
              checkboxContainer.appendChild(checkboxLabel);
              this.inputFields[property] = { type: propertyType, element: checkbox };
            } else if (propertyType === "List") {
              const listContainer = controlContainer.createEl("div");
              listContainer.style.display = "flex";
              listContainer.style.flexDirection = "column";
              listContainer.style.gap = "8px";
              const valuesContainer = listContainer.createEl("div");
              valuesContainer.style.display = "flex";
              valuesContainer.style.flexDirection = "column";
              valuesContainer.style.gap = "4px";
              const addContainer = listContainer.createEl("div");
              addContainer.style.display = "flex";
              addContainer.style.gap = "8px";
              const newInput = document.createElement("input");
              newInput.type = "text";
              newInput.placeholder = `Add ${property}`;
              newInput.style.flex = "1";
              newInput.style.padding = "8px";
              newInput.style.border = "1px solid var(--background-modifier-border)";
              newInput.style.borderRadius = "4px";
              newInput.style.background = "var(--background-primary)";
              newInput.style.color = "var(--text-normal)";
              const addButton = document.createElement("button");
              addButton.type = "button";
              addButton.textContent = "Add";
              addButton.style.padding = "8px 16px";
              addButton.style.border = "1px solid var(--background-modifier-border)";
              addButton.style.borderRadius = "4px";
              addButton.style.background = "var(--background-secondary)";
              addButton.style.color = "var(--text-normal)";
              addButton.style.cursor = "pointer";
              addContainer.appendChild(newInput);
              addContainer.appendChild(addButton);
              const values = [];
              const addValue = (value) => {
                if (value.trim() && !values.includes(value.trim())) {
                  const valueItem = valuesContainer.createEl("div");
                  valueItem.style.display = "flex";
                  valueItem.style.alignItems = "center";
                  valueItem.style.gap = "8px";
                  const valueText = document.createElement("span");
                  valueText.textContent = value.trim();
                  valueText.style.flex = "1";
                  valueText.style.padding = "4px 8px";
                  valueText.style.border = "1px solid var(--background-modifier-border)";
                  valueText.style.borderRadius = "4px";
                  valueText.style.background = "var(--background-secondary)";
                  const removeButton = document.createElement("button");
                  removeButton.type = "button";
                  removeButton.textContent = "\xD7";
                  removeButton.style.width = "24px";
                  removeButton.style.height = "24px";
                  removeButton.style.display = "flex";
                  removeButton.style.alignItems = "center";
                  removeButton.style.justifyContent = "center";
                  removeButton.style.border = "1px solid var(--background-modifier-border)";
                  removeButton.style.borderRadius = "4px";
                  removeButton.style.background = "var(--background-secondary)";
                  removeButton.style.color = "var(--text-normal)";
                  removeButton.style.cursor = "pointer";
                  removeButton.style.fontSize = "16px";
                  removeButton.style.lineHeight = "1";
                  const removeValue = () => {
                    const index = values.indexOf(value.trim());
                    if (index > -1) {
                      values.splice(index, 1);
                    }
                    valueItem.remove();
                  };
                  removeButton.addEventListener("click", removeValue);
                  valueItem.appendChild(valueText);
                  valueItem.appendChild(removeButton);
                  values.push(value.trim());
                }
              };
              addButton.addEventListener("click", () => {
                addValue(newInput.value);
                newInput.value = "";
              });
              newInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                  addValue(newInput.value);
                  newInput.value = "";
                }
              });
              this.inputFields[property] = {
                type: propertyType,
                addValue,
                getValues: () => values
              };
            } else {
              let inputElement;
              switch (propertyType) {
                case "Date":
                  inputElement = document.createElement("input");
                  inputElement.type = "date";
                  break;
                case "Date & time":
                  inputElement = document.createElement("input");
                  inputElement.type = "datetime-local";
                  break;
                case "Number":
                  inputElement = document.createElement("input");
                  inputElement.type = "number";
                  break;
                case "Text":
                default:
                  inputElement = document.createElement("input");
                  inputElement.type = "text";
                  inputElement.placeholder = `Enter ${property}`;
                  break;
              }
              inputElement.style.padding = "8px";
              inputElement.style.border = "1px solid var(--background-modifier-border)";
              inputElement.style.borderRadius = "4px";
              inputElement.style.background = "var(--background-primary)";
              inputElement.style.color = "var(--text-normal)";
              controlContainer.appendChild(inputElement);
              this.inputFields[property] = { type: propertyType, element: inputElement };
            }
          } catch (error) {
            console.error(`Error creating control for property ${property}:`, error);
            throw error;
          }
        });
        const buttonContainer = form.createEl("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "flex-end";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.marginTop = "20px";
        const cancelBtn = buttonContainer.createEl("button", { text: "Cancel", type: "button" });
        cancelBtn.style.padding = "8px 16px";
        cancelBtn.style.border = "1px solid var(--background-modifier-border)";
        cancelBtn.style.borderRadius = "4px";
        cancelBtn.style.background = "var(--background-secondary)";
        cancelBtn.style.color = "var(--text-normal)";
        cancelBtn.style.cursor = "pointer";
        cancelBtn.addEventListener("click", () => {
          this.close();
        });
        const submitBtn = buttonContainer.createEl("button", { text: "Create", type: "submit" });
        submitBtn.style.padding = "8px 16px";
        submitBtn.style.border = "1px solid var(--background-modifier-border)";
        submitBtn.style.borderRadius = "4px";
        submitBtn.style.background = "var(--interactive-accent)";
        submitBtn.style.color = "var(--text-on-accent)";
        submitBtn.style.cursor = "pointer";
        submitBtn.style.marginLeft = "auto";
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const result = {};
          this.templateProperties.forEach((property) => {
            const field = this.inputFields[property];
            const { type } = field;
            let value;
            switch (type) {
              case "Checkbox":
                value = field.element.checked ? "true" : "false";
                break;
              case "List":
                const values = field.getValues();
                if (values.length === 0) {
                  value = "";
                } else {
                  value = "\n" + values.map((v) => `  - "${v}"`).join("\n");
                }
                break;
              case "Date":
              case "Date & time":
              case "Number":
              case "Text":
              default:
                value = field.element.value;
                break;
            }
            result[property] = value;
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

// src/ui/EntityCreatorSettingTab.ts
var import_obsidian2 = __toModule(require("obsidian"));
var EntityCreatorSettingTab = class extends import_obsidian2.PluginSettingTab {
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
    containerEl.createEl("h3", { text: "Property Mappings" });
    containerEl.createEl("p", { text: "Map template properties to display names in the modal (shared by all entities)" });
    Object.entries(this.plugin.settings.propertyMappings).forEach(([property, mapping]) => {
      const setting = new import_obsidian2.Setting(containerEl).setName(property).setDesc(`Display name: ${mapping.displayName}, Type: ${mapping.type}`).addText((text) => text.setValue(mapping.displayName).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.propertyMappings[property].displayName = value;
        yield this.plugin.saveSettings();
        this.display();
      }))).addDropdown((dropdown) => dropdown.addOption("Checkbox", "Checkbox").addOption("Date", "Date").addOption("Date & time", "Date & time").addOption("List", "List").addOption("Number", "Number").addOption("Text", "Text").setValue(mapping.type).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.propertyMappings[property].type = value;
        yield this.plugin.saveSettings();
        this.display();
      }))).addButton((button) => button.setButtonText("Delete").setWarning().onClick(() => __async(this, null, function* () {
        delete this.plugin.settings.propertyMappings[property];
        yield this.plugin.saveSettings();
        this.display();
      })));
    });
    const addMappingSetting = new import_obsidian2.Setting(containerEl).setName("Add New Mapping").setDesc("Add a new property mapping").addText((text) => text.setPlaceholder("property-name").setValue("")).addText((text2) => text2.setPlaceholder("Display Name").setValue("")).addDropdown((dropdown) => dropdown.addOption("Checkbox", "Checkbox").addOption("Date", "Date").addOption("Date & time", "Date & time").addOption("List", "List").addOption("Number", "Number").addOption("Text", "Text").setValue("Text")).addButton((button) => button.setButtonText("Add").onClick(() => __async(this, null, function* () {
      const propertyInput = addMappingSetting.components[0];
      const displayNameInput = addMappingSetting.components[1];
      const typeDropdown = addMappingSetting.components[2];
      const property = propertyInput.getValue().trim();
      const displayName2 = displayNameInput.getValue().trim();
      const type = typeDropdown.getValue();
      if (property && displayName2) {
        this.plugin.settings.propertyMappings[property] = {
          displayName: displayName2,
          type
        };
        yield this.plugin.saveSettings();
        propertyInput.setValue("");
        displayNameInput.setValue("");
        typeDropdown.setValue("Text");
        this.display();
      }
    })));
  }
  renderTabContent(containerEl, entityType) {
    const displayName = ENTITY_DISPLAY_NAMES[entityType];
    const entityConfig = this.plugin.settings.entities[entityType];
    if (!entityConfig) {
      containerEl.createEl("div", { text: `No configuration found for ${displayName}` });
      return;
    }
    containerEl.createEl("h3", { text: `${displayName} Settings` });
    new import_obsidian2.Setting(containerEl).setName(`${displayName} Note Path`).setDesc(`Path where ${displayName} notes will be created`).addText((text) => text.setPlaceholder(`${displayName}s`).setValue(entityConfig.notePath).onChange((value) => __async(this, null, function* () {
      entityConfig.notePath = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian2.Setting(containerEl).setName(`${displayName} Template File Path`).setDesc(`Path to the ${displayName} template file`).addText((text) => text.setPlaceholder(`_Templates/Temp-${displayName}.md`).setValue(entityConfig.templatePath).onChange((value) => __async(this, null, function* () {
      entityConfig.templatePath = value;
      yield this.plugin.saveSettings();
    })));
  }
};

// src/main.ts
var EntityCreatorPlugin = class extends import_obsidian3.Plugin {
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
        },
        propertyMappings: __spreadValues({}, DEFAULT_PROPERTY_MAPPINGS)
      };
      if (loadedSettings == null ? void 0 : loadedSettings.entities) {
        Object.keys(DEFAULT_ENTITY_CONFIGS).forEach((entityTypeStr) => {
          const entityType = entityTypeStr;
          if (loadedSettings.entities[entityType]) {
            this.settings.entities[entityType] = __spreadProps(__spreadValues({}, this.settings.entities[entityType]), {
              notePath: loadedSettings.entities[entityType].notePath || this.settings.entities[entityType].notePath,
              templatePath: loadedSettings.entities[entityType].templatePath || this.settings.entities[entityType].templatePath
            });
          }
        });
      }
      if (loadedSettings == null ? void 0 : loadedSettings.propertyMappings) {
        this.settings.propertyMappings = __spreadValues(__spreadValues({}, this.settings.propertyMappings), loadedSettings.propertyMappings);
      }
      if (loadedSettings == null ? void 0 : loadedSettings.entities) {
        Object.keys(loadedSettings.entities).forEach((entityTypeStr) => {
          var _a;
          const entityType = entityTypeStr;
          if ((_a = loadedSettings.entities[entityType]) == null ? void 0 : _a.propertyMappings) {
            this.settings.propertyMappings = __spreadValues(__spreadValues({}, this.settings.propertyMappings), loadedSettings.entities[entityType].propertyMappings);
          }
        });
      }
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
        if (!templateFile || !(templateFile instanceof import_obsidian3.TFile)) {
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
