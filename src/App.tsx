import { useRef, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import {
  bootstrapCameraKit,
  Transform2D,
  createMediaStreamSource,
  CameraKit,
  CameraKitSession,
  RemoteApiService,
  RemoteApiServices,
  Injectable,
  remoteApiServicesFactory,
  Lens,
} from "@snap/camera-kit";
import { Loading } from "./components/Loading";

import "./App.css";

const LENS_GROUP_ID = "0f91ab70-a2c8-4468-b711-edf28f8dc044";

const apiService: RemoteApiService = {
  apiSpecId: "af9a7f93-3a8d-4cf4-85d2-4dcdb8789b3d",
  getRequestHandler(request) {
    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage("collect");
    }
    return (reply) => {
      return reply({
        status: "success",
        metadata: {},
        body: new TextEncoder().encode(`{"message":"collect-success"}`),
      });
    };
  },
};

export const App = () => {
  const cameraKitRef = useRef<CameraKit>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<CameraKitSession>();
  const lensesRef = useRef<Lens[]>();

  const mediaStreamRef = useRef<MediaStream>();

  const [isInitialized, setIsInitialized] = useState(false);
  const [started, setStarted] = useState(false);

  async function onStartButtonClick() {
    if (!sessionRef.current || !lensesRef.current) {
      console.error("Session not initialized when trying to start");
      return;
    }

    let permSatus = "prompt";
    console.log("isMobile", isMobile);

    if (!isMobile) {
      await sessionRef.current.applyLens(lensesRef.current[0]);
      setStarted(true);
      return;
    }

    if (
      isMobile &&
      !window.DeviceMotionEvent.hasOwnProperty("requestPermission")
    ) {
      // odd case - we are likely in desktop browser simulation mode
      await sessionRef.current.applyLens(lensesRef.current[0]);
      setStarted(true);
      return;
    }

    try {
      //@ts-ignore
      permSatus = await window.DeviceMotionEvent.requestPermission();
      if (permSatus === "granted") {
        console.log("DeviceMotion permission granted");
        await sessionRef.current.applyLens(lensesRef.current[0]);
        setStarted(true);
      } else {
        console.error("DeviceMotion permission denied");
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    async function initCameraKit() {
      // Init CameraKit
      //@ts-ignore
      const apiServiceInjectable = Injectable(
        remoteApiServicesFactory.token,
        [remoteApiServicesFactory.token] as const,
        (existing: RemoteApiServices) => [...existing, apiService]
      );
      const cameraKit = await bootstrapCameraKit(
        {
          logger: "console",
          apiToken:
            "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzA4NTQ0MTU3LCJzdWIiOiI3YjQwZWM4Ny1hNTk3LTQ0OTMtYjAyZi04YTFkOWVlYTNjZTN-U1RBR0lOR340ZGE0ZmUwYi05OTNmLTRkOGYtYjNiNC0yNjg3NjM2NjkxMzgifQ.BfK9vetSFkfUkL5_ueLB7xJv3S60SRfwIuISh_5F0V8",
        },
        (container) => container.provides(apiServiceInjectable)
      );
      cameraKitRef.current = cameraKit;

      const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        LENS_GROUP_ID,
      ]);

      lensesRef.current = lenses;

      // Init Session
      const session = await cameraKit.createSession({
        liveRenderTarget: canvasRef.current || undefined,
      });
      sessionRef.current = session;
      session.events.addEventListener("error", (event) =>
        console.error(event.detail)
      );
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("device", devices);
      const backCamera = devices.find(
        (device) =>
          device.kind === "videoinput" &&
          device.label === "Back Ultra Wide Camera" // Get the wider camera on iPhone / TODO test on Android
      );
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { min: 640, ideal: 1920 },
          height: { min: 400, ideal: 1080 },
          deviceId: backCamera ? { exact: backCamera?.deviceId } : undefined,
        },
      });

      mediaStreamRef.current = mediaStream;

      const source = createMediaStreamSource(mediaStream, {
        cameraType: "environment",
      });
      await session.setSource(source);
      // await session.applyLens(lenses[1]);

      session.play();
      setIsInitialized(true);
    }

    if (!cameraKitRef.current) {
      initCameraKit();
    }

    return () => {
      sessionRef.current?.pause();
    };
  }, []);

  return (
    <div className="snap-camera-container">
      <canvas ref={canvasRef} />

      {(!isInitialized || !started) && (
        <Loading
          onStartButtonClick={onStartButtonClick}
          camKitLoaded={isInitialized}
        />
      )}

      <img
        className="snap-logo"
        src="/snap_attribution.png"
      />
    </div>
  );
};
