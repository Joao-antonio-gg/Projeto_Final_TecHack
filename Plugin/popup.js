document.getElementById('verificar').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;
    const apiUrl = 'http://127.0.0.1:8000/verifica?url=' + encodeURIComponent(url);

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const resultado = document.getElementById('resultado');

        if (data.suspeito) {
          resultado.innerHTML = `<strong>⚠️ Site suspeito de phishing!</strong><br><br>Causas:<ul>${data.motivos.map(m => `<li>${m}</li>`).join('')}</ul>`;
          resultado.style.color = 'red';
        } else {
          resultado.innerHTML = `<strong>✅ Site seguro.</strong><br><br>Motivos:<ul>${data.motivos.map(m => `<li>${m}</li>`).join('')}</ul>`;
          resultado.style.color = 'green';
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        document.getElementById('resultado').textContent = 'Erro ao verificar o site.';
      });
  });
});
