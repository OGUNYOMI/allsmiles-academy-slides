import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";
import { BookOpen, Clock, Users, Monitor } from "lucide-react";

const WhatWeOfferSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);

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
        enter: { type: "fadeIn", duration: 800, delay: 200 },
        group: 1,
      })
      .addElement("card1", card1Ref, {
        enter: { type: "fadeInLeft", duration: 600, delay: 400 },
        group: 2,
      })
      .addElement("card2", card2Ref, {
        enter: { type: "fadeInLeft", duration: 600, delay: 500 },
        group: 2,
      })
      .addElement("card3", card3Ref, {
        enter: { type: "fadeInLeft", duration: 600, delay: 600 },
        group: 2,
      })
      .addElement("card4", card4Ref, {
        enter: { type: "fadeInLeft", duration: 600, delay: 700 },
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
        What We Offer
      </h1>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-8">
        {/* Left: Image */}
        <div ref={imageRef} className="flex items-center justify-center">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/8d4747f9-12ef-47fd-a8eb-23777145feeb.png"
            alt="Educational materials"
            className="w-full h-full object-cover rounded-2xl shadow-xl"
          />
        </div>

        {/* Right: Features */}
        <div className="flex flex-col justify-center gap-5">
          <div ref={card1Ref} className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF6B6B]/5 p-6 rounded-2xl border-l-4 border-[#FF6B6B]">
            <div className="flex items-start gap-4">
              <div className="bg-[#FF6B6B] p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">Comprehensive K-12 Curriculum</h3>
                <p className="text-lg text-gray-600">Full academic program aligned with national standards</p>
              </div>
            </div>
          </div>

          <div ref={card2Ref} className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#4ECDC4]/5 p-6 rounded-2xl border-l-4 border-[#4ECDC4]">
            <div className="flex items-start gap-4">
              <div className="bg-[#4ECDC4] p-3 rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">Flexible Learning Schedules</h3>
                <p className="text-lg text-gray-600">Learn at your own pace, anytime, anywhere</p>
              </div>
            </div>
          </div>

          <div ref={card3Ref} className="bg-gradient-to-r from-[#FFE66D]/10 to-[#FFE66D]/5 p-6 rounded-2xl border-l-4 border-[#FFE66D]">
            <div className="flex items-start gap-4">
              <div className="bg-[#FFE66D] p-3 rounded-xl">
                <Users className="w-8 h-8 text-[#2C3E50]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">Certified Expert Teachers</h3>
                <p className="text-lg text-gray-600">Experienced educators dedicated to student success</p>
              </div>
            </div>
          </div>

          <div ref={card4Ref} className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#4ECDC4]/5 p-6 rounded-2xl border-l-4 border-[#FF6B6B]">
            <div className="flex items-start gap-4">
              <div className="bg-[#4ECDC4] p-3 rounded-xl">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">Interactive Online Platform</h3>
                <p className="text-lg text-gray-600">Engaging digital learning environment with live classes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "What We Offer",
  order: 1,
  enterAnimation: { type: "slideLeft", duration: 600 },
})(WhatWeOfferSlideComponent);

export default WhatWeOfferSlideComponent;