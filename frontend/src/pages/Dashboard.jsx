import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000";

const Dashboard = () => {
  const { logout } = useAuth();
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | completed | pending

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ---------------- PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/profile`, authHeader);
      setUser(data);
      setProfileName(data.name);
      setProfileEmail(data.email);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  /* ---------------- TASKS ---------------- */
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${API}/api/tasks`, authHeader);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const createTask = async () => {
    if (!newTask.trim()) return;
    try {
      const { data } = await axios.post(
        `${API}/api/tasks`,
        { title: newTask },
        authHeader
      );
      setTasks([data, ...tasks]);
      setNewTask("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const { data } = await axios.put(
        `${API}/api/tasks/${task._id}`,
        { completed: !task.completed },
        authHeader
      );
      setTasks(tasks.map((t) => (t._id === task._id ? data : t)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, authHeader);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      alert("Name and email cannot be empty.");
      return;
    }

    setUpdating(true);
    try {
      const { data } = await axios.put(
        `${API}/api/users/profile`,
        { name: profileName, email: profileEmail },
        authHeader
      );

      setUser(data);
      localStorage.setItem("user", JSON.stringify({ ...userData, ...data }));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  // Fetch profile once
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch tasks when dashboard or tasks tab is active
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "tasks") {
      fetchTasks();
    }
  }, [activeTab]);

  // Filtered and searched tasks for dashboard display
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "completed") return matchesSearch && task.completed;
    if (filterStatus === "pending") return matchesSearch && !task.completed;
    return matchesSearch; // all
  });

  const completedTasks = filteredTasks.filter((t) => t.completed);
  const pendingTasks = filteredTasks.filter((t) => !t.completed);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-indigo-600 text-white flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-16"} shrink-0`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <span className="text-xl font-bold">MyApp 🚀</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white text-xl focus:outline-none"
          >
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2 mt-4">
          {["dashboard", "tasks", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab ? "bg-indigo-700" : "hover:bg-indigo-500"
              }`}
            >
              <span className={`${!sidebarOpen && "hidden"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg"
          >
            {sidebarOpen ? "Logout" : "⏻"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <span className="text-sm text-gray-600 break-words">{user?.email}</span>
        </header>

        <main className="p-6 flex-1 overflow-auto space-y-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Stat title="Total Tasks" value={tasks.length} />
                <Stat title="Completed" value={tasks.filter(t => t.completed).length} color="green" />
                <Stat title="Pending" value={tasks.filter(t => !t.completed).length} color="yellow" />
              </div>

              {/* Filter & Search UI */}
              <div className="bg-white p-4 rounded-xl shadow mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="all">All Tasks</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Task Lists */}
              <div className="bg-white p-4 rounded-xl shadow mt-4">
                <h3 className="text-lg font-semibold mb-2">Completed Tasks ✅</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {completedTasks.length === 0 ? (
                    <li>No completed tasks</li>
                  ) : (
                    completedTasks.map((t) => <li key={t._id}>{t.title}</li>)
                  )}
                </ul>

                <h3 className="text-lg font-semibold mt-4 mb-2">Pending Tasks ⏳</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {pendingTasks.length === 0 ? (
                    <li>No pending tasks</li>
                  ) : (
                    pendingTasks.map((t) => <li key={t._id}>{t.title}</li>)
                  )}
                </ul>
              </div>
            </>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <div className="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold mb-4">Tasks</h2>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="New task..."
                  className="flex-1 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={createTask}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>

              <ul className="divide-y">
                {tasks.map((task) => (
                  <li
                    key={task._id}
                    className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <span
                        style={{
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "#6B7280" : "#1F2937",
                        }}
                        className="leading-relaxed break-words"
                      >
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="text-red-500 text-sm hover:text-red-600 mt-2 md:mt-0"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                  {profileName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{profileName}</h2>
                  <p className="text-sm text-gray-500 break-words">{profileEmail}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <label className="text-sm text-gray-600">Email</label>
                <input
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                onClick={updateProfile}
                disabled={updating}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Stat = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "text-gray-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${colors[color] || colors.gray}`}>
        {value}
      </p>
    </div>
  );
};

export default Dashboard;
