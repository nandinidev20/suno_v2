import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
    <div style={{ color: '#c3c7d1' }}>{children}</div>
  </section>
);

const Terms = () => {
  return (
    <div className="terms-page" style={{ minHeight: '100vh', background: '#0f111a', color: '#fff' }}>
      <header style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>OpenBeat.AI — Terms &amp; Conditions</h1>
          <p style={{ marginTop: '0.75rem', color: '#9aa0b4' }}>
            These Terms &amp; Conditions govern your access to and use of the OpenBeat.AI website, platform, and related services.
            By accessing or using OpenBeat, you agree to be bound by these Terms. If you do not agree, do not use the platform.
          </p>
        </div>
      </header>

      <main style={{ padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', lineHeight: 1.8 }}>
          <Section title="Last Updated">
            <p>[11.10.25]</p>
          </Section>

          <Section title="1. Eligibility">
            <p>
              You must be at least 13 years old to use OpenBeat. If you are under the age of majority in your jurisdiction, you may only use the platform with permission from a parent or legal guardian.
            </p>
          </Section>

          <Section title="2. User Responsibilities">
            <p>You agree not to use OpenBeat for any unlawful, harmful, or unauthorized purpose.</p>
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Upload copyrighted audio, music, vocals, stems, or other materials that you do not own or do not have permission to use.</li>
              <li>Use OpenBeat to create infringing, defamatory, or illegal content.</li>
              <li>Attempt to reverse engineer OpenBeat’s models, APIs, or systems.</li>
              <li>Interfere with or damage the platform through automated tools, scraping, or malicious activity.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              You are solely responsible for any content you upload, generate, publish, or share using OpenBeat.
            </p>
          </Section>

          <Section title="3. Copyright &amp; Intellectual Property">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>3.1 Your Uploaded Content</h3>
            <p>
              You represent and warrant that any audio, text, prompts, lyrics, recordings, or material you upload are owned by you,
              or you have obtained all necessary rights, licenses, and permissions to use them. OpenBeat is not liable for any user-submitted content.
            </p>
            <p>
              If you upload copyrighted material without permission, you are fully responsible for any resulting claims, losses, or legal action.
            </p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1.5rem 0 0.5rem' }}>3.2 Generated Content Rights</h3>
            <p>
              OpenBeat grants you a non-exclusive, royalty-free, perpetual, worldwide license to use, modify, distribute, publish, monetize, and commercially exploit the content generated via the platform (“Generated Content”), subject to the following:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Generated Content is provided “as-is” with no guarantee of uniqueness.</li>
              <li>You are responsible for ensuring that your use of Generated Content complies with applicable laws, including similarity to copyrighted works or potentially recognizable voices.</li>
              <li>OpenBeat does not claim ownership over your Generated Content.</li>
            </ul>
          </Section>

          <Section title="4. License to Use the Platform">
            <p>
              OpenBeat grants you a limited, revocable, non-transferable license to access and use the platform for lawful purposes in accordance with these Terms.
            </p>
          </Section>

          <Section title="5. Prohibited Use of Copyrighted or Protected Materials">
            <p>Uploading copyrighted content without authorization is strictly prohibited. If we discover that content violates copyright laws, OpenBeat may:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Remove or restrict access to the material</li>
              <li>Suspend or terminate your account</li>
              <li>Provide information to rights holders as required by law</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              You agree to indemnify and hold OpenBeat harmless from any claims arising from your misuse of copyrighted content.
            </p>
          </Section>

          <Section title="6. Commercial Use of Generated Music">
            <p>
              All content generated through OpenBeat (including songs, beats, stems, lyrics, musical ideas, covers, or remixes) may be used commercially, including for:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>YouTube/streaming</li>
              <li>Music releases</li>
              <li>Film, TV, ads</li>
              <li>Podcasts</li>
              <li>Games</li>
              <li>Personal or business projects</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              No royalties, credit, subscriptions, or licensing fees are required, except where you incorporate third-party content you do not own.
            </p>
          </Section>

          <Section title="7. Model Output Limitations">
            <p>
              AI-generated audio may occasionally resemble existing works unintentionally. OpenBeat makes no guarantee that generated content will be unique,
              will not resemble copyrighted melodies, or will be free from potential infringement risk. Users should evaluate generated output before commercial use.
            </p>
          </Section>

          <Section title="8. DMCA Policy">
            <p>OpenBeat complies with the Digital Millennium Copyright Act (DMCA).</p>
            <p>To submit a DMCA takedown request, please contact:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Email: openbeatai@gmail.com</li>
              <li>Subject: DMCA Notice – OpenBeat.AI</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>We will respond promptly to verified notices.</p>
          </Section>

          <Section title="9. Account Suspension &amp; Termination">
            <p>We may suspend or terminate your account if:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>You violate these Terms</li>
              <li>You upload harmful or infringing material</li>
              <li>You misuse the platform or disrupt service</li>
              <li>You engage in fraudulent behavior</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Termination decisions are at OpenBeat’s discretion.
            </p>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <p>
              OpenBeat is provided “as is” and “as available.” We disclaim all warranties, express or implied, including fitness for a particular purpose,
              non-infringement, and availability or reliability of AI-generated content. Use the platform at your own risk.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, OpenBeat is not liable for loss of data, loss of revenue or business, copyright disputes arising from content
              uploaded by users, claims based on improper or illegal use of the platform, or any direct, indirect, incidental, or consequential damages.
            </p>
            <p>Your sole remedy is to discontinue use of the platform.</p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless OpenBeat, its owners, affiliates, employees, and partners from any claims, damages, losses, or expenses arising from:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Your uploaded content</li>
              <li>Your use of Generated Content</li>
              <li>Your violation of these Terms</li>
              <li>Any infringement caused by your actions</li>
            </ul>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms at any time. Changes will be posted on this page with a new “Last Updated” date.
              Continued use of OpenBeat after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Montana, without regard to conflict of law principles.
              Any disputes shall be resolved exclusively in Montana state or federal courts.
            </p>
          </Section>

          <Section title="15. Contact Information">
            <p>
              For support or legal inquiries:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li>Email: openbeatai@gmail.com</li>
              <li>Website: OpenBeat.AI</li>
            </ul>
          </Section>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to="/"
              className="btn-gradient"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Return to Home
            </Link>
            <p style={{ color: '#9aa0b4', margin: 0 }}>
              Last Updated: 11.10.25
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;

