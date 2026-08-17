import { SPREADSHEET_ID } from "../config.js";

export function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>데이터를 불러오는 중입니다...</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="empty-state">
      <p>해당하는 품목 데이터가 없습니다.</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const isAuthError = message === "구글 시트 접근 권한이 없습니다.";
  return (
    <div className="error-state">
      <h3>{isAuthError ? "구글 시트 접근 권한 오류" : "오류 발생"}</h3>
      <p>{message}</p>
      {isAuthError && (
        <div className="auth-error-help">
          <p className="auth-error-help-title">[해결 방법]</p>
          <ol>
            <li>구글 시트({SPREADSHEET_ID.slice(0, 8)}...)를 엽니다.</li>
            <li>우측 상단 [공유] 버튼을 클릭합니다.</li>
            <li>'일반 액세스'를 '링크가 있는 모든 사용자'로 변경합니다.</li>
            <li>권한을 '뷰어'로 설정한 뒤 완료를 누릅니다.</li>
            <li>이후 현재 페이지를 새로고침 해주세요.</li>
          </ol>
        </div>
      )}
      <button className="reload-btn" onClick={onRetry}>
        새로고침
      </button>
    </div>
  );
}
