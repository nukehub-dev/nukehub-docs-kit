import * as React from "react";
import { cn } from "../../lib/utils";

interface MermaidProps {
  chart: string;
  className?: string;
}

function getResolvedTheme(): "default" | "dark" {
  if (typeof document === "undefined") return "default";
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "dark" ? "dark" : "default";
}

export function Mermaid({ chart, className }: MermaidProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>("");
  const chartRef = React.useRef(chart);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    chartRef.current = chart;
  });

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const renderChart = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    const mod = await import("mermaid");
    const mermaid = mod.default;

    mermaid.initialize({
      startOnLoad: false,
      theme: getResolvedTheme(),
      securityLevel: "loose",
    });

    try {
      const { svg: renderedSvg } = await mermaid.render(`mermaid-${id}`, chartRef.current);
      if (isMountedRef.current) setSvg(renderedSvg);
    } catch {
      if (isMountedRef.current) setSvg("<p>Failed to render diagram.</p>");
    }
  }, [id]);

  React.useEffect(() => {
    renderChart();
  }, [chart, renderChart]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new MutationObserver(() => {
      renderChart();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [renderChart]);

  return (
    <div
      className={cn(
        "not-prose relative my-6 overflow-hidden rounded-xl border border-border/50 bg-card",
        className,
      )}
    >
      <div
        ref={ref}
        className="overflow-auto p-4 [&_svg]:mx-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
