import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-section">
      <div className="search-bar">
        <Search size={18} className="search-bar-icon" />
        <input
          type="text"
          placeholder="제품 코드 또는 품목명을 입력하세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="enter-tag">엔터 입력</span>
      </div>
    </div>
  );
}
