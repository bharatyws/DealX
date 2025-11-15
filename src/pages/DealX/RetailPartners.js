import React, { useEffect, useState, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";

// --- FIREBASE CONFIG START ---
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, remove } from "firebase/database";
import { ref, set, remove } from "firebase/database";
import { database } from "../../firebase"; // Adjust path if Agent.js is in 'src/pages/DealX/'


// const firebaseConfig = {
//   apiKey: "AIzaSyBfU5o0rgjIXHnneG1-VdGT9iE-Kmcegfg",
//   authDomain: "dealx-5f4fb.firebaseapp.com",
//   databaseURL: "https://dealx-5f4fb-default-rtdb.firebaseio.com",
//   projectId: "dealx-5f4fb",
//   storageBucket: "dealx-5f4fb.appspot.com",
//   messagingSenderId: "47578681635",
//   appId: "1:47578681635:web:a302c00e5ed0d74d79fc96",
//   measurementId: "G-9XWJ8YSVGZ",
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// --- FIREBASE CONFIG END ---

export default function RetailPartners() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    aadhar: "",
    address: "",
    agent: "",
    email: "",
    gstin: "",
    name: "",
    pan: "",
    password: "",
    phone: "",
    rm: "",
    shopName: "",
  });

  const API_URL = "https://usethecred.com/api/Retailer.php";

  // ✅ Fetch data
  const fetchRetailers = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setRetailers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching retailers:", err));
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  // ✅ Add or Update
  const handleSubmit = () => {
    const method = editData ? "PUT" : "POST";
    fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData ? { ...formData, id: editData.id } : formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (formData.phone) {
          set(ref(database, "Retailers/" + formData.phone), {
            ...formData,
            id: editData ? editData.id : (data?.id || formData.phone)
          })
            .then(() => {
              setShowModal(false);
              setFormData({
                aadhar: "",
                address: "",
                agent: "",
                email: "",
                gstin: "",
                name: "",
                pan: "",
                password: "",
                phone: "",
                rm: "",
                shopName: "",
              });
              setEditData(null);
              fetchRetailers();
            })
            .catch((error) => {
              alert("Firebase Error: " + error.message);
            });
        } else {
          alert("Enter a phone number to save in Firebase.");
        }
      });
  };

  // ✅ Delete retailer from Hostinger then from Firebase
  const handleDelete = (id) => {
    const retailerToDelete = retailers.find(r => r.id === id);
    if (!retailerToDelete) return alert("Retailer not found!");
    if (!window.confirm("Are you sure you want to delete this retailer?")) return;
    fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}`,
    })
      .then(() => {
        if (retailerToDelete.phone)
          remove(ref(database, `Retailers/${retailerToDelete.phone}`));
        fetchRetailers();
      });
  };

  // ✅ Table Columns (matching your database)
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "aadhar", header: "Aadhar" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "agent", header: "Agent" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "gstin", header: "GSTIN" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "pan", header: "PAN" },
      { accessorKey: "password", header: "Password" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "rm", header: "RM" },
      { accessorKey: "shopName", header: "Shop Name" },
      { accessorKey: "created_at", header: "Created At" },
      {
        header: "Action",
        Cell: ({ row }) => (
          <>
            <button
              onClick={() => {
                setEditData(row.original);
                setFormData(row.original);
                setShowModal(true);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                marginLeft: "8px",
              }}
            >
              🗑️
            </button>
          </>
        ),
      },
    ],
    []
  );

  // ✅ CSV Export
  const csvConfig = mkConfig({
    filename: "retailers",
    useKeysAsHeaders: true,
  });

  const handleExportCSV = () => {
    const csv = generateCsv(csvConfig)(retailers);
    download(csvConfig)(csv);
  };

  if (loading) return <p>Loading retailers...</p>;

  return (
    <div className="page-bg">
      <div className="title-header">
        <div className="title-icon">
          <h2 className="page-title">Retail Partners</h2>
        </div>
        <button
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => setShowModal(true)}
        >
          ➕ Add Retailer
        </button>
      </div>
      <div className="table-cntnr" style={{ width: "100%", overflowX: "auto" }}>
        <MaterialReactTable
          columns={columns}
          data={retailers}
          enableSorting
          enableGlobalFilter
          enablePagination
          enableColumnOrdering
          muiTableContainerProps={{ sx: { minWidth: "1200px" } }}
          muiTableBodyCellProps={{ sx: { whiteSpace: "nowrap" } }}
          renderTopToolbarCustomActions={() => (
            <button
              onClick={handleExportCSV}
              style={{
                background: "#1976d2",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Export CSV
            </button>
          )}
        />
      </div>

      {/* ✅ Modal Popup with Labels */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>
              {editData ? "Edit Retailer" : "Add Retailer"}
            </h3>
            {/* Form Fields */}
            {[
              { label: "Aadhar", name: "aadhar" },
              { label: "Address", name: "address" },
              { label: "Agent", name: "agent" },
              { label: "Email", name: "email", type: "email" },
              { label: "GSTIN", name: "gstin" },
              { label: "Name", name: "name" },
              { label: "PAN", name: "pan" },
              { label: "Password", name: "password", type: "password" },
              { label: "Phone", name: "phone" },
              { label: "RM", name: "rm" },
              { label: "Shop Name", name: "shopName" },
            ].map(field => (
              <div style={formGroupStyle} key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type={field.type || "text"}
                  value={formData[field.name]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  required={field.name === "phone" || field.name === "name"}
                  disabled={field.name === "phone" && !!editData}
                  style={inputStyle}
                />
              </div>
            ))}
            <button
              style={{
                background: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "20px",
                width: "100%",
              }}
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const formGroupStyle = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "500",
  fontSize: "14px",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "14px",
};