export default function AboutPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">このアプリについて</h1>
      <div className="prose prose-invert max-w-none">
        <p>
          Task
          Trackerは、日々の繰り返しタスクを管理し、あなたの目標達成をサポートするアプリケーションです。<br>
          現在、ログインなしで全ての基本機能が動作する、クライアントサイド完結型です。
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">機能追加予定表（ロードマップ）</h2>
        <ul>
          <li>ログイン機能 / データ同期機能 (Supabase連携)</li>
          <li>カテゴリ管理機能</li>
          <li>通知機能の強化</li>
          <li>テーマ・デザインのカスタマイズ機能</li>
          <li>Discord連携</li>
        </ul>
      </div>
    </div>
  );
}
