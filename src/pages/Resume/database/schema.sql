-- ==========================================
-- 简历模块数据库表结构
-- ==========================================

-- 1. 个人信息表
CREATE TABLE `resume_personal_info` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `title` VARCHAR(100) DEFAULT NULL COMMENT '职位',
  `age` VARCHAR(10) DEFAULT NULL COMMENT '年龄',
  `gender` VARCHAR(10) DEFAULT NULL COMMENT '性别',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '所在城市',
  `experience` VARCHAR(50) DEFAULT NULL COMMENT '工作年限',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(50) DEFAULT NULL COMMENT '电话',
  `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信',
  `github` VARCHAR(200) DEFAULT NULL COMMENT 'GitHub',
  `linkedin` VARCHAR(200) DEFAULT NULL COMMENT 'LinkedIn',
  `blog` VARCHAR(200) DEFAULT NULL COMMENT '个人博客',
  `website` VARCHAR(200) DEFAULT NULL COMMENT '个人网站',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '详细地址',
  `expected_salary` VARCHAR(50) DEFAULT NULL COMMENT '期望薪资',
  `availability` VARCHAR(100) DEFAULT NULL COMMENT '到岗时间',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_name` (`name`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历个人信息表';

-- 2. 技能栈表
CREATE TABLE `resume_skills` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `category` VARCHAR(50) NOT NULL COMMENT '技能分类：core, spring, microservice, rdbms, nosql等',
  `name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `percentage` INT(3) NOT NULL DEFAULT 0 COMMENT '熟练度百分比（0-100）',
  `icon_type` VARCHAR(50) DEFAULT NULL COMMENT '图标类型',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_user_category` (`user_id`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历技能栈表';

-- 3. 教育信息表
CREATE TABLE `resume_education` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `degree` VARCHAR(50) NOT NULL COMMENT '学历：本科、硕士、博士等',
  `major` VARCHAR(100) DEFAULT NULL COMMENT '专业',
  `school` VARCHAR(200) NOT NULL COMMENT '学校名称',
  `start_date` VARCHAR(20) NOT NULL COMMENT '开始时间（格式：YYYY-MM）',
  `end_date` VARCHAR(20) NOT NULL COMMENT '结束时间（格式：YYYY-MM）',
  `description` TEXT DEFAULT NULL COMMENT '描述信息',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历教育信息表';

-- 4. 职业生涯表
CREATE TABLE `resume_career` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `company` VARCHAR(200) NOT NULL COMMENT '公司名称',
  `position` VARCHAR(100) NOT NULL COMMENT '职位',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '工作地点',
  `department` VARCHAR(200) DEFAULT NULL COMMENT '部门',
  `start_date` VARCHAR(20) NOT NULL COMMENT '开始时间（格式：YYYY-MM）',
  `end_date` VARCHAR(20) NOT NULL COMMENT '结束时间（格式：YYYY-MM 或 至今）',
  `description` TEXT DEFAULT NULL COMMENT '工作描述',
  `responsibilities` JSON DEFAULT NULL COMMENT '主要职责（JSON数组）',
  `achievements` JSON DEFAULT NULL COMMENT '主要成就（JSON数组）',
  `technologies` JSON DEFAULT NULL COMMENT '使用的技术栈（JSON数组）',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历职业生涯表';

-- 5. 项目经验表
CREATE TABLE `resume_projects` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(200) NOT NULL COMMENT '项目名称',
  `description` TEXT DEFAULT NULL COMMENT '项目描述',
  `role` VARCHAR(100) DEFAULT NULL COMMENT '项目角色',
  `start_date` VARCHAR(20) NOT NULL COMMENT '开始时间（格式：YYYY-MM）',
  `end_date` VARCHAR(20) NOT NULL COMMENT '结束时间（格式：YYYY-MM 或 至今）',
  `technologies` JSON DEFAULT NULL COMMENT '使用的技术栈（JSON数组）',
  `highlights` JSON DEFAULT NULL COMMENT '项目亮点（JSON数组）',
  `link` VARCHAR(500) DEFAULT NULL COMMENT '项目链接',
  `demo` VARCHAR(500) DEFAULT NULL COMMENT '演示地址',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历项目经验表';

-- 6. 证书/资质表
CREATE TABLE `resume_certifications` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(200) NOT NULL COMMENT '证书名称',
  `issuer` VARCHAR(200) NOT NULL COMMENT '颁发机构',
  `issue_date` VARCHAR(20) NOT NULL COMMENT '获得时间（格式：YYYY-MM）',
  `expiry_date` VARCHAR(20) DEFAULT NULL COMMENT '有效期至（格式：YYYY-MM 或 永久有效）',
  `credential_id` VARCHAR(100) DEFAULT NULL COMMENT '证书编号',
  `description` TEXT DEFAULT NULL COMMENT '证书描述',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_issue_date` (`issue_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历证书/资质表';

-- 7. 语言能力表
CREATE TABLE `resume_languages` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `language` VARCHAR(50) NOT NULL COMMENT '语言名称',
  `listening` VARCHAR(20) DEFAULT NULL COMMENT '听力水平：母语、熟练、良好、基础、入门',
  `speaking` VARCHAR(20) DEFAULT NULL COMMENT '口语水平',
  `reading` VARCHAR(20) DEFAULT NULL COMMENT '阅读水平',
  `writing` VARCHAR(20) DEFAULT NULL COMMENT '写作水平',
  `certificate` VARCHAR(100) DEFAULT NULL COMMENT '相关证书（如：CET-6、TOEFL）',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历语言能力表';

-- 8. 获奖经历表
CREATE TABLE `resume_awards` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(200) NOT NULL COMMENT '奖项名称',
  `issuer` VARCHAR(200) NOT NULL COMMENT '颁发机构',
  `date` VARCHAR(20) NOT NULL COMMENT '获奖时间（格式：YYYY-MM）',
  `level` VARCHAR(50) DEFAULT NULL COMMENT '奖项级别：国际级、国家级、省级、市级、公司级、部门级、校级、院级',
  `description` TEXT DEFAULT NULL COMMENT '奖项描述',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历获奖经历表';

-- 9. 开源贡献表
CREATE TABLE `resume_opensource` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(200) NOT NULL COMMENT '项目名称',
  `description` TEXT DEFAULT NULL COMMENT '项目描述',
  `link` VARCHAR(500) NOT NULL COMMENT '项目链接',
  `contributions` JSON DEFAULT NULL COMMENT '贡献内容（JSON数组）',
  `stars` INT(11) DEFAULT 0 COMMENT 'Star数量',
  `role` VARCHAR(50) DEFAULT NULL COMMENT '角色：Owner、Contributor等',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历开源贡献表';

-- 10. 作品集表
CREATE TABLE `resume_portfolio` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(200) NOT NULL COMMENT '作品名称',
  `description` TEXT DEFAULT NULL COMMENT '作品描述',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '作品分类：Web应用、移动应用、桌面应用、中间件、工具库、其他',
  `technologies` JSON DEFAULT NULL COMMENT '使用的技术栈（JSON数组）',
  `link` VARCHAR(500) DEFAULT NULL COMMENT '项目链接',
  `demo` VARCHAR(500) DEFAULT NULL COMMENT '演示地址',
  `screenshot` VARCHAR(500) DEFAULT NULL COMMENT '截图地址',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历作品集表';

-- 11. 个人简介表
CREATE TABLE `resume_summary` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `summary` TEXT DEFAULT NULL COMMENT '个人简介内容',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历个人简介表';

