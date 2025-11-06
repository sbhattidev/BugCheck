const tools = [
  {name:"DNSDumpster",cat:"dns",desc:"DNS mapping & host discovery",url:"https://dnsdumpster.com/"},
  {name:"NSLookup.io",cat:"dns",desc:"DNS lookup and record checks",url:"https://www.nslookup.io/"},
  {name:"MXToolbox",cat:"dns",desc:"DNS / MX / blacklist lookup",url:"https://mxtoolbox.com/"},

  {name:"Subdomain Finder (c99)",cat:"subdomains",desc:"Online subdomain enumeration",url:"https://subdomainfinder.c99.nl/"},
  {name:"crt.sh",cat:"subdomains",desc:"Certificate transparency enumeration",url:"https://crt.sh/"},
  {name:"SecurityTrails Subdomains",cat:"subdomains",desc:"Subdomain & DNS history",url:"https://securitytrails.com/"},

  {name:"Wayback Machine",cat:"archive",desc:"Archived website snapshots",url:"https://web.archive.org/"},

  {name:"Censys Search",cat:"osint",desc:"Search internet-wide hosts",url:"https://search.censys.io/"},
  {name:"Shodan",cat:"osint",desc:"Search exposed devices & services",url:"https://www.shodan.io/"},
  {name:"urlscan.io",cat:"osint",desc:"Scan & analyze live web pages",url:"https://urlscan.io/"},

  {name:"Qualys SSL Labs",cat:"scanners",desc:"SSL/TLS config scanner",url:"https://www.ssllabs.com/ssltest/"}
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
