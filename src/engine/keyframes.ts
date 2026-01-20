import { Keyframe } from '../store/timelineSlice';

export interface KeyframeAnimation {
  property: string;
  keyframes: Keyframe[];
  currentValue: any;
}

export class KeyframeEngine {
  interpolate(keyframes: Keyframe[], time: number): any {
    if (keyframes.length === 0) return null;
    if (keyframes.length === 1) return keyframes[0].value;

    // Find surrounding keyframes
    let prevKeyframe: Keyframe | null = null;
    let nextKeyframe: Keyframe | null = null;

    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].time <= time) {
        prevKeyframe = keyframes[i];
      }
      if (keyframes[i].time >= time && !nextKeyframe) {
        nextKeyframe = keyframes[i];
        break;
      }
    }

    // If before first keyframe
    if (!prevKeyframe) return nextKeyframe?.value;
    // If after last keyframe
    if (!nextKeyframe) return prevKeyframe.value;
    // If exactly on a keyframe
    if (prevKeyframe.time === time) return prevKeyframe.value;

    // Interpolate between keyframes
    const duration = nextKeyframe.time - prevKeyframe.time;
    const progress = (time - prevKeyframe.time) / duration;

    const easing = this.getEasingFunction(prevKeyframe.easing || 'linear');
    const easedProgress = easing(progress);

    // Handle different value types
    if (typeof prevKeyframe.value === 'number' && typeof nextKeyframe.value === 'number') {
      return prevKeyframe.value + (nextKeyframe.value - prevKeyframe.value) * easedProgress;
    }

    if (
      typeof prevKeyframe.value === 'object' &&
      typeof nextKeyframe.value === 'object' &&
      'x' in prevKeyframe.value &&
      'y' in prevKeyframe.value
    ) {
      return {
        x:
          prevKeyframe.value.x +
          (nextKeyframe.value.x - prevKeyframe.value.x) * easedProgress,
        y:
          prevKeyframe.value.y +
          (nextKeyframe.value.y - prevKeyframe.value.y) * easedProgress,
      };
    }

    // For non-interpolatable values, return the previous value
    return prevKeyframe.value;
  }

  private getEasingFunction(easing: string): (t: number) => number {
    switch (easing) {
      case 'linear':
        return (t) => t;
      case 'ease-in':
        return (t) => t * t;
      case 'ease-out':
        return (t) => t * (2 - t);
      case 'ease-in-out':
        return (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      default:
        return (t) => t;
    }
  }

  addKeyframe(
    keyframes: Keyframe[],
    time: number,
    value: any,
    easing: Keyframe['easing'] = 'linear'
  ): Keyframe[] {
    const newKeyframe: Keyframe = { time, value, easing };
    const updated = [...keyframes];

    // Find insertion point
    const index = updated.findIndex((kf) => kf.time > time);
    if (index === -1) {
      updated.push(newKeyframe);
    } else {
      // Replace if exists at same time
      if (updated[index].time === time) {
        updated[index] = newKeyframe;
      } else {
        updated.splice(index, 0, newKeyframe);
      }
    }

    return updated;
  }

  removeKeyframe(keyframes: Keyframe[], time: number): Keyframe[] {
    return keyframes.filter((kf) => kf.time !== time);
  }

  getKeyframeAtTime(keyframes: Keyframe[], time: number): Keyframe | null {
    return keyframes.find((kf) => kf.time === time) || null;
  }
}

export const keyframeEngine = new KeyframeEngine();
