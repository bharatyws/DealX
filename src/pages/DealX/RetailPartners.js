import React, { useEffect, useState, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";

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

  // ✅ Fetch data
  const fetchRetailers = () => {
    fetch("https://usethecred.com/api/Retailer.php")
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
    fetch("https://usethecred.com/api/Retailer.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData ? { ...formData, id: editData.id } : formData),
    })
      .then((res) => res.json())
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
      });
  };

  // ✅ Delete retailer
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this retailer?")) return;
    fetch("https://usethecred.com/api/Retailer.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}`,
    }).then(() => fetchRetailers());
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

            {/* Aadhar */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Aadhar</label>
              <input
                value={formData.aadhar}
                onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Address */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Address</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Agent */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Agent</label>
              <input
                value={formData.agent}
                onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* GSTIN */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>GSTIN</label>
              <input
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Name */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* PAN */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>PAN</label>
              <input
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* RM */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>RM (Relationship Manager)</label>
              <input
                value={formData.rm}
                onChange={(e) => setFormData({ ...formData, rm: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Shop Name */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Shop Name</label>
              <input
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                style={inputStyle}
              />
            </div>

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
