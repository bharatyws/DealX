import React, { useState, useEffect, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ref, set, remove } from "firebase/database";
import { database } from "../../firebase";

const API_URL = "https://usethecred.com/api/loanBook.php";

// Firebase payload cleaner
function cleanObject(obj) {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    cleaned[key] = obj[key] === undefined ? "" : obj[key];
  });
  return cleaned;
}

// Consistent date display function
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("-");
      const dt = new Date(`${y}-${m}-${d}`);
      return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } else {
      return dateStr;
    }
  } catch (e) {
    return dateStr;
  }
}

export default function LoanBook() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    pan: "",
    dateonly: "",
    currentTime: "",
    itemName: "",
    itemserial: "",
    itemValue: "",
    downpayment: "",
    selectedLoanAmount: "",
    selectedTenure: "",
    shopName: "",
    status: "OPEN",
    creator: "",
    creatorid: "",
    keysValue: "",
    photoWithDevice_url: "",
  });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setLoans(Array.isArray(data) ? data : []))
      .catch((err) => {
        setLoans([]);
        setLoading(false);
        alert("Could not load loans from server: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    const loanToDelete = loans.find(l => l.id === id);
    if (!loanToDelete) return alert("Loan not found!");
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
      .then(() => {
        remove(ref(database, `Loans/${id}`));
        setLoans((prev) => prev.filter((l) => l.id !== id));
      });
  };

  const handleEdit = (loan) => {
    setEditLoan(loan);
    setFormData(loan);
    setShowPopup(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editLoan ? "PUT" : "POST";
    fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editLoan ? { ...formData, id: editLoan.id } : formData),
    })
      .then((res) => res.json())
      .then((data) => {
        const firebaseId = editLoan ? editLoan.id : data.id || formData.phone;
        set(ref(database, "Loans/" + firebaseId), cleanObject(formData))
          .then(() => {
            if (editLoan) {
              setLoans((prev) =>
                prev.map((l) =>
                  l.id === editLoan.id
                    ? { ...l, ...formData }
                    : l
                )
              );
            } else {
              setLoans((prev) => [
                {
                  id: data.id,
                  ...formData,
                },
                ...prev,
              ]);
            }
            setShowPopup(false);
            setFormData({
              customerName: "",
              phone: "",
              pan: "",
              dateonly: "",
              currentTime: "",
              itemName: "",
              itemserial: "",
              itemValue: "",
              downpayment: "",
              selectedLoanAmount: "",
              selectedTenure: "",
              shopName: "",
              status: "OPEN",
              creator: "",
              creatorid: "",
              keysValue: "",
              photoWithDevice_url: "",
            });
            setEditLoan(null);
          })
          .catch((error) => {
            alert("Firebase Error: " + error.message);
          });
      });
  };

  // ----- Loan Details: Single Calculation Block -----
  let loanDetailView = null;
  if (selectedLoan) {
    // Read user variables once
    const itemValue = Number(selectedLoan.itemValue) || 0;
    const downpayment = Number(selectedLoan.downpayment) || 0;
    const netDisbursal = itemValue - downpayment;
    // const loanAmount = (netDisbursal * 100) / 98 + 250;
    const loanAmount = Math.ceil((netDisbursal * 100) / 98 + 250);
    const pf = loanAmount - netDisbursal;
    const roiAnnual = 0.18;
    const roiDaily = roiAnnual / 365;
    const numEmis = Number(selectedLoan.selectedTenure);

    // Dates: parse and anchor once
    let loanDt;
    if (selectedLoan.dateonly?.includes('-')) {
      const parts = selectedLoan.dateonly.split('-');
      if (parts[0].length === 4) loanDt = new Date(selectedLoan.dateonly);
      else loanDt = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      loanDt = new Date();
    }
    let loanDay = loanDt.getDate();
    let anchorDay = 30;
    if (loanDay >= 1 && loanDay <= 10) anchorDay = 10;
    else if (loanDay >= 11 && loanDay <= 20) anchorDay = 20;

    let firstEmiDate = new Date(loanDt);
    firstEmiDate.setMonth(firstEmiDate.getMonth() + 1);
    firstEmiDate.setDate(anchorDay);

    let lastEmiDate = new Date(firstEmiDate);
    lastEmiDate.setMonth(lastEmiDate.getMonth() + (numEmis - 1));
    lastEmiDate.setDate(anchorDay);

    const tenureDays = Math.round((lastEmiDate - loanDt) / (1000 * 60 * 60 * 24) + 1);

    const normalInterest = loanAmount * roiDaily * tenureDays;
    const emiAmount = Math.round((loanAmount + normalInterest) / numEmis);
    const repaymentAmount = emiAmount * numEmis;
    const totalInterest = repaymentAmount - loanAmount;

    const emiSchedule = (() => {
      let emiDate = new Date(firstEmiDate);
      let balance = repaymentAmount;
      const emiList = [];
      for (let i = 1; i <= numEmis; i++) {
        balance = i === 1
          ? repaymentAmount - emiAmount
          : balance - emiAmount;
        if (i === numEmis) balance = 0;
        const principal = (loanAmount / numEmis);
        const monthlyInterest = (emiAmount - principal);
        // const principal = emiAmount - monthlyInterest;
        
        emiList.push({
          no: i,
          date: emiDate.toDateString(),
          emi: emiAmount,
          interest: monthlyInterest,
          principal: principal,
          balance: balance < 0 ? 0 : balance
        });
        emiDate = new Date(emiDate); // clone for next month
        emiDate.setMonth(emiDate.getMonth() + 1);
        emiDate.setDate(anchorDay);
      }
      return emiList;
    })();

    loanDetailView = (
      <div className="loan-detail-page" style={{ padding: 32, background: "#fff" }}>
        <button onClick={() => setSelectedLoan(null)} style={{
          marginBottom: 16,
          background: "#eee",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>← Back to Loan Book</button>
        <h2>Loan Details</h2>
        <table>
          <tbody>
            <tr><td>Customer Name:</td><td>{selectedLoan.customerName}</td></tr>
            <tr><td>Loan Amount:</td><td>₹{loanAmount.toFixed(2)}</td></tr>
            <tr><td>Processing Fee:</td><td>₹{pf.toFixed(2)}</td></tr>
            <tr><td>Annual ROI:</td><td>{(roiAnnual * 100).toFixed(2)}%</td></tr>
            <tr><td>Down Payment:</td><td>₹{selectedLoan.downpayment}</td></tr>
            <tr><td>Loan Date:</td><td>{formatDate(selectedLoan.dateonly)}</td></tr>
            <tr><td>Tenure:</td><td>{numEmis} months</td></tr>
            <tr><td>Tenure Days:</td><td>{tenureDays}</td></tr>
            <tr><td>EMI Amount:</td><td>₹{emiAmount}</td></tr>
            <tr><td>Total Repayment:</td><td>₹{repaymentAmount}</td></tr>
            <tr><td>Normal Interest:</td><td>₹{totalInterest.toFixed(2)}</td></tr>
            <tr><td>Status:</td>
              <td>
                <span style={{
                  color: selectedLoan.status === "CLOSE" ? "red" : "green",
                  fontWeight: "bold"
                }}>
                  {selectedLoan.status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <h3 style={{marginTop: 24}}>EMI Schedule</h3>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>No</th>
              <th>EMI Date</th>
              <th>EMI (₹)</th>
              <th>Interest (₹)</th>
              <th>Principal (₹)</th>
              <th>Balance (₹)</th>
              <th>Collection Date</th>
              <th>Collection (₹)</th>
              <th>Loan Status</th>
            </tr>
          </thead>
          <tbody>
            {emiSchedule.map(e => (
              <tr key={e.no}>
                <td>{e.no}</td>
                <td>{e.date}</td>
                <td>{e.emi}</td>
                <td>{e.interest.toFixed(2)}</td>
                <td>{e.principal.toFixed(2)}</td>
                <td>{e.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "actions",
        header: "Action",
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px"
              }}
              title="View"
              onClick={() => setSelectedLoan(row.original)}
            >
              👁️
            </button>
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                color: "#7c3aed"
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
                color: "#ef4444"
              }}
              title="Delete"
              onClick={() => handleDelete(row.original.id)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
      { accessorKey: "id", header: "ID" },
      { accessorKey: "customerName", header: "Customer Name" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "pan", header: "PAN" },
      {
        accessorKey: "dateonly",
        header: "Loan Date",
        Cell: ({ cell }) => formatDate(cell.getValue())
      },
      { accessorKey: "currentTime", header: "Current Time" },
      { accessorKey: "itemName", header: "Item Name" },
      { accessorKey: "itemserial", header: "Item Serial" },
      { accessorKey: "itemValue", header: "Item Value" },
      { accessorKey: "downpayment", header: "Down Payment" },
      { accessorKey: "selectedLoanAmount", header: "Loan Amount" },
      { accessorKey: "selectedTenure", header: "Tenure" },
      { accessorKey: "shopName", header: "Shop Name" },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => (
          <span style={{
            color: cell.getValue() === "CLOSE" ? "red" : "green",
            fontWeight: "bold"
          }}>
            {cell.getValue()}
          </span>
        )
      },
      { accessorKey: "creator", header: "Creator" },
      { accessorKey: "creatorid", header: "Creator ID" },
      { accessorKey: "keysValue", header: "Keys Value" },
      { accessorKey: "photoWithDevice_url", header: "Photo With Device URL" },
    ], []
  );

  if (loading) return <p>Loading loans...</p>;

  return (
    <div className="page-bg">
      {selectedLoan ? (
        loanDetailView
      ) : (
        <>
          <div className="title-header">
            <div className="title-icon">
              <h2 className="page-title">Loan Book</h2>
            </div>
            <button
              className="add-btn"
              onClick={() => {
                setEditLoan(null);
                setFormData({
                  customerName: "",
                  phone: "",
                  pan: "",
                  dateonly: "",
                  currentTime: "",
                  itemName: "",
                  itemserial: "",
                  itemValue: "",
                  downpayment: "",
                  selectedLoanAmount: "",
                  selectedTenure: "",
                  shopName: "",
                  status: "OPEN",
                  creator: "",
                  creatorid: "",
                  keysValue: "",
                  photoWithDevice_url: "",
                });
                setShowPopup(true);
              }}
            >
              + Add Loan
            </button>
          </div>

          <div className="table-cntnr" style={{ overflowX: "auto" }}>
            <MaterialReactTable columns={columns} data={loans} />
          </div>

          {showPopup && (
            <div
              className="modal-bg"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                zIndex: 9999,
                overflowY: "auto",
              }}
            >
              <div
                className="modal-box"
                style={{
                  marginTop: 48,
                  background: "#fff",
                  padding: "32px 24px",
                  borderRadius: "12px",
                  maxWidth: "520px",
                  width: "95vw",
                  maxHeight: "82vh",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  overflowY: "auto",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <button
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                  onClick={() => setShowPopup(false)}
                >
                  ✖
                </button>
                <h3 style={{ margin: "0 0 18px 0", textAlign: "center" }}>
                  {editLoan ? "Edit Loan" : "Add Loan"}
                </h3>
                <form onSubmit={handleSubmit} style={{flex: 1, display: "flex", flexDirection: "column"}}>
                  {[
                    { label: "Customer Name", name: "customerName" },
                    { label: "Phone", name: "phone" },
                    { label: "PAN", name: "pan" },
                    { label: "Loan Date", name: "dateonly", type: "date" },
                    { label: "Current Time", name: "currentTime" },
                    { label: "Item Name", name: "itemName" },
                    { label: "Item Serial", name: "itemserial" },
                    { label: "Item Value", name: "itemValue" },
                    { label: "Down Payment", name: "downpayment" },
                    { label: "Loan Amount", name: "selectedLoanAmount" },
                    { label: "Tenure", name: "selectedTenure" },
                    { label: "Shop Name", name: "shopName" },
                    { label: "Status", name: "status", type: "select", options: ["OPEN", "CLOSE"] },
                    { label: "Creator", name: "creator" },
                    { label: "Creator ID", name: "creatorid" },
                    { label: "Keys Value", name: "keysValue" },
                    { label: "Photo With Device URL", name: "photoWithDevice_url" },
                  ].map(field =>
                    field.type === "select" ? (
                      <div className="form-group" key={field.name} style={{marginBottom: 12}}>
                        <label>{field.label}</label>
                        <select
                          value={formData[field.name] || ""}
                          onChange={e =>
                            setFormData({ ...formData, [field.name]: e.target.value })
                          }
                        >
                          {field.options.map(opt =>
                            <option value={opt} key={opt}>{opt}</option>
                          )}
                        </select>
                      </div>
                    ) : (
                      <div className="form-group" key={field.name} style={{marginBottom: 12}}>
                        <label>{field.label}</label>
                        <input
                          type={field.type || "text"}
                          value={formData[field.name] || ""}
                          onChange={e =>
                            setFormData({ ...formData, [field.name]: e.target.value })
                          }
                          required={field.name === "customerName" || field.name === "phone"}
                          disabled={field.name === "phone" && !!editLoan}
                          style={{padding: "8px", width: "100%", borderRadius: "5px", border: "1px solid #ddd"}}
                        />
                      </div>
                    )
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
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
                      {editLoan ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
