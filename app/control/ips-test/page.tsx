export const metadata = {
  title: 'Kerio Intrusion Prevention Test',
};

export default function IpsTestPage() {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', maxWidth: 800, minHeight: '100vh' }}>
      <h1>Kerio Intrusion Prevention Test</h1>

      <p>This page will test your Intrusion Prevention System in Kerio Control.</p>

      <h2>How Does it Work?</h2>

      <p>
        The test sends three special chunks of data back to your browser that your IPS
        recognizes as threats and logs or drops them according to your Kerio Control
        configuration. Please note that the data is completely harmless and does not
        pose any threat whatsoever even if your IPS is not functioning.
      </p>

      <p>
        Please keep in mind that the test results may not be reliable if your network
        suffers from very high latency or packet loss ratio. In such cases the test may
        falsely report that the traffic was dropped.
      </p>

      <p>
        This test will not work for any other IDS/IPS system than the one built in
        Kerio Control.
      </p>

      <h2>How Do I Check the Results?</h2>

      <p>
        Once the test is finished, depending on the severity levels settings in your
        Intrusion Prevention configuration, you should see messages similar to the
        following examples in your Kerio Control&apos;s security log:
      </p>

      <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, overflowX: 'auto', fontSize: 13, border: '1px solid #ddd' }}>{`IPS: Packet drop, severity: High, Rule ID: 1:3000001 KERIO IPS Test Signature - High Severity,
    proto:TCP, ip/port:85.17.210.230:80(www.kerio.com) -> 10.0.0.1:49023

IPS: Alert, severity: Medium, Rule ID: 1:3000002 KERIO IPS Test Signature - Medium Severity,
    proto:TCP, ip/port:85.17.210.230:80(www.kerio.com) -> 10.0.0.1:49023

IPS: Alert, severity: Low, Rule ID: 1:3000003 KERIO IPS Test Signature - Low Severity,
    proto:TCP, ip/port:85.17.210.230:80(www.kerio.com) -> 10.0.0.1:49023`}</pre>

      <h2>Perform the Test</h2>

      <p>
        Click on the &quot;Start test&quot; button. For each intrusion severity, the table below
        will show whether it is dropped by your IPS or not. The result should correspond
        to your IPS configuration.
      </p>

      <div style={{ width: 240, background: '#f5f5f5', padding: 12, borderRadius: 4, border: '1px solid #ddd' }}>
        <div style={{ marginBottom: 4 }}>
          High severity: <span id="highResult" style={{ float: 'right' }}></span>
        </div>
        <div style={{ marginBottom: 4 }}>
          Medium severity: <span id="mediumResult" style={{ float: 'right' }}></span>
        </div>
        <div>
          Low severity: <span id="lowResult" style={{ float: 'right' }}></span>
        </div>
      </div>

      <p>
        <button id="startButton" style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4 }}>
          Start test
        </button>
      </p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            function setResultState(priority, state, color) {
              var e = document.getElementById(priority + "Result");
              e.style.color = color;
              e.innerHTML = state;
              e.resultState = state;
            }

            function getResultState(priority) {
              var e = document.getElementById(priority + "Result");
              return e.resultState;
            }

            function testNext(priority) {
              if (priority == "high") testPriority("medium");
              else if (priority == "medium") testPriority("low");
            }

            function testTimeout(priority, req) {
              if (req.priority == priority && getResultState(priority) == "testing...") {
                req.abort();
                setResultState(priority, "Dropped", "#000000");
                testNext(priority);
              }
            }

            function testPriority(priority) {
              setResultState(priority, "testing...", "#C0C0C0");
              var req = new XMLHttpRequest();
              req.priority = priority;
              req.onreadystatechange = function() {
                if (req.readyState == 4 && req.status == 200 && req.priority == priority) {
                  if (getResultState(priority) == "testing...") {
                    setResultState(priority, "Permitted", "#000000");
                    testNext(priority);
                  }
                }
              };
              req.open("GET", "/ipstest/request?sig=" + priority);
              req.send(null);
              setTimeout(function() { testTimeout(priority, req); }, 8000);
            }

            function ipsTest() {
              setResultState("low", "", "#000000");
              setResultState("medium", "", "#000000");
              testPriority("high");
            }

            document.getElementById("startButton").addEventListener("click", ipsTest);
          `,
        }}
      />
    </div>
  );
}
