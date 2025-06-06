import React, { useState } from "react";
import "./App.css"; // モバイル対応スタイル用

function parseTickets(input, isTrifecta) {
  const lines = input
    .split("\n")
    .map(line => line.trim())
    .filter(line => line);
  let tickets = [];
  for (const line of lines) {
    if (/^[\d,-]+$/.test(line)) {
      tickets.push(...expandTicketLine(line, isTrifecta));
    } else {
      tickets.push(line);
    }
  }
  return tickets;
}

function expandTicketLine(line, isTrifecta) {
  const parts = line.split("-").map(p => p.split(","));

  if (parts.length === 1 && parts[0].length >= 3) {
    const box = parts[0];
    return isTrifecta ? generatePermutations(box, 3) : generateCombinations(box, 3);
  }

  if (parts.length === 2) {
    const base = parts[0];
    const targets = parts[1];
    const results = [];
    for (const t of targets) {
      const combo = [...base, t];
      const unique = [...new Set(combo)];
      if (unique.length === 3) {
        results.push(isTrifecta ? combo.join("-") : unique.sort().join("-"));
      }
    }
    return results;
  }

  if (parts.length === 3) {
    const [a, b, c] = parts;
    const results = new Set();
    for (const i of a) {
      for (const j of b) {
        for (const k of c) {
          const trio = [i, j, k];
          if (new Set(trio).size === 3) {
            const ticket = isTrifecta ? trio.join("-") : trio.sort().join("-");
            results.add(ticket);
          }
        }
      }
    }
    return [...results];
  }

  return [line];
}

function generateCombinations(arr, r) {
  const results = [];
  const combine = (start, combo) => {
    if (combo.length === r) {
      results.push(combo.slice().sort().join("-"));
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combine(i + 1, [...combo, arr[i]]);
    }
  };
  combine(0, []);
  return results;
}

function generatePermutations(arr, r) {
  const results = [];
  const permute = (path, used) => {
    if (path.length === r) {
      if (new Set(path).size === r) {
        results.push(path.join("-"));
      }
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(arr[i]);
      permute(path, used);
      path.pop();
      used[i] = false;
    }
  };
  permute([], Array(arr.length).fill(false));
  return results;
}

function normalize(ticket, isTrifecta) {
  const nums = ticket.split("-").map(Number);
  return isTrifecta ? nums.join("-") : nums.sort((a, b) => a - b).join("-");
}

function findDuplicates(ticketSets, isTrifecta) {
  const ticketMap = new Map();
  for (const [setName, tickets] of Object.entries(ticketSets)) {
    for (const ticket of tickets) {
      const norm = normalize(ticket, isTrifecta);
      if (!ticketMap.has(norm)) {
        ticketMap.set(norm, new Set());
      }
      ticketMap.get(norm).add(setName);
    }
  }
  const duplicates = [];
  for (const [ticket, sets] of ticketMap.entries()) {
    if (sets.size > 1) {
      duplicates.push({ ticket, sets: Array.from(sets) });
    }
  }
  return duplicates;
}

function readFileAsText(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsText(file);
}

function App() {
  const [inputs, setInputs] = useState([{ id: "A", value: "" }]);
  const [isTrifecta, setIsTrifecta] = useState(false);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState({});

  const handleChange = (id, value) => {
    setInputs(prev => prev.map(input => input.id === id ? { ...input, value } : input));
  };

  const handleFileUpload = (id, file) => {
    readFileAsText(file, (text) => {
      setInputs(prev => prev.map(input => input.id === id ? { ...input, value: text } : input));
    });
  };

  const handleAddSet = () => {
    const nextId = String.fromCharCode(65 + inputs.length);
    setInputs(prev => [...prev, { id: nextId, value: "" }]);
  };

  const handleRemoveSet = (id) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  };

  const handleCheck = () => {
    const ticketSets = {};
    const expandedMap = {};
    for (const { id, value } of inputs) {
      const tickets = parseTickets(value, isTrifecta);
      ticketSets[id] = tickets;
      expandedMap[id] = tickets;
    }
    const duplicates = findDuplicates(ticketSets, isTrifecta);
    setResults(duplicates);
    setExpanded(expandedMap);
  };

  return (
    <div className="app-container">
      <h1>🎫 馬券の重複チェッカー</h1>

      <div className="set-container">
        {inputs.map(({ id, value }) => (
          <div key={id} className="set-box">
            <div className="set-header">
              <strong>セット {id}</strong>
              {expanded[id] && <span>（{expanded[id].length}点）</span>}
              {inputs.length > 1 && (
                <button onClick={() => handleRemoveSet(id)}>削除</button>
              )}
            </div>
            <textarea
              value={value}
              onChange={e => handleChange(id, e.target.value)}
              placeholder={`例：
1頭流し：1-2,3,4-2,3,4
2頭流し：1-2-3,4,5
フォーメーション：1-2,3-2,3,4,5
ボックス：1,2,3,4`}
              rows={6}
            />
            <input
              type="file"
              accept=".csv"
              onChange={e => handleFileUpload(id, e.target.files[0])}
              className="file-input"
            />
            {expanded[id] && (
              <details>
                <summary>展開後の馬券（{isTrifecta ? "三連単" : "三連複"}）</summary>
                <ul className="expanded-list">
                  {expanded[id].map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button onClick={handleAddSet}>＋ セットを追加</button>
        <label>
          <input type="checkbox" checked={isTrifecta} onChange={() => setIsTrifecta(!isTrifecta)} /> 三連単モード
        </label>
        <button onClick={handleCheck}>重複をチェック</button>
      </div>

      <div>
        <h2>重複結果</h2>
        {results.length === 0 ? (
          <p>重複は見つかりませんでした。</p>
        ) : (
          <ul>
            {results.map((item, idx) => (
              <li key={idx}>
                馬券: <strong>{item.ticket}</strong> → セット: {item.sets.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
