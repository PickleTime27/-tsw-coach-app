const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

// Fix the double-nested loggedIn in fixed nav (lines ~195-197)
c = c.replace(
  /\{loggedIn \? \(<><button onClick=\{[^}]+\} className="btn-primary"[^>]+>Go to BALM<\/button><button onClick=\{[^}]+\}[^>]+>\{"\\u2630"\}<\/button><\/>\) : \(<>\{loggedIn \? \(<><button onClick=\{[^}]+\} className="btn-primary"[^>]+>Go to BALM<\/button><button onClick=\{[^}]+\}[^>]+>\{"\\u2630"\}<\/button><\/>\) : \(<><button className="btn-secondary"[^>]+>Log In<\/button>\s*<button className="btn-primary"[^>]+>Get Started Free<\/button><\/>\)\}/,
  '{loggedIn ? (<><button onClick={() => window.location.href="/chat"} className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }}>Go to BALM</button><button onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, background: "white", border: "1px solid rgba(27,107,74,0.2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{"\\u2630"}</button></>) : (<><button className="btn-secondary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Log In</button><button className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Get Started Free</button></>)}'
);

fs.writeFileSync('src/app/page.tsx', c, 'utf8');
console.log('Nested loggedIn count:', (c.match(/loggedIn \?/g) || []).length);
console.log('Go to BALM count:', (c.match(/Go to BALM/g) || []).length);
