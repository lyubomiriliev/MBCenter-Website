'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'fade';
};

export function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0,
  from = 'bottom'
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const animations: Record<string, any> = {
      bottom: { y: 60, opacity: 0 },
      top: { y: -60, opacity: 0 },
      left: { x: -60, opacity: 0 },
      right: { x: 60, opacity: 0 },
      fade: { opacity: 0 },
    };

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        ...animations[from],
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [delay, from]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}


