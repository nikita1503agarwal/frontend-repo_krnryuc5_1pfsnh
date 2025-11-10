import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from './lib/api'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  return { theme, toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }
}

function Layout({ children }) {
  const { theme, toggle } = useTheme()
  const [menu, setMenu] = useState(false)
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/70 dark:bg-gray-950/70 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">FashionFlow</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/products" className="hover:text-blue-500">Shop</Link>
            <Link to="/account" className="hover:text-blue-500">Account</Link>
            <Link to="/cart" className="hover:text-blue-500">Cart</Link>
            <button onClick={toggle} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">{theme === 'light' ? 'Dark' : 'Light'}</button>
          </nav>
          <button className="md:hidden px-3 py-2" onClick={() => setMenu(s => !s)}>Menu</button>
        </div>
        {menu && (
          <div className="md:hidden px-4 pb-4 flex gap-4 text-sm">
            <Link to="/products">Shop</Link>
            <Link to="/account">Account</Link>
            <Link to="/cart">Cart</Link>
            <button onClick={toggle} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">{theme === 'light' ? 'Dark' : 'Light'}</button>
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-sm text-center">© {new Date().getFullYear()} FashionFlow</footer>
    </div>
  )
}

function Hero() {
  return (
    <section className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">Wear your vibe with FashionFlow</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Discover curated apparel, smart filters, and a delightful checkout — all in one modern shopping experience.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/products" className="px-5 py-3 rounded bg-blue-600 text-white hover:bg-blue-700">Shop now</Link>
          <a href="/test" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Check backend</a>
        </div>
      </div>
      <div className="aspect-video rounded-xl bg-gradient-to-br from-fuchsia-500 to-blue-600 opacity-80" />
    </section>
  )
}

function ProductCard({ p }) {
  return (
    <Link to={`/product/${p.slug || p.id}`} className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow">
      <div className="aspect-square bg-gray-100 dark:bg-gray-900" />
      <div className="p-4">
        <div className="font-medium group-hover:text-blue-600">{p.title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">${p.price.toFixed(2)}</div>
      </div>
    </Link>
  )
}

function HomePage() {
  const [featured, setFeatured] = useState([])
  useEffect(() => {
    apiGet('/api/products?featured=true&limit=8&sort=newest').then(d => setFeatured(d.items)).catch(() => {})
  }, [])
  return (
    <>
      <Hero />
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured</h2>
          <Link to="/products" className="text-blue-600">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </>
  )
}

function ProductsPage() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    params.set('page', page)
    params.set('limit', limit)
    apiGet(`/api/products?${params.toString()}`).then(d => { setItems(d.items); setTotal(d.total) })
  }, [q, category, sort, page])

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-8">
      <aside className="space-y-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="w-full px-3 py-2 border rounded" />
        <select value={sort} onChange={e => setSort(e.target.value)} className="w-full px-3 py-2 border rounded">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </aside>
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.max(1, Math.ceil(total/limit)) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`px-3 py-1 border rounded ${page===i+1?'bg-blue-600 text-white':''}`}>{i+1}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductDetailPage() {
  const slug = location.pathname.split('/').pop()
  const [p, setP] = useState(null)
  useEffect(() => { apiGet(`/api/products/${slug}`).then(setP) }, [slug])
  if (!p) return <div>Loading...</div>
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded" />
      <div>
        <h1 className="text-3xl font-bold">{p.title}</h1>
        <div className="text-xl mt-2">${p.price.toFixed(2)}</div>
        <button className="mt-6 px-5 py-3 rounded bg-blue-600 text-white">Add to Cart</button>
      </div>
    </div>
  )
}

function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        const res = await apiPost('/api/auth/login', { email, password })
        localStorage.setItem('token', res.token)
        nav('/')
      } else {
        await apiPost('/api/auth/register', { name, email, password })
        setMode('login')
      }
    } catch (e) {
      alert(e.message)
    }
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit} className="space-y-3">
        {mode==='register' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border rounded"/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded"/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 border rounded"/>
        <button className="w-full px-4 py-2 rounded bg-blue-600 text-white">{mode==='login'?'Login':'Create account'}</button>
      </form>
      <button className="mt-3 text-sm text-blue-600" onClick={()=>setMode(m=>m==='login'?'register':'login')}>
        {mode==='login'?"Need an account? Register":"Have an account? Login"}
      </button>
    </div>
  )
}

function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/products" element={<ProductsPage/>} />
          <Route path="/product/:slug" element={<ProductDetailPage/>} />
          <Route path="/account" element={<AuthPage/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default function App() { return <Router/> }
