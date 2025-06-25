declare module "three.meshline" {
  import * as THREE from "three";

  export class MeshLine extends THREE.BufferGeometry {
    setGeometry(geometry: THREE.BufferGeometry | THREE.Vector3[]): void;
  }

  export interface MeshLineMaterialParameters extends THREE.ShaderMaterialParameters {
    useMap?: boolean;
    color?: THREE.Color | string | number;
    opacity?: number;
    resolution?: THREE.Vector2;
    sizeAttenuation?: boolean;
    lineWidth?: number;
    near?: number;
    far?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
    transparent?: boolean;
    dashArray?: number;
    dashOffset?: number;
    dashRatio?: number;
    alphaTest?: number;
    repeat?: THREE.Vector2;
  }

  export class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters?: MeshLineMaterialParameters);
  }
}
