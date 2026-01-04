import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const CoverSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 800 },
        group: 0,
      })
      .addElement("subtitle", subtitleRef, {
        enter: { type: "fadeIn", duration: 800, delay: 300 },
        group: 1,
      })
      .addElement("tagline", taglineRef, {
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
    <section className="relative flex h-full flex-col items-center justify-center text-center px-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&h=720&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 space-y-8">
        <div className="inline-block px-8 py-3 bg-blue-500 rounded-full mb-4">
          <span className="text-white text-2xl font-bold">ALLSMILES ACADEMY</span>
        </div>
        
        <h1 ref={titleRef} className="text-7xl font-bold text-gray-900 leading-tight">
          Quality Online Education<br />for Your Child's Bright Future
        </h1>
        
        <p ref={subtitleRef} className="text-3xl text-gray-700 max-w-4xl mx-auto">
          Professional homeschooling, exam prep, and personalized tutoring from anywhere in the world
        </p>
        
        <p ref={taglineRef} className="text-2xl text-purple-600 font-semibold">
          Learning Starts at Home – Full Online Support for Students Worldwide
        </p>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Cover",
  order: 0,
  enterAnimation: { type: "fadeIn", duration: 600 },
})(CoverSlideComponent);

export default CoverSlideComponent;