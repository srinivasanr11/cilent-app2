/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { drawPoint, connectHands, connectPose } from "./lib";

interface AvatarProps {
  signingSpeed: number;
  getNextWord: () => any;
}

export default function Avatar({ signingSpeed, getNextWord }: AvatarProps) {
  const { camera } = useThree();

  const startTimeRef = useRef(0);
  const wordRef = useRef<any>(null);
  const previousFrameRef = useRef(0);

  useFrame(({ clock, scene }) => {
    const elapsed = clock.getElapsedTime() - startTimeRef.current;
    const frameIndex = Math.floor(elapsed * signingSpeed);

    if (frameIndex === previousFrameRef.current) return;
    previousFrameRef.current = frameIndex;

    if (!wordRef.current) {
      wordRef.current = getNextWord();
      startTimeRef.current = clock.getElapsedTime();
      previousFrameRef.current = 0;
      return;
    }

    if (frameIndex >= wordRef.current.length) {
      wordRef.current = null;
      return;
    }

    // Clear previous frame
    scene.clear();

    const [_, pose, [leftHand, rightHand]] = wordRef.current[0];

    for (const point of pose) {
      drawPoint(point[1], point[2], point[3]);
    }

    for (const point of leftHand) {
      drawPoint(point[1], point[2], point[3]);
    }

    for (const point of rightHand) {
      drawPoint(point[1], point[2], point[3]);
    }

    connectHands(frameIndex, wordRef.current, scene);
    connectPose(frameIndex, wordRef.current, scene);
  });

  useEffect(() => {
    camera.position.set(5, -5, 5);
    camera.rotation.set(0, 0, 0);
  }, [camera]);

  return null;
}
