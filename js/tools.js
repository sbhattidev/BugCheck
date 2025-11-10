const tools = [
  {name:"DNSDumpster",cat:"dns",desc:"DNS mapping & host discovery",url:"https://dnsdumpster.com/"},
  {name:"NSLookup.io",cat:"dns",desc:"DNS lookup and record checks",url:"https://www.nslookup.io/"},
  {name:"MXToolbox",cat:"dns",desc:"DNS / MX / blacklist lookup",url:"https://mxtoolbox.com/"},

  {name:"Subdomain Finder (c99)",cat:"subdomains",desc:"Online subdomain enumeration",url:"https://subdomainfinder.c99.nl/"},
  {name:"crt.sh",cat:"subdomains",desc:"Certificate transparency enumeration",url:"https://crt.sh/"},
  {name:"SecurityTrails",cat:"subdomains",desc:"Subdomain & DNS history",url:"https://securitytrails.com/"},

  {name:"Wayback Machine",cat:"archive",desc:"Archived website snapshots",url:"https://web.archive.org/"},

  {name:"Censys",cat:"osint",desc:"Search internet-wide hosts",url:"https://search.censys.io/"},
  {name:"Shodan",cat:"osint",desc:"Search exposed devices & services",url:"https://www.shodan.io/"},
  {name:"IPinfo",cat:"osint",desc:"IP & ASN lookups",url:"https://ipinfo.io/"},
  {name:"AbuseIPDB",cat:"osint",desc:"Check IP reputation & abuse reports",url:"https://www.abuseipdb.com/"},
  {name:"VirusTotal",cat:"osint",desc:"File & URL scanning",url:"https://www.virustotal.com/"},
  {name:"urlscan.io",cat:"osint",desc:"Scan & analyze live web pages",url:"https://urlscan.io/"},

  {name:"Qualys SSL Labs",cat:"scanners",desc:"SSL/TLS config scanner",url:"https://www.ssllabs.com/ssltest/"},

  // Kali-packaged tools (link to Kali tool pages)
  {name:"Kali: Nmap",cat:"kali",desc:"Network scanner (Kali page)",url:"https://www.kali.org/tools/nmap/"},
  {name:"Kali: Nikto",cat:"kali",desc:"Web server scanner (Kali page)",url:"https://www.kali.org/tools/nikto/"},
  {name:"Kali: Nuclei",cat:"kali",desc:"Fast vulnerability scanner (Kali page)",url:"https://www.kali.org/tools/nuclei/"},
  {name:"Kali: wpscan",cat:"kali",desc:"WordPress vulnerability scanner (Kali page)",url:"https://www.kali.org/tools/wpscan/"},
  {name:"Kali: BurpSuite",cat:"kali",desc:"Web proxy & testing (Kali page)",url:"https://www.kali.org/tools/burpsuite/"},
  {name:"Kali: FinalRecon",cat:"kali",desc:"Automated recon tool",url:"https://www.kali.org/tools/finalrecon/"},
  {name:"GoSpider",cat:"kali",desc:"Fast web spider for discovery",url:"https://www.kali.org/tools/gospider/"},
  {name:"Kali: SqlMap",cat:"kali",desc:"SQL injection and takeover",url:"https://www.kali.org/tools/sqlmap/"}
];


const grid = document.getElementById("toolGrid");
const search = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

function render() {
  const query = search.value.toLowerCase();
  const active = document.querySelector(".filters button.active").dataset.filter;

  grid.innerHTML = tools
    .filter(t => (active === "all" || t.cat === active))
    .filter(t => t.name.toLowerCase().includes(query))
    .map(t => `
      <div class="card">
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
        <a href="${t.url}" target="_blank">Open</a>
      </div>
    `).join("");
}

search.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

render();
