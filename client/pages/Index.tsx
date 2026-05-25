import { CheckCircle2 } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Main card with horizontal layout */}
        <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl border border-red-900/30 bg-gradient-to-br from-red-950/40 to-black/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-900/30 transition-all duration-500">

          {/* Left side - Image placeholder */}
          <div className="w-full lg:w-1/3 h-64 lg:h-auto lg:min-h-80 bg-gradient-to-br from-red-900/60 to-black/80 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Placeholder image with mystical effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-red-700/40 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>

            {/* Glow effect for the image section */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-2/3 p-8 lg:p-10 flex flex-col justify-between">

            {/* Description */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent mb-4 leading-tight">
                Unlock the Experience
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Discover a world of possibilities. Join our exclusive community and elevate your experience to new heights.
              </p>

              {/* Checklist */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Premium access to exclusive content</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Direct access to our vibrant community</span>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">Early access to new features</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button below card */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://example.com"
            className="relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
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
              Join now!
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
