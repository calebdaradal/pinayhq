import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { CtaConfigResponse, TurnstileVerifyResponse } from "@shared/api";

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
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [ctaUrl, setCtaUrl] = useState<string | null>(null);
  const [ctaLoadError, setCtaLoadError] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePreviewIndex((currentIndex) => (currentIndex + 1) % previewImages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [previewImages.length]);

  useEffect(() => {
    const loadCtaConfig = async () => {
      try {
        const response = await fetch("/api/config/cta");
        if (!response.ok) {
          setCtaLoadError("Unable to load destination link.");
          return;
        }

        const data = (await response.json()) as CtaConfigResponse;
        const configuredCtaUrl = data.ctaUrl?.trim();
        if (!configuredCtaUrl) {
          setCtaLoadError("CTA_URL is missing. Add it to your environment variables.");
          return;
        }

        setCtaUrl(configuredCtaUrl);
      } catch {
        setCtaLoadError("Unable to load destination link.");
      }
    };

    void loadCtaConfig();
  }, []);

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
      turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token) => {
          const normalizedToken = token?.trim();
          if (!normalizedToken) {
            setIsHumanVerified(false);
            setVerificationError("Missing Turnstile token. Please verify again.");
            return;
          }

          setIsHumanVerified(false);
          void verifyTurnstileToken(normalizedToken);
        },
        "expired-callback": () => {
          setIsHumanVerified(false);
          setVerificationError("Verification expired. Please verify again.");
        },
        "error-callback": () => {
          setIsHumanVerified(false);
          setVerificationError("Turnstile failed to load. Please refresh the page.");
        },
      });

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

  const verifyTurnstileToken = async (token: string) => {
    const normalizedToken = token?.trim();
    if (!normalizedToken) {
      setIsHumanVerified(false);
      setVerificationError("Missing Turnstile token. Please verify again.");
      return false;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-turnstile-token": normalizedToken,
        },
        body: JSON.stringify({
          token: normalizedToken,
        }),
      });

      const data = (await response.json()) as TurnstileVerifyResponse;
      if (!response.ok || !data.success) {
        const hasErrorCodes = Boolean(data.errorCodes && data.errorCodes.length > 0);
        const hasMessage = Boolean(data.message && data.message.trim().length > 0);
        setVerificationError(
          hasErrorCodes
            ? `Verification failed (${data.errorCodes?.join(", ")}). Please try again.`
            : hasMessage
              ? data.message ?? "Verification failed. Please try again."
              : "Verification failed. Please try again.",
        );
        setIsHumanVerified(false);

        const turnstile = (window as Window & { turnstile?: TurnstileApi }).turnstile;
        if (turnstile) {
          turnstile.reset();
        }
        return false;
      }

      setIsHumanVerified(true);
      return true;
    } catch {
      setIsHumanVerified(false);
      setVerificationError("Unable to verify right now. Please try again.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoinNow = () => {
    if (!isHumanVerified) {
      setVerificationError("Please complete verification first.");
      return;
    }

    if (!ctaUrl) {
      setCtaLoadError("CTA_URL is missing. Add it to your environment variables.");
      return;
    }

    window.location.assign(ctaUrl);
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
        <div className="mt-12 flex flex-col items-center gap-3">
          <section className="flex items-center justify-center gap-4">
            <section id="turnstile-widget-container" className="min-h-[65px]" aria-label="Turnstile verification" />
            <button
              type="button"
              onClick={handleJoinNow}
              disabled={isVerifying || !isHumanVerified || !ctaUrl}
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
          </section>
          {ctaLoadError ? <p className="text-sm text-red-300">{ctaLoadError}</p> : null}
          {verificationError ? <p className="text-sm text-red-300">{verificationError}</p> : null}
        </div>
      </div>
    </div>
  );
}
