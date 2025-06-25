/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "regenerator-runtime/runtime";

import { Slider } from "@/ui/components/Slider";
import Visualization from "../app/components/Visualization";

// Initialize socket connection
const socket = io("ws://localhost:1234");

type AnimationData = [string, any];

export default function Home() {
  const wordAnimationsToPlay = useRef<AnimationData[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [signingSpeed, setSigningSpeed] = useState<number>(30);
  const [text, setText] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log("✅ Connected to server");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("❌ Disconnected from server");
    };

    const handleAnimation = (animations: AnimationData[]) => {
      wordAnimationsToPlay.current = [...wordAnimationsToPlay.current, ...animations];
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("E-ANIMATION", handleAnimation);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("E-ANIMATION", handleAnimation);
    };
  }, []);

  const getNextWord = useCallback(() => {
    if (!wordAnimationsToPlay.current.length) return null;
    const [word, animation] = wordAnimationsToPlay.current.shift()!;
    setCurrentWord(word);
    return animation;
  }, []);

  const requestAnimation = () => {
    if (text.trim()) {
      socket.emit("E-REQUEST-ANIMATION", text.trim());
    } else {
      alert("Please enter some text to translate.");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Connection Status Toast */}
      <div className="absolute top-4 right-4 z-50">
        <span
          className={`px-3 py-1 text-xs rounded shadow-lg ${
            isConnected ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Sidebar */}
      <aside
        className={`z-40 fixed md:static md:flex flex-col w-72 h-full bg-gray-900 border-r border-gray-800 p-6 transition-transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-serif">ISL Assistant</h1>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden text-sm text-red-500"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Control: Signing Speed */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Signing Speed</label>
            <Slider
              defaultValue={[signingSpeed]}
              value={[signingSpeed]}
              onValueChange={(value) => setSigningSpeed(value[0])}
              min={20}
              max={100}
              step={1}
            />
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p>ISL Assistant v1.0</p>
            <p>Developed with ❤️ by Machine Maestros</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Layout */}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-gray-900">
          <h2 className="text-xl font-semibold font-serif">SIGN SPELL</h2>
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="md:hidden px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
          >
            {showSidebar ? "Hide Settings" : "Show Settings"}
          </button>
        </div>

        {/* Visualization Display */}
        <div className="flex-1 overflow-auto bg-black p-4">
          <Visualization
            full
            signingSpeed={signingSpeed}
            getNextWord={getNextWord}
            currentWord={currentWord}
          />
        </div>

        {/* Bottom Input Area */}
        <div className="border-t border-gray-800 bg-gray-900 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none rounded-md border border-gray-700 bg-gray-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setText("")}
                className="px-4 py-2 rounded-md text-sm bg-red-700 hover:bg-red-600"
              >
                Clear
              </button>
              <button
                onClick={requestAnimation}
                className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded-md text-sm font-semibold"
              >
                Render
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
