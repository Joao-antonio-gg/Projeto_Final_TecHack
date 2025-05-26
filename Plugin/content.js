// Análise de links ao passar o mouse
document.addEventListener('mouseover', function(e) {
  if (e.target.tagName === 'A') {
    const link = e.target.href;
    const apiUrl = 'http://127.0.0.1:8000/verifica?url=' + encodeURIComponent(link);

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.suspeito) {
          e.target.style.border = '2px solid red';
          e.target.title = '⚠️ Link suspeito!';
        }
      });
  }
});
