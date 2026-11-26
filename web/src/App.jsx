import { useState } from 'react';

const TABS = [
  {
    id: 'upload',
    label: 'Upload & Harden',
    title: 'Application Upload & Hardening',
    description:
      'Submit an Android 14+ APK or AAB package to wrap it with SecuroPOP runtime protections and policy enforcement.',
    items: [
      'Package Upload & Manifest Inspection (Android API 34+)',
      'Automated Security Wrapper Injection',
      'Signed Hardened Build Output'
    ]
  },
  {
    id: 'policy',
    label: 'Policy',
    title: 'Android 14+ Security Policy',
    description:
      'Configure baseline enterprise security rules enforced by SecuroPOP inside wrapped applications.',
    items: [
      'Screenshot & Screen-Recording Prevention (FLAG_SECURE)',
      'Debugger, Tamper & Root Detection Guardrails',
      'Enforced TLS & Local Storage Protection'
    ]
  },
  {
    id: 'audit',
    label: 'Audit Reports',
    title: 'Security Audit Reports',
    description:
      'Review application hardening history, policy compliance checks, and device posture telemetry.',
    items: [
      'Build Verification & Signature Summary',
      'Android 14+ Permission & Exported Component Audit',
      'Exportable Compliance Report Logs'
    ]
  }
];

export default function App() {
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);
  const currentTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1>SecuroPOP — Android 14+ Security Framework</h1>
            <p className="subtitle">
              Application Hardening, Policy Control &amp; Compliance Console
            </p>
          </div>
          <span className="status-pill">Target: Android 14+ (API 34+)</span>
        </div>

        <nav className="tab-bar" aria-label="Primary Navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button ${tab.id === currentTab.id ? 'active' : ''}`}
              onClick={() => setActiveTabId(tab.id)}
              aria-pressed={tab.id === currentTab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <section className="panel" aria-labelledby="panel-title">
          <div className="panel-header">
            <h2 id="panel-title">{currentTab.title}</h2>
            <span className="placeholder-tag">Day 1 Placeholder</span>
          </div>
          <p className="panel-description">{currentTab.description}</p>

          <div className="placeholder-box">
            <h3>Planned Capabilities</h3>
            <ul>
              {currentTab.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
