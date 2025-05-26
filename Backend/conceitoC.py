import re
import socket
import ssl
import whois
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from datetime import datetime
from Levenshtein import distance as levenshtein_distance

LEET_MAP = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b'
}

def carrega_lista_phishing(caminho_arquivo):
    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
        return set(linha.strip().lower() for linha in f if linha.strip())

def obtem_idade_dominio(dominio):
    try:
        w = whois.whois(dominio)
        if isinstance(w.creation_date, list):
            creation_date = w.creation_date[0]
        else:
            creation_date = w.creation_date
        if creation_date:
            idade = (datetime.now() - creation_date).days
            return idade
    except Exception:
        pass
    return None

def verifica_ssl(dominio):
    try:
        contexto = ssl.create_default_context()
        with socket.create_connection((dominio, 443), timeout=5) as sock:
            with contexto.wrap_socket(sock, server_hostname=dominio) as ssock:
                cert = ssock.getpeercert()
                emissor = dict(x[0] for x in cert['issuer'])
                data_exp = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                return emissor, data_exp, cert['subject']
    except Exception:
        return None, None, None

def verifica_redirecionamentos(url):
    try:
        resp = requests.get(url, allow_redirects=True, timeout=5)
        if len(resp.history) > 3:
            return True, [r.url for r in resp.history]
    except Exception:
        pass
    return False, []

def verifica_conteudo_sensivel(url):
    try:
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')
        forms = soup.find_all('form')
        palavras_chave = ['senha', 'password', 'login', 'cartão', 'credit', 'cpf']
        for form in forms:
            if any(palavra in form.text.lower() for palavra in palavras_chave):
                return True
    except Exception:
        pass
    return False

def numeros_substituindo_letras(dominio: str) -> bool:
    substitutos = {'0', '1', '3', '4', '5', '7', '8', '9'}
    for i in range(1, len(dominio) - 1):
        if dominio[i] in substitutos:
            if dominio[i-1].isalpha() and dominio[i+1].isalpha():
                return True
    return False

def normaliza_leet(dominio):
    return ''.join(LEET_MAP.get(c, c) for c in dominio)

def verifica_leet_similaridade(dominio, marcas_conhecidas):
    dominio_normalizado = normaliza_leet(dominio)
    for marca in marcas_conhecidas:
        dist = levenshtein_distance(dominio_normalizado, marca)
        if dist <= 2:
            return True, marca
    return False, None

def verificaIndentificador(url, phishing_domains=None, marcas_conhecidas=None, dominios_base_suspeitos=None):
    motivos = []

    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url

    dominio = urlparse(url).netloc.lower()

    if dominio.startswith('www.'):
        dominio = dominio[4:]

    dominio = dominio.split(':')[0]

    if numeros_substituindo_letras(dominio):
        motivos.append("Números substituindo letras no domínio")

    subdominios = dominio.split('.')
    if len(subdominios) > 3:
        motivos.append("Uso excessivo de subdomínios")

    if re.search(r'[^a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]', url):
        motivos.append("Caracteres especiais suspeitos na URL")

    if phishing_domains and dominio in phishing_domains:
        motivos.append("Domínio presente na lista de phishing (match exato)")

    if dominios_base_suspeitos:
        for base in dominios_base_suspeitos:
            if dominio.endswith(base):
                motivos.append(f"Domínio termina com base suspeita: {base}")
                break

    idade = obtem_idade_dominio(dominio)
    if idade is not None and idade < 180:
        motivos.append(f"Domínio recente: {idade} dias")

    if any(servico in dominio for servico in ['no-ip', 'dyndns', 'duckdns', 'freedns']):
        motivos.append("Uso de DNS dinâmico")

    emissor, data_exp, subject = verifica_ssl(dominio)
    if emissor:
        if 'Let\'s Encrypt' in emissor.get('organizationName', ''):
            motivos.append("Certificado SSL gratuito")
        if data_exp and data_exp < datetime.now():
            motivos.append("Certificado SSL expirado")
        if subject and dominio not in str(subject):
            motivos.append("Nome do certificado não corresponde ao domínio")

    redir, history = verifica_redirecionamentos(url)
    if redir:
        motivos.append(f"Redirecionamentos suspeitos: {len(history)}")

    if marcas_conhecidas:
        for marca in marcas_conhecidas:
            dist = levenshtein_distance(dominio, marca)
            if dist <= 3:
                motivos.append(f"Domínio similar à marca conhecida: {marca}")

        similar_leet, marca_leet = verifica_leet_similaridade(dominio, marcas_conhecidas)
        if similar_leet:
            motivos.append(f"Domínio usa substituição para se parecer com marca: {marca_leet}")

    if verifica_conteudo_sensivel(url):
        motivos.append("Formulário de login ou solicitação de informações sensíveis detectado")

    suspeito = False
    if phishing_domains and dominio in phishing_domains:
        suspeito = True
    elif len(motivos) > 0:
        suspeito = True

    return suspeito, motivos
