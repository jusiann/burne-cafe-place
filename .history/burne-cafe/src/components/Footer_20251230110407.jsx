function Footer() {
    return (
        <footer className="mt-auto">
            {/* Gradient Border */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#E8E0D5] to-transparent" />
            
            <div className="bg-[#F5F0EB] py-6">
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
            </div>
        </footer>
    )
}

export default Footer;