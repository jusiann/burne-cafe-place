import {Component} from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#F5F1EB] px-4">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-[#E8E0D5] max-w-md w-full">
                        <h1 className="text-2xl font-bold text-[#2B1E17] mb-2">Beklenmeyen Bir Hata Oluştu</h1>
                        <p className="text-[#8B7E75] mb-6">Sayfayı yenilemeyi deneyebilir veya daha sonra tekrar dönebilirsiniz.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-[#C46A2B] text-white rounded-xl hover:bg-[#A85A24] transition-colors font-medium"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
