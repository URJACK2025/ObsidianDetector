// 实体类型枚举
export type EntityType = 'event' | 'person' | 'organization' | 'location' | 'country';

// 属性类型枚举
export type PropertyType = 'Checkbox' | 'Citation' | 'Date' | 'Date & time' | 'Enum' | 'List' | 'Number' | 'Text';

// 引用配置接口
export interface CitationConfig {
  propertyName: string; // 属性名，用于检测匹配的属性名，例如entity-type
  propertyValue: string; // 属性值，与propertyName组合，例如event
}

// 属性映射配置接口
export interface PropertyMapping {
  displayName: string;
  type: PropertyType;
  enumOptions?: string[]; // Enum类型的可选值
  citationConfig?: CitationConfig; // Citation类型的引用配置
}

// 单个实体配置接口
export interface EntityConfig {
  notePath: string;
  templatePath: string;
}

// 插件设置接口
export interface EntityCreatorSettings {
  entities: Record<EntityType, EntityConfig>;
  propertyMappings: Record<string, PropertyMapping>;
}

// 默认属性映射
export const DEFAULT_PROPERTY_MAPPINGS: Record<string, PropertyMapping> = {
  'full_name': { displayName: '名称', type: 'Text' },
  'rel-group': { displayName: '关联组织', type: 'Text' },
  'rel-person': { displayName: '关联人员', type: 'Text' },
  'rel-event': { displayName: '关联事件', type: 'Text' },
  'rel-location': { displayName: '关联地点', type: 'Text' },
  'rel-country': { displayName: '关联国家', type: 'Text' },
  'birth': { displayName: '出生日期', type: 'Date' },
  'gender': { displayName: '性别', type: 'Text' },
  'code': { displayName: '代码', type: 'Text' },
  'description': { displayName: '描述', type: 'Text' }
};

// 实体类型显示名称映射
export const ENTITY_DISPLAY_NAMES: Record<EntityType, string> = {
  'event': 'Event',
  'person': 'Person',
  'organization': 'Organization',
  'location': 'Location',
  'country': 'Country'
};

// 默认实体配置
export const DEFAULT_ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  'event': {
    notePath: 'Events',
    templatePath: '_Templates/Temp-Event.md'
  },
  'person': {
    notePath: 'Person',
    templatePath: '_Templates/Temp-Person.md'
  },
  'organization': {
    notePath: 'Organization',
    templatePath: '_Templates/Temp-Group.md'
  },
  'location': {
    notePath: 'Location',
    templatePath: '_Templates/Temp-Location.md'
  },
  'country': {
    notePath: 'Country',
    templatePath: '_Templates/Temp-Country.md'
  }
};

// 默认设置
export const DEFAULT_SETTINGS: EntityCreatorSettings = {
  entities: DEFAULT_ENTITY_CONFIGS,
  propertyMappings: DEFAULT_PROPERTY_MAPPINGS
};
