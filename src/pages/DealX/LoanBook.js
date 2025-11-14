import React, { useEffect, useState, useMemo } from "react";
import "../../cstm.style.css";
import { MaterialReactTable } from "material-react-table";

export default function LoanBook() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetch("https://usethecred.com/api/loanBook.php")
      .then((res) => res.json())
      .then((data) => {
        setLoans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching loans:", err);
        setLoading(false);
      });
  }, []);

  // Columns for table
  const columns = useMemo(
    () => [
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <button
            onClick={() => setSelectedLoan(row.original)}
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
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "pan", header: "PAN" },
      { accessorKey: "dateonly", header: "Date Only" },
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
      { accessorKey: "created_at", header: "Created At" },
      {
        accessorKey: "photoWithDevice_url",
        header: "Photo With Device",
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <a
              href={cell.getValue()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "blue", fontWeight: "bold"
              }}
            >
              View
            </a>
          ) : (
            "-"
          ),
      },
    ],
    []
  );

  if (loading) return <p>Loading loans...</p>;

  // Loan Detail formulas (Excel logic)
  if (selectedLoan) {
    const netDisbursal = selectedLoan.downpayment;
    const loanAmount = (netDisbursal * 100) / 98 + 250;
    const pf = loanAmount - netDisbursal;
    const roiAnnual = 0.18;
    const roiDaily = roiAnnual / 365;
    const numEmis = selectedLoan.selectedTenure;
    // EMI Calculation (Excel logic)
    const interestForFirst95 = loanAmount * roiDaily * 95;
    const emiAmount = Math.round((loanAmount + interestForFirst95) / numEmis);
    const repaymentAmount = emiAmount * numEmis;
    const totalInterest = repaymentAmount - loanAmount;

    function getEmiSchedule() {
      let emiList = [];
      let principalLeft = loanAmount;
      let emiDate = selectedLoan.loanDate ? new Date(selectedLoan.loanDate) : new Date();
      for (let i = 1; i <= numEmis; i++) {
        const monthlyInterest = Math.round(loanAmount * roiAnnual / 12);
        const principal = emiAmount - monthlyInterest;
        emiList.push({
          no: i,
          date: emiDate.toDateString(),
          emi: emiAmount,
          interest: monthlyInterest,
          principal: principal,
          balance: Math.max(principalLeft - principal, 0)
        });
        principalLeft -= principal;
        emiDate.setMonth(emiDate.getMonth() + 1);
      }
      return emiList;
    }

    const emiSchedule = getEmiSchedule();

    return (
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
            <tr><td><b>Customer Name:</b></td><td>{selectedLoan.customerName}</td></tr>
            <tr><td>Loan Amount:</td><td>₹{loanAmount.toFixed(2)}</td></tr>
            <tr><td>PF (Processing Fee):</td><td>₹{pf.toFixed(2)}</td></tr>
            <tr><td>Annual ROI:</td><td>{(roiAnnual * 100).toFixed(2)}%</td></tr>
            <tr><td>Down Payment:</td><td>₹{netDisbursal}</td></tr>
            <tr><td>Tenure:</td><td>{numEmis} months</td></tr>
            <tr><td>EMI Amount:</td><td>₹{emiAmount}</td></tr>
            <tr><td>Total Repayment:</td><td>₹{repaymentAmount}</td></tr>
            <tr><td>Total Interest:</td><td>₹{totalInterest.toFixed(2)}</td></tr>
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
            </tr>
          </thead>
          <tbody>
            {emiSchedule.map(e => (
              <tr key={e.no}>
                <td>{e.no}</td>
                <td>{e.date}</td>
                <td>{e.emi}</td>
                <td>{e.interest}</td>
                <td>{e.principal}</td>
                <td>{e.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Main Table view
  return (
    <div className="page-bg">
      <div className="title-header">
        <h2 className="page-title">Loan Book</h2>
      </div>
      <div className="table-cntnr" style={{ width: "100%", overflowX: "auto" }}>
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
            sx: { minWidth: "1200px" },
          }}
          muiTableBodyCellProps={{
            sx: { whiteSpace: "nowrap" },
          }}
        />
      </div>
    </div>
  );
}
