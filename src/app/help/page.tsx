
export default function HelpPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">ヘルプ</h1>
      <div className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-3">基本的な使い方</h2>
        <p>ここにアプリの基本的な使い方を記述します。</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">よくある質問</h2>
        <p>ここにFAQを記述します。</p>
      </div>
    </div>
  );
}
