export default function About() {
    return(
        <main>
            <section className="page-hero">
                <h1>ABOUT US</h1>
                <p>Black Box Technologies is a data security company specializing in physical data destruction and computer restoration services. We are committed to providing secure and reliable solutions for individuals and businesses looking to protect their sensitive information.</p>
            </section>
            <section className="about-story">
                <h2>OUR STORY</h2>
                <p>Initially founded in 2025, Black Box Technologies strives to put secure, reliable, and efficient data destruction and restoration services while providing secuity of mind that your sensitive data is actually destroyed to DOD standards.</p>
            </section>
            <section className="about-team">
                <h2>MEET THE TEAM</h2>
                <div className="team-grid">
                    <div className="team-card">
                        <h3>Matthew Herndon</h3>
                        <p>Founder and CEO</p>
                    </div>
                    <div className="team-card">
                        <h3>Daniel Eremin</h3>
                        <p>Co-Founder and CTO</p>
                    </div>
                </div>
            </section>
        </main>
    )
}