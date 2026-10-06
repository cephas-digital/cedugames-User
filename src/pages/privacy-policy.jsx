import { Link } from "react-router-dom";
import { BrandLogo } from "../components/Brand";

const sections = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <h3>From parents and guardians</h3>
        <ul>
          <li>Name, email address and phone number.</li>
          <li>Billing details handled by our payment processor. We do not store full card numbers.</li>
          <li>A child&apos;s first name or nickname, age or grade level, avatar and learner login details.</li>
          <li>The date, method and scope of parental consent.</li>
        </ul>
        <h3>From children and learners</h3>
        <p>We limit collection to what is needed to provide a safe learning experience:</p>
        <ul>
          <li>Username, PIN or password used to access Learner Mode. Children under 13 are not required to provide their own email address.</li>
          <li>Learning progress, scores, achievements, time spent, answers, hints and recently opened modules.</li>
          <li>Privacy-preserving device identifiers needed to run the mobile app and save progress.</li>
        </ul>
        <p>Learner Mode does not expose billing, account settings, other users&apos; data or account-deletion controls.</p>
        <h3>From schools and teachers</h3>
        <p>For institutional accounts, we may receive a teacher or administrator&apos;s name, work email, school name and a limited class roster supplied under the school&apos;s consent basis.</p>
        <h3>Technical information</h3>
        <p>We may collect browser or app type, operating system, general usage analytics, crash logs and IP address for security, performance and fraud prevention.</p>
        <aside className="rounded-2xl border border-purple-200 bg-purple-50 p-5" aria-label="Information we do not collect from children">
          <h3 className="!mt-0">What we do not collect from children</h3>
          <p className="!mb-0">We do not collect precise geolocation, government ID numbers, public profile fields, open-chat messages or data used to build behavioural-advertising profiles.</p>
        </aside>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: <ul><li>Operate and personalise educational games and learning paths.</li><li>Let parents monitor a child&apos;s progress.</li><li>Send service, progress and billing communications to parents or guardians.</li><li>Maintain security, prevent abuse and enforce our terms.</li><li>Improve the service using aggregated, de-identified analytics.</li></ul>,
  },
  {
    id: "parental-consent",
    title: "Parental consent",
    content: <><p>Before collecting personal information from a child under 13, or the applicable local age of digital consent, we obtain verifiable parental consent using a legally recognised method. Parents may agree to basic gameplay while declining optional data-driven personalisation.</p><p>Consent can be withdrawn at any time by contacting <a href="mailto:cedugames@gmail.com">cedugames@gmail.com</a>. We will deactivate the child&apos;s account and delete associated personal information, subject to the retention rules below.</p></>,
  },
  {
    id: "sharing",
    title: "How we share information",
    content: <><p>We do not sell personal information belonging to children or teens. We share information only:</p><ul><li>With contracted service providers working on our behalf under confidentiality and data-protection obligations.</li><li>With the child&apos;s parent or guardian and, where applicable, their school.</li><li>When required by law, regulation or valid legal process.</li><li>During a merger, acquisition or sale of assets, where equivalent privacy protections are maintained.</li></ul></>,
  },
  {
    id: "retention-rights",
    title: "Retention, deletion and parental rights",
    content: <><p>We keep a child&apos;s information only as long as needed to provide the service and as consented to by the parent. Inactive accounts are reviewed periodically and personal data is deleted or anonymised after 12 months of inactivity, unless law, safety or audit requirements require longer retention.</p><p>Parents and guardians may review their child&apos;s information, correct it, request deletion, or refuse further collection and use. Send a request to <a href="mailto:cedugames@gmail.com">cedugames@gmail.com</a>.</p></>,
  },
  {
    id: "security-transfers",
    title: "Security and international transfers",
    content: <><p>We use safeguards appropriate to the sensitivity of children&apos;s data, including encryption in transit and at rest, role-based access controls and regular independent security testing.</p><p>When data is processed or stored outside a user&apos;s country, we apply safeguards consistent with the Nigeria Data Protection Act and other applicable cross-border transfer rules.</p></>,
  },
  {
    id: "cookies-services",
    title: "Cookies and third-party services",
    content: <><p>The web dashboard may use functional and analytics cookies. The mobile app does not use third-party advertising cookies or trackers targeted at children; analytics tools are configured in a child-safe, no-ad-tracking mode.</p><p>Third-party services used for analytics, crash reporting or cloud storage are vetted for children&apos;s-privacy requirements and contractually prohibited from using children&apos;s data for their own purposes, including advertising.</p></>,
  },
  {
    id: "changes-contact",
    title: "Changes and contact",
    content: <><p>We will announce material changes by email and/or an in-dashboard notice. If a change affects previously granted consent, we will seek renewed parental consent before it takes effect.</p><address className="not-italic"><strong>CEDUGAMES</strong><br /><a href="mailto:cedugames@gmail.com">cedugames@gmail.com</a><br /><a href="tel:+2349134582568">+234 913 458 2568</a></address></>,
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-[#f8f5ff] text-slate-800">
    <a href="#privacy-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-purple-700 focus:shadow-lg">Skip to privacy policy</a>
    <header className="border-b border-purple-100 bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" aria-label="CEDUGAMES home"><BrandLogo className="w-32 sm:w-40" /></Link>
        <Link to="/sign-up" className="rounded-xl bg-[#8b36c7] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#7325ad] focus:outline-none focus:ring-4 focus:ring-purple-200">Create account</Link>
      </div>
    </header>
    <main id="privacy-content">
      <section className="bg-gradient-to-br from-[#6d28d9] via-[#9333ea] to-[#bf5af2] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-purple-100">Your privacy matters</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-purple-50">A clear explanation of how CEDUGAMES collects, uses and protects information for children, parents and schools.</p>
          <p className="mt-6 text-sm font-semibold text-purple-100">Effective 21 September 2026 · Last updated 18 September 2026</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-14">
        <nav aria-label="Privacy policy sections" className="h-fit rounded-2xl border border-purple-100 bg-white p-5 shadow-sm lg:sticky lg:top-5">
          <p className="mb-3 font-extrabold text-slate-900">On this page</p>
          <ol className="space-y-2 text-sm font-semibold text-slate-600">{sections.map((section, index) => <li key={section.id}><a className="block rounded-lg px-2 py-1.5 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400" href={`#${section.id}`}>{index + 1}. {section.title}</a></li>)}</ol>
        </nav>
        <article className="rounded-3xl border border-purple-100 bg-white px-5 py-8 shadow-sm sm:px-9 lg:px-12">
          <section aria-labelledby="introduction-heading" className="privacy-section">
            <h2 id="introduction-heading">Introduction</h2>
            <p>CEDUGAMES provides educational games through a web dashboard and companion mobile app (together, the “Service”). The dashboard includes Parent/Guardian Mode, Teacher/Administrator Mode for institutional licences, and a restricted Learner Mode for children.</p>
            <p>This policy explains how we collect, use, share and protect information. It is designed around applicable child-privacy law, including the Nigeria Data Protection Act 2023, the U.S. Children&apos;s Online Privacy Protection Act where applicable, and the UK GDPR and Age Appropriate Design Code where applicable.</p>
            <p>It applies to parents and legal guardians, children under 13 or the equivalent local threshold, teenagers, teachers and school administrators who use the Service.</p>
          </section>
          {sections.map((section) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="privacy-section scroll-mt-6"><h2 id={`${section.id}-heading`}>{section.title}</h2>{section.content}</section>)}
        </article>
      </div>
    </main>
    <footer className="border-t border-purple-100 bg-white px-4 py-8 text-center text-sm text-slate-600"><p>© 2026 CEDUGAMES · <Link className="font-bold text-purple-700 underline underline-offset-4" to="/login">Login</Link></p></footer>
  </div>
);

export default PrivacyPolicy;
