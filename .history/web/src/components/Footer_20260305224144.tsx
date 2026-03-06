import { Phone, Instagram } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 mt-auto bg-[#F5F0EB] border-t border-[#E8E0D5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">

                {/* LOGO */}
                <div className="text-xl font-bold text-[#2B1E17] font-heading">
                    BURNÉ <span className="text-[#C46A2B]">Coffee</span>
                </div>

                {/* CONTACT & SOCIAL */}
                <div className="flex flex-col items-center gap-1">
                    {/* PHONE */}
                    <div className="flex items-center gap-1.5 text-[#6B5E55] text-sm">
                        <Phone className="w-4 h-4" />
                        <span>444 0 451</span>
                    </div>

                    {/* INSTAGRAM */}
                    <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#6B5E55] hover:text-[#C46A2B] text-sm transition-colors"
                        aria-label="Instagram"
                    >
                        <Instagram className="w-4 h-4" />
                        <span>burnecoffee</span>
                    </a>
                </div>

                {/* COPYRIGHT */}
                <p className="text-[#6B5E55] text-sm">
                    © {currentYear} Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
