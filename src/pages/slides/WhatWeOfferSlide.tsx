import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const WhatWeOfferSlideComponent: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const slideAnimation = useSlideAnimation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    slideAnimation
      .addElement("title", titleRef, {
        enter: { type: "fadeInDown", duration: 600 },
        group: 0,
      })
      .addElement("grid", gridRef, {
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

  const features = [
    {
      icon: "📚",
      title: "Comprehensive K-12 Curriculum",
      description: "Complete primary and secondary education delivered online with expert guidance",
    },
    {
      icon: "⏰",
      title: "Flexible Learning Schedules",
      description: "Classes that fit your family's timetable, no matter your timezone",
    },
    {
      icon: "👨‍🏫",
      title: "Certified Expert Teachers",
      description: "Friendly, experienced educators who make learning enjoyable and effective",
    },
    {
      icon: "💻",
      title: "Interactive Online Platform",
      description: "Engaging digital tools and resources for an immersive learning experience",
    },
  ];

  return (
    <section className="flex h-full flex-col px-16 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 ref={titleRef} className="text-6xl font-bold text-center mb-12 text-gray-900">
        What We Offer
      </h1>

      <div ref={gridRef} className="grid grid-cols-2 gap-8 flex-1">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300"
          >
            <div className="text-6xl mb-4">{feature.icon}</div>
            <h3 className="text-3xl font-bold mb-3 text-blue-600">{feature.title}</h3>
            <p className="text-xl text-gray-700 leading-relaxed">{feature.description}</p>
          </div>
        ))}
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