
import { OffscreenCanvasCreator } from '../services/OffscreenCanvasCreator';
import { TextService } from '../services/TextService';



export const offscreenCanvas:OffscreenCanvasCreator = new OffscreenCanvasCreator();


export const textService:TextService = new TextService(offscreenCanvas);

export function patchTextConstants(runtime: any) {
  runtime.offscreenCanvas = offscreenCanvas
  runtime.textService = textService

}