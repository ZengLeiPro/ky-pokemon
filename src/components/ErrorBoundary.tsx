import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  declare state: State;
  declare props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            <p className="text-cyan-400 font-bold text-lg tracking-wide">
              发生了一些问题
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded transition-colors tracking-wider"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
