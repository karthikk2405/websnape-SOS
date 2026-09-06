/* ===== QR CODE GENERATION ===== */
const QRGenerator = (() => {

  function getBaseUrl() {
    const loc = window.location;
    return loc.origin + loc.pathname;
  }

  function getTableUrl(tableNumber) {
    return getBaseUrl() + '#/table/' + tableNumber;
  }

  function generateQR(text, size = 6) {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: size, margin: 4 });
  }

  function renderQRForTable(tableNumber, container, cellSize = 6) {
    const url = getTableUrl(tableNumber);
    const svgStr = generateQR(url, cellSize);
    container.innerHTML = `
      <div class="qr-card">
        <div class="qr-image">${svgStr}</div>
        <div class="qr-label">Table ${tableNumber}</div>
        <div class="qr-url">${url}</div>
      </div>
    `;
  }

  function renderAllQRCodes(containerEl, tableCount, cellSize = 5) {
    containerEl.innerHTML = '';
    for (let i = 1; i <= tableCount; i++) {
      const url = getTableUrl(i);
      const svgStr = generateQR(url, cellSize);
      const card = document.createElement('div');
      card.className = 'qr-card';
      card.innerHTML = `
        <div class="qr-image">${svgStr}</div>
        <div class="qr-label">Table ${i}</div>
        <div class="qr-url-small">${url}</div>
      `;
      containerEl.appendChild(card);
    }
  }

  function printQRCodes() {
    window.print();
  }

  return { getBaseUrl, getTableUrl, generateQR, renderQRForTable, renderAllQRCodes, printQRCodes };
})();
