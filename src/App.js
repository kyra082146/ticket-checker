import React, { useState } from "react";
import "./App.css";

function App() {
  const [bets, setBets] = useState([{ name: "セットA", value: "" }]);
  const [isTrio, setIsTrio] = useState(true);

  const handleChange = (index, value) => {
    const newBets = [...bets];
    newBets[index].value = value;
    setBets(newBets);
  };

  const addSet = () => {
    const nextLetter = String.fromCharCode(65 + bets.length);
    setBets([...bets, { name: `セット${nextLetter}`, value: "" }]);
  };

  const removeSet = () => {
    if (bets.length > 1) {
      setBets(bets.slice(0, -1));
    }
  };

  const expandBets = (input) => {
    const result = new Set();
    const parts = input.split("-");

    if (parts.length === 1) {
      // BOX
      const nums = parts[0].split(",").map(Number);
      const combinations = getCombinations(nums, 3);
      combinations.forEach((combo) => {
        result.add(formatCombo(combo));
      });
    } else if (parts.length === 2) {
      // 1頭軸
      const axis = parts[0];
      const secondParts = parts[1].split(",");
      for (let i = 0; i < secondParts.length; i++) {
        for (let j = i + 1; j < secondParts.length; j++) {
          result.add(formatCombo([Number(axis), Number(secondParts[i]), Number(secondParts[j])]));
        }
      }
    } else if (parts.length === 3) {
      // フォーメーション
      const p1 = parts[0].split(",").map(Number);
      const p2 = parts[1].split(",").map(Number);
      const p3 = parts[2].split(",").map(Number);
      p1.forEach((a) => {
        p2.forEach((b) => {
          p3.forEach((c) => {
            const combo = [a, b, c];
            if (new Set(combo).size === 3) {
              result.add(formatCombo(combo));
            }
          });
        });
      });
    }

    return Array.from(result);
  };

  const formatCombo = (combo) => {
    return isTrio ? combo.sort((a, b) => a - b).join("-") : combo.join("-");
  };

  const getCombinations = (arr, k) => {
    const result = [];
    const combine = (start, path) => {
      if (path.length === k) {
        result.push([...path]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combine(i + 1, [...path, arr[i]]);
      }
    };
    combine(0, []);
    return result;
  };

  const allTickets = bets.flatMap((set) => expandBets(set.value));
  const duplicates = allTickets.filter((item, index, self) => self.indexOf(item) !== index);

  return (
    <div className="App">
      <h1>馬券チェッカー</h1>
      <label>
        <input
          type="checkbox"
          checked={isTrio}
          onChange={(e) => setIsTrio(e.target.checked)}
        />
        三連複
      </label>
      <div className="sets">
        {bets.map((set, index) => (
          <div key={index} className="set">
            <h3>{set.name}</h3>
            <p className="hint">
              例：1頭流し：1-2,3,4-2,3,4<br />
              　　2頭流し：1-2-3,4,5<br />
              　　フォーメーション：1-2,3-2,3,4,5<br />
              　　ボックス：1,2,3,4
            </p>
            <textarea
              value={set.value}
              onChange={(e) => handleChange(index, e.target.value)}
              rows={2}
              cols={30}
            />
            <p>{expandBets(set.value).length}点</p>
            <ul>
              {expandBets(set.value).map((ticket, i) => (
                <li
                  key={i}
                  style={{ color: duplicates.includes(ticket) ? "red" : "black" }}
                >
                  {ticket}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={addSet}>セット追加</button>
      <button onClick={removeSet}>セット削除</button>
    </div>
  );
}

export default App;
