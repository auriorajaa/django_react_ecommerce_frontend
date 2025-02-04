import { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";

function ProductsVendor() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState([]);

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`vendor/products/${userData?.vendor_id}/`).then((res) => {
      setProducts(res.data);
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: "all",
  });

  // Advanced filtering and sorting
  const processedProducts = useMemo(() => {
    let result = [...(products || [])];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.pid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(
        (product) =>
          product.category.title.toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    // Price range filter
    if (filters.minPrice) {
      result = result.filter(
        (product) => parseFloat(product.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (product) => parseFloat(product.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Stock filter
    if (filters.inStock !== "all") {
      result = result.filter((product) =>
        filters.inStock === "inStock" ? product.in_stock : !product.in_stock
      );
    }

    // Sorting
    return result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, sortConfig, filters]);

  // Get unique categories
  const categories = [...new Set(products?.map((p) => p.category.title) || [])];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: "all",
    });
    setSearchTerm("");
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar Toggle Button (visible on mobile) */}
        <button
          className="btn btn-warning d-lg-none position-fixed top-0 start-0 mt-2 ms-2 z-3"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <i className={`bi bi-${isSidebarCollapsed ? "list" : "x"}`}></i>
        </button>
        {/* Sidebar */}
        <div
          className={`col-lg-3 col-xl-2 pt-3 sidebar ${
            isSidebarCollapsed ? "d-none" : ""
          } d-lg-block`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 pt-3">
          <div className="min-vh-100">
            <div className="">
              {/* Header Section */}
              <div className="card border mb-3">
                <div className="card-body">
                  {/* Header */}
                  <div className="col-md-4 mb-3">
                    <h4 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-box-seam-fill me-2"></i>
                      Product Management
                    </h4>
                  </div>

                  {/* Filters & Search Bar */}
                  <div className="row align-items-center gy-3">
                    <div className="col-12">
                      <div className="d-flex flex-wrap gap-3">
                        {/* Search Bar */}
                        <div
                          className="flex-grow-1"
                          style={{ minWidth: "200px", maxWidth: "100%" }}
                        >
                          <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                              <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="Search products..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                        </div>

                        {/* Category Filter */}
                        <select
                          className="form-select"
                          name="category"
                          value={filters.category}
                          onChange={handleFilterChange}
                          style={{ minWidth: "150px", maxWidth: "100%" }}
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        {/* Price Range */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Min $"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            style={{ width: "100px", maxWidth: "100%" }}
                          />
                          <span className="text-muted">—</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Max $"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            style={{ width: "100px", maxWidth: "100%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex mb-3 gap-2">
                {/* Stock Filter */}
                <div className="d-flex gap-2">
                  <input
                    type="radio"
                    className="btn-check"
                    name="inStock"
                    id="allStock"
                    value="all"
                    checked={filters.inStock === "all"}
                    onChange={handleFilterChange}
                  />
                  <label
                    className="btn btn-outline-light text-dark  border"
                    htmlFor="allStock"
                  >
                    All
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="inStock"
                    id="inStock"
                    value="inStock"
                    checked={filters.inStock === "inStock"}
                    onChange={handleFilterChange}
                  />
                  <label
                    className="btn btn-outline-light text-dark border"
                    htmlFor="inStock"
                  >
                    In Stock
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="inStock"
                    id="outStock"
                    value="outStock"
                    checked={filters.inStock === "outStock"}
                    onChange={handleFilterChange}
                  />
                  <label
                    className="btn btn-outline-light text-dark border"
                    htmlFor="outStock"
                  >
                    Out of Stock
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={resetFilters}
                  title="Reset Filters"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  Reset
                </button>
              </div>

              {/* Table Section */}
              <div className="card border rounded">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table">
                      <thead className="bg-light">
                        <tr>
                          <th className="">#ID</th>
                          <th className="px-4">Product Name</th>
                          <th className="px-4 text-center">Price</th>
                          <th className="px-4 text-center">Orders</th>
                          <th className="px-4 text-center">Stage</th>
                          <th className="px-4 text-center">Stock</th>
                          <th className=" text-center">Status</th>
                          <th className="text-center px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedProducts
                          .slice()
                          .reverse()
                          .map((product) => (
                            <tr key={product.id} className="align-middle">
                              <td className="">
                                <span className="fw-medium">
                                  #{product.pid}
                                </span>
                              </td>
                              <td
                                className="d-flex align-items-center gap-3"
                                style={{ flexWrap: "nowrap" }}
                              >
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="rounded"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div
                                  style={{
                                    maxWidth: "200px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <div
                                    className="fw-medium"
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {product.title}
                                  </div>
                                  <div className="small text-muted">
                                    {product.category.title}
                                  </div>
                                </div>
                              </td>
                              <td className="text-center fw-medium">
                                ${product.price}
                              </td>
                              <td className="text-center">{product.orders}</td>
                              <td className="text-center text-capitalize">
                                {product.status}
                              </td>
                              <td className="text-center">
                                <span
                                  className={`badge ${
                                    product.stock_qty > 10
                                      ? "bg-success-subtle text-success"
                                      : "bg-warning-subtle text-warning"
                                  } px-3 py-2`}
                                >
                                  {product.stock_qty}
                                </span>
                              </td>
                              <td className="text-center">
                                <span
                                  className={`badge ${
                                    product.in_stock
                                      ? "bg-success-subtle text-success"
                                      : "bg-danger-subtle text-danger"
                                  } px-3 py-2`}
                                >
                                  {product.in_stock
                                    ? "In Stock"
                                    : "Out of Stock"}
                                </span>
                              </td>
                              <td className="text-end px-4">
                                <div className="btn-group">
                                  <button
                                    className="btn btn-light btn-sm"
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-light btn-sm"
                                    title="Edit Product"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-light btn-sm"
                                    title="Delete Product"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {processedProducts.length === 0 && (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="bi bi-box-seam display-1 text-muted opacity-50"></i>
                      </div>
                      <h5 className="text-muted mb-0">No products found</h5>
                      <p className="text-muted small">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductsVendor;
