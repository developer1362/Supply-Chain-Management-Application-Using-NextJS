'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Clock, Truck, CheckCircle } from 'lucide-react'

interface Order {
 _id?: string
 productId: string
 supplierId: string
 quantity: number
 status: string
 orderDate: string
}

interface Product { _id: string; name: string }
interface Supplier { _id: string; name: string }

const ITEMS_PER_PAGE = 10 

export default function OrdersPage() {
 const [allOrders, setAllOrders] = useState<Order[]>([])
 const [products, setProducts] = useState<Product[]>([])
 const [suppliers, setSuppliers] = useState<Supplier[]>([])
 
 const [searchTerm, setSearchTerm] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 
 const [editingId, setEditingId] = useState<string | null>(null)
 const [productId, setProductId] = useState('')
 const [supplierId, setSupplierId] = useState('')
 const [quantity, setQuantity] = useState('')
 const [status, setStatus] = useState('Pending')
 const [orderDate, setOrderDate] = useState('')

 const getProductName = (id: string) => products.find(p=>p._id===id)?.name || 'Unknown'
 const getSupplierName = (id: string) => suppliers.find(s=>s._id===id)?.name || 'Unknown'

 const fetchOrders = useCallback(async () => { 
  const res = await fetch('/api/orders'); 
  setAllOrders(await res.json())
 }, [])
 
 const fetchProducts = useCallback(async () => { 
  const res = await fetch('/api/products'); 
  setProducts(await res.json()) 
 }, [])
 
 const fetchSuppliers = useCallback(async () => { 
  const res = await fetch('/api/suppliers'); 
  setSuppliers(await res.json()) 
 }, [])

 useEffect(()=>{ 
  fetchOrders(); 
  fetchProducts(); 
  fetchSuppliers() 
 }, [fetchOrders, fetchProducts, fetchSuppliers])

 const resetForm = () => {
  setProductId(''); setSupplierId(''); setQuantity(''); setStatus('Pending'); setOrderDate(''); setEditingId(null)
 }
 
 const saveOrder = async (e: React.FormEvent) => {
  e.preventDefault()
  const body = { productId, supplierId, quantity: parseInt(quantity), status, orderDate }
  if (editingId) {
   await fetch(`/api/orders?id=${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
  } else {
   await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
  }
  
  resetForm()
  fetchOrders()
 }

 const editOrder = (o: Order) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setEditingId(o._id || null)
  setProductId(o.productId)
  setSupplierId(o.supplierId)
  setQuantity(o.quantity.toString())
  setStatus(o.status)
  setOrderDate(o.orderDate)
 }

 const deleteOrder = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this order?")) return;

  await fetch(`/api/orders?id=${id}`, { method:'DELETE' })
  if (editingId === id) {
    resetForm(); 
  }
  fetchOrders()
 }
  
 const orderStatusSummary = useMemo(() => {
  return allOrders.reduce((summary, order) => {
    summary[order.status] = (summary[order.status] || 0) + 1;
    return summary;
  }, {
    'Pending': 0,
    'Shipped': 0,
    'Delivered': 0,
  } as Record<string, number>);
 }, [allOrders]);
  
  const statusCards = useMemo(() => [
    {
      status: 'Pending',
      icon: Clock,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      count: orderStatusSummary['Pending'],
    },
    {
      status: 'Shipped',
      icon: Truck,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      count: orderStatusSummary['Shipped'],
    },
    {
      status: 'Delivered',
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      count: orderStatusSummary['Delivered'],
    },
  ], [orderStatusSummary]);


 const filteredOrders = useMemo(() => {
  if (!searchTerm) return allOrders

  const lowerCaseSearch = searchTerm.toLowerCase()
  return allOrders.filter(order => {
   const productName = getProductName(order.productId)
   const supplierName = getSupplierName(order.supplierId)
   
   return (
    productName.toLowerCase().includes(lowerCaseSearch) ||
    supplierName.toLowerCase().includes(lowerCaseSearch) ||
    order.status.toLowerCase().includes(lowerCaseSearch) ||
    order.orderDate.includes(lowerCaseSearch)
   )
  })
 }, [allOrders, searchTerm, products, suppliers])

 useEffect(() => {
  setCurrentPage(1)
 }, [searchTerm])

 const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)

 const paginatedOrders = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
 }, [filteredOrders, currentPage])

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
    Page <strong className='font-bold'>{currentPage}</strong> of <strong className='font-bold'>{totalPages}</strong> ({filteredOrders.length} Total)
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
   <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Orders</h1>

      <div className="bg-white shadow-xl rounded-xl p-6 mb-8 border border-purple-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statusCards.map((card) => (
              <div key={card.status} className={`${card.bgColor} p-5 rounded-lg shadow-md border-l-4 border-purple-600`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">{card.status.toUpperCase()} ORDERS</div>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <p className={`text-4xl font-extrabold mt-2 ${card.color}`}>{card.count}</p>
              </div>
            ))}
          </div>
      </div>

   <div className='grid md:grid-cols-2 gap-8'>
        <form onSubmit={saveOrder} className="flex flex-col gap-3 p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200 h-fit">
     <h2 className="text-xl font-bold text-gray-700 mb-2">{editingId ? 'Edit Order' : 'Add New Order'}</h2>

     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={productId} onChange={e=>setProductId(e.target.value)} required>
      <option value="" disabled>Select Product</option>
      {products.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
     </select>
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={supplierId} onChange={e=>setSupplierId(e.target.value)} required>
      <option value="" disabled>Select Supplier</option>
      {suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
     </select>
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Quantity" type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} required />
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} required />
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={status} onChange={e=>setStatus(e.target.value)} required>
      <option value="Pending">Pending</option>
      <option value="Shipped">Shipped</option>
      <option value="Delivered">Delivered</option>
     </select>
     <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
                {editingId ? 'Update Order' : 'Add Order'}
            </button>
    </form>
        <div className='hidden md:block'></div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Order List</h2>
      <div className="mb-4">
        <input
            type="text"
            placeholder="Search orders by product, supplier, status, or date (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-black-300 px-4 py-2 rounded-lg w-full max-w-xl focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

   <div className="overflow-x-auto bg-white rounded-xl shadow-lg border">
    <table className="min-w-full divide-y divide-gray-200">
     <thead className="bg-gray-100">
      <tr>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supplier</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Date</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
       <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
      </tr>
     </thead>
     <tbody className="bg-white divide-y divide-gray-200">
      {paginatedOrders.length > 0 ? (
       paginatedOrders.map(o => (
        <tr key={o._id} className="hover:bg-gray-50 transition">
         <td className="px-4 py-3 text-sm font-medium text-gray-900">{getProductName(o.productId)}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{getSupplierName(o.supplierId)}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{o.quantity}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{o.orderDate}</td>
         <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {o.status}
                        </span>
                    </td>
         <td className="px-4 py-3 text-center flex justify-center gap-2">
          <button onClick={()=>editOrder(o)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600 transition shadow-sm">Edit</button>
          <button onClick={()=>o._id && deleteOrder(o._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition shadow-sm">Delete</button>
        </td>
       </tr>
      ))
      ) : (
       <tr>
        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
         {searchTerm ? "No orders match your search criteria." : "No orders found."}
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
