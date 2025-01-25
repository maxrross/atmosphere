declare module 'vanta/dist/vanta.clouds.min' {
  import { Object3D } from 'three';

  interface VantaCloudOptions {
    el: HTMLElement | null;
    THREE: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    backgroundColor?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunColor?: number;
    sunGlareColor?: number;
    sunlightColor?: number;
    speed?: number;
  }

  interface VantaEffect extends Object3D {
    destroy: () => void;
    setOptions: (options: Partial<VantaCloudOptions>) => void;
  }

  function CLOUDS(options: VantaCloudOptions): VantaEffect;
  export default CLOUDS;
} 