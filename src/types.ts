// 实体类型定义
export type EntityType = string;

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

// 实体类型配置接口
export interface EntityTypeConfig {
  id: EntityType;
  displayName: string;
  config: EntityConfig;
}

// 插件设置接口
export interface EntityCreatorSettings {
  entityTypes: Record<EntityType, string>; // 实体类型id到显示名称的映射
  entities: Record<EntityType, EntityConfig>; // 实体配置
  propertyMappings: Record<string, PropertyMapping>; // 属性映射
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

// 默认实体类型
export const DEFAULT_ENTITY_TYPES: Record<EntityType, string> = {
  'event': 'Event',
  'person': 'Person',
  'organization': 'Organization',
  'location': 'Location',
  'country': 'Country'
};

// 默认实体配置
export const DEFAULT_ENTITIES: Record<EntityType, EntityConfig> = {
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
  entityTypes: DEFAULT_ENTITY_TYPES,
  entities: DEFAULT_ENTITIES,
  propertyMappings: DEFAULT_PROPERTY_MAPPINGS
};

// 获取实体显示名称
export function getEntityDisplayName(entityType: EntityType, settings: EntityCreatorSettings): string {
  return settings.entityTypes[entityType] || entityType;
};
