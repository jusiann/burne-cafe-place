function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 mt-auto bg-[#F5F0EB] border-t border-[#E8E0D5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">

                {/* LOGO */}
                <div className="text-xl font-bold text-[#2B1E17] font-heading">
                    BURNÉ <span className="text-[#C46A2B]">Coffee</span>
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