import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="nav-logo">BLACK BOX TECHNOLOGIES</span>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/dashboard/analytics?tab=blackwall">Blackwall Line</Link></li>
          <li><Link href="/login" className="nav-login">EMPLOYEE LOGIN</Link></li>
        </ul>
    </nav>
  )
}