
import { useEffect, useState } from "react";
import "./App.css";
import HealthTools from "./HealthTools.jsx";

const ADMIN = {
  name: "Admin",
  email: "admin@fittrack.com",
  password: "admin123",
  role: "admin",
};

function App() {
  const [users, setUsers] = useState(() => {
    const saved = JSON.parse(
      localStorage.getItem("users") || "null"
    );
    return saved || [ADMIN];
  });

  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const [workouts, setWorkouts] = useState(() =>
    JSON.parse(localStorage.getItem("workouts") || "[]")
  );

  const [page, setPage] = useState("login");
  const [isSignup, setIsSignup] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [workout, setWorkout] = useState({
    exercise: "",
    duration: "",
    calories: "",
  });

  // LOCAL STORAGE

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );

      setPage(
        currentUser.role === "admin"
          ? "admin"
          : "dashboard"
      );
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // LOGIN AND REGISTRATION

  function handleAuth(e) {
    e.preventDefault();

    if (isSignup) {
      if (users.some((u) => u.email === form.email)) {
        alert("Email already registered!");
        return;
      }

      const newUser = {
        ...form,
        role: "user",
        id: Date.now(),
      };

      const updatedUsers = [...users, newUser];

      localStorage.setItem(
        "users",
        JSON.stringify(updatedUsers)
      );

      setUsers(updatedUsers);

      alert("Account created! Please login.");

      setIsSignup(false);

      setForm({
        name: "",
        email: "",
        password: "",
      });
    } else {
      const found = users.find(
        (u) =>
          u.email === form.email &&
          u.password === form.password
      );

      if (!found) {
        alert("Invalid email or password!");
        return;
      }

      setCurrentUser(found);
    }
  }

  // CREATE AND UPDATE WORKOUT

  function addWorkout(e) {
    e.preventDefault();

    if (!workout.exercise.trim()) {
      alert("Please enter exercise name!");
      return;
    }

    if (
      Number(workout.duration) <= 0 ||
      Number(workout.calories) < 0
    ) {
      alert("Please enter valid workout details!");
      return;
    }

    if (editingWorkout !== null) {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === editingWorkout &&
          w.userEmail === currentUser.email
            ? {
                ...w,
                exercise: workout.exercise.trim(),
                duration: Number(workout.duration),
                calories: Number(workout.calories),
              }
            : w
        )
      );

      alert("Workout updated successfully!");

      cancelEdit();
      setPage("history");
    } else {
      const newWorkout = {
        id: Date.now(),
        userEmail: currentUser.email,
        exercise: workout.exercise.trim(),
        duration: Number(workout.duration),
        calories: Number(workout.calories),
        date: new Date().toLocaleDateString(),
      };

      setWorkouts((prev) => [...prev, newWorkout]);

      setWorkout({
        exercise: "",
        duration: "",
        calories: "",
      });

      alert("Workout added successfully!");
    }
  }

  // EDIT WORKOUT

  function editWorkout(w) {
    setEditingWorkout(w.id);

    setWorkout({
      exercise: w.exercise,
      duration: w.duration,
      calories: w.calories,
    });

    setPage("workout");
  }

  // DELETE WORKOUT

  function deleteWorkout(id) {
    if (window.confirm("Delete this workout?")) {
      setWorkouts((prev) =>
        prev.filter(
          (w) =>
            !(
              w.id === id &&
              w.userEmail === currentUser.email
            )
        )
      );

      if (editingWorkout === id) {
        cancelEdit();
      }

      alert("Workout deleted successfully!");
    }
  }

  // CANCEL EDITING

  function cancelEdit() {
    setEditingWorkout(null);

    setWorkout({
      exercise: "",
      duration: "",
      calories: "",
    });
  }

  function openAddWorkout() {
    cancelEdit();
    setPage("workout");
  }

  // LOGOUT

  function logout() {
    cancelEdit();

    setCurrentUser(null);
    setPage("login");
    setIsSignup(false);

    setForm({
      name: "",
      email: "",
      password: "",
    });
  }

  // ADMIN DELETE USER

  function deleteUser(email) {
    if (email === ADMIN.email) return;

    if (window.confirm("Delete this user?")) {
      setUsers((prev) =>
        prev.filter((u) => u.email !== email)
      );

      setWorkouts((prev) =>
        prev.filter((w) => w.userEmail !== email)
      );

      alert("User deleted successfully!");
    }
  }

  // LOGIN AND SIGNUP PAGE

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo">
            FIT<span>TRACK</span>
          </div>

          <p className="subtitle">
            YOUR FITNESS. YOUR PROGRESS.
          </p>

          <h1>
            {isSignup
              ? "Create Account"
              : "Welcome Back!"}
          </h1>

          <p className="muted">
            {isSignup
              ? "Start your fitness journey today."
              : "Login to continue your fitness journey."}
          </p>

          <form onSubmit={handleAuth}>
            {isSignup && (
              <input
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

            <button className="primary-btn">
              {isSignup ? "CREATE ACCOUNT" : "LOGIN"}
            </button>
          </form>

          <p className="switch-text">
            {isSignup
              ? "Already have an account?"
              : "New to FitTrack?"}

            <button
              className="text-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>

          <div className="demo-box">
            <strong>Demo Admin Login</strong>
            <p>Email: admin@fittrack.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // READ WORKOUTS

  const myWorkouts = workouts.filter(
    (w) => w.userEmail === currentUser.email
  );

  const totalCalories = myWorkouts.reduce(
    (sum, w) => sum + w.calories,
    0
  );

  const totalMinutes = myWorkouts.reduce(
    (sum, w) => sum + w.duration,
    0
  );

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="app-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          FIT<span>TRACK</span>
        </div>

        <p className="side-label">MENU</p>

        {isAdmin ? (
          <button className="nav-item active">
            ▦ Admin Dashboard
          </button>
        ) : (
          <>
            <button
              className={`nav-item ${
                page === "dashboard" ? "active" : ""
              }`}
              onClick={() => setPage("dashboard")}
            >
              ▦ Dashboard
            </button>

            <button
              className={`nav-item ${
                page === "workout" ? "active" : ""
              }`}
              onClick={openAddWorkout}
            >
              💪 Add Workout
            </button>

            <button
              className={`nav-item ${
                page === "history" ? "active" : ""
              }`}
              onClick={() => setPage("history")}
            >
              ◷ Workout History
            </button>

            <button
              className={`nav-item ${
                page === "bmi" ? "active" : ""
              }`}
              onClick={() => setPage("bmi")}
            >
              📏 BMI Calculator
            </button>

            <button
              className={`nav-item ${
                page === "weight" ? "active" : ""
              }`}
              onClick={() => setPage("weight")}
            >
              📈 Weight Progress
            </button>

            <button
              className={`nav-item ${
                page === "diet" ? "active" : ""
              }`}
              onClick={() => setPage("diet")}
            >
              🥗 Diet Planner
            </button>
          </>
        )}

        <button
          className="logout-btn"
          onClick={logout}
        >
          ↪ Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>
              {isAdmin
                ? "Admin Panel"
                : "Fitness Dashboard"}
            </h2>

            <p className="muted">
              Welcome, {currentUser.name}!
            </p>
          </div>

          <div className="profile">
            <span className="avatar">
              {currentUser.name[0].toUpperCase()}
            </span>

            <span>
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </header>

        {/* ADMIN DASHBOARD */}

        {isAdmin ? (
          <>
            <h1 className="page-title">
              Admin Overview
            </h1>

            <section className="stats-grid">
              <Stat
                title="Total Users"
                value={users.length - 1}
                icon="👥"
              />

              <Stat
                title="Total Workouts"
                value={workouts.length}
                icon="💪"
              />

              <Stat
                title="Calories Burned"
                value={workouts.reduce(
                  (s, w) => s + w.calories,
                  0
                )}
                icon="🔥"
              />
            </section>

            <section className="panel">
              <h2>Registered Users</h2>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id || u.email}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>

                        <td>
                          {u.role !== "admin" && (
                            <button
                              className="delete-btn"
                              onClick={() =>
                                deleteUser(u.email)
                              }
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h2>All Workout Records</h2>

              {workouts.map((w) => (
                <p className="record" key={w.id}>
                  {w.userEmail} — {w.exercise} —{" "}
                  {w.duration} min — {w.calories} kcal
                </p>
              ))}

              {workouts.length === 0 && (
                <p className="muted">
                  No workouts yet.
                </p>
              )}
            </section>
          </>
        ) : (
          <>

            {/* USER DASHBOARD */}

            {page === "dashboard" && (
              <>
                <h1 className="page-title">
                  Your Fitness Overview
                </h1>

                <section className="stats-grid">
                  <Stat
                    title="Total Workouts"
                    value={myWorkouts.length}
                    icon="💪"
                  />

                  <Stat
                    title="Calories Burned"
                    value={totalCalories}
                    icon="🔥"
                  />

                  <Stat
                    title="Workout Minutes"
                    value={totalMinutes}
                    icon="⏱️"
                  />
                </section>

                <section className="panel">
                  <h2>Recent Activity</h2>

                  {myWorkouts
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((w) => (
                      <p className="record" key={w.id}>
                        {w.exercise} — {w.duration} minutes
                        — {w.calories} kcal
                      </p>
                    ))}

                  {myWorkouts.length === 0 && (
                    <p className="muted">
                      No activity yet. Add your first workout!
                    </p>
                  )}

                  <button
                    className="primary-btn small-btn"
                    onClick={openAddWorkout}
                  >
                    + Add Workout
                  </button>
                </section>
              </>
            )}

            {/* CREATE AND UPDATE WORKOUT FORM */}

            {page === "workout" && (
              <section className="panel form-panel">
                <h1>
                  {editingWorkout !== null
                    ? "Edit Workout"
                    : "Add New Workout"}
                </h1>

                <p className="muted">
                  {editingWorkout !== null
                    ? "Update your workout details."
                    : "Record your daily fitness activity."}
                </p>

                <form onSubmit={addWorkout}>
                  <label>Exercise Name</label>

                  <input
                    placeholder="e.g. Running, Cycling, Pushups"
                    required
                    value={workout.exercise}
                    onChange={(e) =>
                      setWorkout({
                        ...workout,
                        exercise: e.target.value,
                      })
                    }
                  />

                  <label>Duration (minutes)</label>

                  <input
                    type="number"
                    min="1"
                    required
                    value={workout.duration}
                    onChange={(e) =>
                      setWorkout({
                        ...workout,
                        duration: e.target.value,
                      })
                    }
                  />

                  <label>Calories Burned</label>

                  <input
                    type="number"
                    min="0"
                    required
                    value={workout.calories}
                    onChange={(e) =>
                      setWorkout({
                        ...workout,
                        calories: e.target.value,
                      })
                    }
                  />

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    {editingWorkout !== null
                      ? "UPDATE WORKOUT"
                      : "SAVE WORKOUT"}
                  </button>

                  {editingWorkout !== null && (
                    <button
                      type="button"
                      className="delete-btn"
                      style={{ marginTop: "12px" }}
                      onClick={() => {
                        cancelEdit();
                        setPage("history");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </section>
            )}

            {/* BMI, WEIGHT AND DIET FEATURES */}

            {["bmi", "weight", "diet"].includes(page) && (
              <HealthTools
                key={currentUser.email}
                email={currentUser.email}
                page={page}
              />
            )}

            {/* WORKOUT HISTORY - READ UPDATE DELETE */}

            {page === "history" && (
              <section className="panel">
                <h1>Workout History</h1>

                <button
                  className="primary-btn small-btn"
                  style={{ marginBottom: "20px" }}
                  onClick={openAddWorkout}
                >
                  + Add Workout
                </button>

                {myWorkouts
                  .slice()
                  .reverse()
                  .map((w) => (
                    <div
                      className="history-item"
                      key={w.id}
                      style={{ flexWrap: "wrap" }}
                    >
                      <div>
                        <strong>{w.exercise}</strong>
                        <p className="muted">{w.date}</p>
                      </div>

                      <span>{w.duration} min</span>

                      <span>{w.calories} kcal</span>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="primary-btn small-btn"
                          onClick={() => editWorkout(w)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteWorkout(w.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                {myWorkouts.length === 0 && (
                  <p className="muted">
                    No workout history available.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// STAT CARD COMPONENT

function Stat({ title, value, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default App;
