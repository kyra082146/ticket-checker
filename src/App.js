import React, { useState } from "react";
import "./App.css";

const horseNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
const MAX_SETS = 5;

function App() {
  const [isTrio, setIsTrio] = useState(true);
  const [sets, setSets] = useState([
    {
      mode: "1頭軸",
      main1: [],
      main2: [],
      main3: [],
      partner: [],
      expanded: [],
      count: 0,
      show: false,
    },
  ]);

  const generateCombinations = (set) => {
    let result = [];
    const { mode, main1, main2, main3, partner } = set;
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
      main1.forEach((a) => {
        main2.forEach((b) => {
          main3.forEach((c) => {
            if (a !== b && a !== c && b !== c) {
              const combo = isTrio
                ? [a, b, c].sort((x, y) => x - y)
                : [a, b, c];
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
    newSets[index] = {
      ...updatedSet,
      show: false, // 再展開前に非表示
    };
    setSets(newSets);
  };

  const expandSet = (index) => {
    const newSets = [...sets];
    const set = newSets[index];
    const expanded = generateCombinations(set);
    newSets[index] = {
      ...set,
      expanded,
      count: expanded.length,
      show: true,
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
      <div className="set-row">
        {sets.map((set, idx) => (
          <div key={idx} className="set-container">
            <h2>セット{String.fromCharCode(65 + idx)}</h2>
            <div className="mode-selector">
              {["1頭軸", "2頭軸", "フォーメーション", "BOX"].map((m) => (
                <button
                  key={m}
                  className={set.mode === m ? "active" : ""}
                  onClick={() =>
                    updateSet(idx, {
                      mode: m,
                      main1: [],
                      main2: [],
                      main3: [],
                      partner: [],
                      expanded: [],
                      count: 0,
                      show: false,
                    })
                  }
                >
                  {m}
                </button>
              ))}
            </div>

            {set.mode === "1頭軸" && (
              <NumberSelector label="軸馬" selected={set.main1} onChange={(nums) => updateSet(idx, { ...set, main1: nums })} />
            )}
            {set.mode === "2頭軸" && (
              <>
                <NumberSelector label="軸馬1" selected={set.main1} onChange={(nums) => updateSet(idx, { ...set, main1: nums })} />
                <NumberSelector label="軸馬2" selected={set.main2} onChange={(nums) => updateSet(idx, { ...set, main2: nums })} />
              </>
            )}
            {set.mode === "フォーメーション" && (
              <>
                <NumberSelector label="1列目" selected={set.main1} onChange={(nums) => updateSet(idx, { ...set, main1: nums })} />
                <NumberSelector label="2列目" selected={set.main2} onChange={(nums) => updateSet(idx, { ...set, main2: nums })} />
                <NumberSelector label="3列目" selected={set.main3} onChange={(nums) => updateSet(idx, { ...set, main3: nums })} />
              </>
            )}
            {set.mode === "BOX" && (
              <NumberSelector label="ボックス馬" selected={set.partner} onChange={(nums) => updateSet(idx, { ...set, partner: nums })} />
            )}

            <div className="action-bar">
              <button onClick={() => expandSet(idx)}>展開（{set.count}点）</button>
            </div>

            {set.show && (
              <ul>
                {set.expanded.map((item, i) => (
                  <li key={i} style={{ color: duplicates.includes(item) ? "red" : "black" }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {sets.length < MAX_SETS && (
        <button
          onClick={() =>
            setSets([
              ...sets,
              {
                mode: "1頭軸",
                main1: [],
                main2: [],
                main3: [],
                partner: [],
                expanded: [],
                count: 0,
                show: false,
              },
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

function NumberSelector({ label, selected, onChange }) {
  const toggleNumber = (num) => {
    onChange(
      selected.includes(num)
        ? selected.filter((n) => n !== num)
        : [...selected, num]
    );
  };
  return (
    <div className="selector">
      <strong>{label}:</strong>
      <div className="checkbox-group grid">
        {horseNumbers.map((num) => (
          <label key={num}>
            <input
              type="checkbox"
              checked={selected.includes(num)}
              onChange={() => toggleNumber(num)}
            />
            {num}
          </label>
        ))}
      </div>
    </div>
  );
}

export default App;
