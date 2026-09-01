import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-3xl mx-auto bg-rose-50 border border-rose-200 rounded-3xl mt-10 space-y-4 font-sans text-xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <span>⚠️ Terjadi Error pada Komponen React</span>
          </div>
          <p className="text-slate-700 font-mono font-bold bg-white p-3 rounded-xl border border-rose-100">
            {this.state.error?.toString()}
          </p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            type="button"
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-700"
          >
            Bersihkan Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}