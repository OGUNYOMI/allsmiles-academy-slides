import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";
import { Target, Shield, DollarSign, BarChart3 } from "lucide-react";

const WhyChooseSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 600 },
        group: 0,
      })
      .addElement("image", imageRef, {
        enter: { type: "zoomIn", duration: 800, delay: 200 },
        group: 1,
      })
      .addElement("grid", gridRef, {
        enter: { type: "fadeInUp", duration: 800, delay: 400 },
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
    <section className="flex h-full flex-col px-16 py-12">
      <h1 ref={titleRef} className="text-5xl font-bold text-[#2C3E50] mb-8">
        Why Choose ALLSMILES Academy?
      </h1>

      <div className="flex-1 min-h-0 flex flex-col gap-6">
        {/* Hero Image */}
        <div ref={imageRef} className="flex-1 min-h-0">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/1a506dd9-67f5-4a8c-8516-a6c534e0afdc.png"
            alt="Teacher and student online learning"
            className="w-full h-full object-cover rounded-2xl shadow-xl"
          />
        </div>

        {/* Feature Grid */}
        <div ref={gridRef} className="grid grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-[#FF6B6B]/20 hover:border-[#FF6B6B] transition-all">
            <div className="bg-[#FF6B6B] w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] text-center mb-2">Personalized Learning</h3>
            <p className="text-base text-gray-600 text-center">Tailored paths for each student's needs</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-[#4ECDC4]/20 hover:border-[#4ECDC4] transition-all">
            <div className="bg-[#4ECDC4] w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] text-center mb-2">Safe Environment</h3>
            <p className="text-base text-gray-600 text-center">Secure online platform for peace of mind</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-[#FFE66D]/20 hover:border-[#FFE66D] transition-all">
            <div className="bg-[#FFE66D] w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto">
              <DollarSign className="w-8 h-8 text-[#2C3E50]" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] text-center mb-2">Affordable Tuition</h3>
            <p className="text-base text-gray-600 text-center">Quality education at competitive prices</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-[#FF6B6B]/20 hover:border-[#FF6B6B] transition-all">
            <div className="bg-[#4ECDC4] w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] text-center mb-2">Progress Tracking</h3>
            <p className="text-base text-gray-600 text-center">Parent dashboard with real-time updates</p>
          </div>
        </div>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Why Choose ALLSMILES",
  order: 2,
  enterAnimation: { type: "slideLeft", duration: 600 },
})(WhyChooseSlideComponent);

export default WhyChooseSlideComponent;