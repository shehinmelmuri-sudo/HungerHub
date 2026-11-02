import React, { useEffect, useMemo, useState } from 'react'
import { LayoutDashboard, Package, Users, Receipt, History, Boxes, Plus, Search, Trash2, Pencil, Download, MessageCircle, Menu, X, RefreshCw } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { api, money } from './api'

const nav = [
  ['Overview', LayoutDashboard], ['Billing', Receipt], ['Products', Package],
  ['Stock In', Boxes], ['Customers', Users], ['Bill History', History]
]
const emptyProduct = { code:'', name:'', price:'', stock:0 }
const emptyCustomer = { name:'', phone:'', roomOrBlock:'' }

export default function App() {
  const [page,setPage] = useState('Overview')
  const [products,setProducts] = useState([])
  const [customers,setCustomers] = useState([])
  const [bills,setBills] = useState([])
  const [summary,setSummary] = useState({totalBills:0,totalSales:0})
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [loading,setLoading] = useState(false)
  const [mobileNav,setMobileNav] = useState(false)

  async function refresh() {
    setLoading(true); setError('')
    try {
      const [p,c,b,s] = await Promise.all([api('/products'),api('/customers'),api('/bills'),api('/summary/daily')])
      setProducts(p); setCustomers(c); setBills(b); setSummary(s)
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{refresh()},[])
  const notify = msg => { setSuccess(msg); setError(''); setTimeout(()=>setSuccess(''),3500) }
  const fail = e => { setError(e.message || 'Unable to complete action'); setSuccess('') }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-mark">H</div><div><b>HungerHub</b><small>SHOP MANAGEMENT</small></div><button className="close-nav" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="nav-label">WORKSPACE</div>
      {nav.map(([name,Icon])=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{setPage(name);setMobileNav(false);setError('')}}><Icon size={18}/><span>{name}</span>{name==='Bill History'&&<span className="nav-count">{bills.length}</span>}</button>)}
      <div className="sidebar-bottom"><div className="status-dot"/> Local workspace <span>v1.0</span></div>
    </aside>
    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div><div className="eyebrow">SHOP MANAGEMENT / {page.toUpperCase()}</div><h1>{page}</h1></div><button className="icon-btn" title="Refresh data" onClick={refresh}><RefreshCw size={17}/></button></header>
      <div className="content">
        {error&&<div className="alert error">{error}<button onClick={()=>setError('')}>×</button></div>}
        {success&&<div className="alert success">{success}</div>}
        {page==='Overview'&&<Overview summary={summary} products={products} bills={bills} setPage={setPage}/>}
        {page==='Products'&&<Products products={products} refresh={refresh} notify={notify} fail={fail}/>}
        {page==='Stock In'&&<StockIn products={products} refresh={refresh} notify={notify} fail={fail}/>}
        {page==='Customers'&&<Customers customers={customers} bills={bills} refresh={refresh} notify={notify} fail={fail}/>}
        {page==='Billing'&&<Billing products={products} customers={customers} refresh={refresh} notify={notify} fail={fail}/>}
        {page==='Bill History'&&<BillHistory bills={bills}/>}
        {loading&&<div className="loading">Refreshing data…</div>}
      </div>
      <footer>HungerHub <span>Simple billing. Smarter shop management.</span></footer>
    </main>
  </div>
}

function Overview({summary,products,bills,setPage}) {
  const low=products.filter(p=>p.stock<=5)
  return <>
    <div className="welcome"><div><span className="welcome-tag">YOUR SHOP AT A GLANCE</span><h2>Good business starts here.</h2><p>Here's what's happening at your shop today.</p></div><button className="primary" onClick={()=>setPage('Billing')}><Plus size={17}/> Create new bill</button></div>
    <div className="stats-grid">
      <Stat label="Today's sales" value={money(summary.totalSales)} hint="Revenue recorded today" icon="₹"/>
      <Stat label="Bills today" value={summary.totalBills||0} hint="Completed transactions" icon="▤"/>
      <Stat label="Products" value={products.length} hint="Items in your catalogue" icon="▦"/>
      <Stat label="Low stock items" value={low.length} hint="5 units or less remaining" icon="!" warn={low.length>0}/>
    </div>
    <div className="two-col">
      <section className="panel"><div className="panel-head"><div><h3>Recent bills</h3><p>Your latest transactions</p></div><button className="text-btn" onClick={()=>setPage('Bill History')}>View all →</button></div>
        {bills.slice(0,5).length?bills.slice(0,5).map(b=><div className="recent-row" key={b.id}><div className="bill-icon"><Receipt size={17}/></div><div className="grow"><b>{b.billNumber}</b><small>{b.customer?.name} · {new Date(b.createdAt).toLocaleString()}</small></div><strong>{money(b.grandTotal)}</strong></div>):<Empty text="No bills yet. Create your first bill."/>}
      </section>
      <section className="panel"><div className="panel-head"><div><h3>Stock watch</h3><p>Products that may need restocking</p></div><button className="text-btn" onClick={()=>setPage('Stock In')}>Stock in →</button></div>
        {low.length?low.slice(0,6).map(p=><div className="stock-row" key={p.id}><div className="grow"><b>{p.name}</b><small>Code {p.code}</small></div><span className={`stock-pill ${p.stock===0?'out':''}`}>{p.stock} left</span></div>):<Empty text="All stocked up. Nothing to flag."/>}
      </section>
    </div>
  </>
}
function Stat({label,value,hint,icon,warn}) { return <div className="stat-card"><div className={`stat-icon ${warn?'warning':''}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-hint">{hint}</div></div> }
function Empty({text}) { return <div className="empty">{text}</div> }

function Products({products,refresh,notify,fail}) {
  const [form,setForm]=useState(emptyProduct),[editing,setEditing]=useState(null),[query,setQuery]=useState('')
  const filtered=products.filter(p=>`${p.code} ${p.name}`.toLowerCase().includes(query.toLowerCase()))
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function submit(e){e.preventDefault();try{await api(editing?`/products/${editing}`:'/products',{method:editing?'PUT':'POST',body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock)})});setForm(emptyProduct);setEditing(null);await refresh();notify(editing?'Product updated':'Product added')}catch(err){fail(err)}}
  function edit(p){setEditing(p.id);setForm({code:p.code,name:p.name,price:p.price,stock:p.stock})}
  async function remove(p){if(!confirm(`Delete ${p.name}?`))return;try{await api(`/products/${p.id}`,{method:'DELETE'});refresh();notify('Product deleted')}catch(e){fail(e)}}
  return <div className="page-grid">
    <section className="panel form-panel"><div className="panel-head"><div><h3>{editing?'Edit product':'Add a product'}</h3><p>Product code must contain four digits</p></div></div>
      <form onSubmit={submit} className="form-stack">
        <Field label="Product code"><input name="code" value={form.code} onChange={change} maxLength="4" pattern="[0-9]{4}" placeholder="e.g. 0001" required/></Field>
        <Field label="Product name"><input name="name" value={form.name} onChange={change} placeholder="Enter product name" required/></Field>
        <Field label="MRP / Selling price (₹)"><input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={change} placeholder="0.00" required/></Field>
        <Field label="Starting stock"><input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} required/></Field>
        <button className="primary full">{editing?'Save changes':'Add product'}</button>
        {editing&&<button type="button" className="secondary full" onClick={()=>{setEditing(null);setForm(emptyProduct)}}>Cancel edit</button>}
      </form>
    </section>
    <section className="panel"><div className="panel-head"><div><h3>Product catalogue</h3><p>{products.length} products registered</p></div></div>
      <div className="searchbox"><Search size={16}/><input placeholder="Search code or product…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <div className="table-wrap"><table><thead><tr><th>CODE</th><th>PRODUCT</th><th>MRP</th><th>STOCK</th><th>ACTIONS</th></tr></thead><tbody>
        {filtered.map(p=><tr key={p.id}><td className="code">{p.code}</td><td><b>{p.name}</b></td><td>{money(p.price)}</td><td><span className={`stock-pill ${p.stock<=5?'out':''}`}>{p.stock}</span></td><td><div className="actions"><button className="small-icon" onClick={()=>edit(p)} title="Edit"><Pencil size={15}/></button><button className="small-icon danger" onClick={()=>remove(p)} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}
        {!filtered.length&&<tr><td colSpan="5"><Empty text="No products found."/></td></tr>}
      </tbody></table></div>
    </section>
  </div>
}
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }

function StockIn({products,refresh,notify,fail}) {
  const [code,setCode]=useState(''),[quantity,setQuantity]=useState(1),[product,setProduct]=useState(null)
  async function lookup(){try{const p=await api(`/products/code/${code}`);setProduct(p);setQuantity(1)}catch(e){setProduct(null);fail(e)}}
  async function submit(e){e.preventDefault();try{await api('/stock-in',{method:'POST',body:JSON.stringify({code,quantity:Number(quantity)})});setProduct(null);setCode('');setQuantity(1);await refresh();notify('Stock quantity added successfully')}catch(e){fail(e)}}
  return <div className="narrow"><section className="panel"><div className="panel-head"><div><h3>Restock a product</h3><p>Find an item by its four-digit product code</p></div></div>
    <form onSubmit={submit} className="form-stack"><Field label="Product code"><div className="inline-input"><input value={code} onChange={e=>{setCode(e.target.value);setProduct(null)}} maxLength="4" placeholder="e.g. 0001" required/><button type="button" className="secondary" onClick={lookup}>Find product</button></div></Field>
    {product&&<div className="product-preview"><div><b>{product.name}</b><small>Code {product.code} · {money(product.price)} each</small></div><div className="preview-stock"><strong>{product.stock}</strong><small>Current stock</small></div></div>}
    <Field label="Quantity to add"><input type="number" min="1" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)} required/></Field>
    <button className="primary full" disabled={!product}>Add stock</button></form>
  </section></div>
}

function Customers({customers,bills,refresh,notify,fail}) {
  const [form,setForm]=useState(emptyCustomer),[editing,setEditing]=useState(null),[selected,setSelected]=useState(null)
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function submit(e){e.preventDefault();try{await api(editing?`/customers/${editing}`:'/customers',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setForm(emptyCustomer);setEditing(null);await refresh();notify(editing?'Customer updated':'Customer saved')}catch(e){fail(e)}}
  const history=bills.filter(b=>b.customer?.id===selected?.id)
  return <div className="page-grid">
    <section className="panel form-panel"><div className="panel-head"><div><h3>{editing?'Edit customer':'Add a customer'}</h3><p>Save customer contact details</p></div></div><form className="form-stack" onSubmit={submit}>
      <Field label="Customer name"><input name="name" value={form.name} onChange={change} required placeholder="Full name"/></Field>
      <Field label="Phone number"><input name="phone" value={form.phone} onChange={change} required placeholder="WhatsApp number"/></Field>
      <Field label="Room or block"><input name="roomOrBlock" value={form.roomOrBlock} onChange={change} required placeholder="e.g. B-204"/></Field>
      <button className="primary full">{editing?'Save changes':'Save customer'}</button>
      {editing&&<button type="button" className="secondary full" onClick={()=>{setEditing(null);setForm(emptyCustomer)}}>Cancel</button>}
    </form></section>
    <section className="panel"><div className="panel-head"><div><h3>Customer directory</h3><p>{customers.length} customers saved · Select a customer to view bills</p></div></div>
      {customers.map(c=><div className={`customer-row ${selected?.id===c.id?'selected':''}`} key={c.id} onClick={()=>setSelected(c)}><div className="avatar">{c.name.slice(0,1).toUpperCase()}</div><div className="grow"><b>{c.name}</b><small>{c.phone} · {c.roomOrBlock}</small></div><button className="small-icon" onClick={e=>{e.stopPropagation();setEditing(c.id);setForm({name:c.name,phone:c.phone,roomOrBlock:c.roomOrBlock})}}><Pencil size={15}/></button></div>)}
      {!customers.length&&<Empty text="No customers added yet."/>}
      {selected&&<div className="customer-history"><h4>Bill history · {selected.name}</h4>{history.length?history.map(b=><div className="recent-row" key={b.id}><div className="grow"><b>{b.billNumber}</b><small>{new Date(b.createdAt).toLocaleString()}</small></div><strong>{money(b.grandTotal)}</strong></div>):<Empty text="No bills for this customer yet."/>}</div>}
    </section>
  </div>
}

function Billing({products,customers,refresh,notify,fail}) {
  const [customerId,setCustomerId]=useState(''),[code,setCode]=useState(''),[qty,setQty]=useState(1),[fee,setFee]=useState(0),[items,setItems]=useState([]),[lastBill,setLastBill]=useState(null)
  const subtotal=items.reduce((s,i)=>s+i.price*i.quantity,0), feeAmount=subtotal*fee/100, total=subtotal+feeAmount
  function addItem(e){e.preventDefault();const p=products.find(p=>p.code===code.trim());if(!p){fail(new Error('Product code not found.'));return}if(Number(qty)<1||!Number.isInteger(Number(qty))){fail(new Error('Quantity must be a positive whole number.'));return}
    const existing=items.find(i=>i.code===p.code), nextQty=(existing?.quantity||0)+Number(qty)
    if(nextQty>p.stock){fail(new Error(`Insufficient stock. Only ${p.stock} available.`));return}
    setItems(existing?items.map(i=>i.code===p.code?{...i,quantity:nextQty}:i):[...items,{code:p.code,name:p.name,price:Number(p.price),quantity:Number(qty),stock:p.stock}]);setCode('');setQty(1)}
  async function saveBill(){if(!customerId){fail(new Error('Select a customer first.'));return}if(!items.length){fail(new Error('Add at least one item.'));return}
    try{const bill=await api('/bills',{method:'POST',body:JSON.stringify({customerId:Number(customerId),convenienceFeePercent:fee,items:items.map(i=>({code:i.code,quantity:i.quantity}))})});setLastBill(bill);setItems([]);setFee(0);await refresh();notify(`Bill ${bill.billNumber} saved successfully`)}catch(e){fail(e)}}
  const billText=b=>`${'HungerHub'}\nBill: ${b.billNumber}\nDate: ${new Date(b.createdAt).toLocaleString()}\nCustomer: ${b.customer.name}\nPhone: ${b.customer.phone}\nRoom/Block: ${b.customer.roomOrBlock}\n\n${b.items.map(i=>`${i.productCode} ${i.productName} x ${i.quantity} @ ${money(i.unitPrice)} = ${money(i.lineTotal)}`).join('\n')}\n\nSubtotal: ${money(b.subtotal)}\nConvenience fee (${b.convenienceFeePercent}%): ${money(b.convenienceFeeAmount)}\nGRAND TOTAL: ${money(b.grandTotal)}\nThank you for shopping with HungerHub`
  function whatsapp(b){window.open(`https://wa.me/${b.customer.phone.replace(/\D/g,'')}?text=${encodeURIComponent(billText(b))}`,'_blank','noopener,noreferrer')}
  function pdf(b){const doc=new jsPDF();let y=18;doc.setFontSize(20);doc.text('HungerHub',15,y);y+=12;doc.setFontSize(10);const lines=billText(b).split('\n');lines.slice(1).forEach(line=>{if(y>280){doc.addPage();y=18}doc.text(line,15,y);y+=7});doc.save(`${b.billNumber}.pdf`);setTimeout(()=>whatsapp(b),500)}
  return <div className="billing-layout">
    <section className="panel"><div className="panel-head"><div><h3>Create a bill</h3><p>Scan or type product codes to add items</p></div><span className="live-tag">NEW BILL</span></div>
      <Field label="Select customer"><select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Choose a customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></Field>
      <form className="add-line" onSubmit={addItem}><Field label="Product code"><input value={code} onChange={e=>setCode(e.target.value)} maxLength="4" placeholder="0001" required/></Field><Field label="Qty"><input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} required/></Field><button className="primary add-btn"><Plus size={17}/> Add</button></form>
      <div className="table-wrap bill-table"><table><thead><tr><th>ITEM</th><th>QTY</th><th>MRP</th><th>TOTAL</th><th></th></tr></thead><tbody>
        {items.map(i=><tr key={i.code}><td><b>{i.name}</b><small className="block code">{i.code}</small></td><td>{i.quantity}</td><td>{money(i.price)}</td><td>{money(i.price*i.quantity)}</td><td><button className="small-icon danger" onClick={()=>setItems(items.filter(x=>x.code!==i.code))}><Trash2 size={15}/></button></td></tr>)}
        {!items.length&&<tr><td colSpan="5"><Empty text="Your bill is empty. Add a product to begin."/></td></tr>}
      </tbody></table></div>
      <div className="bill-bottom"><div className="fee-select"><label>Convenience fee</label><select value={fee} onChange={e=>setFee(Number(e.target.value))}><option value="0">None (0%)</option><option value="5">5%</option><option value="10">10%</option></select></div>
        <div className="totals"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Convenience fee ({fee}%)</span><b>{money(feeAmount)}</b></div><div className="grand"><span>Grand total</span><strong>{money(total)}</strong></div></div>
        <button className="primary full" onClick={saveBill} disabled={!items.length}>Save bill & update stock</button>
      </div>
    </section>
    <aside className="panel bill-help"><div className="panel-head"><div><h3>Billing guide</h3><p>Quick reminders</p></div></div><div className="guide-item"><span>01</span><div><b>Select customer</b><small>Choose who you're billing.</small></div></div><div className="guide-item"><span>02</span><div><b>Add products</b><small>Enter each four-digit product code.</small></div></div><div className="guide-item"><span>03</span><div><b>Review total</b><small>Choose a convenience fee and check the amount.</small></div></div><div className="guide-item"><span>04</span><div><b>Save the bill</b><small>Stock is reduced automatically.</small></div></div>
      {lastBill&&<div className="last-bill"><div className="success-mark">✓</div><b>{lastBill.billNumber} created</b><strong>{money(lastBill.grandTotal)}</strong><button className="secondary full" onClick={()=>whatsapp(lastBill)}><MessageCircle size={16}/> Send as text</button><button className="secondary full" onClick={()=>pdf(lastBill)}><Download size={16}/> Download PDF + WhatsApp</button><small>PDF downloads first; attach it manually in WhatsApp.</small></div>}
    </aside>
  </div>
}

function BillHistory({bills}) {
  const [query,setQuery]=useState('')
  const filtered=bills.filter(b=>`${b.billNumber} ${b.customer?.name||''} ${b.customer?.phone||''}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="panel"><div className="panel-head"><div><h3>All bills</h3><p>{bills.length} transactions recorded</p></div></div><div className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search bill number or customer…"/></div>
    <div className="table-wrap"><table><thead><tr><th>BILL NO.</th><th>DATE & TIME</th><th>CUSTOMER</th><th>ITEMS</th><th>GRAND TOTAL</th></tr></thead><tbody>
      {filtered.map(b=><tr key={b.id}><td className="code">{b.billNumber}</td><td>{new Date(b.createdAt).toLocaleString()}</td><td><b>{b.customer?.name}</b><small className="block">{b.customer?.phone}</small></td><td>{b.items?.length||0}</td><td><b>{money(b.grandTotal)}</b></td></tr>)}
      {!filtered.length&&<tr><td colSpan="5"><Empty text="No matching bills."/></td></tr>}
    </tbody></table></div>
  </section>
}
