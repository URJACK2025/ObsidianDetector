import { EntityType, EntityCreatorSettings } from '../types';

// 实体类型管理工具类
export class EntityTypeManager {
  // 获取实体显示名称
  static getEntityDisplayName(
    entityType: EntityType,
    settings: EntityCreatorSettings
  ): string {
    return settings.entityTypes[entityType] || entityType;
  }
  
  // 添加新实体类型
  static addEntityType(
    settings: EntityCreatorSettings,
    entityTypeId: string,
    displayName: string
  ): void {
    settings.entityTypes[entityTypeId] = displayName;
    settings.entities[entityTypeId] = {
      notePath: displayName,
      templatePath: `_Templates/Temp-${displayName}.md`
    };
  }
  
  // 删除实体类型
  static deleteEntityType(
    settings: EntityCreatorSettings,
    entityType: EntityType
  ): void {
    delete settings.entityTypes[entityType];
    delete settings.entities[entityType];
  }
  
  // 更新实体类型显示名称
  static updateEntityType(
    settings: EntityCreatorSettings,
    entityType: EntityType,
    displayName: string
  ): void {
    settings.entityTypes[entityType] = displayName;
  }
  
  // 获取所有实体类型
  static getEntityTypes(
    settings: EntityCreatorSettings
  ): [EntityType, string][] {
    return Object.entries(settings.entityTypes);
  }
  
  // 获取特定实体类型的配置
  static getEntityConfig(
    settings: EntityCreatorSettings,
    entityType: EntityType
  ) {
    return settings.entities[entityType];
  }
  
  // 检查实体类型是否存在
  static hasEntityType(
    settings: EntityCreatorSettings,
    entityType: EntityType
  ): boolean {
    return entityType in settings.entityTypes;
  }
}
