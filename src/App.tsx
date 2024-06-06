import { useRef, useEffect, useState, useCallback } from "react";
import { isMobile } from "react-device-detect";
import {
  bootstrapCameraKit,
  createMediaStreamSource,
  CameraKit,
  CameraKitSession,
  RemoteApiService,
  RemoteApiServices,
  Injectable,
  remoteApiServicesFactory,
  Lens,
} from "@snap/camera-kit";
import { useQueryParam, StringParam } from "use-query-params";
import { Loading } from "./components/Loading";
import { requestMotionPermission, requestCameraPermission } from "./utils";
import { PlayerMap } from "./Players";

import "./App.css";

const LENS_GROUP_ID = "b99d3ccd-583a-4645-bbcb-ff8eab53915c";

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
  const [playerName] = useQueryParam("player", StringParam);
  const [motionPermissionGranted, setMotionPermission] = useState(false);
  const [_, setCameraPermission] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const setCanvasRef = (element: HTMLCanvasElement) => {
    if (element) setCanvas(element);
  };

  /**
   * apply the correct lens to the session
   */
  async function onStartButtonClick() {
    if (!sessionRef.current || !lensesRef.current) {
      console.error("Session not initialized when trying to start");
      return;
    }

    if (!lensesRef.current.length) {
      console.error("Error loading lenses");
      // @ts-ignore
      if (window.ReactNativeWebView) {
        // @ts-ignore
        window.ReactNativeWebView.postMessage("error");
      }
      return;
    }

    if (!playerName) {
      console.error("No player name provided");
      return;
    }

    // find lens with player name
    const maybeLens = lensesRef.current.find((lens) =>
      lens.name.includes(playerName)
    );

    if (!maybeLens) {
      console.error("No lens found for player name");
      return;
    }

    if (!isMobile) {
      try {
        await sessionRef.current.applyLens(maybeLens);

        setStarted(true);
      } catch (e) {
        console.error("Error applying lens", e);
        //@ts-ignore
        window.ReactNativeWebView.postMessage("AR error");
      }
      return;
    }

    if (
      isMobile &&
      !window.DeviceMotionEvent.hasOwnProperty("requestPermission")
    ) {
      // odd case - we are likely in desktop browser simulation mode
      await sessionRef.current.applyLens(maybeLens);
      setStarted(true);
      return;
    }

    if (!motionPermissionGranted) {
      //@ts-ignore
      if (window.ReactNativeWebView) {
        console.error("Requesting motion permission from RN ");
      }

      const status = await requestMotionPermission();
      if (!status) return;

      setMotionPermission(status);
      try {
        await sessionRef.current.applyLens(maybeLens);

        setStarted(true);
      } catch (e) {
        console.error("Error applying lens", e);
        //@ts-ignore
        window.ReactNativeWebView.postMessage("AR error");
      }
      return;
    }
    try {
      await sessionRef.current.applyLens(maybeLens);

      setStarted(true);
    } catch (e) {
      console.error("Error applying lens", e);
      //@ts-ignore
      window.ReactNativeWebView.postMessage("AR error");
    }
    return;
  }

  /**
   * Determine how to handle permissions based on the platform
   * window.xrii is a namespace used to communicate with the RN app
   */
  useEffect(() => {
    // handle react native permissions
    //@ts-ignore

    //@ts-ignore
    if (!window.xrii) window.xrii = {};
    //@ts-ignore
    window.xrii.setPermissions = (perm: {
      camera: boolean;
      sensor: boolean;
    }) => {
      if (perm.sensor) {
        requestMotionPermission().then((status) => {
          setMotionPermission(status);
          /**
           * Try to pass in the camera permission from the RN app
           * Camera kit may ask anyway
           * */
          requestCameraPermission().then((cameraStatus) => {
            setCameraPermission(cameraStatus);
          });
        });

        // we could also wait to build the AR until this call

        // Thorstens code
        // requestMotionPermission().then((motionPermission) => {
        //   setMotionPermission(motionPermission as any);
        //   requestCameraPermission().then((cameraPermission) => {
        //     setCameraPermission(cameraPermission as any);
        //
        //   });
        // });
      }
    };
  }, []);

  /**
   * Instantiate CameraKit and start the session
   */
  useEffect(() => {
    if (!canvas) {
      console.error("Canvas not initialized");
      return;
    }
    async function initCameraKit() {
      if (!canvas) {
        console.error("Canvas not initialized!");
        return;
      }

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
            "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzE1NzE2NzkxLCJzdWIiOiI1YzZmZTc2Ni1hMGVlLTRhYWYtYjIzOC1kMWUwNDA5MmU2YjB-U1RBR0lOR341YzQ2NDQwOC1hMjY1LTQ2NzItOWZiMS0wNGNjYTA4YjAwMDQifQ.k4QMxwx9I6uvoZWxdiIPr-3RLDqL1983krnoiQ2Aag8",
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
        liveRenderTarget: canvas,
      });
      sessionRef.current = session;
      session.events.addEventListener("error", (event) =>
        console.error(event.detail)
      );
      const devices = await navigator.mediaDevices.enumerateDevices();

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
  }, [canvas]);

  return (
    <div className="snap-camera-container">
      <canvas ref={setCanvasRef} />

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
