import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state" style={{ padding: 60 }}>
          <h3>오류가 발생했습니다.</h3>
          <p>화면을 불러오는 중 문제가 발생했습니다. 페이지를 새로고침 해주세요.</p>
          <button className="reload-btn" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
