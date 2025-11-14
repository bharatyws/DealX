import React from "react";

export default function Dashboard() {

    const topCards = [
        { title: "Total Amount Lent", value: 50000 },
        { title: "Total Amount in Market", value: 12000 },
        { title: "Total Amount Recovered", value: 30000 },
        { title: "Current Profit", value: 15000 },
      ];
    
      const bottomCards = [
        { title: "Active Agents", value: 2000 },
        { title: "Active Retial Partners", value: 150 },
        { title: "Total Customers", value: 50 },
        { title: "Total Active Customers", value: 75 },
      ];
      
  return (
    <div className="container mt-4">
      <h2>DealX Dashboard</h2>
      <p>Show important metrics here.</p>

      {/* Top 4 cards with rupee values */}
      <div className="row mb-4">
        {topCards.map((card, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">₹ {card.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom 4 cards without rupee */}
      <div className="row">
        {bottomCards.map((card, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">{card.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
