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
var DEFAULT_SETTINGS = {
  eventNotePath: "Events",
  templatePath: "_Templates/Temp-Event.md"
};
var EventModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Create Entity-Event" });
    const form = contentEl.createEl("form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "10px";
    form.createEl("label", { text: "\u5173\u8054\u7EC4\u7EC7" });
    this.relGroupEl = new import_obsidian.TextComponent(form);
    this.relGroupEl.setPlaceholder("Enter related group");
    form.createEl("label", { text: "\u5173\u8054\u4EBA\u5458" });
    this.relPersonEl = new import_obsidian.TextComponent(form);
    this.relPersonEl.setPlaceholder("Enter related person");
    form.createEl("label", { text: "\u5173\u8054\u4E8B\u4EF6" });
    this.relEventEl = new import_obsidian.TextComponent(form);
    this.relEventEl.setPlaceholder("Enter related event");
    form.createEl("label", { text: "\u5173\u8054\u5730\u70B9" });
    this.relLocationEl = new import_obsidian.TextComponent(form);
    this.relLocationEl.setPlaceholder("Enter related location");
    form.createEl("label", { text: "\u5173\u8054\u56FD\u5BB6" });
    this.relCountryEl = new import_obsidian.TextComponent(form);
    this.relCountryEl.setPlaceholder("Enter related country");
    form.createEl("label", { text: "\u4E8B\u4EF6\u4E3B\u8981\u5185\u5BB9" });
    this.fullNameEl = new import_obsidian.TextComponent(form);
    this.fullNameEl.setPlaceholder("Enter event name");
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
          new EventModal(this.app, (result) => __async(this, null, function* () {
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
        let content = templateContent.replace(/rel-group:/, `rel-group: ${data.relGroup}`).replace(/rel-person:/, `rel-person: ${data.relPerson}`).replace(/rel-event:/, `rel-event: ${data.relEvent}`).replace(/rel-location:/, `rel-location: ${data.relLocation}`).replace(/rel-country:/, `rel-country: ${data.relCountry}`).replace(/full_name:/, `full_name: ${data.fullName}`);
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
        const fileName = `${data.fullName || "Untitled"}.md`;
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
