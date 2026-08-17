import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Controls, { ALL_TAB } from "./components/Controls.jsx";
import TotalSummaryCard from "./components/TotalSummaryCard.jsx";
import ItemCard from "./components/ItemCard.jsx";
import OverviewChart from "./components/OverviewChart.jsx";
import BrandChart from "./components/BrandChart.jsx";
import { LoadingState, EmptyState, ErrorState } from "./components/States.jsx";
import { useSheetData } from "./lib/useSheetData.js";
import { sum } from "./lib/format.js";

const PAGE_SIZE = 15;
const SCROLL_THRESHOLD = 500;

export default function App() {
  const { loading, error, brandData, groupedItems, overview, reload } = useSheetData();

  const [selectedBrand, setSelectedBrand] = useState(ALL_TAB);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [sortKey, setSortKey] = useState("판매량");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearchText(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 쿼리스트링으로 딥링크 진입 지원 (?item=... 등)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || params.get("search") || params.get("keyword") || params.get("item");
    if (q) {
      setSearchInput(decodeURIComponent(q));
      setSelectedBrand(ALL_TAB);
    }
  }, []);

  // 브랜드/검색/필터/정렬이 바뀌면 페이지네이션 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedBrand, searchText, category, sortKey]);

  // 무한 스크롤
  useEffect(() => {
    const onScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.body.offsetHeight - SCROLL_THRESHOLD
      ) {
        setVisibleCount((v) => v + PAGE_SIZE);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isGroupedView = selectedBrand === ALL_TAB || searchText.length > 0;

  const matchesCategory = (cat) => {
    if (category === "all") return true;
    if (category === "전용") return (cat || "").includes("전용");
    return !(cat || "").includes("전용"); // 범용
  };

  const matchesSearch = (item) => {
    if (!searchText) return true;
    const name = (item.itemName || "").toLowerCase();
    const code = (item.itemCode || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();
    return name.includes(searchText) || code.includes(searchText) || cat.includes(searchText);
  };

  const results = useMemo(() => {
    if (loading || error) return { type: "item", data: [] };

    if (isGroupedView) {
      const filtered = groupedItems.filter(
        (g) => matchesCategory(g.category) && matchesSearch(g)
      );
      filtered.sort((a, b) => {
        const key = sortKey === "판매량" ? "sales" : "revenue";
        return sum(b.totalSummary[key]) - sum(a.totalSummary[key]);
      });
      return { type: "item", data: filtered };
    }

    const items = brandData[selectedBrand]?.items || [];
    const filtered = items.filter((it) => matchesCategory(it.category) && matchesSearch(it));
    filtered.sort((a, b) => {
      const key = sortKey === "판매량" ? "sales" : "revenue";
      return sum(b[key]) - sum(a[key]);
    });
    return { type: "brand", data: filtered };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, isGroupedView, groupedItems, brandData, selectedBrand, category, sortKey, searchText]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const visibleData = results.data.slice(0, visibleCount);

  return (
    <div className="app-container">
      <Header onRefresh={handleRefresh} refreshing={refreshing} />

      <SearchBar value={searchInput} onChange={setSearchInput} />

      <div className="overall-summary-container">
        <Controls
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          category={category}
          onSelectCategory={setCategory}
          sortKey={sortKey}
          onSelectSort={setSortKey}
        />

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={handleRefresh} />}

        {!loading && !error && (
          <>
            {selectedBrand === ALL_TAB && !searchText && <OverviewChart overview={overview} />}
            {selectedBrand !== ALL_TAB && !searchText && (
              <BrandChart brand={selectedBrand} totals={brandData[selectedBrand]?.totals} />
            )}

            {visibleData.length === 0 ? (
              <EmptyState />
            ) : results.type === "item" ? (
              <div className="results-container">
                {visibleData.map((group) => (
                  <TotalSummaryCard key={group.itemCode} group={group} />
                ))}
              </div>
            ) : (
              <div className="brand-results-grid standalone">
                {visibleData.map((item) => (
                  <ItemCard
                    key={`${selectedBrand}-${item.itemCode}`}
                    item={item}
                    brand={selectedBrand}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
