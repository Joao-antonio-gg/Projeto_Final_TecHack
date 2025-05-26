// Monitoramento ativo
chrome.webNavigation.onCompleted.addListener(function(details) {
  chrome.tabs.get(details.tabId, function(tab) {
    const url = tab.url;
    const apiUrl = 'http://127.0.0.1:8000/verifica?url=' + encodeURIComponent(url);

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.suspeito) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: '⚠️ Alerta de Phishing',
            message: 'Site suspeito detectado!'
          });
        }
      });
  });
}, { url: [{ schemes: ['http', 'https'] }] });

// Bloqueio preventivo (lista estática)
const listaBloqueio = ["phishing.com", "malicioso.site"];

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    for (let bloqueado of listaBloqueio) {
      if (details.url.includes(bloqueado)) {
        console.log("Bloqueando:", details.url);
        return { cancel: true };
      }
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
