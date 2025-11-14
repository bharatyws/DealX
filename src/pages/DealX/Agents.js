import React, { useState, useEffect, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";
import { FaEdit, FaTrash } from "react-icons/fa";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBfU5o0rgjIXHnneG1-VdGT9iE-Kmcegfg",
  authDomain: "dealx-5f4fb.firebaseapp.com",
  databaseURL: "https://dealx-5f4fb-default-rtdb.firebaseio.com",
  projectId: "dealx-5f4fb",
  storageBucket: "dealx-5f4fb.firebasestorage.app",
  messagingSenderId: "47578681635",
  appId: "1:47578681635:web:a302c00e5ed0d74d79fc96",
  measurementId: "G-9XWJ8YSVGZ",
};

const API_URL = "https://usethecred.com/api/Agent.php";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Agent() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    agent_id: "",
    phone: "",
    email: "",
    password: "",
    status: "Active",
  });

  // Fetch agents from Hostinger
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch((err) => {
        setAgents([]);
        setLoading(false);
        alert("Could not load agents from Hostinger: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Delete from Hostinger then from Firebase (using phone as Firebase key)
  const handleDelete = (id) => {
    const agentToDelete = agents.find(a => a.id === id);
    if (!agentToDelete) return alert("Agent not found!");
    if (!window.confirm("Are you sure you want to delete this agent?")) return;

    fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
      .then(() => {
        if (agentToDelete.phone)
          remove(ref(database, `Agents/${agentToDelete.phone}`));
        setAgents((prev) => prev.filter((a) => a.id !== id));
      });
  };

  const handleEdit = (agent) => {
    setEditAgent(agent);
    setFormData(agent);
    setShowPopup(true);
  };

  // Save or modify both in Hostinger and Firebase
  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editAgent ? "PUT" : "POST";
    fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAgent ? { ...formData, id: editAgent.id } : formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (formData.phone) {
          set(ref(database, "Agents/" + formData.phone), {
            ...formData,
            total_leads: editAgent ? editAgent.total_leads : 0,
            total_commission: editAgent ? editAgent.total_commission : 0,
          })
            .then(() => {
              if (editAgent) {
                setAgents((prev) =>
                  prev.map((a) =>
                    a.id === editAgent.id
                      ? { ...a, ...formData }
                      : a
                  )
                );
              } else {
                setAgents((prev) => [
                  {
                    id: data.id,
                    total_leads: 0,
                    total_commission: 0,
                    ...formData,
                  },
                  ...prev,
                ]);
              }
              setShowPopup(false);
              setFormData({
                name: "",
                agent_id: "",
                phone: "",
                email: "",
                password: "",
                status: "Active",
              });
              setEditAgent(null);
            })
            .catch((error) => {
              alert("Firebase Error: " + error.message);
            });
        } else {
          alert("Enter a phone number to save in Firebase.");
        }
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "actions",
        header: "Action",
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                color: "#7c3aed",
              }}
              title="Edit"
              onClick={() => handleEdit(row.original)}
            >
              <FaEdit />
            </button>
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                color: "#ef4444",
              }}
              title="Delete"
              onClick={() => handleDelete(row.original.id)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "agent_id", header: "Agent ID" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "phone", header: "Phone Number" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "total_leads", header: "Total Leads" },
      {
        accessorKey: "total_commission",
        header: "Total Commission",
        Cell: ({ cell }) => `₹${cell.getValue() || 0}`,
      },
    ],
    []
  );

  if (loading) return <p>Loading agents...</p>;

  return (
    <div className="page-bg">
      <div className="title-header">
        <div className="title-icon">
          <h2 className="page-title">Agents</h2>
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setEditAgent(null);
            setFormData({
              name: "",
              agent_id: "",
              phone: "",
              email: "",
              password: "",
              status: "Active",
            });
            setShowPopup(true);
          }}
        >
          + Add Agent
        </button>
      </div>

      <div className="table-cntnr" style={{ overflowX: "auto" }}>
        <MaterialReactTable columns={columns} data={agents} />
      </div>

      {showPopup && (
        <div className="modal-bg">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <h3 style={{ marginBottom: "20px" }}>
              {editAgent ? "Edit Agent" : "Add Agent"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Agent ID</label>
                <input
                  value={formData.agent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, agent_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  disabled={!!editAgent}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    borderRadius: "5px",
                    padding: "8px 16px",
                    color: "#222",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#7c3aed",
                    border: "none",
                    color: "#fff",
                    borderRadius: "5px",
                    padding: "8px 16px",
                  }}
                >
                  {editAgent ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
