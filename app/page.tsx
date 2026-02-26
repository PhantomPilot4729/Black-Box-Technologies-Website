export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>Black Box Technologies</h1>
          <p>Securing the digital world through physical data security solutions.</p>
          <a href="/contact" className="btn-primary">GET IN TOUCH</a>
        </div>
      </section>
      <section className="services-snapshot">
        <h2>WHAT WE DO</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Data Destruction</h3>
            <p>Securely destroy sensitive data on hard drives and storage devices to DOD standards.</p>
          </div>
          <div className="service-card">
            <h3>PC Construction</h3>
            <p>Custom PC Construction (currently for personal use)</p>
          </div>
          <div className="service-card">
            <h3>Computer Restoration</h3>
            <p>Restoration and recovery of damaged or failed computer systems for resale.</p>
          </div>
        </div>
      </section>
      <section className="why-us">
        <h2>WHY BLACK BOX</h2>
        <div className="why-grid">
          <div className="why-card">
            <h3>Department  of Defense level destruction</h3>
            <p>Our data destruction services meet DOD standards for secure disposal of sensitive information.</p>
          </div>
          <div className="why-card">
            <h3>Sense of Security</h3>
            <p>Your hard drives and data storage devices are destroyed in front of you, so you know that it is being destroyed.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
