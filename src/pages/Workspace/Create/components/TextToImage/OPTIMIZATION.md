# 文生图模块优化说明

## 已完成的优化

1. **常量抽离**（`constants.ts`）  
   - Volc Seedream 与 API 模型的配置（比例、尺寸、格式）移出组件，避免每次渲染重新创建对象。

2. **统一响应解析**（`utils.tsx`）  
   - `normalizeImageData`、`parseResponseImages` 抽到工具函数，三处成功分支共用，减少重复与不一致。

3. **单一数据源**  
   - `handleGenerate` 内不再重复计算 `isApiModel` / `isVolcSeedream` / `useAsyncApi`，直接使用组件顶层的 `isApiModel`、`isVolcSeedream`、`isApiModelAsync`。

4. **选项列表缓存**  
   - `availableAspectRatios`、`availableImageFormats`、`availableResolutions` 使用 `useMemo`，仅在依赖（模型、分辨率等）变化时重算。

---

## 可继续优化的方向

| 方向 | 说明 |
|------|------|
| **策略/适配器** | 将 Seedream / API 异步 / Local 三种分支拆成独立策略模块，各自负责组参 + 调接口；新增模型时只加新策略，主流程不再加 if。 |
| **错误信息统一** | 将 `response.data?.error ?? response.data?.message` 及超时、网络错误提示抽成小工具（如 `getApiErrorMessage(error, intl)`），避免多处重复。 |
| **历史刷新时机** | 成功分支已调用 `setHistoryRefreshTrigger`，`useEffect` 中 1s 后再触发一次可考虑去掉或改为「仅异步任务成功时延迟刷新」，减少多余请求。 |
| **类型收窄** | 为三种请求体定义类型（如 `SeedreamPayload`、`AsyncApiPayload`、`LocalPayload`），替代 `any`，便于维护和校验。 |
| **Mobile 复用** | `TextToImageMobile.tsx` 中仍有本地 `normalizeImageData` 与类似解析逻辑，可改为使用 `utils` 中的 `parseResponseImages` 与 `constants`。 |
| **后端驱动** | 若后端能按模型返回「表单 schema」或「能力列表」，前端可完全配置驱动表单项与请求体，扩展新模型时前端改动更小。 |
