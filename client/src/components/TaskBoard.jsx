// Column Component (Helper)
function Column({
  title,
  statusKey,
  tasks,
  onUpdateTask,
  onDeleteTask,
  setEditingTask, // Added for edit functionality
}) {
  // Filter tasks belonging to this column
  const columnTasks = tasks.filter((t) => t.status === statusKey);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    onUpdateTask(id, { status: statusKey });
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="kanban-column" onDrop={handleDrop} onDragOver={handleDragOver}>
      <h3>{title} ({columnTasks.length})</h3>

      {columnTasks.map((t) => (
        <div
          key={t._id}
          className="task-card"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", t._id)}
          onClick={() => setEditingTask(t)} // Click to edit
        >
          <div className="task-header">
            <strong>{t.title}</strong>
            <span className={`priority ${t.priority}`}>
              {t.priority}
            </span>
          </div>

          {t.dueDate && (
            <p className="due-date">
              Due: {new Date(t.dueDate).toLocaleDateString()}
            </p>
          )}

          <div className="task-actions">
            {/* Action buttons visible only when not editing */}
            {statusKey === "todo" && (
              <button
                className="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateTask(t._id, { status: "in_progress" });
                }}
              >
                Start
              </button>
            )}

            {statusKey === "in_progress" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateTask(t._id, { status: "done" });
                }}
              >
                Complete
              </button>
            )}

            <button
              className="secondary"
              onClick={(e) => {
                e.stopPropagation(); // Stop card click (edit) action
                onDeleteTask(t._id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// TaskBoard Component (Main Export)
function TaskBoard({ tasks, onUpdateTask, onDeleteTask, setEditingTask }) {
  return (
    <section className="task-board">
      <Column
        title="To Do"
        statusKey="todo"
        tasks={tasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        setEditingTask={setEditingTask}
      />

      <Column
        title="In Progress"
        statusKey="in_progress"
        tasks={tasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        setEditingTask={setEditingTask}
      />

      <Column
        title="Done"
        statusKey="done"
        tasks={tasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        setEditingTask={setEditingTask}
      />
    </section>
  );
}

export default TaskBoard;