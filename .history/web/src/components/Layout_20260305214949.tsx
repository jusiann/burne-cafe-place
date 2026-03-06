import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: ReactNode;
    showFooter?: boolean;
    showNavbar?: boolean;
}

function Layout({ children, showFooter = true, showNavbar = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">

            {/* NAVBAR */}
            {showNavbar && <Navbar />}

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-20 pb-2">
                {children}
            </main>

            {/* FOOTER */}
            {showFooter && <Footer />}
        </div>
    );
}

export default Layout;
