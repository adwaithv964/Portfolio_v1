import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../contexts/ContentContext';

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
  { 
    title: 'Frontend Engineering', 
    desc: 'Crafting responsive and interactive user interfaces using React, JavaScript, HTML5, CSS3, and Tailwind CSS.', 
    tag: 'UI / INTERACTION',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3'] 
  },
  { 
    title: 'Backend & Databases', 
    desc: 'Building secure REST APIs, authentication flows, and high-performance database architectures with Node.js, MongoDB, and PostgreSQL.', 
    tag: 'ARCHITECTURE',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Firebase'] 
  },
  { 
    title: 'Cybersecurity', 
    desc: 'Engineering security platforms with malware analysis, phishing detection, breach monitoring, threat intelligence APIs, and AES-256 encryption.', 
    tag: 'SECURITY',
    skills: ['ClamAV', 'VirusTotal API', 'HIBP', 'AES-256', 'Firebase Auth'] 
  },
  { 
    title: 'AI & Audio Engineering', 
    desc: 'Integrating LLM cybersecurity assistants, NLP workflows, and Web Audio API engines with crossfade, EQ, and waveform visualization.', 
    tag: 'AI & AUDIO',
    skills: ['Python', 'NLP', 'LLMs', 'Web Audio API', 'Zustand'] 
  },
  { 
    title: 'Cloud & DevOps', 
    desc: 'Deploying and scaling production applications using Docker, GitHub Actions CI/CD, and cloud hosting services.', 
    tag: 'INFRASTRUCTURE',
    skills: ['Docker', 'GitHub Actions', 'CI/CD', 'Render', 'Docker Hub'] 
  },
  { 
    title: 'Tools & Ecosystem', 
    desc: 'Equipped with industry-grade instruments for version control, state management, productivity, and workflow automation.', 
    tag: 'PRODUCTIVITY',
    skills: ['Git', 'Zustand', 'Sass', 'VS Code', 'Postman'] 
  },
];

const Skills = () => {
  const { content } = useContent();
  const skillCategories = content.skills;
  const sectionRef   = useRef(null);
  const carouselRef  = useRef(null); // controls visibility to prevent flash on refresh
  const cardsRef     = useRef([]);
  const bgRefs       = useRef([]);
  const textRefs     = useRef([]);

  const handleScroll = (e) => {
    if (window.innerWidth >= 769) return;
    const container = e.target;
    const center = container.scrollLeft + container.offsetWidth / 2;
    
    let activeIdx = 0;
    let minDiff = Infinity;
    
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const diff = Math.abs(cardCenter - center);
      if (diff < minDiff) {
        minDiff = diff;
        activeIdx = i;
      }
    });

    cardsRef.current.forEach((card, i) => {
      if (card) {
        gsap.to(card, { scale: i === activeIdx ? 1 : 0.9, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      }
    });

    bgRefs.current.forEach((bg, i) => {
      if (bg) gsap.to(bg, { opacity: i === activeIdx ? 1 : 0, duration: 0.4, overwrite: "auto" });
    });
    
    textRefs.current.forEach((txt, i) => {
      if (txt) gsap.to(txt, { opacity: i === activeIdx ? 1 : 0, duration: 0.4, overwrite: "auto" });
    });
  };

  useLayoutEffect(() => {
    // Data loads asynchronously from the API — don't run until we have cards
    if (!skillCategories || skillCategories.length === 0) return;

    // DO NOT clear ref arrays here — React has already populated them from the render.
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        let revealed = false;
        const updateCards = (p) => {
          cardsRef.current.forEach((card, i) => {
            if (!card) return;
            const offset = i - p;
            
            const radius = 1800; 
            const angleSpread = 18; 
            
            const angle = offset * angleSpread;
            const rad = angle * Math.PI / 180;
            
            const x = Math.sin(rad) * radius;
            const y = radius - (Math.cos(rad) * radius); 
            const z = -Math.abs(offset) * 50; 
            
            const scale = Math.max(0.4, 1 - Math.abs(offset) * 0.15);
            const rotateZ = angle; 
            
            const opacity = Math.max(0.1, 1 - Math.abs(offset) * 0.3);
            const zIndex = Math.round(100 - Math.abs(offset) * 10);

            gsap.set(card, {
              x: x,
              y: y,
              z: z,
              scale: scale,
              rotationZ: rotateZ,
              rotationY: 0, 
              opacity: opacity,
              zIndex: zIndex,
            });
          });

          bgRefs.current.forEach((bg, i) => {
              if (!bg) return;
              const itemOpacity = Math.max(0, 1 - Math.abs(i - p));
              gsap.set(bg, { opacity: itemOpacity });
              
              if (textRefs.current[i]) {
                  gsap.set(textRefs.current[i], { opacity: itemOpacity });
              }
          });

          // Reveal the carousel AFTER the first positioning pass — prevents flash
          if (!revealed && carouselRef.current) {
            carouselRef.current.style.visibility = 'visible';
            revealed = true;
          }
        };

        updateCards(0);

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=500%", 
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress * (skillCategories.length - 1);
            updateCards(p);
          }
        });
      });

      mm.add("(max-width: 768px)", () => {
        cardsRef.current.forEach((card, i) => {
           if (card) {
             gsap.set(card, { clearProps: "x,y,z,rotation,scale,opacity,position" });
             gsap.set(card, { scale: i === 0 ? 1 : 0.9 });
           }
        });
        
        bgRefs.current.forEach((bg, i) => {
           if (bg) gsap.set(bg, { clearProps: "all", opacity: i === 0 ? 1 : 0 });
        });
        
        textRefs.current.forEach((txt, i) => {
           if (txt) gsap.set(txt, { clearProps: "all", opacity: i === 0 ? 1 : 0 });
        });

        // Reveal carousel after mobile GSAP init too
        if (carouselRef.current) carouselRef.current.style.visibility = 'visible';
      });

    }, sectionRef);

    // Recalculate scroll positions after content populates the page layout
    ScrollTrigger.refresh();

    return () => ctx.revert();
  // Re-run when content data arrives from the API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillCategories?.length]);

  return (
    <section 
      id="skills"
      ref={sectionRef} 
      className="relative w-full min-h-screen md:h-screen bg-[#0b0b0b] text-white overflow-hidden flex items-center justify-center md:[perspective:1000px] select-none"
    >
      {/* Dynamic Netflix Dark Background Vignettes */}
      {skillCategories.map((_, i) => (
        <div 
          key={i}
          ref={el => bgRefs.current[i] = el}
          className="absolute inset-0 z-0 pointer-events-none opacity-0 bg-gradient-to-tr from-black via-[#140203] to-black"
        />
      ))}

      {/* Massive Background Typography (Netflix Red & White Outline) */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        {skillCategories.map((_, i) => (
          <h1 
            key={`text-${i}`}
            ref={el => textRefs.current[i] = el}
            className="absolute text-[22vw] md:text-[18vw] font-black uppercase text-transparent leading-none tracking-tighter mix-blend-overlay"
            style={{ 
               WebkitTextStroke: `2px ${i % 2 === 0 ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.15)'}`,
               opacity: 0 
            }}
          >
            SKILLS
          </h1>
        ))}
      </div>

      {/* Carousel Container — starts hidden, revealed after GSAP positions cards (prevents refresh flash) */}
      <div 
        ref={carouselRef}
        style={{ visibility: 'hidden' }}
        className="relative w-full h-full flex md:items-center md:justify-center z-10 md:[transform-style:preserve-3d] overflow-x-auto overflow-y-hidden md:overflow-visible snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center px-[10vw] md:px-0 gap-4 md:gap-0 touch-pan-x"
        onScroll={handleScroll}
      >
        {skillCategories.map((category, i) => (
          <div 
            key={i}
            ref={el => cardsRef.current[i] = el}
            className="md:absolute relative shrink-0 snap-center w-[88vw] sm:w-[360px] md:w-[440px] h-auto min-h-[400px] md:h-[540px] rounded-[24px] md:rounded-[32px] p-6 md:p-10 bg-[#141414]/95 backdrop-blur-2xl border border-white/15 flex flex-col justify-between overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.9)] hover:border-red-600/80 transition-colors duration-500"
          >
            {/* Inner Red Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
            
            {/* Top Card Metadata */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-500 bg-red-600/10 px-3 py-1 rounded border border-red-600/20">
                {category.tag}
              </span>
              <span className="text-xs font-mono text-white/40">
                [ 0{i + 1} / 06 ]
              </span>
            </div>

            {/* Middle Title & Description */}
            <div className="space-y-4 relative z-10 my-auto">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors duration-300">
                {category.title}
              </h3>
              <p className="text-sm md:text-base text-white/70 font-light leading-relaxed">
                {category.desc}
              </p>
            </div>

            {/* Bottom Skill Badges */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 relative z-10">
              {category.skills.map((skill, sIdx) => (
                <span 
                  key={sIdx}
                  className="text-xs font-mono text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded group-hover:border-red-600/30 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Bottom Glow Accent */}
            <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-red-600 group-hover:shadow-[0_0_15px_#E50914] transition-all" />
          </div>
        ))}
      </div>

    </section>
  );
};

export default Skills;