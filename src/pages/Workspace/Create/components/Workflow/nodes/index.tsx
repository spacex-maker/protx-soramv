import PromptInputNode from './PromptInputNode';
import ImageInputNode from './ImageInputNode';
import KlingV1StdNode from './KlingV1StdNode';
import LumaDreamNode from './LumaDreamNode';
import RunwayGen3Node from './RunwayGen3Node';
import SoraProNode from './SoraProNode';
import OutputPreviewNode from './OutputPreviewNode';
import VideoUpscaleNode from './VideoUpscaleNode';
import StableDiffusionXLNode from './StableDiffusionXLNode';
import ImageDisplayNode from './ImageDisplayNode';
import ImageToVideoNode from './ImageToVideoNode';
import { NodeTypes } from '@xyflow/react';

// 节点类型映射
export const nodeTypes: NodeTypes = {
  'input_prompt': PromptInputNode,
  'input_image': ImageInputNode,
  'kling_v1_std': KlingV1StdNode,
  'luma_dream': LumaDreamNode,
  'runway_gen3': RunwayGen3Node,
  'sora_pro': SoraProNode,
  'output_preview': OutputPreviewNode,
  'video_upscale': VideoUpscaleNode,
  'stable-diffusion-xl': StableDiffusionXLNode,
  'image_display': ImageDisplayNode,
  'image_to_video': ImageToVideoNode,
};

// 导出所有节点组件
export { 
  PromptInputNode, 
  ImageInputNode,
  KlingV1StdNode,
  LumaDreamNode,
  RunwayGen3Node,
  SoraProNode,
  OutputPreviewNode,
  VideoUpscaleNode,
  StableDiffusionXLNode,
  ImageDisplayNode,
  ImageToVideoNode,
};

