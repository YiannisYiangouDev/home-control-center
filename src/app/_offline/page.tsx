export default function OfflinePage() {
  return (
    <html>
      <head><title>Offline — Home Control Center</title></head>
      <body style={{ background: "#0a0f1a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <h1 style={{ margin: 0, fontSize: 20 }}>You&apos;re Offline</h1>
          <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>Connect to the internet to continue</p>
        </div>
      </body>
    </html>
  );
}
