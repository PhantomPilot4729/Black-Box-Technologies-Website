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
            <li><Link href="/blackwall" className="nav-blackwall">BLACKWALL LINE</Link></li>
            <li><Link href="/customers/login" className="nav-login">CUSTOMER LOGIN</Link></li>
            <li><Link href="/customers/signup" className="nav-login">SIGN UP</Link></li>
            <li><Link href="/login" className="nav-login">EMPLOYEE LOGIN</Link></li>
          </ul>
    </nav>
  )
}