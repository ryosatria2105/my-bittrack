let investments = JSON.parse(localStorage.getItem("investments")) || [];

function saveToStorage() {
  localStorage.setItem("investments", JSON.stringify(investments));
}

function parseFormattedNumber(value) {
  if (!value) return NaN;

  const cleanValue = value
    .replace(/\./g, "")
    .replace(/,/g, "")
    .trim();

  return parseInt(cleanValue, 10);
}

function formatRupiah(value) {
  return Number(value).toLocaleString("id-ID");
}

function formatUsd(value) {
  return Number(value).toLocaleString("id-ID");
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function updateDisplay() {
  const tbody = document.getElementById("investmentTableBody");
  const totalText = document.getElementById("totalInvestment");

  tbody.innerHTML = "";
  let total = 0;

  if (investments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-text">Belum ada data investasi.</td>
      </tr>
    `;
  } else {
    investments.forEach((item, idx) => {
      total += item.amount;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="No">${idx + 1}</td>
        <td data-label="Nominal">Rp ${formatRupiah(item.amount)}</td>
        <td data-label="Harga Beli">USD ${formatUsd(item.buyPrice)}</td>
        <td data-label="Tanggal">${formatDate(item.date)}</td>
        <td data-label="Aksi">
          <button onclick="deleteInvestment(${idx})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  totalText.textContent = formatRupiah(total);
}

function addInvestment() {
  const investmentInput = document.getElementById("investmentInput");
  const buyPriceInput = document.getElementById("buyPriceInput");

  const amount = parseFormattedNumber(investmentInput.value);
  const buyPrice = parseFormattedNumber(buyPriceInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Masukkan nominal investasi yang valid ya.");
    return;
  }

  if (isNaN(buyPrice) || buyPrice <= 0) {
    alert("Masukkan harga beli USD yang valid ya.");
    return;
  }

  investments.push({
    amount: amount,
    buyPrice: buyPrice,
    date: new Date().toISOString()
  });

  saveToStorage();
  updateDisplay();

  investmentInput.value = "";
  buyPriceInput.value = "";
}

function deleteInvestment(index) {
  if (confirm("Yakin mau hapus investasi ini?")) {
    investments.splice(index, 1);
    saveToStorage();
    updateDisplay();
  }
}

function clearAll() {
  if (confirm("Yakin mau hapus SEMUA investasi?")) {
    investments = [];
    saveToStorage();
    updateDisplay();
  }
}

async function fetchBtcPrice() {
  const btcNowPrice = document.getElementById("btcNowPrice");

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil harga BTC");
    }

    const data = await response.json();

    if (!data.bitcoin || typeof data.bitcoin.usd !== "number") {
      throw new Error("Data BTC tidak valid");
    }

    const btcPrice = data.bitcoin.usd;
    btcNowPrice.textContent = "USD " + formatUsd(btcPrice);
  } catch (error) {
    btcNowPrice.textContent = "Gagal ambil harga BTC";
    console.error(error);
  }
}

updateDisplay();
fetchBtcPrice();
setInterval(fetchBtcPrice, 60000);