import directorApi, { DirectorSceneReferenceImage } from 'api/director';

export const toSceneReferenceSavePayload = (images: DirectorSceneReferenceImage[]) =>
  images
    .filter((item) => item.imageUrl?.trim())
    .map((item, sortOrder) => ({
      imageUrl: item.imageUrl.trim(),
      caption: item.caption?.trim() || undefined,
      sortOrder,
    }));

export const areSceneReferenceImagesEqual = (
  left: DirectorSceneReferenceImage[],
  right: DirectorSceneReferenceImage[]
) => {
  const normalize = (items: DirectorSceneReferenceImage[]) =>
    toSceneReferenceSavePayload(items).map((item) => `${item.imageUrl}|${item.caption || ''}`).join('\n');
  return normalize(left) === normalize(right);
};

export const mergeSceneReferenceImages = (
  sceneImages?: DirectorSceneReferenceImage[] | null,
  loadedImages?: DirectorSceneReferenceImage[] | null
): DirectorSceneReferenceImage[] => {
  if (loadedImages?.length) return loadedImages.map((item, sortOrder) => ({ ...item, sortOrder }));
  if (sceneImages?.length) return sceneImages.map((item, sortOrder) => ({ ...item, sortOrder }));
  return [];
};

/** 接口未上线时静默返回空数组，避免无意义报错 */
export const fetchSceneReferenceImagesSafe = async (
  sceneId: number
): Promise<DirectorSceneReferenceImage[]> => {
  try {
    const res = await directorApi.listSceneReferenceImages(sceneId);
    return res.success ? mergeSceneReferenceImages(null, res.data) : [];
  } catch {
    return [];
  }
};
