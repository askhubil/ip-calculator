function setFocus() {
  document.form.host.focus();
  document.form.host.select();
}

const ipToLong = (ip) => ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;

const longToIp = (long) => [24, 16, 8, 0].map((s) => (long >>> s) & 255).join(".");

const toBinary = (ip, maskBits) => {
  const bin = ip
    .split(".")
    .map((o) => ("00000000" + parseInt(o).toString(2)).slice(-8))
    .join("");

  let spaced = "";
  for (let i = 0; i < 32; i++) {
    if (i > 0 && i % 8 === 0) spaced += ".";
    if (i === maskBits) spaced += " ";
    spaced += bin[i];
  }
  return spaced;
};

const pad = (s, len) => (s + " ".repeat(len)).slice(0, len);

const getClass = (ip) => {
  const first = parseInt(ip.split(".")[0]);
  if (first >= 0 && first <= 127) return "Class A";
  if (first >= 128 && first <= 191) return "Class B";
  if (first >= 192 && first <= 223) return "Class C";
  if (first >= 224 && first <= 239) return "Class D (Multicast)";
  if (first >= 240 && first <= 255) return "Class E (Reserved)";
  return "Unknown";
};

function calculate() {
  const ipStr = document.getElementById("host").value.trim();
  const cidr = parseInt(document.getElementById("mask1").value.trim(), 10);
  const output = document.getElementById("result");

  if (!ipStr || isNaN(cidr) || cidr < 0 || cidr > 32) {
    output.textContent = "Invalid IP address or CIDR netmask";
    return;
  }

  const ip = ipToLong(ipStr);
  const netmask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = ~netmask >>> 0;
  const network = ip & netmask;
  const broadcast = network | wildcard;
  const hostMin = cidr >= 31 ? network : network + 1;
  const hostMax = cidr >= 31 ? broadcast : broadcast - 1;
  const hostCount = cidr === 31 ? 2 : cidr === 32 ? 1 : broadcast - network - 1;
  const ipClass = getClass(longToIp(ip));

  const binLine = (label, val, bin, color = "#0000ff") => `<font color="#000000">${pad(label + ":", 11)}</font><font color="${color}">${pad(val, 22)}</font><font color="#909090">${bin}</font>`;

  const html = [
    binLine("Address", longToIp(ip), toBinary(longToIp(ip), cidr)),
    binLine("Netmask", longToIp(netmask) + " = " + cidr, toBinary(longToIp(netmask), cidr), "#ff0000"),
    binLine("Wildcard", longToIp(wildcard), toBinary(longToIp(wildcard), cidr)),
    binLine("Network", longToIp(network) + "/" + cidr, toBinary(longToIp(network), cidr)) + ` <font color="#000000">(${ipClass})</font>`,
    binLine("Broadcast", longToIp(broadcast), toBinary(longToIp(broadcast), cidr)),
    binLine("HostMin", longToIp(hostMin), toBinary(longToIp(hostMin), cidr)),
    binLine("HostMax", longToIp(hostMax), toBinary(longToIp(hostMax), cidr)),
    `<font color="#000000">Hosts/Net: </font><font color="#0000ff">${hostCount.toString().padEnd(21)}</font>`,
  ].join("<br>");

  output.innerHTML = html;
}
