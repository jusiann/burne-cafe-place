import { useState, useEffect, useCallback } from 'react';

// SLIDE DATA
const slides = [
    {
        id: 1,
        title: 'Özenle Kavrulmuş',
        subtitle: 'Her Yudumda Ustalık',
        description: 'BURNÉ Coffee, kahve çekirdeğinin özenle kavurulma sürecini yansıtan premium bir deneyim sunar.',
        image: '/images/slides/slide-1.jpg',
        gradient: 'from-[#2B1E17]/90 via-[#2B1E17]/70 to-transparent'
    },
    {
        id: 2,
        title: 'Artisan Demleme',
        subtitle: 'El Yapımı Lezzetler',
        description: 'Uzman baristalarımız tarafından özenle hazırlanan, her fincan bir sanat eseri.',
        image: '/images/slides/slide-2.jpg',
        gradient: 'from-[#2B1E17]/90 via-[#2B1E17]/70 to-transparent'
    },
    {
        id: 3,
        title: 'Premium Atmosfer',
        subtitle: 'Kahve Kültürü',
        description: 'Modern ve sıcak ortamımızda kahvenin tadını çıkarın, anın keyfini yaşayın.',
        image: '/images/slides/slide-3.jpg',
        gradient: 'from-[#2B1E17]/90 via-[#2B1E17]/70 to-transparent'
    }
];

function HomeHeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // NEXT SLIDE HANDLER
    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 700);
    }, [isTransitioning]);

    // GO TO SPECIFIC SLIDE
    const goToSlide = (index) => {
        if (isTransitioning || index === currentSlide) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 700);
    };

    // AUTO SLIDE EFFECT
    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <section className="relative h-[70vh] min-h-[400px] max-h-[600px] overflow-hidden bg-[#2B1E17]">

            {/* SLIDES */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`
                        absolute 
                        inset-0 
                        transition-all 
                        duration-700 
                        ease-in-out
                        ${index === currentSlide
                            ? 'opacity-100 scale-100 z-10'
                            : 'opacity-0 scale-105 z-0'
                        }
                    `}
                >
                    {/* BACKGROUND IMAGE */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${slide.image})`,
                            backgroundColor: '#3E2723'
                        }}
                    >
                        {/* FALLBACK GRADIENT PATTERN */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#4E342E]" />

                        {/* DECORATIVE COFFEE PATTERN */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-[#C46A2B] rounded-full" />
                            <div className="absolute top-1/3 right-1/4 w-48 h-48 border border-[#C46A2B] rounded-full" />
                            <div className="absolute bottom-1/4 left-1/3 w-32 h-32 border border-[#C46A2B] rounded-full" />
                        </div>
                    </div>

                    {/* GRADIENT OVERLAYS */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E17]/60 to-transparent" />

                    {/* SLIDE CONTENT */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-xl overflow-hidden">

                            {/* TAGLINE */}
                            <div
                                className={`
                                    inline-flex 
                                    items-center 
                                    gap-2 
                                    px-3 
                                    py-1.5 
                                    bg-[#C46A2B]/20 
                                    backdrop-blur-sm 
                                    rounded-full 
                                    mb-4 
                                    border 
                                    border-[#C46A2B]/30
                                    transition-all 
                                    duration-700 
                                    ease-out
                                    ${index === currentSlide
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 translate-x-12'
                                    }
                                `}
                                style={{ transitionDelay: index === currentSlide ? '100ms' : '0ms' }}
                            >
                                <span className="w-1.5 h-1.5 bg-[#C46A2B] rounded-full animate-pulse" />
                                <span className="text-[#C46A2B] text-xs font-medium tracking-wide">
                                    {slide.title}
                                </span>
                            </div>

                            {/* MAIN HEADING */}
                            <h1
                                className={`
                                    font-heading 
                                    text-3xl 
                                    md:text-4xl 
                                    lg:text-5xl 
                                    text-white 
                                    mb-4 
                                    leading-tight
                                    transition-all 
                                    duration-700 
                                    ease-out
                                    ${index === currentSlide
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 translate-x-16'
                                    }
                                `}
                                style={{ transitionDelay: index === currentSlide ? '200ms' : '0ms' }}
                            >
                                {slide.subtitle.split(' ').map((word, i) => (
                                    <span key={i}>
                                        {i === slide.subtitle.split(' ').length - 1 ? (
                                            <span className="text-[#C46A2B]">{word}</span>
                                        ) : (
                                            <span>{word} </span>
                                        )}
                                    </span>
                                ))}
                            </h1>

                            {/* DESCRIPTION */}
                            <p
                                className={`
                                    text-white/70 
                                    text-base 
                                    md:text-lg 
                                    max-w-md
                                    transition-all 
                                    duration-700 
                                    ease-out
                                    ${index === currentSlide
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 translate-x-20'
                                    }
                                `}
                                style={{ transitionDelay: index === currentSlide ? '300ms' : '0ms' }}
                            >
                                {slide.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {/* SLIDE INDICATORS */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`
                            transition-all 
                            duration-300 
                            rounded-full
                            ${index === currentSlide
                                ? 'w-8 h-2 bg-[#C46A2B]'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                            }
                        `}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

export default HomeHeroSlider;
