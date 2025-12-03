# Entity Creator Plugin for Obsidian

A powerful Obsidian plugin that allows you to create entity notes with dynamic forms, supporting multiple entity types and customizable property mappings.

## Features

### 🔧 Core Functionality
- **Dynamic Entity Types**: Create and manage your own entity types, no longer limited to fixed types
- **Dynamic Form Generation**: Automatically generates input fields based on template files
- **Command-Based Creation**: Create entities using Obsidian's command palette with dynamically generated commands
- **Template-Driven**: Uses YAML front matter templates to define entity properties
- **Customizable Property Mappings**: Map template properties to user-friendly display names
- **Multiple Property Types**: Support for various property types including Text, Number, Date, Date & time, Checkbox, List, Enum, and Citation

### 🎨 User Experience
- **Tabbed Settings Page**: Configure each entity type independently using tabs
- **Shared Property Mappings**: All entities share the same property mappings for consistency
- **Editable Mappings**: Add, edit, and delete property mappings as needed
- **Clear Configuration**: Well-organized settings with descriptive labels and tooltips
- **Real-time Saving**: Settings are saved automatically when changed

### 📁 File Management
- **Customizable Note Paths**: Configure where notes are created for each entity type
- **Template Support**: Use your own templates for each entity type
- **Automatic Folder Creation**: Creates folders if they don't exist
- **Descriptive File Names**: Uses entity names for file names when available

### 🔗 Entity Relationships
- **Citation Support**: Create relationships between entities using Obsidian's internal links [[...]]
- **Enum Property Type**: Define fixed sets of options for properties
- **List Property Type**: Support for multiple values in a single property
- **Dynamic Search**: Search and select related entities with auto-completion

### 🛠️ Developer Experience
- **Modular Codebase**: Well-organized code structure with clear separation of concerns
- **TypeScript Support**: Full TypeScript support for better development experience
- **Easy Extension**: Simple architecture for adding new property types
- **Comprehensive Documentation**: Detailed README with usage instructions and version history

## Installation

1. Download the latest release from the [GitHub Releases](https://github.com/yourusername/obsidian-entity-creator/releases) page
2. Extract the zip file to your Obsidian plugins directory
3. Enable the plugin in Obsidian's settings
4. Configure the plugin settings according to your needs

## Usage

### Creating Entities

1. Open the command palette (Ctrl+P / Cmd+P)
2. Type "Create Entity-" followed by the entity type (e.g., "Create Entity-Event")
3. Press Enter to open the entity creation modal
4. Fill in the input fields (fields are generated based on the template)
5. Click "Create" to generate the note

### Available Commands

Commands are dynamically generated based on configured entity types. For each entity type, a command will be available in the command palette with the format:

- `Create Entity-{DisplayName}`: Create a new note for the specified entity type

Example commands:
- `Create Entity-Event`: Create a new Event note
- `Create Entity-Person`: Create a new Person note
- `Create Entity-Organization`: Create a new Organization note

The actual commands available depend on the entity types you have configured in the settings.

## Configuration

### Entity Type Management

The plugin now supports dynamic entity type management. You can add, edit, and delete entity types in the settings page:

- **Add Entity Type**: Click "Add New Entity Type" to create a new entity type with a unique ID and display name
- **Edit Entity Type**: Change the display name of existing entity types
- **Delete Entity Type**: Remove entity types that are no longer needed
- **Automatic Configuration**: When adding a new entity type, default configurations are created automatically

### Entity Settings

The plugin settings page uses tabs to organize configuration for each entity type:

1. **Note Path**: The folder where notes for this entity type will be created
2. **Template File Path**: The path to the template file for this entity type

### Property Mappings

Property mappings are shared across all entity types and allow you to customize how template properties are displayed in the creation modal:

- **Add Mapping**: Click "Add New Mapping" to add a new property mapping
- **Edit Mapping**: Change the display name for any property
- **Delete Mapping**: Click "Delete" to remove a property mapping

## Template Format

Templates use YAML front matter to define entity properties. Here's an example template:

```yaml
---
entity-type: event
birth:
full_name:
rel-group:
rel-person:
rel-event:
rel-location:
rel-country:
---
```

The plugin will generate input fields for all properties except `entity-type`.

## Version History

### v1.1.0 (Latest)
- **🔧 Core Functionality**
  - Dynamic entity type management with CRUD operations
  - Automatic command generation based on configured entity types
  - Template-driven form generation with YAML front matter support
  - Customizable property mappings with user-friendly display names
  - Multiple property types: Checkbox, Citation, Date, Date & time, Enum, List, Number, Text
  - Entity relationship support with Citation property type
  - Configurable note paths and template files per entity type

- **🎨 User Experience**
  - Tabbed settings page for independent entity type configuration
  - Shared property mappings for consistent display across entities
  - Real-time settings saving with automatic refresh
  - Clear notifications for important actions like entity type deletion
  - Improved error messages for better debugging
  - Command palette integration with dynamically generated commands

- **🛠️ Technical Improvements**
  - Modular codebase with better separation of concerns
  - Enhanced error handling and form validation
  - Optimized performance with code refactoring
  - Backward compatible with existing configurations
  - Robust command management with existence checks
  - Better template parsing and property extraction

- **🔗 Entity Relationships**
  - Citation property type with dynamic search functionality
  - Support for linking entities across notes
  - Enum property type for predefined value sets
  - List property type for multiple values

### v1.0.0 (Initial Release)
- Basic Event entity creation functionality
- Command-based creation using Obsidian's command palette
- Template support with YAML front matter
- Configurable note paths for entity notes

## Technical Implementation

- **Language**: TypeScript
- **Build System**: esbuild
- **Obsidian API**: Uses Obsidian's Modal, SettingTab, and Vault APIs
- **YAML Parsing**: Custom YAML front matter parser for template properties
- **Dynamic UI**: Runtime generation of input fields based on template properties

## Project Structure

```
.
├── manifest.json          # Plugin metadata
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.mjs     # Build configuration
├── src/
│   └── main.ts           # Main plugin code
├── main.js               # Built plugin file
└── README.md             # This file
```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Copy the plugin to your Obsidian plugins directory for testing

### Development Commands

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the plugin for production
- `npm run typecheck`: Run TypeScript type checking

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yourusername/obsidian-entity-creator/issues) page
2. Create a new issue with a detailed description
3. Include steps to reproduce the issue
4. Attach any relevant logs or screenshots

## Acknowledgments

- Built with ❤️ for the Obsidian community
- Inspired by the need for a better way to create structured notes
- Uses Obsidian's powerful plugin API

---

**Happy Note-Taking!** 📝
