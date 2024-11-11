import { DefaultSceneGraphSelector} from '../services/SceneGraphSelector'
import type { SceneGraphSelector } from '../services/SceneGraphSelector'
import { DefaultSceneGraphService } from '../services/SceneGraphService'
import type { SceneGraphService } from '../services/interfaces'

export const sceneGraphSelector: SceneGraphSelector = new DefaultSceneGraphSelector()
export const sceneGraphService: SceneGraphService = new DefaultSceneGraphService(sceneGraphSelector)

export function patchSceneGraph(runtime: any) {
  runtime.sceneGraphSelector = sceneGraphSelector
  runtime.sceneGraphService = sceneGraphService
}
