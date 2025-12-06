// Cấu hình endpoint backend và helpers dùng chung

// API Gateway URL - Production VM
const BASE_URL_IDENTITY = 'http://35.209.190.65:8080/api/v1/identity';

function setMessage(elId, text, type = 'info') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text || '';
  el.className = `message ${type}`;
}
