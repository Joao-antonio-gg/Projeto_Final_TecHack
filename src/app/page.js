"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const explicacoes = {
  "Números substituindo letras no domínio":
    "Uso de números no domínio para enganar usuários (ex: goog1e.com).",
  "Uso excessivo de subdomínios":
    "Muitos subdomínios podem esconder a real identidade do domínio.",
  "Caracteres especiais suspeitos na URL":
    "Caracteres estranhos podem ser usados para enganar sistemas e usuários.",
  "Domínio presente na lista de phishing":
    "Domínio conhecido por phishing em listas negras.",
  "Domínio recente:": "Domínios muito novos são mais suspeitos.",
  "Uso de DNS dinâmico":
    "Serviços de DNS dinâmico são frequentemente usados para esconder origem maliciosa.",
  "Certificado SSL gratuito":
    "Certificados gratuitos são usados por golpistas por facilidade, mas não garantem confiança.",
  "Certificado SSL expirado":
    "Certificado inválido pode indicar descuido ou fraude.",
  "Nome do certificado não corresponde ao domínio":
    "Certificado que não bate com o domínio é suspeito.",
  "Redirecionamentos suspeitos:":
    "Muitos redirecionamentos podem tentar confundir ou esconder o destino final.",
  "Domínio similar à marca conhecida:":
    "Domínios parecidos com marcas famosas podem tentar se passar por elas.",
  "Formulário de login ou solicitação de informações sensíveis detectado":
    "Presença de formulário pedindo dados pessoais sensíveis, comum em golpes.",
};

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);

  const analisarURL = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      const res = await fetch(
        `http://localhost:8000/verifica?url=${encodeURIComponent(url)}`
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na resposta da API: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      setResultado({ url, ...data });
      setHistorico((prev) => [{ url, ...data, dataHora: new Date() }, ...prev]);
      setUrl("");
    } catch (err) {
      alert("Erro ao conectar com a API: " + err.message);
      console.error(err);
    }
  };

  const exportarCSV = () => {
    if (historico.length === 0) return alert("Histórico vazio");

    const csvHeader = "URL,Suspeito,Motivos,DataHora\n";
    const csvRows = historico
      .map((item) =>
        [
          `"${item.url}"`,
          item.suspeito,
          `"${item.motivos.join("; ")}"`,
          item.dataHora.toLocaleString(),
        ].join(",")
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const urlBlob = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", "historico_urls.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contarMotivos = () => {
    const contagem = {};
    historico.forEach(({ motivos }) => {
      motivos.forEach((motivo) => {
        const chave = Object.keys(explicacoes).find((exp) =>
          motivo.startsWith(exp)
        );
        const final = chave || motivo;
        contagem[final] = (contagem[final] || 0) + 1;
      });
    });
    return contagem;
  };

  const dadosGrafico = () => {
    const contagem = contarMotivos();
    return {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: "Ocorrências",
          data: Object.values(contagem),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
        },
      ],
    };
  };

  // Estilo dos botões
  const estiloBotao = {
    padding: "10px 18px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  };

  const estiloBotaoHover = {
    backgroundColor: "#115293",
  };

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Dashboard de Verificação de URLs</h1>

      {/* Bloco 1: Formulário de análise */}
      <section
        style={{
          marginBottom: 30,
          padding: 20,
          borderRadius: 8,
          backgroundColor: "#f0f4f8",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <form
          onSubmit={analisarURL}
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Digite a URL para verificar"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              flexGrow: 1,
              padding: 10,
              fontSize: "1rem",
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={estiloBotao}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#115293")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
          >
            Verificar
          </button>
        </form>
      </section>

      {/* Bloco 2: Resultado da análise */}
      {resultado && (
        <section
          style={{
            marginBottom: 30,
            padding: 20,
            borderRadius: 8,
            backgroundColor: resultado.suspeito ? "#ffe6e6" : "#e6ffe6",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Resultado da análise</h2>
          <p>
            <strong>URL:</strong> {resultado.url}
          </p>
          <p>
            <strong>Suspeito:</strong> {resultado.suspeito ? "Sim" : "Não"}
          </p>
          {resultado.motivos.length > 0 && (
            <>
              <p>
                <strong>Motivos:</strong>
              </p>
              <ul>
                {resultado.motivos.map((motivo, i) => (
                  <li key={i}>
                    {motivo}
                    <br />
                    <small style={{ color: "#555" }}>
                      {explicacoes[
                        Object.keys(explicacoes).find((exp) =>
                          motivo.startsWith(exp)
                        )
                      ] || "Sem explicação disponível."}
                    </small>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Bloco 3: Histórico com botão exportar */}
      <section
        style={{
          marginBottom: 30,
          padding: 20,
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Histórico de URLs verificadas</h2>
        <button
          onClick={exportarCSV}
          style={{
            ...estiloBotao,
            marginBottom: 15,
            backgroundColor: "#4caf50",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#388e3c")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
        >
          Exportar CSV
        </button>
        {historico.length === 0 && <p>Nenhuma URL verificada ainda.</p>}
        {historico.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>URL</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                  Suspeito
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                  Motivos
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                  Data/Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#fefefe" : "#f1f1f1",
                  }}
                >
                  <td style={{ padding: 8 }}>{item.url}</td>
                  <td style={{ padding: 8 }}>{item.suspeito ? "Sim" : "Não"}</td>
                  <td style={{ padding: 8 }}>{item.motivos.join(", ")}</td>
                  <td style={{ padding: 8 }}>{item.dataHora.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Bloco 4: Gráfico */}
      <section
        style={{
          marginBottom: 30,
          padding: 20,
          borderRadius: 8,
          backgroundColor: "#f0f4f8",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Distribuição de características suspeitas</h2>
        {historico.length === 0 ? (
          <p>Nenhum dado para exibir.</p>
        ) : (
          <Bar data={dadosGrafico()} />
        )}
      </section>

      {/* Bloco 5: Explicações */}
      <section
        style={{
          marginBottom: 30,
          padding: 20,
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Explicações sobre características analisadas</h2>
        <ul>
          {Object.entries(explicacoes).map(([chave, texto]) => (
            <li key={chave}>
              <strong>{chave}</strong>: {texto}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
