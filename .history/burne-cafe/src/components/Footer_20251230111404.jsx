function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto">
            {/* GRADIENT TOP BORDER */}
            <div className="h-px bg-gradient-to-r from-[#E8E0D5]/30 via-[#C46A2B]/40 to-[#E8E0D5]/30" />
            
            <div className="bg-[#F5F0EB] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
                        
                        {/* LOGO */}
                        <div className="text-lg font-bold text-[#2B1E17]">
                            BURNÉ <span className="text-[#C46A2B]">Coffee</span>
                        </div>
                        
                        {/* COPYRIGHT */}
                        <p className="text-[#6B5E55] text-sm">
                            © {currentYear} Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;