# Ferramenta para detecção de Phishing  
  
### Backend   
Entre na pasta do backend, você encontrará o arquivo `requirements.txt` que contém todas as dependências necessárias para o funcionamento do servidor.  


Primeiramente é necessário instalar as dependências do backend. Para isso, execute o seguinte comando:    
  
```bash
pip install -r requirements.txt  
```

Com as dependências instaladas, você pode iniciar o servidor backend com o seguinte comando:  

```bash
uvicorn main:app --reload  
```

Acesso ao backend pode ser feito através do endereço `http://localhost:8000/docs` para a documentação interativa.  

### Frontend
Entre na pasta do frontend, você encontrará o arquivo `package.json` que contém todas as dependências necessárias para o funcionamento do frontend.

Primeiramente é necessário instalar as dependências do frontend. Para isso, execute o seguinte comando:

```bash
npm install 
````
Com as dependências instaladas, você pode iniciar o servidor frontend com o seguinte comando:
```bash
npm run dev
```
Acesso ao frontend pode ser feito através do endereço `http://localhost:3000/` para a interface do usuário.

### Plugins

Para colocar o Plugins no seu navegador Mozilla Firefox developer, siga os seguintes passos:

1. Acesse o about:debugging no seu navegador Firefox.
2. Clique em "This Firefox" no menu lateral.
3. Clique em "Load Temporary Add-on".
4. Selecione o arquivo `manifest.json` localizado na pasta do plugin.
5. O plugin será carregado temporariamente e você poderá testá-lo.

Para acessar o plugin, clique no ícone do plugin na barra de ferramentas do Firefox. Ele abrirá uma janela onde você pode inserir a URL que deseja verificar.
