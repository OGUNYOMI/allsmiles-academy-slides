import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const SuccessStoriesSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 600 },
        group: 0,
      })
      .addElement("content", contentRef, {
        enter: { type: "fadeInUp", duration: 800, delay: 300 },
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
    <section className="flex h-full flex-col px-16 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 ref={titleRef} className="text-6xl font-bold text-center mb-10 text-gray-900">
        Our Success Stories
      </h1>

      <div ref={contentRef} className="grid grid-cols-2 gap-8 flex-1">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🎓</div>
              <div>
                <h3 className="text-3xl font-bold text-blue-600">95% Success Rate</h3>
                <p className="text-lg text-gray-600">in external exams (WAEC, NECO, JAMB, IGCSE)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-2xl font-bold mb-3 text-purple-600">Parent Testimonial</h3>
            <p className="text-lg text-gray-700 italic leading-relaxed">
              "ALLSMILES Academy transformed my daughter's learning experience. The flexible schedule and personalized attention helped her excel in her IGCSE exams!"
            </p>
            <p className="text-base text-gray-600 mt-3">- Mrs. Johnson, UK</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-2xl font-bold mb-3 text-blue-600">Global Community</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Students from 13+ countries learning together, sharing experiences, and achieving their academic goals
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border-4 border-blue-200">
            <img
              src="/images/StudentSuccess.jpg"
              alt="Student Success"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 shadow-lg text-white">
            <h3 className="text-3xl font-bold mb-3">Join Our Success Story</h3>
            <p className="text-xl leading-relaxed">
              Be part of a thriving community of learners achieving excellence through personalized online education
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