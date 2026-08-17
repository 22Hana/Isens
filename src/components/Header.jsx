import { Menu, RefreshCw } from "lucide-react";

export default function Header({ onRefresh, refreshing }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-btn" aria-label="메뉴">
          <Menu size={18} />
        </button>
        <h1 className="header-title">아이센스F&B 수불 관리센터</h1>
      </div>
      <button className="header-update-btn" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw size={14} className={refreshing ? "spin-icon" : ""} />
        데이터 업데이트
      </button>
    </header>
  );
}
