export const MAX_REF_VIDEOS = 3;
export const MAX_REF_IMAGES = 9;
export const MAX_REF_AUDIOS = 3;

export const DOUBAO_SEEDANCE_2_0_260128 = 'doubao-seedance-2-0-260128';
export const DOUBAO_SEEDANCE_2_0_FAST_260128 = 'doubao-seedance-2-0-fast-260128';

export function isSeedance2ModelCode(modelCode?: string | null): boolean {
  const code = (modelCode || '').toLowerCase();
  return code.includes('seedance-2') || code.includes('seedance2');
}

/** Official-style example prompts for capability guide */
export const VIDEO_EDIT_EXAMPLE_PROMPTS = {
  multimodal: `固定镜头，中央鱼眼镜头透过圆形孔洞向下窥视，参考 @视频1 的鱼眼镜头，一只穿着红色新年衣服的可爱小猫看向镜头，嘴角带笑。背景是深黄色墙面、黑白波点地砖的复古走廊，暖黄壁灯点缀其间，镜头畸变带来的空间收拢感鱼眼镜头，场景模仿门上猫眼，动作参考 @视频2 ，小猫看着镜头，说“新年好！开门，seedance来啦！”`,
  edit: `将 @视频1 礼盒中的香水替换成 @图像1 中的面霜，动作和运镜不变`,
  extend: `延长 @视频1 ，一镜到底运镜，全程无剪辑断点，新年喜庆氛围感拉满；开篇 @视频1 画面，自然衔接慢拉镜头匀速穿过厨房门，顺滑过渡到客厅，一对夫妻正在客厅门口贴福字，镜头无缝摇移至贴窗花的客厅窗户处，紧接着慢推镜头从窗户向外穿出，流畅衔接孩子们在室外空地上放烟花的场景；全程运镜丝滑连贯、速度均匀不卡顿，画面融入红灯笼等新年元素，烘托浓厚过年氛围；背景音乐参考 @音频1 ，背景语音为：“新春快乐，阖家幸福，马年吉祥”，整体保证一镜到底的视觉连贯性、沉浸感，年味与氛围感双重拉满，人物比例符合现实世界物理规律。`,
} as const;

export type VideoEditExampleKey = keyof typeof VIDEO_EDIT_EXAMPLE_PROMPTS;

export interface MediaAsset {
  id: string;
  file: File;
  previewUrl: string;
  remoteUrl?: string;
  uploading?: boolean;
}
