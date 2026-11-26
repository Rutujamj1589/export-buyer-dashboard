var buyers = new Array(
  { id: 1, company: "Sacred Sound & Wellness Showroom", contact: "Sarah Jenkins (Buyer)", email: "buying@sacredsoundtx.com", phone: "+1 (713) 555-0192", location: "Houston, Texas, USA", source: "Google Maps API", aiType: "B2B", status: "Pending" },
  { id: 2, company: "Zen Home Decor Imports LLC", contact: "David Miller (Purchasing Mgr)", email: "dmiller@zenhomedecor.com", phone: "+1 (281) 555-0148", location: "Austin, Texas, USA", source: "ImportYeti Data", aiType: "B2B", status: "Sent" },
  { id: 3, company: "Austin Holistic Studio", contact: "Rachel Green", email: "invalid-email-format@", phone: "+1 (512) 555-0177", location: "Austin, Texas, USA", source: "Business Directory", aiType: "B2B", status: "Pending" },
  { id: 4, company: "Individual Yoga Practitioner", contact: "Mark Taylor", email: "marktaylor99@gmail.com", phone: "+1 (832) 555-0110", location: "Houston, Texas, USA", source: "LinkedIn API", aiType: "B2C", status: "Pending" }
);

var sampleApiPool = new Array(
  { company: "Texas Artisan Living", contact: "Elena Rostova (Head Buyer)", email: "elena@txartisanliving.com", phone: "+1 (713) 555-0821", aiType: "B2B" },
  { company: "Harmony Healing & Gifts", contact: "Marcus Vance (Owner)", email: "orders@harmonyhealing.us", phone: "+1 (469) 555-0394", aiType: "B2B" },
  { company: "Lone Star Home Furnishings", contact: "Claire Bennett", email: "purchasing@lonestarhome.com", phone: "+1 (214) 555-0612", aiType: "B2B" },
  { company: "Personal Wellness Buyer", contact: "Kevin Brooks", email: "kbrooks.personal@yahoo.com", phone: "+1 (713) 555-0991", aiType: "B2C" }
);

var activeBuyerId = null;

function isValidEmail(email) {
  var atPos = email.indexOf("@");
  var dotPos = email.lastIndexOf(".");
  return atPos > 0 && dotPos > atPos + 1 && dotPos < email.length - 1;
}

function showToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(function() { t.style.display = "none"; }, 3500);
}

function runApiDiscovery() {
  var product = document.getElementById("productInput").value.trim() || "Home Decor";
  var country = document.getElementById("countryInput").value;
  var loc = document.getElementById("locationInput").value.trim() || "New York";
  var source = document.getElementById("sourceInput").value;
  var addedCount = 0;

  sampleApiPool.forEach(function(item, idx) {
    var slug = product.toLowerCase().split(" ").join("");
    var uniqueEmail = item.email.replace("@", "." + slug + "@");
    var exists = buyers.some(function(b) { return b.email.toLowerCase() === uniqueEmail.toLowerCase(); });
    if (!exists) {
      buyers.unshift({
        id: Date.now() + idx,
        company: item.company + " (" + product + ")",
        contact: item.contact,
        email: uniqueEmail,
        phone: item.phone,
        location: loc + ", " + country,
        source: source,
        aiType: item.aiType,
        status: "Pending"
      });
      addedCount++;
    }
  });

  renderTable();
  if (addedCount > 0) {
    showToast("Extracted " + addedCount + " new buyers from " + source + "!");
  } else {
    showToast("Duplicate Prevention: Leads for " + product + " already exist. Try a new product name!");
  }
}

function addManualBuyer() {
  var company = document.getElementById("mCompany").value.trim();
  var contact = document.getElementById("mContact").value.trim();
  var email = document.getElementById("mEmail").value.trim();
  var phone = document.getElementById("mPhone").value.trim();
  var aiType = document.getElementById("mType").value;

  if (!company || !email) {
    showToast("Company Name and Email are required.");
    return;
  }
  if (buyers.some(function(b) { return b.email.toLowerCase() === email.toLowerCase(); })) {
    showToast("Duplicate Blocked: This email already exists.");
    return;
  }

  buyers.unshift({
    id: Date.now(),
    company: company,
    contact: contact || "Store Manager",
    email: email,
    phone: phone || "N/A",
    location: document.getElementById("locationInput").value || "USA",
    source: "Manual Entry",
    aiType: aiType,
    status: "Pending"
  });

  document.getElementById("mCompany").value = "";
  document.getElementById("mContact").value = "";
  document.getElementById("mEmail").value = "";
  document.getElementById("mPhone").value = "";
  renderTable();
  showToast("Manual lead added & classified.");
}

function removeInvalidEmails() {
  var before = buyers.length;
  buyers = buyers.filter(function(b) { return isValidEmail(b.email); });
  renderTable();
  showToast("Removed " + (before - buyers.length) + " invalid email record(s).");
}

function openEmailModal(id) {
  var buyer = buyers.find(function(b) { return b.id === id; });
  if (!buyer) return;
  if (!isValidEmail(buyer.email)) {
    showToast("Cannot send: Email address failed validation.");
    return;
  }
  activeBuyerId = id;
  var product = document.getElementById("productInput").value || "Handcrafted Home Decor";
  document.getElementById("modalTo").value = buyer.contact + " <" + buyer.email + ">";
  document.getElementById("modalSubject").value = "Direct Export Partnership: Authentic Indian " + product + " for " + buyer.company;
  document.getElementById("modalBody").value = "Hi " + buyer.contact + ",\n\nWe manufacture and export premium " + product + " from India to US showrooms and wholesalers. Please find our latest product catalog and wholesale pricing attached.\n\nBest regards,\nExport Business Development Team";
  document.getElementById("emailModal").style.display = "flex";
}

function sendEmailNow() {
  var buyer = buyers.find(function(b) { return b.id === activeBuyerId; });
  if (buyer) {
    buyer.status = "Sent";
    renderTable();
    showToast("Outreach email + PDF catalog sent to " + buyer.email + "!");
  }
  document.getElementById("emailModal").style.display = "none";
}

function exportCSV() {
  var headers = "Company,Contact,Email,Email Valid,Phone,Location,Source,AI Classification,Outreach Status";
  var rows = buyers.map(function(b) {
    return new Array(
      '"' + b.company + '"',
      '"' + b.contact + '"',
      '"' + b.email + '"',
      isValidEmail(b.email) ? "Valid" : "Invalid",
      '"' + b.phone + '"',
      '"' + b.location + '"',
      '"' + b.source + '"',
      b.aiType,
      b.status
    ).join(",");
  });
  var csv = headers + "\n" + rows.join("\n");
  var blob = new Blob(new Array(csv), { type: "text/csv" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "Export_Buyers_Database.csv";
  a.click();
  showToast("Exported buyer database to CSV!");
}

function renderTable() {
  var typeFilter = document.getElementById("filterType").value;
  var emailFilter = document.getElementById("filterEmail").value;
  var tbody = document.getElementById("buyerTableBody");
  tbody.innerHTML = "";

  var validCount = 0;
  var b2bCount = 0;
  var sentCount = 0;

  buyers.forEach(function(b) {
    if (isValidEmail(b.email)) validCount++;
    if (b.aiType === "B2B") b2bCount++;
    if (b.status === "Sent") sentCount++;
  });

  document.getElementById("statTotal").textContent = buyers.length;
  document.getElementById("statValid").textContent = validCount;
  document.getElementById("statB2B").textContent = b2bCount;
  document.getElementById("statSent").textContent = sentCount;

  var filtered = buyers.filter(function(b) {
    var valid = isValidEmail(b.email);
    if (typeFilter !== "ALL" && b.aiType !== typeFilter) return false;
    if (emailFilter === "VALID" && !valid) return false;
    if (emailFilter === "INVALID" && valid) return false;
    return true;
  });

  filtered.forEach(function(b) {
    var valid = isValidEmail(b.email);
    var tr = document.createElement("tr");

    var actionHtml = b.status === "Sent"
      ? '<span class="pill pill-sent">Outreach Sent</span>'
      : '<button type="button" class="btn-primary" style="padding:0.35rem 0.7rem;font-size:0.8rem;" onclick="openEmailModal(' + b.id + ')">Send Email + PDF</button>';

    var validBadge = valid
      ? '<span class="pill pill-valid">Valid Email</span>'
      : '<span class="pill pill-invalid">Invalid Syntax</span>';

    var aiBadge = b.aiType === "B2B"
      ? '<span class="pill pill-b2b">B2B</span>'
      : '<span class="pill pill-b2c">B2C</span>';

    tr.innerHTML =
      "<td><strong>" + b.company + "</strong></td>" +
      "<td>" + b.contact + "</td>" +
      "<td><div>" + b.email + "</div>" + validBadge + "</td>" +
      "<td>" + b.phone + "</td>" +
      "<td><div>" + b.location + "</div><small style='color:var(--muted)'>" + b.source + "</small></td>" +
      "<td>" + aiBadge + "</td>" +
      "<td>" + actionHtml + "</td>";

    tbody.appendChild(tr);
  });
}

document.getElementById("fetchBtn").addEventListener("click", runApiDiscovery);
document.getElementById("manualSaveBtn").addEventListener("click", addManualBuyer);
document.getElementById("purgeBtn").addEventListener("click", removeInvalidEmails);
document.getElementById("exportBtn").addEventListener("click", exportCSV);
document.getElementById("filterType").addEventListener("change", renderTable);
document.getElementById("filterEmail").addEventListener("change", renderTable);
document.getElementById("cancelModalBtn").addEventListener("click", function() {
  document.getElementById("emailModal").style.display = "none";
});
document.getElementById("sendEmailBtn").addEventListener("click", sendEmailNow);

renderTable();
