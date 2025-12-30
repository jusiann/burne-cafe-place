import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({
    children,
    showFooter = true,
    showNavbar = true
}) {
    return (
        <div className="
            min-h-screen 
            bg-background 
            text-foreground 
            overflow-x-hidden
            flex
            flex-col
        ">
            {/* NAVBAR */}
            {showNavbar && <Navbar />}

            {/* MAIN CONTENT */}
            <main className="flex-1">
                {children}
            </main>

            {/* FOOTER */}
            {showFooter && <Footer />}
        </div>
    );
}

export default Layout;
