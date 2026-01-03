import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const CoverSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    slideAnimation
      .addElement("logo", logoRef, {
        enter: { type: "zoomIn", duration: 800 },
        group: 0,
      })
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 800, delay: 300 },
        group: 1,
      })
      .addElement("subtitle", subtitleRef, {
        enter: { type: "fadeInUp", duration: 800, delay: 600 },
        group: 2,
      })
      .setMode("parallel")
      .startGrouped();

    initializedRef.current = true;
    useAppStore.getState().setCurrentSlideAPI(slideAnimation);

    return () => {
      slideAnimation.reset();
      useAppStore.getState().setCurrentSlideAPI(null);
      initializedRef.current = false;
    };
  }, []);

  return (
    <section className="relative flex h-full flex-col items-center justify-center text-center px-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/1fa9db4c-5245-4a96-8fee-2f24f2f895ba.png"
          alt="Happy children learning online"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div ref={logoRef} className="mb-4">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/492eea04-0790-4544-9f46-0d22bc4702c9.png"
            alt="ALLSMILES Academy Logo"
            className="w-32 h-32 object-contain drop-shadow-lg"
          />
        </div>

        <h1 ref={titleRef} className="text-7xl font-bold tracking-tight text-[#2C3E50]">
          ALLSMILES Academy
        </h1>

        <p ref={subtitleRef} className="text-4xl font-semibold text-[#FF6B6B] max-w-3xl">
          Quality Online Education for Your Child's Bright Future
        </p>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "ALLSMILES Academy",
  order: 0,
  enterAnimation: { type: "fadeIn", duration: 600 },
})(CoverSlideComponent);

export default CoverSlideComponent;