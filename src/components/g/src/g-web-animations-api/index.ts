import { runtime } from '../g-lite';
import { AnimationTimeline } from './dom/AnimationTimeline';
import { parseEasingFunction } from './utils';

export * from './dom';

runtime.EasingFunction = parseEasingFunction;
runtime.AnimationTimeline = AnimationTimeline;
