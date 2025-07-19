'use client';

import { useState } from 'react';

/**
 * 最終的なダメージを計算する関数
 * @param baseDamage 元のダメージ (耐性0の場合)
 * @param resist 敵の耐性 (例: 0.85 は 85%)
 * @param ignore 耐性無視 (例: 0.50 は 50%)
 * @returns 最終的なダメージ
 */
const calculateFinalDamage = (baseDamage: number, resist: number, ignore: number): number => {
  // 入力値のバリデーション
  if (baseDamage < 0) baseDamage = 0;
  if (resist < 0) resist = 0;
  if (resist >= 1) resist = 0.999; // 1以上は計算上問題が起きるため、上限を設ける
  if (ignore < 0) ignore = 0;
  if (ignore > 1) ignore = 1;

  const constantValue = 14106; // 固定値

  // resistが1に近づくとtempValueが無限大に発散するため、1未満に補正済み
  const tempValue = (resist * constantValue) / (1 - resist);
  const numerator = tempValue * (1 - ignore);
  const denominator = constantValue + numerator;

  // 分母が0になるケースは稀だが、念のためチェック
  if (denominator === 0) {
    return 0;
  }

  const finalDamageMultiplier = 1 - (numerator / denominator);

  return baseDamage * finalDamageMultiplier;
};

export default function DamageCalculatorPage() {
  const [baseDamage, setBaseDamage] = useState("30");
  const [resist, setResist] = useState("0.85");
  const [ignore, setIgnore] = useState("0");
  const [partyIgnore, setPartyIgnore] = useState("0");

  const GIGA = 1_000_000_000;
  const totalIgnore = Math.min(1, parseFloat(ignore) + parseFloat(partyIgnore)); // 合計が100%を超えないように
  const finalDamage = calculateFinalDamage((parseFloat(baseDamage) || 0) * GIGA, parseFloat(resist), totalIgnore);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        ダメージ計算シミュレーター
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 items-start">
        <div>
          <label htmlFor="baseDamage" className="block mb-2 font-medium">
            基準ダメージ (G)
          </label>
          <input
            id="baseDamage"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={baseDamage}
            onChange={(e) => {
              const value = e.target.value;
              const sanitizedValue = value.replace(/[^0-9]/g, '');
              setBaseDamage(sanitizedValue);
            }}
            className="p-2 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          <p className="text-sm text-gray-500 mt-2">
            例: 30Gの場合は 30 を入力
          </p>
        </div>

        <div>
          <label htmlFor="ignore" className="block mb-2 font-medium">
            耐性無視 (Ignore)
          </label>
          <select
            id="ignore"
            value={ignore}
            onChange={(e) => setIgnore(e.target.value)}
            className="p-2 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 h-10"
          >
            <option value="0">0%</option>
            <option value="0.15">15%</option>
            <option value="0.30">30%</option>
            <option value="0.45">45%</option>
            <option value="0.50">50%</option>
          </select>
           <p className="text-sm text-gray-500 mt-2">
            リストから選択してください
          </p>
        </div>

        <div>
          <label htmlFor="resist" className="block mb-2 font-medium">
            敵の耐性 (Resist)
          </label>
          <select
            id="resist"
            value={resist}
            onChange={(e) => setResist(e.target.value)}
            className="p-2 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 h-10"
          >
            <option value="0.34">34% (序列)</option>
            <option value="0.36">36% (在りし日)</option>
            <option value="0.67">67% (討伐)</option>
            <option value="0.85">85% (起源)</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">
            コンテンツを選択してください
          </p>
        </div>

        <div>
          <label htmlFor="partyIgnore" className="block mb-2 font-medium">
            PT時追加耐性無視
          </label>
          <select
            id="partyIgnore"
            value={partyIgnore}
            onChange={(e) => setPartyIgnore(e.target.value)}
            className="p-2 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 h-10"
          >
            <option value="0">0% (なし)</option>
            <option value="0.08">8% (シャックル)</option>
            <option value="0.10">10% (メリル)</option>
            <option value="0.12">12% (アスカ)</option>
            <option value="0.22">22% (剛毅)</option>
            <option value="0.30">30% (MAX)</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">
            PTメンバー等の効果を選択
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          計算結果
        </h2>
        <div className="text-xl">
          <p>
            最終ダメージ:
            <strong className="ml-4 text-2xl font-bold">
              {(finalDamage / GIGA).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} G
            </strong>
          </p>
        </div>
      </div>
    </main>
  );
}