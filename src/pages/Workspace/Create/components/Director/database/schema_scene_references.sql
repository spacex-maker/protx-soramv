-- ==========================================
-- 导演系统 · 场景参考图（一场景多张）
-- ==========================================
--
-- 前置：director_scene 表须已存在（InnoDB）
-- 若报 1824 外键错误，先执行本文件（无 FK），再执行 schema_director_foreign_keys.sql
-- ==========================================

CREATE TABLE IF NOT EXISTS `director_scene_reference_image` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `scene_id` BIGINT(20) NOT NULL COMMENT '场景ID',
  `image_url` VARCHAR(1024) NOT NULL COMMENT '参考图 URL',
  `caption` VARCHAR(255) DEFAULT NULL COMMENT '说明，如：全景、道具特写',
  `sort_order` INT(11) NOT NULL DEFAULT 0 COMMENT '排序（升序）',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `create_by` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  KEY `idx_scene_id` (`scene_id`),
  KEY `idx_scene_sort` (`scene_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导演系统场景参考图表';

-- 接口扩展：GET /episodes/{id}/scenes 每条 scene 增加 referenceImages[]、referenceImageCount
-- 外键（可选）：见 schema_director_foreign_keys.sql
