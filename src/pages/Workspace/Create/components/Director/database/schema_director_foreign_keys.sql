-- ==========================================
-- 导演系统 · 可选外键（在确认父表存在后再执行）
-- ==========================================
--
-- 执行前请先检查：
--   SHOW TABLE STATUS WHERE Name IN (
--     'director_project','director_character','director_prop',
--     'director_scene','director_scene_reference_image'
--   );
--
-- 要求：父表必须存在，且 Engine = InnoDB
-- 若父表名不同，请修改 REFERENCES 中的表名后再执行
-- ==========================================

-- 道具 → 项目
ALTER TABLE `director_prop`
  ADD CONSTRAINT `fk_director_prop_project`
  FOREIGN KEY (`project_id`) REFERENCES `director_project` (`id`) ON DELETE CASCADE;

-- 角色-道具 → 角色 / 道具
ALTER TABLE `director_character_prop`
  ADD CONSTRAINT `fk_dcp_character`
  FOREIGN KEY (`character_id`) REFERENCES `director_character` (`id`) ON DELETE CASCADE;

ALTER TABLE `director_character_prop`
  ADD CONSTRAINT `fk_dcp_prop`
  FOREIGN KEY (`prop_id`) REFERENCES `director_prop` (`id`) ON DELETE CASCADE;

-- 场景参考图 → 场景
ALTER TABLE `director_scene_reference_image`
  ADD CONSTRAINT `fk_dsri_scene`
  FOREIGN KEY (`scene_id`) REFERENCES `director_scene` (`id`) ON DELETE CASCADE;
