import { useEffect, useRef, useState } from "react";
import type { Data, Layout, Config } from "plotly.js";
import { cn } from "../../lib/utils";

type Aspect = "video" | "square" | "portrait" | "wide" | "auto";

const ASPECT_RATIOS: Record<Aspect, string | undefined> = {
  video: "16 / 9",
  square: "1 / 1",
  portrait: "3 / 4",
  wide: "21 / 9",
  auto: undefined,
};

interface PlotlyProps {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  aspect?: Aspect;
}

function getResolvedColor(variable: string): string {
  if (typeof document === "undefined") return "#000000";

  // Read the raw CSS variable value from the document element so it respects
  // the current data-theme, then paint one canvas pixel to normalize it to a
  // format Plotly can parse. Browsers serialize oklch()/color-mix() in
  // incompatible ways, but getImageData always gives concrete sRGB values.
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  if (!raw) return "#000000";

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return raw;

  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

  if (a === 0) return "transparent";
  if (a < 255) {
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  }
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function getThemeColors() {
  return {
    background: getResolvedColor("--background"),
    foreground: getResolvedColor("--foreground"),
    muted: getResolvedColor("--muted"),
    mutedForeground: getResolvedColor("--muted-foreground"),
    border: getResolvedColor("--border"),
  };
}

const BASE_CONFIG: Partial<Config> = {
  displaylogo: false,
  responsive: true,
  displayModeBar: true,
  modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
};

function buildConfig(userConfig: Partial<Config> | undefined): Partial<Config> {
  return {
    ...BASE_CONFIG,
    ...userConfig,
  };
}

function buildLayout(
  userLayout: Partial<Layout> | undefined,
  colors: ReturnType<typeof getThemeColors>,
): Partial<Layout> {
  return {
    paper_bgcolor: colors.background,
    plot_bgcolor: colors.background,
    font: { color: colors.foreground },
    xaxis: {
      gridcolor: colors.border,
      zerolinecolor: colors.border,
      linecolor: colors.mutedForeground,
      tickfont: { color: colors.foreground },
      title: { font: { color: colors.foreground } },
      ...userLayout?.xaxis,
    },
    yaxis: {
      gridcolor: colors.border,
      zerolinecolor: colors.border,
      linecolor: colors.mutedForeground,
      tickfont: { color: colors.foreground },
      title: { font: { color: colors.foreground } },
      ...userLayout?.yaxis,
    },
    legend: {
      font: { color: colors.foreground },
      bgcolor: "rgba(0,0,0,0)",
      ...userLayout?.legend,
    },
    modebar: {
      color: colors.foreground,
      bgcolor: "rgba(0,0,0,0)",
      activecolor: colors.mutedForeground,
      ...userLayout?.modebar,
    },
    margin: { t: 32, r: 16, b: 48, l: 48, ...userLayout?.margin },
    autosize: true,
    ...userLayout,
  };
}

export function Plotly({ data, layout, config, className, aspect = "video" }: PlotlyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  const plotlyRef = useRef<typeof import("plotly.js") | null>(null);
  const dataRef = useRef(data);
  const layoutRef = useRef(layout);
  const configRef = useRef(config);

  // Keep refs in sync without re-triggering effects.
  useEffect(() => {
    dataRef.current = data;
    layoutRef.current = layout;
    configRef.current = config;
  });

  // Initial render.
  useEffect(() => {
    let cancelled = false;

    import("plotly.js-dist-min")
      .then((mod) => {
        if (cancelled || !ref.current) return;

        const Plotly = mod.default as unknown as typeof import("plotly.js");
        plotlyRef.current = Plotly;
        const colors = getThemeColors();

        return Plotly.newPlot(
          ref.current,
          dataRef.current,
          buildLayout(layoutRef.current, colors),
          buildConfig(configRef.current),
        ).then(() => {
          if (!cancelled) setIsReady(true);
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Update the chart when props change.
  useEffect(() => {
    const Plotly = plotlyRef.current;
    if (!isReady || !Plotly || !ref.current) return;

    Plotly.react(
      ref.current,
      data,
      buildLayout(layout, getThemeColors()),
      buildConfig(config),
    ).catch(() => {
      setError(true);
    });
  }, [data, layout, config, isReady]);

  // React to theme changes.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new MutationObserver(() => {
      const Plotly = plotlyRef.current;
      if (!Plotly || !ref.current) return;

      Plotly.react(
        ref.current,
        dataRef.current,
        buildLayout(layoutRef.current, getThemeColors()),
        buildConfig(configRef.current),
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Keep the chart sized correctly when the window resizes.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const Plotly = plotlyRef.current;
      if (Plotly && ref.current) {
        Plotly.Plots.resize(ref.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/50 bg-background",
        className,
      )}
      style={aspect === "auto" ? undefined : { aspectRatio: ASPECT_RATIOS[aspect] }}
    >
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Loading chart…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Failed to load chart.
        </div>
      )}
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
