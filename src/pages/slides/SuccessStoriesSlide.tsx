import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";
import { Trophy, Star, Heart, TrendingUp } from "lucide-react";

const SuccessStoriesSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

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
      .addElement("left", leftRef, {
        enter: { type: "fadeInLeft", duration: 800, delay: 200 },
        group: 1,
      })
      .addElement("right", rightRef, {
        enter: { type: "fadeInRight", duration: 800, delay: 400 },
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
      <h1 ref={titleRef} className="text-5xl font-bold text-[#2C3E50] mb-8 text-center">
        Our Students Achieve Amazing Results!
      </h1>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div ref={leftRef} className="flex flex-col gap-6">
          {/* Hero Image */}
          <div className="flex-1 min-h-0">
            <img
              src="https://mgx-backend-cdn.metadl.com/generate/images/70522/2026-01-03/1ed4887a-668c-4e8c-b67a-9ac4ef354fa1.png"
              alt="Student celebrating success"
              className="w-full h-full object-cover rounded-2xl shadow-xl"
            />
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-[#4ECDC4] to-[#4ECDC4]/80 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-4 mb-3">
              <TrendingUp className="w-10 h-10" />
              <h3 className="text-3xl font-bold">95% Success Rate</h3>
            </div>
            <p className="text-lg">Students show significant academic improvement within the first semester</p>
          </div>
        </div>

        {/* Right Column */}
        <div ref={rightRef} className="flex flex-col justify-center gap-6">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#FF6B6B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFE66D] p-3 rounded-full">
                <Star className="w-6 h-6 text-[#2C3E50]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Parent Testimonials</h3>
            </div>
            <p className="text-lg text-gray-700 italic mb-3">
              "My daughter's confidence has soared! The teachers are incredibly supportive and the curriculum is engaging."
            </p>
            <p className="text-base font-semibold text-[#FF6B6B]">- Sarah M., Parent of 5th Grader</p>
          </div>

          {/* Achievement Card */}
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF6B6B]/80 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-4 mb-3">
              <Trophy className="w-10 h-10" />
              <h3 className="text-2xl font-bold">Academic Excellence</h3>
            </div>
            <p className="text-lg">Students consistently score above national averages in standardized tests</p>
          </div>

          {/* Community Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#4ECDC4]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#4ECDC4] p-3 rounded-full">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Supportive Community</h3>
            </div>
            <p className="text-lg text-gray-700">
              Join a thriving community of families who value quality education and student well-being
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Success Stories",
  order: 3,
  enterAnimation: { type: "slideLeft", duration: 600 },
})(SuccessStoriesSlideComponent);

export default SuccessStoriesSlideComponent;