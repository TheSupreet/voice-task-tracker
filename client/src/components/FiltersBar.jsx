function FiltersBar({ filters, setFilters }) {
  return (
    <div className="filters-bar">
      <select
        value={filters.status}
        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
      >
        <option value="">Status: All</option>
        <option value="todo">Status: To Do</option>
        <option value="in_progress">Status: In Progress</option>
        <option value="done">Status: Done</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) =>
          setFilters((f) => ({ ...f, priority: e.target.value }))
        }
      >
        <option value="">Priority: All</option>
        <option value="low">Priority: Low</option>
        <option value="medium">Priority: Medium</option>
        <option value="high">Priority: High</option>
        <option value="critical">Priority: Critical</option>
      </select>

      <input
        type="text"
        placeholder=" Search title or description..."
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
      />
    </div>
  );
}

export default FiltersBar;
