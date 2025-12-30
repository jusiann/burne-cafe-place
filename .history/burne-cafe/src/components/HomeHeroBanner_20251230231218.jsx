import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function HomeHeroBanner() {
    return (
        <section className="relative overflow-hidden">
            {/* BACKGROUND GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B1E17] via-[#3D2B20] to-[#2B1E17]" />

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C46A2B]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C46A2B]/10 rounded-full blur-2xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* TEXT CONTENT */}
                    <div className="text-center md:text-left">
                        {/* TAGLINE */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C46A2B]/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-[#C46A2B] rounded-full" />
                            <span className="text-[#C46A2B] text-sm font-medium tracking-wide">
                                Özenle Kavrulmuş
                            </span>
                        </div>

                        {/* MAIN HEADING */}
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                            Her Yudumda{' '}
                            <span className="text-[#C46A2B]">Ustalık</span>
                        </h1>

                        {/* DESCRIPTION */}
                        <p className="text-white/70 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0">
                            BURNÉ Coffee, kahve çekirdeğinin özenle kavurulma sürecini
                            yansıtan, artisan ve premium bir kahve deneyimi sunar.
                        </p>

                        {/* CTA BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                to="/menu"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C46A2B] hover:bg-[#A85A24] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#C46A2B]/30"
                            >
                                Menüyü Keşfet
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/menu?category=espresso"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 hover:border-[#C46A2B] text-white hover:text-[#C46A2B] font-medium rounded-xl transition-all duration-300"
                            >
                                Espresso Çeşitleri
                            </Link>
                        </div>

                        {/* STATS */}
                        <div className="flex items-center justify-center md:justify-start gap-8 mt-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#C46A2B]">20+</div>
                                <div className="text-white/60 text-sm">Kahve Çeşidi</div>
                            </div>
                            <div className="w-px h-12 bg-white/20" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#C46A2B]">100%</div>
                                <div className="text-white/60 text-sm">Arabica</div>
                            </div>
                            <div className="w-px h-12 bg-white/20" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#C46A2B]">4.9</div>
                                <div className="text-white/60 text-sm">Puan</div>
                            </div>
                        </div>
                    </div>

                    {/* IMAGE SIDE */}
                    <div className="relative hidden md:block">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            {/* GLOWING CIRCLE */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C46A2B]/30 to-transparent rounded-full" />

                            {/* COFFEE CUP ILLUSTRATION */}
                            <div className="absolute inset-8 bg-gradient-to-br from-[#C46A2B]/20 to-[#2B1E17] rounded-full flex items-center justify-center overflow-hidden border border-[#C46A2B]/20">
                                <div className="text-center p-8">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5D4037] to-[#3E2723] border-4 border-[#8D6E63] flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4E342E] to-[#3E2723] border-2 border-[#6D4C41]" />
                                    </div>
                                    <p className="text-white/50 text-sm font-medium tracking-wider uppercase">
                                        Premium Blend
                                    </p>
                                </div>
                            </div>

                            {/* FLOATING BADGES */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="text-center">
                                    <div className="text-white font-bold">Taze</div>
                                    <div className="text-white/60 text-xs">Günlük Kavrum</div>
                                </div>
                            </div>

                            <div className="absolute bottom-8 left-0 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="text-center">
                                    <div className="text-white font-bold">15 dk</div>
                                    <div className="text-white/60 text-xs">Hazırlık</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeHeroBanner;
