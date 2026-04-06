import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaPlus, FaTrash, FaEdit, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Toast from "./Toast";
import { decodeStoredToken } from "../utils/auth";
import { formatDisplayDate } from "../utils/date";

const CATEGORIES = ["Food", "Transport", "Shopping", "Salary", "Bills", "Health", "Entertainment", "Other"];

import Navbar from "./Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [filters, setFilters] = useState({
    date: "",
    category: "",
    type: "",
  });

  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    type: "EXPENSE",
    note: "",
  });

  const [editForm, setEditForm] = useState({
    amount: "",
    category: "Food",
    type: "EXPENSE",
    note: "",
    date: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const today = new Date().toISOString().split("T")[0];

  const showToast = (message, type = "error") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "error",
      });
    }, 4000);
  };

  const fetchTransactions = async (pageToFetch = currentPage) => {
    try {
      setIsPageLoading(true);
      const auth = decodeStoredToken();

      if (!auth) {
        setIsPageLoading(false);
        return;
      }

      const token = auth.token;
      setRole(auth.role);

      const searchParams = new URLSearchParams({
        page: String(pageToFetch),
      });

      if (filters.date) {
        searchParams.set("date", filters.date);
      }

      if (filters.category) {
        searchParams.set("category", filters.category);
      }

      if (filters.type) {
        searchParams.set("type", filters.type);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions?${searchParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        console.error(data.message || "Failed to fetch transactions");
        return;
      }

      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 1) {
      fetchTransactions(1);
      return;
    }

    setCurrentPage(1);
  }, [filters]);

  const handleAddTransaction = async () => {
    if (!form.amount || isNaN(form.amount)) {
      showToast("Enter the Amount", "error");
      return;
    }

    if (form.amount <= 0) {
      showToast("Enter the Positive Amount", "error");
      return;
    }

    try {
      setIsLoading(true);
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const payload = {
        amount: parseFloat(form.amount),
        category: form.category,
        type: form.type.toUpperCase(), 
        notes: form.note,              
        date: new Date().toISOString(), 
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        console.error(data.message || "Failed to add transaction");
        setIsLoading(false);
        return;
      }

      setForm({
        amount: "",
        category: "Food",
        type: "EXPENSE",
        note: "",
      });

      setShowForm(false);
      setCurrentPage(1);
      fetchTransactions(1);

    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally{
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setForm({ amount: "", category: "Food", type: "EXPENSE", note: "" });
    setShowForm(false);
  };

  const handleUpdateTransaction = async () => {
    if (!editData?.id) {
      showToast("Invalid record data", "error");
      return;
    }
    if (!editForm.amount || isNaN(editForm.amount)) {
      showToast("Enter the valid Amount", "error");
      return;
    }

    if(editForm.amount <= 0){
      showToast("The Amount must be a positive number", "error");
      return;
    }

    try {
      setIsEditLoading(true);
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const payload = {
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        type: editForm.type,
        notes: editForm.note,
        date: new Date(editForm.date).toISOString(),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        console.error(data.message || "Failed to update transaction");
        return;
      }

      handleCloseEditModal();
      fetchTransactions(currentPage);
      showToast(data.message || "Transaction updated successfully", "success");
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditData(transaction);
    setEditForm({
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      note: transaction.notes || transaction.note || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setEditForm({
      amount: "",
      category: "Food",
      type: "EXPENSE",
      note: "",
      date: "",
    });
  };

  const handleDeleteTransaction = async (id) => {
    try {
      setDeletingId(id);
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        console.error(data.message || "Failed to delete transaction");
        return;
      }

      const nextPage = transactions.length === 1 && currentPage > 1
        ? currentPage - 1
        : currentPage;

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        fetchTransactions(nextPage);
      }

      showToast(data.message || "Transaction deleted successfully", "success");

    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <Navbar />

      <div className="dashboard-container">

        <div className="add-container">
          <div className="record-text">Records</div>
          {role !== "VIEWER" && (
            <div className="summary-div">
              <div className="filter-bar">
                <input
                  type="date"
                  className="filter-input"
                  value={filters.date}
                  max={today}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, date: e.target.value }))
                  }
                />

                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>

                <button
                  className="clear-filter-btn"
                  onClick={() =>
                    setFilters({
                      date: "",
                      category: "",
                      type: "",
                    })
                  }
                >
                  Clear
                </button>
              </div>
              {(role === "SUPER_ADMIN" || role === "ADMIN" || role === "ANALYST") && (
                <button className="summary-btn" onClick={() => navigate("/summary")}>
                  Summary
                </button>
              )}
              {(role === "SUPER_ADMIN" || role === "ADMIN") && (
                <div className="add-btn" onClick={() => setShowForm(!showForm)}>
                  <FaPlus />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="records">
          {isPageLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-loading-spinner" aria-hidden="true"></div>
              <div className="dashboard-loading-text">Loading records...</div>
            </div>
          ) : (
            <>

            {showForm && (
              <div className="inline-form-row">
                <input
                  className="form-input"
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={handleChange}
                />

                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="type-toggle">
                  <button
                    className={`type-btn ${form.type === "INCOME" ? "active-income" : ""}`}
                    onClick={() => setForm({ ...form, type: "INCOME" })}
                  >
                    Income
                  </button>
                  <button
                    className={`type-btn ${form.type === "EXPENSE" ? "active-expense" : ""}`}
                    onClick={() => setForm({ ...form, type: "EXPENSE" })}
                  >
                    Expense
                  </button>
                </div>

                <input
                  className="form-input note-input"
                  type="text"
                  name="note"
                  placeholder="Note (optional)"
                  value={form.note}
                  onChange={handleChange}
                />

                <button 
                  className="confirm-btn" 
                  onClick={handleAddTransaction}
                  disabled={isLoading}
                >
                  {isLoading ? <div className="spinner"></div> : "Save"}
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}

            {transactions.length === 0 && !showForm && (
              <div className="empty-state">
                <img src="/no-data.png" alt="No records" className="empty-state-image" />
                <div className="empty-state-overlay">NO Records</div>
              </div>
            )}

            {transactions.map((t) => (
              <div key={t.id} className="transaction-row">
                <div className="transaction-cell t-amount">
                  {t.type === "INCOME" ? "+" : "-"}{"\u20B9"}{t.amount.toFixed(2)}
                </div>
                <div className="transaction-cell">
                  <div className={`t-badge ${t.type}`}>
                    {t.type === "INCOME" ? "INCOME" : "EXPENSE"}
                  </div>
                </div>
                <div className="transaction-cell t-category">{t.category}</div>
                <div className="transaction-cell t-date">{formatDisplayDate(t.date)}</div>
                <div className="transaction-cell t-note">{t.notes || t.note || "No note added"}</div>

                {(role === "SUPER_ADMIN" || role === "ADMIN") && (
                  <div className="transaction-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEditTransaction(t)}
                      aria-label={`Edit ${t.category} transaction`}
                    >
                      <FaEdit size={20}/>
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteTransaction(t.id)}
                      disabled={deletingId === t.id}
                      aria-label={`Delete ${t.category} transaction`}
                    >
                      {deletingId === t.id ? <div className="delete-spinner"></div> : <FaTrash />}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {transactions.length > 0 && (
              <div className="page-btns">
                <button
                  type="button"
                  className="prev-btn page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                <div className="page-detail">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  type="button"
                  className="next-btn page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
            </>
          )}
        </div>

        {showEditModal && (
          <div className="edit-modal-backdrop" onClick={handleCloseEditModal}>
            <div
              className="edit-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-transaction-title"
            >
              <h2 id="edit-transaction-title" className="edit-modal-title">Edit Transaction</h2>

              <div className="edit-form-grid">
                <input
                  className="form-input"
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={editForm.amount}
                  onChange={handleEditChange}
                />

                <select
                  className="form-select"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  className="form-input"
                  type="date"
                  name="date"
                  value={editForm.date}
                  max={today}
                  onChange={handleEditChange}
                />

                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${editForm.type === "INCOME" ? "active-income" : ""}`}
                    onClick={() => setEditForm((prev) => ({ ...prev, type: "INCOME" }))}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${editForm.type === "EXPENSE" ? "active-expense" : ""}`}
                    onClick={() => setEditForm((prev) => ({ ...prev, type: "EXPENSE" }))}
                  >
                    Expense
                  </button>
                </div>

                <input
                  className="form-input edit-note-input"
                  type="text"
                  name="note"
                  placeholder="Note (optional)"
                  value={editForm.note}
                  onChange={handleEditChange}
                />
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEditModal}
                  disabled={isEditLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-btn"
                  onClick={handleUpdateTransaction}
                  disabled={isEditLoading}
                >
                  {isEditLoading ? <div className="spinner"></div> : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
