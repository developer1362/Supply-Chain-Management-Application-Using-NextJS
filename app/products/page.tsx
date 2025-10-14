'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { DollarSign, Package, TrendingUp } from 'lucide-react'

interface Product {
 _id?: string
 name: string
 price: number
 category: string
 supplierId: string
 stock: number
 status: string
}

interface Supplier {
 _id: string
 name: string
}

const ITEMS_PER_PAGE = 10 

export default function ProductsPage() {
 const [allProducts, setAllProducts] = useState<Product[]>([])
 const [suppliers, setSuppliers] = useState<Supplier[]>([])
 
 const [searchTerm, setSearchTerm] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 
 const [editingId, setEditingId] = useState<string | null>(null)
 const [name, setName] = useState('')
 const [price, setPrice] = useState('')
 const [category, setCategory] = useState('')
 const [supplierId, setSupplierId] = useState('')
 const [stock, setStock] = useState('')
 const [status, setStatus] = useState('Available')

 const getSupplierName = (id: string) => suppliers.find(s => s._id === id)?.name || 'Unknown'

 const fetchProducts = useCallback(async () => {
  const res = await fetch('/api/products')
  setAllProducts(await res.json()) 
 }, [])

 const fetchSuppliers = useCallback(async () => {
  const res = await fetch('/api/suppliers')
  setSuppliers(await res.json())
 }, [])

 useEffect(() => {
  fetchProducts()
  fetchSuppliers()
 }, [fetchProducts, fetchSuppliers]) 

 const resetForm = () => {
  setName(''); setPrice(''); setCategory(''); setSupplierId(''); setStock(''); setStatus('Available'); setEditingId(null)
 }

 const saveProduct = async (e: React.FormEvent) => {
  e.preventDefault()
  const body = { name, price: parseFloat(price), category, supplierId, stock: parseInt(stock), status }

  if (editingId) {
   await fetch(`/api/products?id=${editingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
   })
  } else {
   await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
   })
  }

  resetForm()
  fetchProducts()
 }

 const editProduct = (p: Product) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setEditingId(p._id || null)
  setName(p.name)
  setPrice(p.price.toString())
  setCategory(p.category)
  setSupplierId(p.supplierId)
  setStock(p.stock.toString())
  setStatus(p.status)
 }

 const deleteProduct = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;
  
  await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
  if (editingId === id) {
    resetForm(); 
  }
  fetchProducts()
 }


 const totalInventoryValue = useMemo(() => {
  return allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
 }, [allProducts]);

 const totalStockCount = useMemo(() => {
  return allProducts.reduce((sum, p) => sum + p.stock, 0);
 }, [allProducts]);

 const valueByCategory = useMemo(() => {
  const categoryMap = allProducts.reduce((map, p) => {
    const value = p.price * p.stock;
    map[p.category] = (map[p.category] || 0) + value;
    return map;
  }, {} as Record<string, number>);

  return Object.entries(categoryMap).sort(([, v1], [, v2]) => v2 - v1);
 }, [allProducts]);


 const filteredProducts = useMemo(() => {
  if (!searchTerm) return allProducts

  const lowerCaseSearch = searchTerm.toLowerCase()
  return allProducts.filter(product => {
   const supplierName = getSupplierName(product.supplierId)
   return (
    product.name.toLowerCase().includes(lowerCaseSearch) ||
    product.category.toLowerCase().includes(lowerCaseSearch) ||
    supplierName.toLowerCase().includes(lowerCaseSearch)
   )
  })
 }, [allProducts, searchTerm, suppliers])

 useEffect(() => {
  setCurrentPage(1)
 }, [searchTerm])

 const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

 const paginatedProducts = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
 }, [filteredProducts, currentPage])

 const PaginationControls = () => (
  <div className="flex justify-between items-center mt-4 mb-6">
   <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 transition"
   >
    Previous
   </button>
   
   <span className="text-gray-700">
    Page <strong className='font-bold'>{currentPage}</strong> of <strong className='font-bold'>{totalPages}</strong> ({filteredProducts.length} Total)
   </span>

   <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages || totalPages === 0}
    className="bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 transition"
   >
    Next
   </button>
  </div>
 )

 return (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
   <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Products</h1>

      <div className="bg-white shadow-xl rounded-xl p-6 mb-8 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg shadow-inner border-l-4 border-blue-600">
                  <p className="text-sm font-medium text-gray-500">TOTAL INVENTORY VALUE</p>
                  <p className="text-3xl font-extrabold text-blue-900 mt-1 flex items-center">
                      <DollarSign className="w-6 h-6 mr-1" />
                      {totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-inner border-l-4 border-blue-600">
                  <p className="text-sm font-medium text-gray-500">TOTAL STOCK UNITS</p>
                  <p className="text-3xl font-extrabold text-blue-900 mt-1 flex items-center">
                      <Package className="w-6 h-6 mr-1" />
                      {totalStockCount.toLocaleString()}
                  </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-inner border-l-4 border-blue-600">
                  <p className="text-sm font-medium text-gray-500">TOP VALUE CATEGORY</p>
                  <p className="text-xl font-extrabold text-blue-900 mt-1">
                      {valueByCategory.length > 0 ? valueByCategory[0][0] : "N/A"}
                      <span className='text-base font-extrabold text-gray-600 ml-2'>
                        {valueByCategory.length > 0 ? `$${valueByCategory[0][1].toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ""}
                      </span>
                  </p>
              </div>
          </div>
          {valueByCategory.length > 0 && (
            <div className="mt-4">
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Value Breakdown by Category:</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {valueByCategory.map(([category, value]) => (
                  <li key={category} className="text-sm font-semibold text-gray-600 bg-gray-50 p-2 rounded-md shadow-sm">
                    {category}: ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

   <div className='grid md:grid-cols-2 gap-8'>
        <form onSubmit={saveProduct} className="flex flex-col gap-3 p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200 h-fit">
     <h2 className="text-xl font-bold text-gray-700 mb-2">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} required />
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Price (e.g., 49.99)" type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={category} onChange={e=>setCategory(e.target.value)} required>
      <option value="" disabled>Select Category</option>
      <option value="Electronics">Electronics</option>
      <option value="Furniture">Furniture</option>
      <option value="Clothing">Clothing</option>
      <option value="Groceries">Groceries</option>
     </select>
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={supplierId} onChange={e=>setSupplierId(e.target.value)} required>
      <option value="" disabled>Select Supplier</option>
      {suppliers.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
     </select>
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Stock Quantity" type="number" value={stock} onChange={e=>setStock(e.target.value)} required />
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={status} onChange={e=>setStatus(e.target.value)} required>
      <option value="Available">Available</option>
      <option value="Low Stock">Low Stock</option>
      <option value="Out of Stock">Out of Stock</option>
     </select>
     <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
                {editingId ? 'Update Product' : 'Add Product'}
            </button>
    </form>
        <div className='hidden md:block'></div>
      </div>


      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Product List</h2>
      <div className="mb-4">
        <input
            type="text"
            placeholder="Search products by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-black-300 px-4 py-2 rounded-lg w-full max-w-xl focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

   <div className="overflow-x-auto bg-white rounded-xl shadow-lg border">
    <table className="min-w-full divide-y divide-gray-200">
     <thead className="bg-gray-100">
      <tr>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supplier</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
       <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
      </tr>
     </thead>
     <tbody className="bg-white divide-y divide-gray-200">
      {paginatedProducts.length > 0 ? (
       paginatedProducts.map(p => (
        <tr key={p._id} className="hover:bg-gray-50 transition">
         <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
         <td className="px-4 py-3 text-sm text-gray-600">${p.price.toFixed(2)}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{getSupplierName(p.supplierId)}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{p.stock}</td>
         <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'Available' ? 'bg-green-100 text-green-800' :
                            p.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {p.status}
                        </span>
                    </td>
         <td className="px-4 py-3 text-center flex justify-center gap-2">
          <button onClick={()=>editProduct(p)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600 transition shadow-sm">Edit</button>
          <button onClick={()=>p._id && deleteProduct(p._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition shadow-sm">Delete</button>
        </td>
       </tr>
      ))
      ) : (
       <tr>
        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
         {searchTerm ? "No products match your search criteria." : "No products found."}
        </td>
       </tr>
      )}
     </tbody>
    </table>
   </div>

      {totalPages > 1 && <PaginationControls />}
  </div>
 )
}
