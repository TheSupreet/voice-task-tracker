import React from "react";

// Helper component for status visualization
const StatusDisplay = ({ status }) => {
  let statusText = status.replace(/_/g, " ");
  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <span className={`status-dot ${status}`}></span>
      {statusText}
    </span>
  );
};

function TaskList({ tasks, onUpdateTask, onDeleteTask, setEditingTask }) {
  if (!tasks.length) {
    return (
      <section className="task-list">
        <p>No tasks found matching the current filters.</p>
      </section>
    );
  }

  return (
    <section className="task-list">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id}>
              <td
                onClick={() => setEditingTask(t)}
                style={{ cursor: "pointer", fontWeight: "500" }}
              >
                {t.title}
              </td>
              <td>
                <span className={`priority ${t.priority}`}>{t.priority}</span>
              </td>
              <td>
                <StatusDisplay status={t.status} />
              </td>
              <td>
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}
              </td>
              <td className="list-actions">
                {/* Only show status change action if not 'done' */}
                {t.status !== "done" && (
                  <button
                    onClick={() =>
                      onUpdateTask(t._id, {
                        status: t.status === "todo" ? "in_progress" : "done",
                      })
                    }
                    className={t.status === "todo" ? "secondary" : ""}
                  >
                    {t.status === "todo" ? "Start" : "Complete"}
                  </button>
                )}
                <button
                  className="secondary"
                  onClick={() => onDeleteTask(t._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default TaskList;
