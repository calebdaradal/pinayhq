import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { TurnstileVerifyResponse } from "@shared/api";

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
}

export default function Index() {
  const previewImages = ["/preview.jpg", "/preview2.jpeg", "/preview3.jpg", "/preview4.jpeg"];
  const ctaUrl = "http://link.pinayhq.online/join";
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePreviewIndex((currentIndex) => (currentIndex + 1) % previewImages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [previewImages.length]);

  useEffect(() => {
    if (!turnstileSiteKey) {
      setVerificationError("Missing Turnstile site key configuration.");
      return;
    }

    const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let isMounted = true;

    const renderTurnstileWidget = () => {
      const turnstile = (window as Window & { turnstile?: TurnstileApi }).turnstile;
      const container = document.getElementById("turnstile-widget-container");
      if (!turnstile || !container || !isMounted) {
        return;
      }

      container.innerHTML = "";
      const widgetId = turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token) => {
          setTurnstileToken(token);
          setVerificationError(null);
        },
        "expired-callback": () => {
          setTurnstileToken(null);
        },
        "error-callback": () => {
          setTurnstileToken(null);
          setVerificationError("Turnstile failed to load. Please refresh the page.");
        },
      });

      setTurnstileWidgetId(widgetId);
    };

    const existingScript = document.querySelector(
      `script[src="${turnstileScriptUrl}"]`,
    ) as HTMLScriptElement | null;

    if ((window as Window & { turnstile?: TurnstileApi }).turnstile) {
      renderTurnstileWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderTurnstileWidget);
    } else {
      const script = document.createElement("script");
      script.src = turnstileScriptUrl;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderTurnstileWidget);
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (existingScript) {
        existingScript.removeEventListener("load", renderTurnstileWidget);
      }
    };
  }, [turnstileSiteKey]);

  const handleJoinNow = async () => {
    if (!turnstileToken) {
      setVerificationError("Please complete the verification first.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: turnstileToken,
        }),
      });

      const data = (await response.json()) as TurnstileVerifyResponse;
      if (!response.ok || !data.success) {
        setVerificationError("Verification failed. Please try again.");
        setTurnstileToken(null);

        const turnstile = (window as Window & { turnstile?: TurnstileApi }).turnstile;
        if (turnstile && turnstileWidgetId) {
          turnstile.reset(turnstileWidgetId);
        }
        return;
      }

      window.location.assign(ctaUrl);
    } catch {
      setVerificationError("Unable to verify right now. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Main card with horizontal layout */}
        <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl border border-red-900/30 bg-gradient-to-br from-red-950/40 to-black/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-900/30 transition-all duration-500">

          {/* Left side - Preview image */}
          <div className="w-full lg:w-1/3 h-64 lg:h-auto lg:min-h-80 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={previewImages[activePreviewIndex]}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Glow effect for the image section */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-2/3 p-8 lg:p-10 flex flex-col justify-between">

            {/* Description */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent mb-4 leading-tight">
                Join PinayHQ now 
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Join our exclusive group and experience viral and up to date contents of beautiful pinay models.
              </p>

              {/* Checklist */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Premium access for free!</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Exclusive videos, pure pinay amateur videos</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Early access to viral contents</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Unreleased videos and images</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Ultra rare files, only for your eyes</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Explore the delicious side of pure pinay delicacies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button below card */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <section id="turnstile-widget-container" className="min-h-[65px]" aria-label="Turnstile verification" />
          {verificationError ? <p className="text-sm text-red-300">{verificationError}</p> : null}

          <button
            type="button"
            onClick={handleJoinNow}
            disabled={isVerifying}
            className="relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg blur-xl bg-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

            {/* Inner shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Button shadow */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-red-800 blur opacity-50 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

            <span className="relative flex items-center justify-center gap-2">
              {isVerifying ? "Verifying..." : "Join now!"}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
