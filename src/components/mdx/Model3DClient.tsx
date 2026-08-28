import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, RotateCw } from "lucide-react";
import type { PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Tooltip } from "../../components/ui/Tooltip";
import { cn } from "../../lib/utils";

type Aspect = "video" | "square" | "portrait" | "wide" | "auto";

const ASPECT_RATIOS: Record<Aspect, string | undefined> = {
  video: "16 / 9",
  square: "1 / 1",
  portrait: "3 / 4",
  wide: "21 / 9",
  auto: undefined,
};

type ViewPreset = "iso" | "front" | "top" | "side";

const VIEW_PRESETS: {
  id: ViewPreset;
  label: string;
  dir: [number, number, number];
}[] = [
  { id: "iso", label: "Iso", dir: [1, 0.55, 1] },
  { id: "front", label: "Front", dir: [0, 0, 1] },
  { id: "top", label: "Top", dir: [0, 1, 0] },
  { id: "side", label: "Side", dir: [1, 0, 0] },
];

interface Model3DProps {
  src: string;
  caption?: string;
  className?: string;
  aspect?: Aspect;
  /** Enable turntable rotation on load; off by default. */
  autoRotate?: boolean;
}

interface ViewerHandle {
  camera: PerspectiveCamera;
  controls: OrbitControls;
  distance: number;
}

// Same probe approach as PlotlyClient: resolve a CSS custom property to a
// concrete color string three.js can parse.
function getResolvedColor(variable: string): string {
  if (typeof document === "undefined") return "#000000";

  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.color = `var(${variable})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return resolved;
}

export function Model3D({
  src,
  caption,
  className,
  aspect = "video",
  autoRotate = false,
}: Model3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerHandle | null>(null);
  // Plain-object camera target consumed by the animation loop; set by the
  // view-preset buttons.
  const cameraTargetRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [rotating, setRotating] = useState(autoRotate);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;

    async function init() {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (cancelled || !container) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(getResolvedColor("--background"));

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);

      const renderer = (() => {
        try {
          return new THREE.WebGLRenderer({ antialias: true });
        } catch {
          return null;
        }
      })();
      if (!renderer) {
        if (!cancelled) setStatus("error");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(1, 1.5, 1);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
      rimLight.position.set(-1, 0.5, -1);
      scene.add(rimLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = rotating;
      controls.autoRotateSpeed = 0.8;

      try {
        const gltf = await new GLTFLoader().loadAsync(src);
        if (cancelled) {
          renderer.dispose();
          renderer.domElement.remove();
          return;
        }
        scene.add(gltf.scene);

        // Center the model at the origin and frame it with the camera.
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);

        const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
        const distance = (radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.3;
        const isoDir = VIEW_PRESETS[0].dir;
        camera.position.set(isoDir[0], isoDir[1], isoDir[2]).normalize().multiplyScalar(distance);
        camera.near = radius * 0.01;
        camera.far = radius * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.minDistance = radius * 0.4;
        controls.maxDistance = distance * 4;
        controls.update();

        viewerRef.current = { camera, controls, distance };
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }

      const resize = () => {
        const { clientWidth: width, clientHeight: height } = container;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const themeObserver = new MutationObserver(() => {
        scene.background = new THREE.Color(getResolvedColor("--background"));
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      let frameId = 0;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        // Smoothly move the camera toward a preset view, if one is pending.
        const target = cameraTargetRef.current;
        if (target) {
          camera.position.x += (target.x - camera.position.x) * 0.15;
          camera.position.y += (target.y - camera.position.y) * 0.15;
          camera.position.z += (target.z - camera.position.z) * 0.15;
          const dx = camera.position.x - target.x;
          const dy = camera.position.y - target.y;
          const dz = camera.position.z - target.z;
          if (dx * dx + dy * dy + dz * dz < 1) {
            camera.position.set(target.x, target.y, target.z);
            cameraTargetRef.current = null;
          }
        }
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        controls.dispose();
        scene.traverse((object) => {
          const mesh = object as InstanceType<typeof THREE.Mesh>;
          mesh.geometry?.dispose();
          const material = mesh.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material?.dispose();
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
        viewerRef.current = null;
      };
    }

    init();
    return () => {
      cancelled = true;
      cleanup?.();
    };
    // The viewer is initialized once; runtime toggles go through viewerRef.
  }, [src]);

  // Lock page scroll and allow Escape while the viewer is expanded, matching
  // the ImageFigure lightbox behavior.
  useEffect(() => {
    if (!expanded) return;
    document.body.classList.add("overflow-hidden");
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", handleKey);
    };
  }, [expanded]);

  const toggleRotate = () => {
    const next = !rotating;
    setRotating(next);
    if (viewerRef.current) viewerRef.current.controls.autoRotate = next;
  };

  const applyView = (preset: (typeof VIEW_PRESETS)[number]) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const [x, y, z] = preset.dir;
    const length = Math.hypot(x, y, z);
    cameraTargetRef.current = {
      x: (x / length) * viewer.distance,
      y: (y / length) * viewer.distance,
      z: (z / length) * viewer.distance,
    };
    // Looking straight down needs a non-degenerate up vector.
    viewer.camera.up.set(0, preset.id === "top" ? 0 : 1, preset.id === "top" ? -1 : 0);
  };

  return (
    <figure className={cn("not-prose my-6", className)}>
      <div
        ref={containerRef}
        className={cn(
          "w-full overflow-hidden border-border/50 bg-background",
          expanded ? "fixed inset-0 z-50" : "relative rounded-xl border",
        )}
        style={expanded || aspect === "auto" ? undefined : { aspectRatio: ASPECT_RATIOS[aspect] }}
      >
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Loading model…
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load model.
          </div>
        )}

        {status === "ready" && (
          <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-lg border border-border/50 bg-background/80 p-1 backdrop-blur-sm">
            <Tooltip content="Toggle auto-rotation">
              <button
                type="button"
                onClick={toggleRotate}
                aria-label="Toggle auto-rotation"
                aria-pressed={rotating}
                className={cn(
                  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  rotating && "bg-muted text-foreground",
                )}
              >
                <RotateCw size={16} />
              </button>
            </Tooltip>
            <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
            {VIEW_PRESETS.map((preset) => (
              <Tooltip key={preset.id} content={`${preset.label} view`}>
                <button
                  type="button"
                  onClick={() => applyView(preset)}
                  aria-label={`${preset.label} view`}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {preset.label}
                </button>
              </Tooltip>
            ))}
            <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
            <Tooltip content={expanded ? "Exit fullscreen" : "Fullscreen"}>
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-label={expanded ? "Exit fullscreen" : "Fullscreen"}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {expanded ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </Tooltip>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
