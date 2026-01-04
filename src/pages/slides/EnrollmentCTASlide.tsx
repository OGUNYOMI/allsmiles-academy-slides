import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const EnrollmentCTASlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 800 },
        group: 0,
      })
      .addElement("content", contentRef, {
        enter: { type: "fadeInUp", duration: 800, delay: 400 },
        group: 1,
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
    <section className="relative flex h-full flex-col items-center justify-center text-center px-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 space-y-10 max-w-5xl">
        <h1 ref={titleRef} className="text-7xl font-bold text-white leading-tight">
          Ready to Start Your Child's<br />Learning Journey?
        </h1>

        <div ref={contentRef} className="space-y-8">
          <p className="text-3xl text-white/90 leading-relaxed">
            Join thousands of families worldwide who trust ALLSMILES Academy for quality online education
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-white/20">
            <h2 className="text-4xl font-bold text-white mb-6">📞 Contact Us Today</h2>
            <div className="space-y-4 text-2xl text-white">
              <p className="flex items-center justify-center gap-3">
                <span className="font-semibold">WhatsApp:</span>
                <span>+234 903 716 9857</span>
              </p>
              <p className="flex items-center justify-center gap-3">
                <span className="font-semibold">Telegram:</span>
                <span>+234 903 716 9857 | +234 814 382 1179</span>
              </p>
              <p className="flex items-center justify-center gap-3">
                <span className="font-semibold">Email:</span>
                <span>info@allsmilesacademy.com</span>
              </p>
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <div className="bg-white text-blue-600 px-10 py-4 rounded-full text-2xl font-bold shadow-2xl hover:scale-105 transition-transform">
              🎓 Enroll Now
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full text-2xl font-bold border-2 border-white hover:bg-white/30 transition-all">
              📚 Learn More
            </div>
          </div>

          <p className="text-xl text-white/80 italic">
            ✨ Special Offer: First month 20% off for new students! ✨
          </p>
        </div>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Enroll Today",
  order: 4,
  enterAnimation: { type: "fadeIn", duration: 600 },
})(EnrollmentCTASlideComponent);

export default EnrollmentCTASlideComponent;