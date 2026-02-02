# AI2OBJ AI 创作平台

AI2OBJ 是面向 C 端的 AI 多模态创作平台，提供文生图、文生视频、图生图、图生视频、提示词商城、媒体工具与社区等功能。

## 🌟 主要特性

- 🎬 AI 视频生成
  - 文本生成视频：输入文字描述，AI 自动生成视频
  - 图片生成视频：上传参考图片，生成动态视频内容
  - 多种 AI 模型选择
  - 支持多种分辨率和画质

- 🚀 快速生成
  - 优化的 AI 模型和强大的计算资源
  - 实时生成进度显示
  - 批量生成功能
  - 作品管理和下载

- 🌍 国际化
  - 支持多语言（中文、英文、日文等11种语言）
  - 完整的 i18n 支持

- 🎨 用户界面
  - 响应式设计，支持移动端
  - 深色/浅色主题切换
  - 现代化 UI 组件
  - 流畅的动画效果

- ⚡ 性能优化
  - 文件分块上传/下载
  - 智能内存管理
  - 高效的文件处理机制

## 🛠️ 技术栈

- 前端框架：React
- UI 组件：Ant Design
- 样式解决方案：Styled Components
- 状态管理：React Hooks
- 国际化：react-intl
- 文件加密：CryptoJS
- 网络请求：Axios
- 对象存储：腾讯云 COS

## 📦 安装

```bash
# 克隆项目
git clone [repository-url]

# 安装依赖
yarn install

# 启动开发服务器
yarn start

# 构建生产版本
yarn build
```

## 🚀 快速开始

1. 确保已安装 Node.js (>= 14.0.0) 和 Yarn
2. 克隆项目并安装依赖
3. 配置环境变量（参考 .env.example）
4. 启动开发服务器

## 📚 项目结构

```
src/
├── api/          # API 接口
├── components/   # 通用组件
├── contexts/     # React Context
├── hooks/        # 自定义 Hooks
├── locales/      # 国际化文件
├── models/       # 数据模型
├── pages/        # 页面组件
├── services/     # 服务层
├── styles/       # 全局样式
└── utils/        # 工具函数
```

## ☁️ Cloudflare Pages 部署

本项目使用 **Yarn 1** 和 `yarn.lock` v1。Cloudflare Pages 默认使用 Yarn 4，会导致依赖校验报错（YN0060）或构建卡住。

**在 Cloudflare 控制台必须设置：**

1. 打开 **Workers & Pages** → 你的项目 → **Settings** → **Environment variables**。
2. 添加变量（生产与预览均可）：
   - **变量名**：`YARN_VERSION`
   - **值**：`1.22.22`

3. 构建配置建议：
   - **Build command**：`yarn build` 或 `npm run build`
   - **Build output directory**：`build`

设置后重新部署即可使用 Yarn 1 安装依赖，避免 Yarn 4 迁移和 peer 依赖错误。

## 🔧 配置说明

### 环境变量

创建 .env 文件并配置以下变量：

```env
REACT_APP_API_URL=你的API地址
REACT_APP_COS_REGION=对象存储区域
REACT_APP_COS_BUCKET=存储桶名称
```

### 国际化配置

国际化文件位于 `src/locales` 目录，支持以下语言：

- 简体中文 (zh_CN)
- 英文 (en_US)
- 日文 (ja_JP)
- 韩文 (ko_KR)
- 德文 (de_DE)
- 法文 (fr_FR)
- 西班牙文 (es_ES)
- 意大利文 (it_IT)
- 葡萄牙文 (pt_PT)
- 俄文 (ru_RU)
- 阿拉伯文 (ar_SA)

## 📝 开发指南

### 添加新功能

1. 在相应目录创建组件
2. 添加国际化文本
3. 实现组件逻辑
4. 添加到路由配置

### 样式开发

- 使用 Styled Components 进行样式开发
- 遵循项目现有的样式规范
- 确保深色模式兼容性

### 国际化开发

- 在 `src/locales` 中添加翻译文本
- 使用 `FormattedMessage` 组件或 `useIntl` Hook

## 🔐 安全功能

### 文件加密

- 使用 AES-256-CBC 加密算法
- 支持本地加密/解密
- 加密过程在客户端完成

### 文件传输

- HTTPS 传输
- 文件完整性校验
- 传输过程加密

## 📈 性能优化

- 大文件分片上传
- 智能内存管理
- 缓存优化
- 按需加载

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 📄 许可证

© 2024 ProTX Team. All rights reserved.

## 🆘 支持

- 提交 Issue
- 查看文档
- 联系技术支持




## 页面

1.主页

![image](https://github.com/user-attachments/assets/972fa7ab-0236-4462-bb71-e6c4f0900440)

2.选择文件

![image](https://github.com/user-attachments/assets/e47e2a26-ae21-4a6c-bfee-d96453ca4e58)

3.加密文件

![image](https://github.com/user-attachments/assets/d9f3f21e-a469-4f4b-8f4b-17873a7326e8)

4.加密成功

![image](https://github.com/user-attachments/assets/6f3f5292-6ac8-412e-bc10-97dda724e861)

5.上传文件

![image](https://github.com/user-attachments/assets/9312e292-85cd-4f1f-bec7-75147ad80f18)

6.上传成功

![image](https://github.com/user-attachments/assets/04e161e4-4ae4-4564-b4bd-d6cbc5c457f8)

7.下载文件

![image](https://github.com/user-attachments/assets/1ae52e13-2a5a-4c4c-a533-79c0899b033c)

8.选择解密文件

![image](https://github.com/user-attachments/assets/a3b789ee-a369-4040-b5d5-ebabfa9e8c2e)


9.输入解密密码

![image](https://github.com/user-attachments/assets/4a16f93c-c3f8-45e6-a45d-e53c718e0bf5)

10.解密成功

![image](https://github.com/user-attachments/assets/87c05ae0-7d96-49e5-80a9-f95f83a2fb10)

11.查看图片

![image](https://github.com/user-attachments/assets/d514ec55-da88-470c-bd46-9d78e169ae68)






