/** 从表单值读取「译为英文」开关，默认 false */
export function isTranslatePromptToEnglish(values: Record<string, unknown> | undefined | null): boolean {
  return values?.translatePromptToEnglish === true;
}

/** 写入 API 请求体 */
export function appendTranslatePromptFlag<T extends Record<string, unknown>>(
  payload: T,
  values: Record<string, unknown> | undefined | null,
): T {
  return {
    ...payload,
    translatePromptToEnglish: isTranslatePromptToEnglish(values),
  };
}
