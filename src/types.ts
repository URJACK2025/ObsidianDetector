// 实体类型枚举
export type EntityType = 'event' | 'person' | 'organization' | 'location' | 'country';

// 单个实体配置接口
export interface EntityConfig {
  notePath: string;
  templatePath: string;
}

// 插件设置接口
export interface EntityCreatorSettings {
  entities: Record<EntityType, EntityConfig>;
  propertyMappings: Record<string, string>;
}

// 默认属性映射
export const DEFAULT_PROPERTY_MAPPINGS: Record<string, string> = {
  'full_name': '名称',
  'rel-group': '关联组织',
  'rel-person': '关联人员',
  'rel-event': '关联事件',
  'rel-location': '关联地点',
  'rel-country': '关联国家',
  'birth': '出生日期',
  'gender': '性别',
  'code': '代码',
  'description': '描述'
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
