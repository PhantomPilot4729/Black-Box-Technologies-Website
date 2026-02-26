export default function Contact () {
    return (
        <main>
            <section className="page-hero">
                <h1>CONTACT US</h1>
                <p>Get in touch with Black Box Technologies</p>
            </section>

            <section className="contact-section">
                <div className="contact-grid">
                    <div className="contact-form-wrapper">
                        <h2>SEND A MESSAGE</h2>
                        <div className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">NAME</label>
                                <input type="text" id="name" placeholder="Your Name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">EMAIL</label>
                                <input type="email" id="email" placeholder="Your Email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">MESSAGE</label>
                                <textarea id="message" rows={6} placeholder="Your message" />
                            </div>
                            <button className="btn-primary btn-dark">SEND MESSAGE</button>
            </div>
          </div>

          <div className="contact-info">
            <h2>REACH US DIRECTLY</h2>
            <div className="contact-info-item">
              <span className="contact-label">EMAIL</span>
              <span>contact@blackboxtech.xyz</span>
            </div>
            <div className="contact-info-item">
              <span className="contact-label">PHONE</span>
              <span>+1 (000) 000-0000</span>
            </div>
            <div className="contact-info-item">
              <span className="contact-label">LOCATION</span>
              <span>Your City, State</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}