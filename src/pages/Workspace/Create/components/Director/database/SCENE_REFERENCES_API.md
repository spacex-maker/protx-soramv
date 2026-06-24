# 导演系统 · 场景参考图 API 规范

前缀：`/productx/director`  
响应格式：`{ success: boolean, data?: T, message?: string }`

## 错误说明

若后端日志出现：

```
NoResourceFoundException: No static resource productx/director/scenes/{id}/reference-images
```

表示 **Controller 尚未注册该路由**，Spring 把请求当成了静态资源。需要按本文实现 REST 接口（不是静态文件路径）。

## 数据模型

### DirectorSceneReferenceImage

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键 |
| sceneId | number | 场景 ID |
| imageUrl | string | 参考图 URL |
| caption | string? | 说明 |
| sortOrder | number? | 排序 |

对应表：`director_scene_reference_image`（见 `schema_scene_references.sql`）

## 参考图管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/scenes/{sceneId}/reference-images` | 场景参考图列表 |
| PUT | `/scenes/{sceneId}/reference-images` | 全量替换参考图 |

### GET 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sceneId": 3,
      "imageUrl": "https://cdn.example.com/scene/ref1.jpg",
      "caption": "教室全景",
      "sortOrder": 0
    }
  ]
}
```

### PUT body

```json
{
  "images": [
    {
      "imageUrl": "https://cdn.example.com/scene/ref1.jpg",
      "caption": "教室全景",
      "sortOrder": 0
    }
  ]
}
```

## Spring Boot 实现要点

与现有 director 接口同风格，**必须**注册 `@RestController`：

```java
@RestController
@RequestMapping("/productx/director/scenes")
@RequiredArgsConstructor
public class DirectorSceneReferenceImageController {

    private final DirectorSceneReferenceImageService referenceImageService;

    @GetMapping("/{sceneId}/reference-images")
    public ApiResponse<List<DirectorSceneReferenceImageVO>> list(@PathVariable Long sceneId) {
        return ApiResponse.success(referenceImageService.listBySceneId(sceneId));
    }

    @PutMapping("/{sceneId}/reference-images")
    public ApiResponse<List<DirectorSceneReferenceImageVO>> replace(
            @PathVariable Long sceneId,
            @RequestBody @Valid ReplaceSceneReferenceImagesRequest request) {
        return ApiResponse.success(referenceImageService.replaceAll(sceneId, request.getImages()));
    }
}
```

Service：`replaceAll` 内校验 scene 归属 → `deleteBySceneId` → 批量 insert → 返回列表。

## 部署检查

- [ ] 执行 `schema_scene_references.sql`
- [ ] 注册 Controller
- [ ] curl：`GET http://localhost:8080/productx/director/scenes/3/reference-images`
