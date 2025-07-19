"use client";

import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * 最終的なダメージを計算する関数
 * @param baseDamage 元のダメージ (耐性0の場合)
 * @param resist 敵の耐性 (例: 0.85 は 85%)
 * @param ignore 耐性無視 (例: 0.50 は 50%)
 * @returns 最終的なダメージ
 */
const calculateFinalDamage = (
  baseDamage: number,
  resist: number,
  ignore: number
): number => {
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

  const finalDamageMultiplier = 1 - numerator / denominator;

  return baseDamage * finalDamageMultiplier;
};

interface Scenario {
  id: number;
  baseDamage: string;
  ignore: string;
  partyIgnore: string;
  label: string;
}

export default function DamageCalculatorPage() {
  const [baseDamage, setBaseDamage] = useState("30");
  const [resistForDisplay, setResistForDisplay] = useState("0.85"); // 計算結果表示用
  const [ignore, setIgnore] = useState("0");
  const [partyIgnore, setPartyIgnore] = useState("0");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const GIGA = 1_000_000_000;
  const totalIgnoreForDisplay = Math.min(
    1,
    parseFloat(ignore) + parseFloat(partyIgnore)
  );
  const finalDamage = calculateFinalDamage(
    (parseFloat(baseDamage) || 0) * GIGA,
    parseFloat(resistForDisplay),
    totalIgnoreForDisplay
  );

  const specificResistances = useMemo(
    () => [
      { value: 0, label: "0%" },
      { value: 0.34, label: "34% (序列)" },
      { value: 0.36, label: "36% (在りし日)" },
      { value: 0.67, label: "67% (討伐)" },
      { value: 0.85, label: "85% (起源)" },
    ],
    []
  );

  const addScenario = () => {
    const newScenario: Scenario = {
      id:
        scenarios.length > 0 ? Math.max(...scenarios.map((s) => s.id)) + 1 : 1,
      baseDamage,
      ignore,
      partyIgnore,
      label: `基準: ${baseDamage}G, 無視: ${
        parseFloat(ignore) * 100
      }%, PT無視: ${parseFloat(partyIgnore) * 100}%`,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const clearScenarios = () => {
    setScenarios([]);
  };

  const generateColor = (index: number) => {
    const colors = [
      "rgb(75, 192, 192)",
      "rgb(255, 99, 132)",
      "rgb(54, 162, 235)",
      "rgb(255, 206, 86)",
      "rgb(153, 102, 255)",
      "rgb(255, 159, 64)",
      "rgb(201, 203, 207)",
    ];
    return colors[index % colors.length];
  };

  const chartData = useMemo(() => {
    const labels = specificResistances.map((r) => r.label);

    const datasets = scenarios.map((scenario, index) => {
      const totalIgnore = Math.min(
        1,
        parseFloat(scenario.ignore) + parseFloat(scenario.partyIgnore)
      );
      const data = specificResistances.map((r) => {
        const damage = calculateFinalDamage(
          (parseFloat(scenario.baseDamage) || 0) * GIGA,
          r.value,
          totalIgnore
        );
        return damage / GIGA; // G単位に戻す
      });
      const color = generateColor(index);

      return {
        label: scenario.label,
        data,
        borderColor: color,
        backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.5)"),
        tension: 0.1,
        pointRadius: 3,
      };
    });

    return {
      labels,
      datasets,
    };
  }, [scenarios, specificResistances]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "敵の耐性ごとの最終ダメージ比較",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "最終ダメージ (G)",
        },
      },
      x: {
        title: {
          display: true,
          text: "敵の耐性",
        },
      },
    },
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">ダメージ計算シミュレーター</h1>

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
              const sanitizedValue = value.replace(/[^0-9]/g, "");
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
          <label htmlFor="resistForDisplay" className="block mb-2 font-medium">
            敵の耐性 (Resist)
          </label>
          <select
            id="resistForDisplay"
            value={resistForDisplay}
            onChange={(e) => setResistForDisplay(e.target.value)}
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
          <p className="text-sm text-gray-500 mt-2">PTメンバー等の効果を選択</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={addScenario}
          className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
        >
          グラフに追加
        </button>
        <button
          onClick={clearScenarios}
          className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
        >
          グラフをクリア
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">計算結果</h2>
        <div className="text-xl">
          <p>
            最終ダメージ:
            <strong className="ml-4 text-2xl font-bold">
              {(finalDamage / GIGA).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              G
            </strong>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">耐性値ごとのダメージグラフ</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
          {scenarios.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-gray-500">
              グラフに表示する数値を追加してください。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
