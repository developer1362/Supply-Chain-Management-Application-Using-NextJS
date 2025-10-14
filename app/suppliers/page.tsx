'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

interface Supplier {
 _id?: string
 name: string
 country: string
 status: string 
 contactEmail: string
}

const ITEMS_PER_PAGE = 10 

export default function SuppliersPage() {
 const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])
 
 const [searchTerm, setSearchTerm] = useState<string>('')
 const [currentPage, setCurrentPage] = useState<number>(1)
 
 const [editingId, setEditingId] = useState<string | null>(null)
 const [name, setName] = useState<string>('')
 const [country, setCountry] = useState<string>('')
 const [status, setStatus] = useState<string>('Active')
 const [contactEmail, setContactEmail] = useState<string>('')

 const fetchSuppliers = useCallback(async () => {
  const res = await fetch('/api/suppliers')
  setAllSuppliers(await res.json()) // Update allSuppliers
 }, [])

 useEffect(() => {
  fetchSuppliers()
 }, [fetchSuppliers]) 

 const resetForm = () => {
  setName(''); setCountry(''); setStatus('Active'); setContactEmail(''); setEditingId(null)
 }

 const saveSupplier = async (e: React.FormEvent) => {
  e.preventDefault()
  const body = { name, country, status, contactEmail }

  if (editingId) {
   await fetch(`/api/suppliers?id=${editingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
   })
  } else {
   await fetch('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
   })
  }

  resetForm()
  fetchSuppliers()
 }

 const editSupplier = (s: Supplier) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setEditingId(s._id || null)
  setName(s.name)
  setCountry(s.country)
  setStatus(s.status)
  setContactEmail(s.contactEmail)
 }

 const deleteSupplier = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this supplier?")) return;
  
  await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' })
  if (editingId === id) {
    resetForm(); 
  }
  fetchSuppliers()
 }


 const filteredSuppliers = useMemo(() => {
  if (!searchTerm) return allSuppliers

  const lowerCaseSearch = searchTerm.toLowerCase()
  return allSuppliers.filter(supplier => (
   supplier.name.toLowerCase().includes(lowerCaseSearch) ||
   supplier.country.toLowerCase().includes(lowerCaseSearch) ||
   supplier.contactEmail.toLowerCase().includes(lowerCaseSearch)
  ))
 }, [allSuppliers, searchTerm])

 useEffect(() => {
  setCurrentPage(1)
 }, [searchTerm])

 const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE)

 const paginatedSuppliers = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  return filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
 }, [filteredSuppliers, currentPage])

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
    Page <strong className='font-bold'>{currentPage}</strong> of <strong className='font-bold'>{totalPages}</strong> ({filteredSuppliers.length} Total)
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
   <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Suppliers</h1>

   <div className='grid md:grid-cols-2 gap-8 mb-10'>
        <form onSubmit={saveSupplier} className="flex flex-col gap-3 p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200 h-fit">
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Supplier Name" value={name} onChange={e=>setName(e.target.value)} required />
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required />
     <input className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Contact Email" type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} required />
     <select className="border px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={status} onChange={e=>setStatus(e.target.value)} required>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
      <option value="Under Review">Under Review</option>
     </select>
     <button 
                type="submit" 
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
                {editingId ? 'Update Supplier' : 'Add Supplier'}
            </button>
     {editingId && (
      <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition shadow-sm"
            >
                Cancel Edit
            </button>
     )}
    </form>
        <div className='hidden md:block'></div>
      </div>


      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Supplier List</h2>
      <div className="mb-4">
        <input
            type="text"
            placeholder="Search suppliers by name, country, or email..."
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
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
       <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
      </tr>
     </thead>
     <tbody className="bg-white divide-y divide-gray-200">
      {paginatedSuppliers.length > 0 ? (
       paginatedSuppliers.map(s => (
        <tr key={s._id} className="hover:bg-gray-50 transition">
         <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
         <td className="px-4 py-3 text-sm text-gray-600">{s.country}</td>
         <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">{s.contactEmail}</td>
         <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            s.status === 'Active' ? 'bg-green-100 text-green-800' :
                            s.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {s.status}
                        </span>
                    </td>
         <td className="px-4 py-3 text-center flex justify-center gap-2">
          <button onClick={()=>editSupplier(s)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600 transition shadow-sm">Edit</button>
          <button onClick={()=>s._id && deleteSupplier(s._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition shadow-sm">Delete</button>
        </td>
       </tr>
      ))
      ) : (
       <tr>
        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
         {searchTerm ? "No suppliers match your search criteria." : "No suppliers found."}
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
