import React, { useState } from "react";
import "./App.css";

const horseNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
const MAX_SETS = 5;

function App() {
  const [isTrio, setIsTrio] = useState(true);
  const [sets, setSets] = useState([
    { mode: "1頭軸", main1: [], main2: [], partner: [], expanded: [], count: 0 },
  ]);

  const toggleNumber = (num, list, setList) => {
    setList((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const generateCombinations = (set) => {
    let result = [];
    const { mode, main1, main2, partner } = set;
    if (mode === "1頭軸") {
      main1.forEach((m) => {
        for (let i = 0; i < partner.length; i++) {
          for (let j = i + 1; j < partner.length; j++) {
            if (partner[i] !== m && partner[j] !== m) {
              const combo = isTrio
                ? [m, partner[i], partner[j]].sort((a, b) => a - b)
                : [m, partner[i], partner[j]];
              result.push(combo.join("-"));
            }
          }
        }
      });
    } else if (mode === "2頭軸") {
      main1.forEach((m1) => {
        main2.forEach((m2) => {
          if (m1 !== m2) {
            partner.forEach((p) => {
              if (p !== m1 && p !== m2) {
                const combo = isTrio
                  ? [m1, m2, p].sort((a, b) => a - b)
                  : [m1, m2, p];
                result.push(combo.join("-"));
              }
            });
          }
        });
      });
    } else if (mode === "フォーメーション") {
      main1.forEach((m1) => {
        main2.forEach((m2) => {
          partner.forEach((p) => {
            if (m1 !== m2 && m1 !== p && m2 !== p) {
              const combo = isTrio
                ? [m1, m2, p].sort((a, b) => a - b)
                : [m1, m2, p];
              result.push(combo.join("-"));
            }
          });
        });
      });
    } else if (mode === "BOX") {
      for (let i = 0; i < partner.length; i++) {
        for (let j = i + 1; j < partner.length; j++) {
          for (let k = j + 1; k < partner.length; k++) {
            const combo = isTrio
              ? [partner[i], partner[j], partner[k]].sort((a, b) => a - b)
              : [partner[i], partner[j], partner[k]];
            result.push(combo.join("-"));
          }
        }
      }
    }
    return result;
  };

  const updateSet = (index, updatedSet) => {
    const newSets = [...sets];
    const expanded = generateCombinations(updatedSet);
    newSets[index] = {
      ...updatedSet,
      expanded,
      count: expanded.length,
    };
    setSets(newSets);
  };

  const allBets = sets.flatMap((s) => s.expanded);
  const duplicates = allBets.filter((item, idx, arr) => arr.indexOf(item) !== idx);

  return (
    <div className="app-container">
      <h1>馬券チェッカー</h1>
      <label>
        <input
          type="checkbox"
          checked={isTrio}
          onChange={(e) => setIsTrio(e.target.checked)}
        />
        三連複
      </label>
      {sets.map((set, idx) => (
        <div key={idx} className="set-container">
          <h2>セット{String.fromCharCode(65 + idx)}</h2>
          <div className="mode-selector">
            {["1頭軸", "2頭軸", "フォーメーション", "BOX"].map((m) => (
              <button
                key={m}
                className={set.mode === m ? "active" : ""}
                onClick={() =>
                  updateSet(idx, { ...set, mode: m, main1: [], main2: [], partner: [] })
                }
              >
                {m}
              </button>
            ))}
          </div>

          {(set.mode === "1頭軸" || set.mode === "2頭軸") && (
            <div className="selector">
              <strong>軸馬{set.mode === "2頭軸" ? "1" : ""}:</strong>
              <div className="checkbox-group">
                {horseNumbers.map((num) => (
                  <label key={num}>
                    <input
                      type="checkbox"
                      checked={set.main1.includes(num)}
                      onChange={() =>
                        updateSet(idx, {
                          ...set,
                          main1: set.main1.includes(num)
                            ? set.main1.filter((n) => n !== num)
                            : [...set.main1, num],
                        })
                      }
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          )}

          {set.mode === "2頭軸" && (
            <div className="selector">
              <strong>軸馬2:</strong>
              <div className="checkbox-group">
                {horseNumbers.map((num) => (
                  <label key={num}>
                    <input
                      type="checkbox"
                      checked={set.main2.includes(num)}
                      onChange={() =>
                        updateSet(idx, {
                          ...set,
                          main2: set.main2.includes(num)
                            ? set.main2.filter((n) => n !== num)
                            : [...set.main2, num],
                        })
                      }
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          )}

          {(set.mode === "1頭軸" || set.mode === "2頭軸" || set.mode === "フォーメーション") && (
            <div className="selector">
              <strong>{set.mode === "フォーメーション" ? "相手馬2" : "相手馬"}:</strong>
              <div className="checkbox-group">
                {horseNumbers.map((num) => (
                  <label key={num}>
                    <input
                      type="checkbox"
                      checked={set.partner.includes(num)}
                      onChange={() =>
                        updateSet(idx, {
                          ...set,
                          partner: set.partner.includes(num)
                            ? set.partner.filter((n) => n !== num)
                            : [...set.partner, num],
                        })
                      }
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          )}

          {set.mode === "フォーメーション" && (
            <div className="selector">
              <strong>相手馬1:</strong>
              <div className="checkbox-group">
                {horseNumbers.map((num) => (
                  <label key={num}>
                    <input
                      type="checkbox"
                      checked={set.main2.includes(num)}
                      onChange={() =>
                        updateSet(idx, {
                          ...set,
                          main2: set.main2.includes(num)
                            ? set.main2.filter((n) => n !== num)
                            : [...set.main2, num],
                        })
                      }
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          )}

          {set.mode === "BOX" && (
            <div className="selector">
              <strong>ボックス馬:</strong>
              <div className="checkbox-group">
                {horseNumbers.map((num) => (
                  <label key={num}>
                    <input
                      type="checkbox"
                      checked={set.partner.includes(num)}
                      onChange={() =>
                        updateSet(idx, {
                          ...set,
                          partner: set.partner.includes(num)
                            ? set.partner.filter((n) => n !== num)
                            : [...set.partner, num],
                        })
                      }
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="action-bar">
            <button onClick={() => updateSet(idx, set)}>展開（{set.count}点）</button>
          </div>

          <ul>
            {set.expanded.map((item, i) => (
              <li key={i} style={{ color: duplicates.includes(item) ? "red" : "black" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {sets.length < MAX_SETS && (
        <button
          onClick={() =>
            setSets([
              ...sets,
              { mode: "1頭軸", main1: [], main2: [], partner: [], expanded: [], count: 0 },
            ])
          }
        >
          セット追加
        </button>
      )}

      {sets.length > 1 && (
        <button onClick={() => setSets(sets.slice(0, -1))}>セット削除</button>
      )}
    </div>
  );
}

export default App;
