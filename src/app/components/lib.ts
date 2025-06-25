/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";

const SCALE = 0.015;
const BODY_COLOR = 0x686868;

const scaleVec3 = (x: number, y: number, z: number) =>
  new THREE.Vector3(x * SCALE, -y * SCALE, z * SCALE);

const scaleVec2 = (x: number, y: number) =>
  new THREE.Vector2(x * SCALE, -y * SCALE);

function drawPoint(x: number, y: number, z: number) {
  const geometry = new THREE.SphereGeometry(0.1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x84ffff });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(scaleVec3(x, y, z));
}

function drawLine(
  scene: THREE.Scene,
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  color: number,
  opacity = 1,
  width = 0.08
) {
  const points = [scaleVec3(x1, y1, z1), scaleVec3(x2, y2, z2)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new MeshLine();
  line.setGeometry(geometry);

  const material = new MeshLineMaterial({
    color,
    opacity,
    lineWidth: width,
    transparent: true,
    depthTest: false,
  });

  scene.add(new THREE.Mesh(line, material));
}

function drawBody(
  scene: THREE.Scene,
  topLeft: number[],
  topRight: number[],
  bottomRight: number[],
  bottomLeft: number[]
) {
  const points = [
    scaleVec2(topLeft[1], topLeft[2]),
    scaleVec2(topRight[1], topRight[2]),
    scaleVec2(bottomRight[1], bottomRight[2]),
    scaleVec2(bottomLeft[1], bottomLeft[2]),
  ];

  const path = new THREE.Shape(points);
  const geometry = new THREE.ShapeGeometry(path);
  const material = new THREE.MeshBasicMaterial({
    color: BODY_COLOR,
    opacity: 0.2,
    transparent: true,
    depthTest: false,
  });

  scene.add(new THREE.Mesh(geometry, material));
}

function drawHead(scene: THREE.Scene, left: number[], right: number[]) {
  const p1 = scaleVec3(left[1], left[2], left[3]);
  const p2 = scaleVec3(right[1], right[2], right[3]);

  const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const distance = p1.distanceTo(p2);
  const majorRadius = distance / 2;
  const minorRadius = majorRadius * 1.25;

  const shape = new THREE.Shape();
  shape.absellipse(
    midPoint.x,
    midPoint.y,
    majorRadius,
    minorRadius,
    0,
    Math.PI * 2
  );

  const geometry = new THREE.ShapeGeometry(shape, 20);
  const material = new THREE.MeshBasicMaterial({
    color: BODY_COLOR,
    opacity: 0.2,
    transparent: true,
    depthTest: false,
    side: THREE.DoubleSide,
  });

  const ellipse = new THREE.Mesh(geometry, material);
  ellipse.position.set(0, -0.8, 0);
  scene.add(ellipse);
}

function drawPalm(
  scene: THREE.Scene,
  wrist: number[],
  thumb: number[],
  index: number[],
  middle: number[],
  ring: number[],
  pinky: number[],
  color = BODY_COLOR
) {
  const points = [
    scaleVec2(wrist[1], wrist[2]),
    scaleVec2(thumb[1], thumb[2]),
    scaleVec2(index[1], index[2]),
    scaleVec2(middle[1], middle[2]),
    scaleVec2(ring[1], ring[2]),
    scaleVec2(pinky[1], pinky[2]),
  ];

  const shape = new THREE.Shape(points);
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    opacity: 0.05,
    transparent: true,
    depthTest: false,
  });

  scene.add(new THREE.Mesh(geometry, material));
}

function connectPose(index: number, animation: any, scene: THREE.Scene) {
  const pose = animation[index][1];

  const poseEdges = [
    [12, 14],
    [14, 16],
    [11, 13],
    [13, 15],
  ];

  poseEdges.forEach(([u, v]) => {
    if (pose[u] && pose[v]) {
      const [_, x1, y1, z1] = pose[u];
      const [__, x2, y2, z2] = pose[v];
      drawLine(scene, x1, y1, z1, x2, y2, z2, BODY_COLOR, 1, 0.2);
    }
  });

  if (pose[7] && pose[8]) drawHead(scene, pose[7], pose[8]);
  if (pose[11] && pose[12] && pose[23] && pose[24])
    drawBody(scene, pose[12], pose[11], pose[23], pose[24]);
}

function connectHands(index: number, animation: any, scene: THREE.Scene) {
  const [left, right] = animation[index][2];

  const handEdges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [5, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [9, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [13, 17],
    [17, 18],
    [18, 19],
    [19, 20],
    [0, 17],
  ];

  const drawHand = (hand: number[][], color: number) => {
    handEdges.forEach(([u, v]) => {
      if (hand[u] && hand[v]) {
        const [_, x1, y1, z1] = hand[u];
        const [__, x2, y2, z2] = hand[v];
        drawLine(scene, x1, y1, z1, x2, y2, z2, color, 1);
      }
    });

    if (hand[0] && hand[5] && hand[9] && hand[13] && hand[17]) {
      drawPalm(scene, hand[0], hand[5], hand[9], hand[13], hand[17], hand[0], color);
    }
  };

  drawHand(left, 0x00ff00);
  drawHand(right, 0xff0000);
}

export { drawPoint, drawLine, connectPose, connectHands };
