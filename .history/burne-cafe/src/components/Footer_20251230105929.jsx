function Footer() {
    return (
        <footer className="bg-[#F5F0EB] border-t border-[#E8E0D5] py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[#2B1E17]">
                        BURNÉ <span className="text-[#C46A2B]">Coffee</span>
                    </div>
                    
                    <p className="text-[#6B5E55] text-sm">
                        © {new Date().getFullYear()} Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;