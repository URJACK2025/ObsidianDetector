import { PropertyType as BasePropertyType } from '../types';

// 属性类型常量定义
export const PROPERTY_TYPES = ['Checkbox', 'Citation', 'Date', 'Date & time', 'Enum', 'List', 'Number', 'Text'] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

// 属性类型配置接口
export interface PropertyMapping {
  displayName: string;
  type: BasePropertyType;
  enumOptions?: string[];
  citationConfig?: { propertyName: string; propertyValue: string };
}

// 属性类型默认配置生成
export const createDefaultPropertyMapping = (type: BasePropertyType, displayName: string): PropertyMapping => {
  const mapping: PropertyMapping = { displayName, type };
  
  if (type === 'Enum') {
    mapping.enumOptions = [];
  }
  
  if (type === 'Citation') {
    mapping.citationConfig = {
      propertyName: 'entity-type',
      propertyValue: ''
    };
  }
  
  return mapping;
};

// 检查是否为有效的属性类型
export const isValidPropertyType = (type: string): type is BasePropertyType => {
  return PROPERTY_TYPES.includes(type as PropertyType);
};
