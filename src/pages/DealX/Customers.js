// src/pages/DealX/Customers.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Customer Profile View
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  
  // Loan Detail Popup
  const [showLoanDetail, setShowLoanDetail] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const loanDetailRef = useRef(null);

  // Fetch customers
  useEffect(() => {
    fetch("https://usethecred.com/api/customer.php")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  }, []);

  // Fetch customer's loan history by PAN
  const fetchCustomerLoans = (pan) => {
    setLoadingLoans(true);
    fetch("https://usethecred.com/api/loanBook.php")
      .then((res) => res.json())
      .then((data) => {
        const loans = Array.isArray(data) ? data : [];
        const filtered = loans.filter((loan) => loan.pan === pan);
        setCustomerLoans(filtered);
        setLoadingLoans(false);
      })
      .catch((err) => {
        console.error("Error fetching loans:", err);
        setLoadingLoans(false);
      });
  };

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerLoans(customer.pan);
    setShowProfile(true);
  };

  const handleBackToTable = () => {
    setShowProfile(false);
    setSelectedCustomer(null);
    setCustomerLoans([]);
  };

  const handleViewLoanDetail = (loan) => {
    setSelectedLoan(loan);
    setShowLoanDetail(true);
  };

  const handleCloseLoanDetail = () => {
    setShowLoanDetail(false);
    setSelectedLoan(null);
  };

  const handleDownloadLoanDetail = () => {
    if (loanDetailRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Loan Application - ${selectedLoan?.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f3f4f6; font-weight: 600; }
              .header { text-align: center; margin-bottom: 30px; }
              .company { font-size: 16px; font-weight: bold; }
              .address { font-size: 12px; color: #666; }
              .section-title { font-size: 14px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            ${loanDetailRef.current.innerHTML}
            <script>
              window.print();
              window.close();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleView = (filePath) => {
    if (filePath) {
      setSelectedFile(filePath);
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <button
            onClick={() => handleViewProfile(row.original)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            👁️
          </button>
        ),
      },
      { accessorKey: "id", header: "ID" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "aadhaar", header: "Aadhaar" },
      { accessorKey: "pan", header: "PAN" },
      { accessorKey: "phone", header: "Phone" },
    ],
    []
  );

  if (loading) return <p>Loading customers...</p>;

  return (
    <div className="page-bg">
      {showProfile && selectedCustomer ? (
        <div>
          <div className="title-header">
            <div className="title-icon">
              <button
                onClick={handleBackToTable}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                  marginRight: "12px",
                }}
              >
                ← Back
              </button>
              <h2 className="page-title">Customer Profile</h2>
            </div>
          </div>

          <div style={profileStyles.container}>
            {/* Customer Details Sections (same as before) */}
            <div style={profileStyles.row}>
              <div style={profileStyles.photoContainer}>
                {selectedCustomer.customerPic_url ? (
                  <img
                    src={selectedCustomer.customerPic_url}
                    alt="Customer"
                    style={profileStyles.photo}
                  />
                ) : (
                  <div style={profileStyles.photoPlaceholder}>No Photo</div>
                )}
              </div>
              <div style={profileStyles.infoBox}>
                <h2 style={profileStyles.name}>{selectedCustomer.customerName}</h2>
                <div style={profileStyles.field}>
                  <label style={profileStyles.label}>Phone Number</label>
                  <p style={profileStyles.value}>{selectedCustomer.phone}</p>
                </div>
                <div style={profileStyles.field}>
                  <label style={profileStyles.label}>Address</label>
                  <p style={profileStyles.value}>
                    {selectedCustomer.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div style={profileStyles.row}>
              <div style={profileStyles.halfBox}>
                <div style={profileStyles.field}>
                  <label style={profileStyles.label}>Aadhaar Number</label>
                  <p style={profileStyles.value}>{selectedCustomer.aadhaar}</p>
                </div>
                <div style={profileStyles.docButtons}>
                  {selectedCustomer.front_url && (
                    <button
                      style={profileStyles.docBtn}
                      onClick={() => handleView(selectedCustomer.front_url)}
                    >
                      📄 View Front ID
                    </button>
                  )}
                  {selectedCustomer.back_url && (
                    <button
                      style={profileStyles.docBtn}
                      onClick={() => handleView(selectedCustomer.back_url)}
                    >
                      📄 View Back ID
                    </button>
                  )}
                </div>
              </div>
              <div style={profileStyles.halfBox}>
                <div style={profileStyles.field}>
                  <label style={profileStyles.label}>PAN Number</label>
                  <p style={profileStyles.value}>{selectedCustomer.pan}</p>
                </div>
              </div>
            </div>

            <div style={profileStyles.gridSection}>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>Income</label>
                <p style={profileStyles.value}>₹{selectedCustomer.income || "N/A"}</p>
              </div>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>Mode</label>
                <p style={profileStyles.value}>{selectedCustomer.mode || "N/A"}</p>
              </div>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>Employment</label>
                <p style={profileStyles.value}>{selectedCustomer.employment || "N/A"}</p>
              </div>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>Employer</label>
                <p style={profileStyles.value}>{selectedCustomer.employer || "N/A"}</p>
              </div>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>Created At</label>
                <p style={profileStyles.value}>{selectedCustomer.created_at || "N/A"}</p>
              </div>
              <div style={profileStyles.gridItem}>
                <label style={profileStyles.label}>UTC Score</label>
                <p style={profileStyles.value}>{selectedCustomer.created_at || "N/A"}</p>
              </div>
            </div>

            {/* Loan Details Section with Count */}
            <div style={profileStyles.loanSection}>
              <h3 style={profileStyles.sectionTitle}>
                Loan Details ({customerLoans.length})
              </h3>
              {loadingLoans ? (
                <p>Loading loan details...</p>
              ) : customerLoans.length > 0 ? (
                <table style={profileStyles.loanTable}>
                  <thead>
                    <tr>
                      <th style={profileStyles.th}>Loan ID</th>
                      <th style={profileStyles.th}>Item</th>
                      <th style={profileStyles.th}>Loan Amount</th>
                      <th style={profileStyles.th}>Tenure</th>
                      <th style={profileStyles.th}>Status</th>
                      <th style={profileStyles.th}>Created</th>
                      <th style={profileStyles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td style={profileStyles.td}>{loan.id}</td>
                        <td style={profileStyles.td}>{loan.itemName}</td>
                        <td style={profileStyles.td}>₹{loan.selectedLoanAmount}</td>
                        <td style={profileStyles.td}>{loan.selectedTenure} months</td>
                        <td style={profileStyles.td}>
                          <span
                            style={{
                              color: loan.status === "CLOSE" ? "#ef4444" : "#10b981",
                              fontWeight: "600",
                            }}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td style={profileStyles.td}>{loan.created_at}</td>
                        <td style={profileStyles.td}>
                          <button
                            style={profileStyles.viewBtn}
                            onClick={() => handleViewLoanDetail(loan)}
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={profileStyles.noLoans}>No loan details found</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="title-header">
            <div className="title-icon">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="16" stroke="black" strokeWidth="2" />
                <text x="8" y="22" fontSize="12" fill="black">CRM</text>
              </svg>
              <h2 className="page-title">Customers CRM</h2>
            </div>
          </div>
          
          <div className="table-cntnr" style={{ width: "100%", overflowX: "auto" }}>
            <MaterialReactTable
              columns={columns}
              data={customers}
              enableSorting
              enableColumnFilters
              enablePagination
              enableColumnOrdering
              enableDensityToggle={false}
              enableRowSelection={false}
              enableGlobalFilter
              muiTableContainerProps={{ sx: { minWidth: "1000px" } }}
              muiTableBodyCellProps={{ sx: { whiteSpace: "nowrap" } }}
            />
          </div>
        </>
      )}

      {/* Loan Detail Popup */}
      {showLoanDetail && selectedLoan && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.loanContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Loan Application Details</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={modalStyles.downloadBtn} onClick={handleDownloadLoanDetail}>
                  ⬇ Download
                </button>
                <button style={modalStyles.closeBtn} onClick={handleCloseLoanDetail}>
                  ✖
                </button>
              </div>
            </div>
            
            <div ref={loanDetailRef} style={loanDetailStyles.document}>
              {/* Header */}
              <div style={loanDetailStyles.header}>
                <div style={loanDetailStyles.company}>UTC FINANCE PVT. LTD.</div>
                <div style={loanDetailStyles.address}>
                Office Plot 47, Sagar Enclave, Rajendra Park, Gurgaon, Sadar Bazar, Gurgaon-122001
                </div>
              </div>

              {/* Basic Information */}
              <table style={loanDetailStyles.table}>
                <tbody>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Name</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedCustomer?.customerName}</td>
                    <td style={loanDetailStyles.labelCell}><strong>Email</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedCustomer?.email || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Contact</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedCustomer?.phone}</td>
                    <td style={loanDetailStyles.labelCell}><strong>Loan Amount</strong></td>
                    <td style={loanDetailStyles.valueCell}>₹{selectedLoan.selectedLoanAmount}</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Sanction Date</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.dateonly}</td>
                    <td style={loanDetailStyles.labelCell}><strong>Processing Fee</strong></td>
                    <td style={loanDetailStyles.valueCell}>₹{(selectedLoan.selectedLoanAmount * 0.02).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Disbursement Date</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.dateonly}</td>
                    <td style={loanDetailStyles.labelCell}><strong>Disbursed Amount</strong></td>
                    <td style={loanDetailStyles.valueCell}>
                      ₹{(selectedLoan.selectedLoanAmount - selectedLoan.downpayment).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Start Date</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.dateonly}</td>
                    <td style={loanDetailStyles.labelCell}><strong>ROI</strong></td>
                    <td style={loanDetailStyles.valueCell}>12%</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>End Date</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.created_at}</td>
                    <td style={loanDetailStyles.labelCell}><strong>Number of Payments</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.selectedTenure}</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Loan Period</strong></td>
                    <td style={loanDetailStyles.valueCell}>{selectedLoan.selectedTenure} months</td>
                    <td style={loanDetailStyles.labelCell}><strong>Type of Loan</strong></td>
                    <td style={loanDetailStyles.valueCell}>Personal Loan</td>
                  </tr>
                  <tr>
                    <td style={loanDetailStyles.labelCell}><strong>Sub-Type</strong></td>
                    <td style={loanDetailStyles.valueCell}>EMI Based</td>
                    <td style={loanDetailStyles.labelCell}><strong>Status</strong></td>
                    <td style={loanDetailStyles.valueCell}>
                      <span style={{ 
                        color: selectedLoan.status === "CLOSE" ? "#ef4444" : "#10b981",
                        fontWeight: "600" 
                      }}>
                        {selectedLoan.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Disclaimer */}
              <div style={loanDetailStyles.disclaimer}>
                <strong>-----Disclaimer-----</strong><br/>
                Unless the Constituent notifies the NBFC/ Lender, immediately of any DISCREPENCY found by him/her in the Statement of Account, 
                it will be that he/she has found the Statement correct. This Statement has been generated by the computer, therefore need not to be signed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image/PDF Modal */}
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {selectedFile && (
                <a href={selectedFile} download style={modalStyles.downloadBtnGreen} target="_blank" rel="noopener noreferrer">
                  ⬇ Download
                </a>
              )}
              <button style={modalStyles.closeBtn} onClick={handleClose}>X</button>
            </div>
            {selectedFile?.endsWith(".pdf") ? (
              <iframe src={selectedFile} title="Document Viewer" style={{ width: "100%", height: "80vh" }} />
            ) : (
              <img src={selectedFile} alt="Uploaded File" style={{ maxWidth: "100%", maxHeight: "80vh" }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Profile Styles
const profileStyles = {
  container: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
    alignItems: "flex-start",
  },
  photoContainer: {
    flexShrink: 0,
  },
  photo: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #7c3aed",
  },
  photoPlaceholder: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "14px",
  },
  infoBox: {
    flex: 1,
  },
  halfBox: {
    flex: 1,
  },
  name: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    marginTop: 0,
  },
  field: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "15px",
    color: "#1f2937",
    margin: 0,
  },
  docButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  docBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  gridSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "1px solid #e5e7eb",
  },
  gridItem: {},
  loanSection: {
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "2px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
    marginTop: 0,
  },
  loanTable: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  th: {
    background: "#f9fafb",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#1f2937",
    borderBottom: "1px solid #f3f4f6",
  },
  viewBtn: {
    background: "#7c3aed",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  noLoans: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
    padding: "40px 20px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
};

// Loan Detail Document Styles
const loanDetailStyles = {
  document: {
    background: "#fff",
    padding: "30px",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },
  company: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  address: {
    fontSize: "12px",
    color: "#6b7280",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  labelCell: {
    padding: "10px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    width: "25%",
  },
  valueCell: {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
    width: "25%",
  },
  disclaimer: {
    marginTop: "30px",
    padding: "15px",
    background: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "6px",
    fontSize: "11px",
    lineHeight: "1.5",
  },
};

// Modal Styles
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  loanContainer: {
    background: "#fff",
    width: "90%",
    maxWidth: "1000px",
    maxHeight: "85vh",
    borderRadius: "16px",
    padding: "30px",
    position: "relative",
    overflow: "auto",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "90%",
    maxHeight: "90%",
    position: "relative",
  },
  closeBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  downloadBtn: {
    background: "#7c3aed",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  downloadBtnGreen: {
    border: "none",
    background: "green",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "5px",
    textDecoration: "none",
  },
};
