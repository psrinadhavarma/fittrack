import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

function HealthTools({ email, page }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);

  const [newWeight, setNewWeight] = useState("");

  const [weights, setWeights] = useState(() =>
    JSON.parse(localStorage.getItem("weights_" + email) || "[]")
  );

  const [foods, setFoods] = useState(() =>
    JSON.parse(localStorage.getItem("foods_" + email) || "[]")
  );

  const [goal, setGoal] = useState(() =>
    Number(localStorage.getItem("goal_" + email) || 2000)
  );

  const [food, setFood] = useState({
    name: "",
    meal: "Breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });

  const today = new Date().toLocaleDateString();

  useEffect(() => {
    localStorage.setItem("weights_" + email, JSON.stringify(weights));
  }, [weights, email]);

  useEffect(() => {
    localStorage.setItem("foods_" + email, JSON.stringify(foods));
  }, [foods, email]);

  useEffect(() => {
    localStorage.setItem("goal_" + email, goal);
  }, [goal, email]);

  function calculateBMI(e) {
    e.preventDefault();
    setBmi(Number(weight) / (Number(height) / 100) ** 2);
  }

  function addWeight(e) {
    e.preventDefault();

    setWeights(prev => [
      ...prev,
      {
        id: Date.now(),
        date: today,
        weight: Number(newWeight)
      }
    ]);

    setNewWeight("");
  }

  function addFood(e) {
    e.preventDefault();

    setFoods(prev => [
      ...prev,
      {
        ...food,
        id: Date.now(),
        date: today,
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fats: Number(food.fats)
      }
    ]);

    setFood({
      name: "",
      meal: "Breakfast",
      calories: "",
      protein: "",
      carbs: "",
      fats: ""
    });
  }

  const dailyFoods = foods.filter(f => f.date === today);

  const calories = dailyFoods.reduce(
    (sum, f) => sum + f.calories, 0
  );

  const protein = dailyFoods.reduce(
    (sum, f) => sum + f.protein, 0
  );

  const carbs = dailyFoods.reduce(
    (sum, f) => sum + f.carbs, 0
  );

  const fats = dailyFoods.reduce(
    (sum, f) => sum + f.fats, 0
  );

  const category =
    bmi < 18.5 ? "Underweight" :
    bmi < 25 ? "Normal Weight" :
    bmi < 30 ? "Overweight" : "Obesity";

  if (page === "bmi") {
    return (
      <section className="panel form-panel">
        <h1>BMI Calculator</h1>
        <p className="muted">
          Calculate your Body Mass Index
        </p>

        <form onSubmit={calculateBMI}>
          <label>Height (cm)</label>
          <input
            type="number"
            min="1"
            step="any"
            required
            value={height}
            onChange={e => setHeight(e.target.value)}
          />

          <label>Weight (kg)</label>
          <input
            type="number"
            min="1"
            step="any"
            required
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />

          <button className="primary-btn">
            CALCULATE BMI
          </button>
        </form>

        {bmi !== null && (
          <div className="panel" style={{ marginTop: 20 }}>
            <p>Your BMI</p>
            <h1 style={{ color: "#a3e635", fontSize: 40 }}>
              {bmi.toFixed(2)}
            </h1>
            <h3>{category}</h3>
            <p className="muted">
              Adult BMI screening categories
            </p>
          </div>
        )}
      </section>
    );
  }

  if (page === "weight") {
    return (
      <>
        <h1 className="page-title">Weight Progress</h1>

        <section className="panel">
          <h2>Record Your Weight</h2>

          <form onSubmit={addWeight}>
            <label>Current Weight (kg)</label>
            <input
              type="number"
              min="1"
              step="0.1"
              required
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />

            <button className="primary-btn">
              SAVE WEIGHT
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Weight Progress Graph</h2>

          {weights.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weights}>
                <CartesianGrid
                  stroke="#303b30"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis
                  stroke="#aaa"
                  domain={["auto", "auto"]}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a3e635"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">No weight records yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Weight History</h2>

          {weights.slice().reverse().map(w => (
            <div className="history-item" key={w.id}>
              <span>{w.date}</span>
              <strong>{w.weight} kg</strong>

              <button
                className="delete-btn"
                onClick={() =>
                  setWeights(prev =>
                    prev.filter(item => item.id !== w.id)
                  )
                }
              >
                Delete
              </button>
            </div>
          ))}
        </section>
      </>
    );
  }

  if (page === "diet") {
    return (
      <>
        <h1 className="page-title">
          Diet & Calorie Planner
        </h1>

        <section className="panel">
          <h2>Daily Calorie Target</h2>

          <input
            type="number"
            min="1"
            value={goal}
            onChange={e =>
              setGoal(Math.max(1, Number(e.target.value)))
            }
          />

          <h2 style={{ color: "#a3e635" }}>
            {calories} / {goal} kcal
          </h2>

          <progress
            value={Math.min(calories, goal)}
            max={goal}
            style={{
              width: "100%",
              accentColor: "#a3e635"
            }}
          />

          <p>
            {calories <= goal
              ? `${goal - calories} kcal remaining`
              : `${calories - goal} kcal above target`}
          </p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Protein</p>
            <h2>{protein.toFixed(1)} g</h2>
          </div>

          <div className="stat-card">
            <p>Carbohydrates</p>
            <h2>{carbs.toFixed(1)} g</h2>
          </div>

          <div className="stat-card">
            <p>Fats</p>
            <h2>{fats.toFixed(1)} g</h2>
          </div>
        </section>

        <section className="panel form-panel">
          <h2>Add Food</h2>

          <form onSubmit={addFood}>
            <label>Food Name</label>
            <input
              required
              placeholder="e.g. Chicken, Rice, Eggs"
              value={food.name}
              onChange={e =>
                setFood({ ...food, name: e.target.value })
              }
            />

            <label>Meal Type</label>
            <select
              value={food.meal}
              onChange={e =>
                setFood({ ...food, meal: e.target.value })
              }
              style={{
                width: "100%",
                padding: 12,
                background: "#151b15",
                color: "white",
                border: "1px solid #354035",
                borderRadius: 8,
                marginBottom: 15
              }}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snacks</option>
            </select>

            {["calories", "protein", "carbs", "fats"].map(key => (
              <div key={key}>
                <label>
                  {key.toUpperCase()}
                  {key === "calories" ? " (kcal)" : " (g)"}
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={food[key]}
                  onChange={e =>
                    setFood({
                      ...food,
                      [key]: e.target.value
                    })
                  }
                />
              </div>
            ))}

            <button className="primary-btn">
              ADD FOOD
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Today's Food History</h2>

          {dailyFoods.map(f => (
            <div className="history-item" key={f.id}>
              <div>
                <strong>{f.name}</strong>
                <p className="muted">{f.meal}</p>
              </div>

              <span>{f.calories} kcal</span>

              <button
                className="delete-btn"
                onClick={() =>
                  setFoods(prev =>
                    prev.filter(item => item.id !== f.id)
                  )
                }
              >
                Delete
              </button>
            </div>
          ))}

          {dailyFoods.length === 0 && (
            <p className="muted">No food records today.</p>
          )}
        </section>
      </>
    );
  }

  return null;
}

export default HealthTools;