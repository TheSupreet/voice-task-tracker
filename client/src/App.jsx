import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

import VoiceInput from "./components/VoiceInput.jsx";
import TaskBoard from "./components/TaskBoard.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskForm from "./components/TaskForm.jsx";
import FiltersBar from "./components/FiltersBar.jsx";

function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("board"); // "board" | "list"
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await api.get("/tasks", { params });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleCreateTask = async (data) => {
    const res = await api.post("/tasks", data);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdateTask = async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Voice-Enabled Task Tracker</h1>
        <div className="header-actions view-switcher">
          <button
            className={view === "board" ? "active" : ""}
            onClick={() => setView("board")}
          >
            Task Board
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            Task List
          </button>
        </div>
      </header>

      <VoiceInput onParsedTask={handleCreateTask} />

      {/* Show form when editing, or always show for quick entry */}
      <TaskForm
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />

      <FiltersBar filters={filters} setFilters={setFilters} />

      {view === "board" ? (
        <TaskBoard
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          setEditingTask={setEditingTask}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          setEditingTask={setEditingTask}
        />
      )}
    </div>
  );
}

export default App;
