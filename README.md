# Entity Creator Plugin for Obsidian

A powerful Obsidian plugin that allows you to create entity notes with dynamic forms, supporting multiple entity types and customizable property mappings.

## Features

### 🔧 Core Functionality
- **Multiple Entity Types**: Support for Event, Person, Organization, Location, and Country entities
- **Dynamic Form Generation**: Automatically generates input fields based on template files
- **Command-Based Creation**: Create entities using Obsidian's command palette
- **Template-Driven**: Uses YAML front matter templates to define entity properties
- **Customizable Property Mappings**: Map template properties to user-friendly display names

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

- `Create Entity-Event`: Create a new Event note
- `Create Entity-Person`: Create a new Person note
- `Create Entity-Organization`: Create a new Organization note
- `Create Entity-Location`: Create a new Location note
- `Create Entity-Country`: Create a new Country note

## Configuration

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

### v1.4.0 (Latest)
- **Shared Property Mappings**: Moved property mappings outside of tabs, shared across all entities
- **Delete Mapping Support**: Added ability to delete property mappings
- **Improved Settings Organization**: Cleaner settings page with better separation of concerns
- **Backward Compatibility**: Support for migrating settings from older versions

### v1.3.0
- **Multiple Entity Types**: Added support for Person, Organization, Location, and Country entities
- **Tabbed Settings Page**: Implemented tabbed interface for entity-specific configuration
- **Entity-Specific Commands**: Added commands for each entity type
- **Entity-Specific Templates**: Support for different templates per entity type

### v1.2.0
- **Dynamic Form Generation**: Automatically generates input fields based on template files
- **Property Mapping Configuration**: Added ability to map property names to display names
- **Improved Template Handling**: Better template parsing and error handling
- **Enhanced Error Messages**: More descriptive error messages for better debugging

### v1.1.0
- **Template Path Configuration**: Added ability to configure template file path
- **Improved Error Handling**: Better handling of missing template files
- **Enhanced Logging**: More detailed logging for debugging

### v1.0.0
- **Initial Release**: Basic Event entity creation functionality
- **Command-Based Creation**: Create events using Obsidian's command palette
- **Template Support**: Uses YAML front matter templates
- **Configurable Note Path**: Set where Event notes are created

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
