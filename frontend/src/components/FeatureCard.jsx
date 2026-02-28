import { useRef } from "react";

const FeatureCard = ({
  title,
  desc,
  videoSrc,
  imageSrc,
  onTry,
  showButton = true,
  className = "",
}) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {}); // Catch error if play is blocked
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const hasVideo = Boolean(videoSrc);
  const hasImage = !hasVideo && Boolean(imageSrc);

  return (
    <div
      className={`border border-white/20 rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1 hover:scale-[1.03] ${className}`}
    >
      {/* Video Support */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          preload="metadata"
          playsInline
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="rounded-lg border border-white/10 w-full h-auto transition-transform duration-300"
        />
      )}

      {/* Image Support (Fallback) */}
      {hasImage && (
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className="rounded-lg border border-white/10 w-full h-auto object-cover transition-transform duration-300"
        />
      )}

      <div className="p-2 flex flex-col flex-grow">
        <h3 className="text-xl md:text-2xl text-white font-medium">
          {title}
        </h3>

        <p className="text-[#D1DCD9] text-base md:text-lg mt-2">
          {desc}
        </p>

        {showButton && (
          <button
            onClick={onTry}
            className="mt-8 border border-white rounded-full px-6 md:px-8 py-3 text-sm md:text-base text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 uppercase tracking-widest font-bold"
          >
            Try Demo
          </button>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;