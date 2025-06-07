import React, { useState } from "react";
import "./App.css";

function generateTickets(mode, selections, isTrifecta) {
  const { first, second, third } = selections;
  let results = [];

  const uniqSorted = arr => [...new Set(arr)].sort((a, b) => a - b);

  if (mode === "box") {
    const source = first;
    for (let i = 0; i < source.length; i++) {
      for (let j = i + 1; j < source.length; j++) {
        for (let k = j + 1; k < source.length; k++) {
          const trio = [source[i], source[j], source[k]];
          if (isTrifecta) {
            results.push(...permute(trio).map(p => p.join("-")));
          } else {
            results.push(trio.join("-"));
          }
        }
      }
    }
  } else if (mode === "single") {
    for (const s of second) {
      for (const t of third) {
        const trio = [first[0], s, t];
        if (new Set(trio).size < 3) continue;
        results.push(isTrifecta ? trio.join("-") : uniqSorted(trio).join("-"));
      }
    }
  } else if (mode === "double") {
    for (const t of third) {
      const pair = first;
      for (let i = 0; i < pair.length; i++) {
        for (let j = 0; j < second.length; j++) {
          const trio = [pair[i], second[j], t];
          if (new Set(trio).size < 3) continue;
          results.push(isTrifecta ? trio.join("-") : uniqSorted(trio).join("-"));
        }
      }
    }
  } else if (mode === "formation") {
    for (const a of first) {
      for (const b of second) {
        for (const c of third) {
          const trio = [a, b, c];
          if (new Set(trio).size < 3) continue;
          results.push(isTrifecta ? trio.join("-") : uniqSorted(trio).join("-"));
        }
      }
    }
  }
  return [...new Set(results)];
}

function permute(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permute(rest)) {
      result.push([arr[i], ...p]);
    }
  }
  return result;
}

function App() {
  const [mode, setMode] = useState("single");
  const [isTrifecta, setIsTrifecta] = useState(false);
  const [first, setFirst] = useState([]);
  const [second, setSecond] = useState([]);
  const [third, setThird] = useState([]);
  const [results, setResults] = useState([]);

  const handleCheck = () => {
    const tickets = generateTickets(mode, { first, second, third }, isTrifecta);
    setResults(tickets);
  };

  const handleSelect = (num, setFunc, selected) => {
    setFunc(
      selected.includes(num)
        ? selected.filter(n => n !== num)
        : [...selected, num]
    );
  };

  const renderSelector = (label, numbers, selected, setFunc) => (
    <div className="selector">
      <span>{label}</span>
      <div className="checkbox-group">
        {numbers.map(num => (
          <label key={num}>
            <input
              type="checkbox"
              checked={selected.includes(num)}
              onChange={() => handleSelect(num, setFunc, selected)}
            />
            {num}
          </label>
        ))}
      </div>
    </div>
  );

  const getCount = () => results.length;

  return (
    <div className="app-container">
      <h1>🎫 馬券チェッカー（PAT風UI）</h1>

      <div className="mode-selector">
        <label>券種:</label>
        <button onClick={() => setMode("single")} className={mode === "single" ? "active" : ""}>1頭軸</button>
        <button onClick={() => setMode("double")} className={mode === "double" ? "active" : ""}>2頭軸</button>
        <button onClick={() => setMode("formation")} className={mode === "formation" ? "active" : ""}>フォーメーション</button>
        <button onClick={() => setMode("box")} className={mode === "box" ? "active" : ""}>BOX</button>
        <label>
          <input type="checkbox" checked={isTrifecta} onChange={() => setIsTrifecta(!isTrifecta)} /> 三連単モード
        </label>
      </div>

      {mode === "single" && (
        <>
          {renderSelector("軸馬", [...Array(18)].map((_, i) => i + 1), first, setFirst)}
          {renderSelector("相手1", [...Array(18)].map((_, i) => i + 1), second, setSecond)}
          {renderSelector("相手2", [...Array(18)].map((_, i) => i + 1), third, setThird)}
        </>
      )}
      {mode === "double" && (
        <>
          {renderSelector("軸馬1,2", [...Array(18)].map((_, i) => i + 1), first, setFirst)}
          {renderSelector("相手", [...Array(18)].map((_, i) => i + 1), second, setSecond)}
          {renderSelector("ダミー", [...Array(18)].map((_, i) => i + 1), third, setThird)}
        </>
      )}
      {mode === "formation" && (
        <>
          {renderSelector("1頭目", [...Array(18)].map((_, i) => i + 1), first, setFirst)}
          {renderSelector("2頭目", [...Array(18)].map((_, i) => i + 1), second, setSecond)}
          {renderSelector("3頭目", [...Array(18)].map((_, i) => i + 1), third, setThird)}
        </>
      )}
      {mode === "box" && (
        <>{renderSelector("選択馬", [...Array(18)].map((_, i) => i + 1), first, setFirst)}</>
      )}

      <div className="action-bar">
        <button onClick={handleCheck}>展開して点数を表示</button>
        <p>展開点数：{getCount()} 点</p>
      </div>

      <div>
        <h2>展開後の馬券</h2>
        <ul>
          {results.map((ticket, idx) => (
            <li key={idx}>{ticket}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
