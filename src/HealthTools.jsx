
import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function HealthTools({ email, page }) {

  // BMI STATES

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);

  // WEIGHT STATES

  const [newWeight, setNewWeight] = useState("");
  const [editingWeight, setEditingWeight] = useState(null);

  const [weights, setWeights] = useState(() =>
    JSON.parse(
      localStorage.getItem("weights_" + email) || "[]"
    )
  );

  // FOOD STATES

  const [editingFood, setEditingFood] = useState(null);

  const [foods, setFoods] = useState(() =>
    JSON.parse(
      localStorage.getItem("foods_" + email) || "[]"
    )
  );

  const [goal, setGoal] = useState(() =>
    Number(
      localStorage.getItem("goal_" + email) || 2000
    )
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

  // LOCAL STORAGE

  useEffect(() => {
    localStorage.setItem(
      "weights_" + email,
      JSON.stringify(weights)
    );
  }, [weights, email]);

  useEffect(() => {
    localStorage.setItem(
      "foods_" + email,
      JSON.stringify(foods)
    );
  }, [foods, email]);

  useEffect(() => {
    localStorage.setItem("goal_" + email, goal);
  }, [goal, email]);

  // BMI CALCULATION

  function calculateBMI(e) {
    e.preventDefault();

    if (Number(height) <= 0 || Number(weight) <= 0) {
      alert("Please enter valid height and weight!");
      return;
    }

    setBmi(
      Number(weight) / (Number(height) / 100) ** 2
    );
  }

  // CREATE AND UPDATE WEIGHT

  function addWeight(e) {
    e.preventDefault();

    if (Number(newWeight) <= 0) {
      alert("Please enter valid weight!");
      return;
    }

    if (editingWeight !== null) {

      setWeights(prev =>
        prev.map(w =>
          w.id === editingWeight
            ? {
                ...w,
                weight: Number(newWeight)
              }
            : w
        )
      );

      alert("Weight updated successfully!");

    } else {

      setWeights(prev => [
        ...prev,
        {
          id: Date.now(),
          date: today,
          weight: Number(newWeight)
        }
      ]);

      alert("Weight added successfully!");
    }

    cancelWeightEdit();
  }

  // EDIT WEIGHT

  function editWeight(w) {
    setEditingWeight(w.id);
    setNewWeight(w.weight);
  }

  // DELETE WEIGHT

  function deleteWeight(id) {
    if (window.confirm("Delete this weight record?")) {

      setWeights(prev =>
        prev.filter(w => w.id !== id)
      );

      if (editingWeight === id) {
        cancelWeightEdit();
      }

      alert("Weight deleted successfully!");
    }
  }

  // CANCEL WEIGHT EDIT

  function cancelWeightEdit() {
    setEditingWeight(null);
    setNewWeight("");
  }

  // CREATE AND UPDATE FOOD

  function addFood(e) {
    e.preventDefault();

    if (!food.name.trim()) {
      alert("Please enter food name!");
      return;
    }

    const foodDetails = {
      name: food.name.trim(),
      meal: food.meal,
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fats: Number(food.fats)
    };

    if (
      foodDetails.calories < 0 ||
      foodDetails.protein < 0 ||
      foodDetails.carbs < 0 ||
      foodDetails.fats < 0
    ) {
      alert("Please enter valid nutrition values!");
      return;
    }

    if (editingFood !== null) {

      setFoods(prev =>
        prev.map(f =>
          f.id === editingFood
            ? {
                ...f,
                ...foodDetails
              }
            : f
        )
      );

      alert("Food updated successfully!");

    } else {

      setFoods(prev => [
        ...prev,
        {
          ...foodDetails,
          id: Date.now(),
          date: today
        }
      ]);

      alert("Food added successfully!");
    }

    cancelFoodEdit();
  }

  // EDIT FOOD

  function editFood(f) {
    setEditingFood(f.id);

    setFood({
      name: f.name,
      meal: f.meal,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fats
    });
  }

  // DELETE FOOD

  function deleteFood(id) {
    if (window.confirm("Delete this food record?")) {

      setFoods(prev =>
        prev.filter(f => f.id !== id)
      );

      if (editingFood === id) {
        cancelFoodEdit();
      }

      alert("Food deleted successfully!");
    }
  }

  // CANCEL FOOD EDIT

  function cancelFoodEdit() {
    setEditingFood(null);

    setFood({
      name: "",
      meal: "Breakfast",
      calories: "",
      protein: "",
      carbs: "",
      fats: ""
    });
  }

  // READ TODAY'S FOOD RECORDS

  const dailyFoods = foods.filter(
    f => f.date === today
  );

  // NUTRITION CALCULATIONS

  const calories = dailyFoods.reduce(
    (sum, f) => sum + f.calories,
    0
  );

  const protein = dailyFoods.reduce(
    (sum, f) => sum + f.protein,
    0
  );

  const carbs = dailyFoods.reduce(
    (sum, f) => sum + f.carbs,
    0
  );

  const fats = dailyFoods.reduce(
    (sum, f) => sum + f.fats,
    0
  );

  // BMI CATEGORY

  const category =
    bmi < 18.5 ? "Underweight" :
    bmi < 25 ? "Normal Weight" :
    bmi < 30 ? "Overweight" :
    "Obesity";

  // BMI CALCULATOR PAGE

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
          <div
            className="panel"
            style={{ marginTop: 20 }}
          >

            <p>Your BMI</p>

            <h1
              style={{
                color: "#a3e635",
                fontSize: 40
              }}
            >
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

  // WEIGHT PROGRESS PAGE

  if (page === "weight") {
    return (
      <>

        <h1 className="page-title">
          Weight Progress
        </h1>

        {/* CREATE AND UPDATE WEIGHT */}

        <section className="panel">

          <h2>
            {editingWeight !== null
              ? "Edit Weight Record"
              : "Record Your Weight"}
          </h2>

          <form onSubmit={addWeight}>

            <label>Current Weight (kg)</label>

            <input
              type="number"
              min="1"
              step="0.1"
              required
              value={newWeight}
              onChange={e =>
                setNewWeight(e.target.value)
              }
            />

            <button
              type="submit"
              className="primary-btn"
            >
              {editingWeight !== null
                ? "UPDATE WEIGHT"
                : "SAVE WEIGHT"}
            </button>

            {editingWeight !== null && (
              <button
                type="button"
                className="delete-btn"
                style={{ marginTop: 12 }}
                onClick={cancelWeightEdit}
              >
                Cancel
              </button>
            )}

          </form>

        </section>

        {/* WEIGHT GRAPH */}

        <section className="panel">

          <h2>Weight Progress Graph</h2>

          {weights.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart data={weights}>

                <CartesianGrid
                  stroke="#303b30"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  stroke="#aaa"
                />

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

            <p className="muted">
              No weight records yet.
            </p>

          )}

        </section>

        {/* READ, UPDATE AND DELETE WEIGHT */}

        <section className="panel">

          <h2>Weight History</h2>

          {weights.slice().reverse().map(w => (

            <div
              className="history-item"
              key={w.id}
              style={{ flexWrap: "wrap" }}
            >

              <span>{w.date}</span>

              <strong>{w.weight} kg</strong>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                }}
              >

                <button
                  className="primary-btn small-btn"
                  onClick={() => editWeight(w)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteWeight(w.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

          {weights.length === 0 && (
            <p className="muted">
              No weight history available.
            </p>
          )}

        </section>

      </>
    );
  }

  // DIET AND CALORIE PLANNER PAGE

  if (page === "diet") {
    return (
      <>

        <h1 className="page-title">
          Diet & Calorie Planner
        </h1>

        {/* DAILY CALORIE TARGET */}

        <section className="panel">

          <h2>Daily Calorie Target</h2>

          <input
            type="number"
            min="1"
            value={goal}
            onChange={e =>
              setGoal(
                Math.max(1, Number(e.target.value))
              )
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

        {/* NUTRITION STATISTICS */}

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

        {/* CREATE AND UPDATE FOOD */}

        <section className="panel form-panel">

          <h2>
            {editingFood !== null
              ? "Edit Food"
              : "Add Food"}
          </h2>

          <form onSubmit={addFood}>

            <label>Food Name</label>

            <input
              required
              placeholder="e.g. Chicken, Rice, Eggs"
              value={food.name}
              onChange={e =>
                setFood({
                  ...food,
                  name: e.target.value
                })
              }
            />

            <label>Meal Type</label>

            <select
              value={food.meal}
              onChange={e =>
                setFood({
                  ...food,
                  meal: e.target.value
                })
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

            {["calories", "protein", "carbs", "fats"]
              .map(key => (

                <div key={key}>

                  <label>
                    {key.toUpperCase()}
                    {key === "calories"
                      ? " (kcal)"
                      : " (g)"}
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

            <button
              type="submit"
              className="primary-btn"
            >
              {editingFood !== null
                ? "UPDATE FOOD"
                : "ADD FOOD"}
            </button>

            {editingFood !== null && (
              <button
                type="button"
                className="delete-btn"
                style={{ marginTop: 12 }}
                onClick={cancelFoodEdit}
              >
                Cancel
              </button>
            )}

          </form>

        </section>

        {/* READ, UPDATE AND DELETE FOOD */}

        <section className="panel">

          <h2>Today's Food History</h2>

          {dailyFoods.map(f => (

            <div
              className="history-item"
              key={f.id}
              style={{ flexWrap: "wrap" }}
            >

              <div>

                <strong>{f.name}</strong>

                <p className="muted">
                  {f.meal}
                </p>

                <p className="muted">
                  Protein: {f.protein} g |
                  Carbs: {f.carbs} g |
                  Fats: {f.fats} g
                </p>

              </div>

              <span>{f.calories} kcal</span>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                }}
              >

                <button
                  className="primary-btn small-btn"
                  onClick={() => editFood(f)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteFood(f.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

          {dailyFoods.length === 0 && (
            <p className="muted">
              No food records today.
            </p>
          )}

        </section>

      </>
    );
  }

  return null;
}

export default HealthTools;

