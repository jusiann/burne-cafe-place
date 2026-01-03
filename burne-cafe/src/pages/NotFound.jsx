import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="
                min-h-screen 
                bg-[#faf7f2] 
                text-[#2B1E17]
                overflow-x-hidden
                flex
                items-center
                justify-center
        ">
            {/* 404 CONTENT */}
            <div className="relative z-10 text-center px-8">
                <h1 className="
                        text-8xl 
                        md:text-9xl 
                        font-heading 
                        font-bold 
                        text-[#C46A2B]
                        mb-4
                        tracking-tight
                    ">
                    404
                </h1>
                <p className="
                        text-2xl 
                        md:text-3xl 
                        text-[#8B7E75]
                        mb-8
                    ">
                    Sayfa Bulunamadı
                </p>

                <Link
                    to="/"
                    className="
                        px-8
                        py-4
                        rounded-lg
                        bg-[#C46A2B]
                        text-white
                        font-semibold
                        text-lg
                        hover:bg-[#A85A24]
                        hover:scale-[1.02]
                        active:scale-95
                        shadow-lg
                        shadow-[#C46A2B]/30
                        transition-all
                        duration-300
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                    "
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}

export default NotFound;