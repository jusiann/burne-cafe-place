function LoadingSpinner({fullScreen = false}) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full border-4 border-[#C46A2B]/20 border-t-[#C46A2B] animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center p-4">
            <div className="w-8 h-8 rounded-full border-4 border-[#C46A2B]/20 border-t-[#C46A2B] animate-spin"></div>
        </div>
    );
}

export default LoadingSpinner;
