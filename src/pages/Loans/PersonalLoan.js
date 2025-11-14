// src/pages/Loans/PersonalLoan.js
import React, { useEffect, useState, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";

export default function PersonalLoan() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch data
  useEffect(() => {
    fetch("https://usethecred.com/api/PersonalLoan.php")
      .then((res) => res.json())
      .then((data) => {
        setLoans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const handleView = (filePath) => {
    setSelectedFile(filePath);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  // ✅ Define MRT columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "countryCode", header: "Country Code" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "occupation", header: "Occupation" },
      { accessorKey: "loanAmount", header: "Loan Amount" },
      { accessorKey: "submitted_at", header: "Submitted At" },
      { accessorKey: "officialEmail", header: "Official Email" },
      { accessorKey: "message", header: "Message" },
      {
        accessorKey: "panCardPath",
        header: "PAN",
        Cell: ({ cell }) => (
          <button onClick={() => handleView(cell.getValue())}>View</button>
        ),
      },
      {
        accessorKey: "aadharCardPath",
        header: "Aadhar",
        Cell: ({ cell }) => (
          <button onClick={() => handleView(cell.getValue())}>View</button>
        ),
      },
      {
        accessorKey: "salarySlipPath",
        header: "Salary Slip",
        Cell: ({ cell }) => (
          <button onClick={() => handleView(cell.getValue())}>View</button>
        ),
      },
      {
        accessorKey: "bankStatementPath",
        header: "Bank Statement",
        Cell: ({ cell }) => (
          <button onClick={() => handleView(cell.getValue())}>View</button>
        ),
      },
    ],
    []
  );

  // ✅ CSV export setup
  const csvConfig = mkConfig({
    filename: "personal_loans",
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportCSV = () => {
    const csv = generateCsv(csvConfig)(loans);
    download(csvConfig)(csv);
  };

  if (loading) return <p>Loading loan applications...</p>;

  return (
    <div className="page-bg">
      <div className="title-header">
        <div className="title-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
          >
            <path
              d="M6.31125 2.86875C6.51076 2.6355 6.75843 2.44824 7.03722 2.31984C7.31602 2.19145 7.61931 2.12498 7.92625 2.125H26.0738C26.3807 2.12498 26.684 2.19145 26.9628 2.31984C27.2416 2.44824 27.4892 2.6355 27.6887 2.86875L33.2329 9.33725C33.7279 9.91489 34 10.6505 34 11.4113V11.9531C34.0001 13.0049 33.6716 14.0305 33.0604 14.8865C32.4491 15.7425 31.5857 16.3861 30.5908 16.7275C29.5959 17.0688 28.5192 17.0907 27.5112 16.7902C26.5033 16.4897 25.6143 15.8818 24.9688 15.0514C24.4974 15.6588 23.8933 16.1502 23.2026 16.4879C22.512 16.8257 21.7532 17.0009 20.9844 17C20.2156 17.0009 19.4568 16.8257 18.7661 16.4879C18.0755 16.1502 17.4713 15.6588 17 15.0514C16.5287 15.6588 15.9245 16.1502 15.2339 16.4879C14.5432 16.8257 13.7844 17.0009 13.0156 17C12.2468 17.0009 11.488 16.8257 10.7974 16.4879C10.1067 16.1502 9.50259 15.6588 9.03125 15.0514C8.38566 15.8818 7.49675 16.4897 6.48877 16.7902C5.48078 17.0907 4.4041 17.0688 3.40919 16.7275C2.41428 16.3861 1.55087 15.7425 0.939637 14.8865C0.328401 14.0305 -0.000116022 13.0049 3.07371e-08 11.9531V11.4113C2.6791e-05 10.6505 0.27212 9.91489 0.767125 9.33725L6.31125 2.86875Z"
              fill="black"
            />
          </svg>
          <h2 className="page-title">Personal Loan Applications</h2>
        </div>
      </div>

      {/* ✅ MRT Table */}
      <div
        className="table-cntnr"
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <MaterialReactTable
          columns={columns}
          data={loans}
          enableSorting
          enableColumnFilters
          enablePagination
          enableColumnOrdering
          enableDensityToggle={false}
          enableRowSelection={false}
          enableGlobalFilter
          muiTableContainerProps={{
            sx: {
              minWidth: "1000px",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              whiteSpace: "nowrap",
            },
          }}
          renderTopToolbarCustomActions={() => (
            <button
              onClick={handleExportCSV}
              style={{
                background: "#1976d2",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                border: "none",
              }}
            >
              Export CSV
            </button>
          )}
        />
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
            >
              <a
                href={`https://usethecred.com/api/download.php?file=${selectedFile
                  ?.split("/")
                  .pop()}`}
                style={styles.downloadBtn}
              >
                ⬇ Download
              </a>
              <button style={styles.closeBtn} onClick={handleClose}>
                X
              </button>
            </div>

            {selectedFile?.endsWith(".pdf") ? (
              <iframe
                src={selectedFile}
                title="Document Viewer"
                style={{ width: "100%", height: "80vh" }}
              ></iframe>
            ) : (
              <img
                src={selectedFile}
                alt="Uploaded File"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Modal styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
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
    border: "none",
    background: "red",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "5px",
  },
  downloadBtn: {
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
