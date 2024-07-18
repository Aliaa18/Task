import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Container, Paper, Box, Grid, Radio } from "@mui/material";
import Chart from "chart.js/auto";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [groupRows, setGroupRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const chartRef = useRef(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersResponse = await axios.get("http://localhost:3001/customers");
        const transactionsResponse = await axios.get("http://localhost:3001/transactions");
        setCustomers(customersResponse.data);
        setTransactions(transactionsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (customers.length > 0 && transactions.length > 0) {
      const combinedData = transactions.map(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        return {
          id: transaction.id,
          customer_name: customer ? customer.name : "Null",
          date: new Date(transaction.date).toLocaleDateString(),
          amount: transaction.amount,
        };
      });
      setGroupRows(combinedData);
      setTotalItems(combinedData.length);


      if (selectedRowId !== null) {
        const selectedCustomerTransactions = combinedData.filter(
          transaction => transaction.id === selectedRowId
        );
        setCustomerTransactions(selectedCustomerTransactions);
        updateChart(selectedCustomerTransactions);
      }
    }
  }, [customers, transactions, selectedRowId]);

  const objectsColumns = [
    {
      field: "select",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Radio
          checked={selectedRowId === params.id}
          value={params.id}
          onChange={(e) => setSelectedRowId(selectedRowId === params.id ? null : params.id)}
        />
      ),
    },
    { field: "customer_name", headerName: "Customer Name", width: 200 },
    { field: "amount", headerName: "Transaction Amount", width: 150 },
    { field: "date", headerName: "Transaction Date", width: 150 },
  ];

  const updateChart = (data) => {
    if (chartRef.current !== null) {
      chartRef.current.destroy(); 
    }

    const labels = data.map(transaction => transaction.date);
    const amounts = data.map(transaction => transaction.amount);

    const ctx = document.getElementById("transactionChart");

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      //indexAxis: 'y',
      data: {
        labels: labels,
        datasets: [{
          label: 'Transaction Amount',
          data: amounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)', 
          borderColor: 'rgba(54, 162, 235, 1)', 
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Amount: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  };
                // The Filter button appear when hover the column header. 

  if (loading) {
    return <>
      <div>
        <div id="cover-spin" style={{ backgroundColor: "white" }}></div>
        <div className="loader-text">Loading...</div>
      </div>
    </>
  } else {
    return <>
      <div className="container bg-white p-2 m-auto col-11" style={{ height: "90%", overflowY: "hidden", overflowX: "hidden" }}>
        <Box sx={{ display: "flex", marginTop: "20px" }}>
          <Container maxWidth="lg">
            <Grid item xs={12}>
              <Paper sx={{ height: 500, width: "100%" }} style={{ overflowX: "hidden", overflowY: "auto" }}>
                <DataGrid
                  rows={groupRows}
                  columns={objectsColumns}
                  rowCount={totalItems}
                  pageSize={rowsPerPage}
                  page={page}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
                  loading={loading}
                  rowsPerPageOptions={[5, 10, 50, 100]}
                  initialState={{ pagination: { page: 0 } }}
                  paginationMode="server"
                  pagination
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                  componentsProps={{
                    toolbar: {
                      showColumnsButton: true,
                      showFilterButton: true,
                      showDensitySelector: true,
                    },
                  }}
                />
              </Paper>
            </Grid>
            {selectedRowId !== null && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                  <canvas id="transactionChart" width="400" height="200"></canvas>
                </Paper>
              </Grid>
            )}
          </Container>
        </Box>
        <div id="loading-div" style={{ textAlign: "center", display: "none" }}>
          <div id="cover-spin" style={{ position: "fixed" }}></div>
          <div className="loader-text"></div>
        </div>
      </div>
    </>
  }
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}



