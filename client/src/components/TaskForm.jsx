import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

function TaskForm({ onCreate, onUpdate, editingTask, setEditingTask }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "todo",
        priority: editingTask.priority || "medium",
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().slice(0, 10)
          : "",
      });
    } else {
      setForm(initialForm);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
    };

    if (editingTask) {
      onUpdate(editingTask._id, payload);
      setEditingTask(null);
    } else {
      onCreate(payload);
    }
    setForm(initialForm);
  };

  return (
    <section className="task-form">
      <h2>{editingTask ? " Edit Task" : " Add New Task"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Task title (e.g., Fix homepage bug)"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Detailed description of the task..."
          value={form.description}
          onChange={handleChange}
        />
        <div className="row">
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical Priority</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>
        <div className="row" style={{gridTemplateColumns: editingTask ? '1fr 1fr' : '1fr', gap: '1rem'}}>
          <button type="submit">
            {editingTask ? "Update Task" : "Create Task"}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="secondary"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;