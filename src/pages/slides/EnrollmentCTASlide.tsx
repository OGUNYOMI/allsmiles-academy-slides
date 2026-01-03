import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";
import { ArrowRight, Phone, Mail, Globe } from "lucide-react";

const EnrollmentCTASlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "zoomIn", duration: 800 },
        group: 0,
      })
      .addElement("subtitle", subtitleRef, {
        enter: { type: "fadeIn", duration: 600, delay: 300 },
        group: 1,
      })
      .addElement("image", imageRef, {
        enter: { type: "fadeInUp", duration: 800, delay: 500 },
        group: 2,
      })
      .addElement("cta", ctaRef, {
        enter: { type: "pulse", duration: 1000, delay: 700 },
        group: 3,
      })
      .addElement("contact", contactRef, {
        enter: { type: "fadeInUp", duration: 600, delay: 900 },
        group: 4,
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
    <section className="relative flex h-full flex-col items-center justify-center px-16 py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#4ECDC4]/20 via-[#FFE66D]/20 to-[#FF6B6B]/20"></div>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-5xl">
        <h1 ref={titleRef} className="text-6xl font-bold text-[#2C3E50] mb-2">
          Enroll Today!
        </h1>

        <p ref={subtitleRef} className="text-3xl font-semibold text-[#FF6B6B] mb-4">
          Limited Spots Available - Special Introductory Offer!
        </p>

        {/* Family Image */}
        <div ref={imageRef} className="w-full max-w-2xl mb-4">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/530c20ff-10b5-49fc-a4ed-40933c316b5b.png"
            alt="Family learning together"
            className="w-full h-64 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* CTA Button */}
        <div ref={ctaRef} className="mb-6">
          <button className="bg-gradient-to-r from-[#FF6B6B] to-[#FF6B6B]/80 hover:from-[#FF6B6B]/90 hover:to-[#FF6B6B]/70 text-white px-12 py-6 rounded-2xl text-3xl font-bold shadow-2xl transform hover:scale-105 transition-all flex items-center gap-4">
            Start Your Journey
            <ArrowRight className="w-10 h-10" />
          </button>
        </div>

        {/* Contact Information */}
        <div ref={contactRef} className="grid grid-cols-3 gap-6 w-full">
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-[#4ECDC4]" />
              <h3 className="text-lg font-bold text-[#2C3E50]">Visit Us</h3>
            </div>
            <p className="text-base text-gray-700 font-semibold">mgx-06rjp6x56iza.mgx.world</p>
          </div>

          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-[#FF6B6B]" />
              <h3 className="text-lg font-bold text-[#2C3E50]">Email Us</h3>
            </div>
            <p className="text-base text-gray-700 font-semibold">info@allsmiles.academy</p>
          </div>

          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Phone className="w-6 h-6 text-[#FFE66D]" />
              <h3 className="text-lg font-bold text-[#2C3E50]">Call Us</h3>
            </div>
            <p className="text-base text-gray-700 font-semibold">1-800-ALLSMILES</p>
          </div>
        </div>

        <p className="text-xl text-[#2C3E50] font-semibold mt-4">
          🎓 Give your child the gift of quality education! 🎓
        </p>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Enroll Today",
  order: 4,
  enterAnimation: { type: "fadeIn", duration: 800 },
})(EnrollmentCTASlideComponent);

export default EnrollmentCTASlideComponent;