// Carrega configuração
chrome.storage.local.get(['sensibilidade'], function(result) {
  if (result.sensibilidade) {
    document.getElementById('sensibilidade').value = result.sensibilidade;
  }
});

// Salva configuração
document.getElementById('salvar').addEventListener('click', () => {
  const sensibilidade = document.getElementById('sensibilidade').value;
  chrome.storage.local.set({ sensibilidade }, function() {
    alert('Configuração salva!');
  });
});
