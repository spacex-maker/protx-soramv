# 导演系统 · 道具库 API 规范

前缀：`/productx/director`  
响应格式：`{ success: boolean, data?: T, message?: string }`

## 数据模型

### DirectorProp

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键 |
| projectId | number | 项目 ID |
| name | string | 道具名称，≤64 |
| description | string? | 设定说明 |
| referenceImageUrl | string? | 参考图 |
| promptSuffix | string? | 提示词后缀，≤500 |
| category | string? | general / weapon / vehicle / furniture / magic / document / other |
| sortOrder | number? | 排序 |

### 项目详情扩展

`GET /projects/{projectId}` 的 `data` 增加：

```json
{
  "props": [DirectorProp],
  "propCount": 3
}
```

## 道具 CRUD

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/projects/{projectId}/props` | 项目道具列表 |
| POST | `/projects/{projectId}/props` | 创建道具 |
| PUT | `/props/{propId}` | 更新道具 |
| DELETE | `/props/{propId}` | 删除道具（级联删除角色绑定） |

### POST body 示例

```json
{
  "name": "古铜钥匙",
  "description": "开启地下室的门，表面有蛇形纹路",
  "referenceImageUrl": "https://...",
  "promptSuffix": "antique brass key, snake engraving",
  "category": "general",
  "sortOrder": 0
}
```

## 角色 ↔ 道具绑定

以**角色为主体**做全量替换（与剧集绑定角色一致）：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/characters/{characterId}/props` | 该角色关联的道具列表 |
| PUT | `/characters/{characterId}/props` | 全量替换绑定 |

### PUT body

```json
{
  "propIds": [1, 3, 5]
}
```

服务端逻辑：

1. 校验 `propIds` 均属于该角色所在 `project_id`
2. 删除旧关联，批量插入新关联
3. 返回更新后的道具列表

### 可选（道具侧）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/props/{propId}/characters` | 绑定该道具的角色列表 |
| PUT | `/props/{propId}/characters` | `{ characterIds: number[] }` 全量替换 |

## 权限

与现有 director 接口一致：仅项目所有者可读写。

## 前端对接文件

- `src/api/director.ts`
- `src/pages/Workspace/Create/components/Director/PropManager.tsx`
- `src/pages/Workspace/Create/components/Director/CharacterManager.tsx`
