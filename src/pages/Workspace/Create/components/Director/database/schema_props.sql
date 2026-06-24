-- ==========================================
-- 导演系统 · 道具库 & 角色-道具绑定
-- ==========================================
--
-- 【重要】若报错 1824 Failed to open the referenced table 'director_project'：
--   1. 说明父表尚未创建，或表名/库名不一致，或父表不是 InnoDB
--   2. 请先执行本文件（无 FK 版本）建表
--   3. 确认父表存在后，再执行 schema_director_foreign_keys.sql
--
-- 检查父表：
--   SHOW TABLES LIKE 'director_%';
--   SHOW TABLE STATUS WHERE Name = 'director_project';
-- ==========================================

-- 1. 道具表（项目级资产库）
CREATE TABLE IF NOT EXISTS `director_prop` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `project_id` BIGINT(20) NOT NULL COMMENT '所属项目ID',
  `name` VARCHAR(64) NOT NULL COMMENT '道具名称',
  `description` TEXT DEFAULT NULL COMMENT '道具设定/用途说明',
  `reference_image_url` VARCHAR(1024) DEFAULT NULL COMMENT '参考图 URL',
  `prompt_suffix` VARCHAR(500) DEFAULT NULL COMMENT '生成提示词后缀',
  `category` VARCHAR(32) DEFAULT 'general' COMMENT '分类：general/weapon/vehicle/furniture/magic/document/other',
  `sort_order` INT(11) NOT NULL DEFAULT 0 COMMENT '排序（升序）',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `create_by` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `update_by` VARCHAR(255) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_project_sort` (`project_id`, `sort_order`),
  KEY `idx_project_name` (`project_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导演系统道具表';

-- 2. 角色-道具关联表（多对多）
CREATE TABLE IF NOT EXISTS `director_character_prop` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `character_id` BIGINT(20) NOT NULL COMMENT '角色ID',
  `prop_id` BIGINT(20) NOT NULL COMMENT '道具ID',
  `relation_note` VARCHAR(255) DEFAULT NULL COMMENT '关联说明，如：随身携带、本集关键道具',
  `sort_order` INT(11) NOT NULL DEFAULT 0 COMMENT '该角色下道具排序',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `create_by` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_character_prop` (`character_id`, `prop_id`),
  KEY `idx_prop_id` (`prop_id`),
  KEY `idx_character_id` (`character_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导演系统角色道具关联表';

-- 接口扩展：GET /projects/{id} 响应增加 props[]、propCount
-- 外键（可选）：见 schema_director_foreign_keys.sql
