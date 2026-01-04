import React from "react";
import { useRef, useEffect } from "react";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";
import { useAppStore } from "@/store/useAppStore";
import { RegisterSlide } from "@/decorators/RegisterSlide";

const WhyChooseSlideComponent: React.FC = () => {
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

  const benefits = [
    {
      icon: "🎯",
      title: "Personalized Learning",
      description: "Tailored curriculum and pace adapted to each student's unique needs and learning style",
    },
    {
      icon: "🏠",
      title: "Safe Learning Environment",
      description: "Learn from the comfort and security of home with full parental oversight",
    },
    {
      icon: "💰",
      title: "Affordable Tuition",
      description: "Quality education at competitive prices with flexible payment plans available",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Regular assessments and detailed reports to monitor your child's academic growth",
    },
  ];

  return (
    <section className="flex h-full flex-col px-16 py-12 bg-gradient-to-br from-purple-50 to-blue-50">
      <h1 ref={titleRef} className="text-6xl font-bold text-center mb-12 text-gray-900">
        Why Choose ALLSMILES Academy?
      </h1>

      <div ref={gridRef} className="grid grid-cols-2 gap-8 flex-1">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300"
          >
            <div className="text-6xl mb-4">{benefit.icon}</div>
            <h3 className="text-3xl font-bold mb-3 text-purple-600">{benefit.title}</h3>
            <p className="text-xl text-gray-700 leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

RegisterSlide({
  title: "Why Choose Us",
  order: 2,
  enterAnimation: { type: "slideLeft", duration: 600 },
})(WhyChooseSlideComponent);

export default WhyChooseSlideComponent;