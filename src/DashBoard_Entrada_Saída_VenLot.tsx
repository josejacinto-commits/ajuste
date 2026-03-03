import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  Zap,
  Calendar,
  User,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Box,
  DollarSign,
  Sun,
  Moon,
  TrendingUp,
  Percent,
  Package,
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Filter,
} from "lucide-react";

// --- URLs DAS PLANILHAS GLOBAIS ---
const CSV_URL_ENTRADA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUtFb63gk6JA4WjEDzIUjlgMjK5XE8yNVdJD3LxkNn3I_MLd6fbrcKarBgku-j1tzJOKrjPziggBXd/pub?gid=2024718346&single=true&output=csv";
const CSV_URL_SAIDA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUtFb63gk6JA4WjEDzIUjlgMjK5XE8yNVdJD3LxkNn3I_MLd6fbrcKarBgku-j1tzJOKrjPziggBXd/pub?gid=1572852432&single=true&output=csv";
const CSV_URL_COMPARATIVO =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUtFb63gk6JA4WjEDzIUjlgMjK5XE8yNVdJD3LxkNn3I_MLd6fbrcKarBgku-j1tzJOKrjPziggBXd/pub?gid=1732152233&single=true&output=csv";

// --- CONSTANTES GLOBAIS ---
const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

// --- CORES DE TEMA (NEON / SÓLIDAS) ---
const NEON_CYAN = "#00E5FF";
const NEON_PINK = "#FF0055";
const NEON_GREEN = "#00FF66";
const NEON_ORANGE = "#FF6600";
const NEON_YELLOW = "#FFCC00";

const LIGHT_CYAN = "#007489";
const LIGHT_PINK = "#C50042";
const LIGHT_GREEN = "#008033";
const LIGHT_ORANGE = "#D95306";
const LIGHT_YELLOW = "#CC9900";

const NEON_COLORS_ENTRADA = [
  "#00E5FF",
  "#B900FF",
  "#00FF66",
  "#FF0055",
  "#FFCC00",
  "#FF3366",
];
const NEON_COLORS_SAIDA = [
  "#00E5FF",
  "#B900FF",
  "#FF0055",
  "#FFCC00",
  "#00FF66",
  "#FF9900",
];

// --- DICIONÁRIOS GEOGRÁFICOS GLOBAIS ---
const ufMapForward = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

const ufMapReverse = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

// --- UTILITÁRIOS DE FORMATAÇÃO E PARSING GLOBAIS ---
const formatBRL = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCompactBRL = (value) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value}`;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("pt-BR").format(value || 0);

const parseBrazilianNumber = (str) => {
  if (str === null || str === undefined || str === "") return 0;
  let cleanStr = String(str).replace(/"/g, "").trim();
  cleanStr = cleanStr.replace(/[R$\s\u00A0]/gi, "");
  if (cleanStr.includes(",")) {
    cleanStr = cleanStr.replace(/\./g, "").replace(",", ".");
  } else {
    cleanStr = cleanStr.replace(/\./g, "");
  }
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
};

const normalizeMonth = (m) => {
  if (!m) return "";
  const lower = String(m).toLowerCase().trim();
  const idx = MONTH_NAMES.findIndex((mo) =>
    lower.startsWith(mo.substring(0, 3))
  );
  return idx !== -1 ? MONTH_NAMES[idx] : lower;
};

const normalizeHeader = (h) =>
  h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getVal = (row, possibleKeys) => {
  for (let k of possibleKeys) {
    const target = normalizeHeader(k);
    const match = Object.keys(row).find(
      (rowKey) => normalizeHeader(rowKey) === target
    );
    if (match && row[match] !== undefined && row[match] !== "")
      return row[match];
  }
  return null;
};

const parseCSVRobust = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/);
  const rows = [];
  let currentRowStr = "";
  for (let i = 0; i < lines.length; i++) {
    currentRowStr += (currentRowStr === "" ? "" : "\n") + lines[i];
    if ((currentRowStr.match(/"/g) || []).length % 2 === 0) {
      rows.push(currentRowStr);
      currentRowStr = "";
    }
  }
  if (rows.length === 0) return [];
  const delimiter =
    (rows[0].match(/;/g) || []).length > (rows[0].match(/,/g) || []).length
      ? ";"
      : ",";

  const parseRow = (rowStr) => {
    const cols = [];
    let col = "",
      inQ = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        if (inQ && rowStr[i + 1] === '"') {
          col += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (char === delimiter && !inQ) {
        cols.push(col.trim());
        col = "";
      } else {
        col += char;
      }
    }
    cols.push(col.trim());
    return cols;
  };

  const parsedRows = rows.map(parseRow);
  const headers = parsedRows[0] || [];
  const data = [];
  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length <= 1 && row[0] === "") continue;
    const obj = {};
    headers.forEach((h, idx) => {
      const key = h ? h.replace(/^"|"$/g, "").trim() : `Col${idx}`;
      obj[key] =
        row[idx] !== undefined ? row[idx].replace(/^"|"$/g, "").trim() : "";
    });
    data.push(obj);
  }
  return data;
};

const parseDataAgendamentoMap = (dataStr) => {
  if (!dataStr) return { ano: "", mes: "" };
  const s = String(dataStr).trim();
  let ano = "",
    mes = "";
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length >= 3) {
      ano = parts[2].substring(0, 4);
      mes = MONTH_NAMES[parseInt(parts[1], 10) - 1] || "";
    }
  } else if (s.includes("-")) {
    const parts = s.split("-");
    if (parts.length >= 3) {
      ano = parts[0].length === 4 ? parts[0] : parts[2].substring(0, 4);
      mes = MONTH_NAMES[parseInt(parts[1], 10) - 1] || "";
    }
  }
  return { ano, mes };
};

// --- PROCESSADORES DE DADOS CENTRAIS ---
const processEntradaData = (csvText) => {
  return parseCSVRobust(csvText)
    .map((row) => ({
      ...row,
      "Qtd.": parseBrazilianNumber(row["Qtd."]),
      "Valor total": parseBrazilianNumber(row["Valor total"]),
      Ano: row["Ano"] ? String(row["Ano"]).trim() : "",
      Mês: normalizeMonth(row["Mês"]),
      Dia: row["Dia"] ? parseInt(row["Dia"], 10) : 0,
    }))
    .filter((row) => {
      const isQtdValid = row["Qtd."] < 1000000000;
      const isValorValid = row["Valor total"] < 1000000000;
      const categoria = String(row["Categoria do item"] || "").trim();
      const isCategoriaValid = /[a-zA-ZÀ-ÿ]{3,}/.test(categoria);
      return isQtdValid && isValorValid && isCategoriaValid;
    });
};

const processSaidaData = (csvText) => {
  return parseCSVRobust(csvText)
    .map((row) => {
      const dateStr =
        row["Data da coleta"] || row["Data de agendamento de coleta"] || "";
      let mes = "",
        ano = "",
        dia = 0;
      if (dateStr.includes("/")) {
        const dateOnly = dateStr.split(" ")[0];
        const parts = dateOnly.split("/");
        dia = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        ano = parts[2] ? parts[2].substring(0, 4) : "";
        if (m >= 1 && m <= 12) mes = MONTH_NAMES[m - 1];
      }
      return {
        ...row,
        Ano: ano,
        Mês: mes,
        Dia: dia,
        Categoria: row["Categoria"] ? String(row["Categoria"]).trim() : "N/A",
        Arrematante: row["ARREMATANTE"]
          ? String(row["ARREMATANTE"]).trim()
          : "N/A",
        Leiloeira: String(row["Leiloeira"] || row["LEILOEIRA"] || "N/A").trim(),
        ValorCusto: parseBrazilianNumber(row["Valor Custo"]),
        ValorVenda: parseBrazilianNumber(
          row["VALOR NF R$"] || row["Valor NF"] || 0
        ),
        ValorRecuperado: parseBrazilianNumber(row["Valor Recuperado"]),
        QtdItens: parseBrazilianNumber(row["Qtd Itens de Lote"]),
        QtdPaletes: parseBrazilianNumber(row["Qtd. Palete/CDL"]),
      };
    })
    .filter((row) => row.Ano && row.ValorCusto > 0);
};

const processComparativoData = (csvText) => {
  return parseCSVRobust(csvText)
    .map((row) => {
      let entItens = 0,
        saiItens = 0,
        entCusto = 0,
        saiRecup = 0;
      let anoRaw = getVal(row, ["ano", "year"]) || "";
      let mesRaw = getVal(row, ["mes", "mês", "month"]) || "";
      let dataRaw = getVal(row, ["data", "periodo", "date"]);
      let catRaw =
        getVal(row, [
          "categoria",
          "categoria do item",
          "category",
          "classificacao",
        ]) || "Geral";

      if (dataRaw && dataRaw.includes("/")) {
        const parts = dataRaw.split("/");
        if (parts.length >= 3) {
          if (!anoRaw)
            anoRaw = parts[2].length === 2 ? "20" + parts[2] : parts[2];
          const mIdx = parseInt(parts[1], 10);
          if (!mesRaw && mIdx >= 1 && mIdx <= 12)
            mesRaw = MONTH_NAMES[mIdx - 1];
        }
      }

      entItens = parseBrazilianNumber(
        getVal(row, [
          "qtd. entrada",
          "qtd entrada",
          "entrada (itens)",
          "entrada",
        ])
      );
      saiItens = parseBrazilianNumber(
        getVal(row, [
          "qtd. saida",
          "qtd. saída",
          "qtd saida",
          "saida (itens)",
          "saída (itens)",
          "saida",
        ])
      );
      entCusto = parseBrazilianNumber(
        getVal(row, ["entrada $", "entrada (custo)", "custo entrada"])
      );
      saiRecup = parseBrazilianNumber(
        getVal(row, [
          "saida $",
          "saída $",
          "saida (recuperado)",
          "saída (recuperado)",
        ])
      );

      const tipoStr = getVal(row, ["tipo", "type", "movimento", "operacao"]);
      if (tipoStr && entCusto === 0 && saiRecup === 0) {
        const tipo = String(tipoStr).toUpperCase();
        const qtdVert = parseBrazilianNumber(
          getVal(row, ["qtd", "quantidade", "itens", "qtd.", "volume"])
        );
        const valorVert = parseBrazilianNumber(
          getVal(row, [
            "valor",
            "custo",
            "recuperado",
            "valor total",
            "montante",
            "financeiro",
            "total",
          ])
        );

        if (tipo.includes("ENTRADA")) {
          entItens = entItens || qtdVert;
          entCusto = entCusto || valorVert;
        } else if (tipo.includes("SAIDA") || tipo.includes("SAÍDA")) {
          saiItens = saiItens || qtdVert;
          saiRecup = saiRecup || valorVert;
        }
      }

      return {
        Ano: String(anoRaw).trim() || "2024",
        Mês: mesRaw ? normalizeMonth(mesRaw).substring(0, 3) : "jan",
        MêsCompleto: normalizeMonth(mesRaw) || "janeiro",
        Categoria: String(catRaw).trim(),
        entItens,
        saiItens,
        entCusto,
        saiRecup,
      };
    })
    .filter(
      (r) =>
        (r.entItens > 0 ||
          r.saiItens > 0 ||
          r.entCusto > 0 ||
          r.saiRecup > 0) &&
        parseInt(r.Ano) >= 2023
    );
};

const processMapeamentoData = (csvText) => {
  return parseCSVRobust(csvText)
    .map((row) => {
      const dt = getVal(row, [
        "Data de agendamento de coleta",
        "Data de Agendamento",
      ]);
      const { ano, mes } = parseDataAgendamentoMap(dt);
      const st = String(getVal(row, ["Estado", "UF"]) || "").trim();
      return {
        arrematante: getVal(row, ["Arrematantes", "Arrematante"]),
        estado: ufMapForward[st] || st,
        dataAgendamento: dt,
        ano,
        mes,
        origem: String(getVal(row, ["Origem"]) || "")
          .trim()
          .toUpperCase(),
        coletado: String(getVal(row, ["Coletado ?", "Coletado"]) || "")
          .trim()
          .toUpperCase(),
        valorCusto: parseBrazilianNumber(getVal(row, ["Valor Custo", "Custo"])),
        valorVendido: parseBrazilianNumber(
          getVal(row, ["VALOR NF R$", "Valor NF"])
        ),
        valorRecuperado: parseBrazilianNumber(
          getVal(row, ["Valor Recuperado", "Recuperado"])
        ),
        qtdItensLote: parseBrazilianNumber(
          getVal(row, [
            "Qtd Itens de Lote",
            "Qtd. itens",
            "Qtd Itens",
            "Quantidade",
          ])
        ),
      };
    })
    .filter(
      (r) =>
        r.origem === "LEVE" && r.coletado === "SIM" && r.arrematante && r.estado
    );
};

// --- COMPONENTES UI COMPARTILHADOS ---

const renderDonutLabel = (props) => {
  const { cx, cy, midAngle, outerRadius, percent, fill, isLightMode } = props;
  if (percent < 0.02) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontFamily="monospace"
      fontWeight="bold"
      style={{
        textShadow: isLightMode ? "none" : "1px 1px 3px rgba(0,0,0,0.9)",
      }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const SectionHeader = ({ title, isLightMode }) => {
  const titleColor = isLightMode
    ? "text-[#007489] drop-shadow-none"
    : "text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]";
  const titleDecorColor = isLightMode
    ? "bg-[#007489] shadow-none"
    : "bg-[#00E5FF] shadow-[0_0_5px_#00E5FF]";
  const headerBgClass = isLightMode ? "bg-gray-50/80" : "bg-[#0A0D14]/80";
  const headerBorderClass = isLightMode
    ? "border-gray-200"
    : "border-[#1A2332]";

  return (
    <div
      className={`w-full flex justify-center items-center py-2 px-3 relative z-10 border-b backdrop-blur-sm rounded-t-md ${headerBgClass} ${headerBorderClass}`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2 h-0.5 ${titleDecorColor}`}></span>
        <h3
          className={`font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-center ${titleColor}`}
        >
          {title}
        </h3>
        <span className={`w-2 h-0.5 ${titleDecorColor}`}></span>
      </div>
    </div>
  );
};

const MechPanel = ({ title, children, isLightMode }) => {
  const bgClass = isLightMode ? "bg-white" : "bg-[#0D1117]";
  const borderClass = isLightMode ? "border-gray-200" : "border-[#00E5FF]/20";
  const cornerClass = isLightMode ? "border-[#007489]" : "border-[#00E5FF]";
  const gridBg = isLightMode
    ? "linear-gradient(#007489 1px, transparent 1px), linear-gradient(90deg, #007489 1px, transparent 1px)"
    : "linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)";
  const shadowClass = isLightMode
    ? "shadow-sm"
    : "shadow-[0_0_15px_rgba(0,0,0,0.5)]";

  return (
    <div
      className={`flex flex-col h-full w-full rounded-md border relative overflow-hidden group ${bgClass} ${borderClass} ${shadowClass}`}
    >
      <div
        className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-20 pointer-events-none rounded-tl-md ${cornerClass}`}
      ></div>
      <div
        className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-20 pointer-events-none rounded-br-md ${cornerClass}`}
      ></div>
      <div
        className={`absolute inset-0 pointer-events-none z-0 opacity-[0.03]`}
        style={{ backgroundImage: gridBg, backgroundSize: "20px 20px" }}
      ></div>
      <SectionHeader title={title} isLightMode={isLightMode} />
      <div className="flex-1 w-full min-h-0 relative z-10 p-2 md:p-3 pt-6 flex flex-col">
        {children}
      </div>
    </div>
  );
};

const NeonKpiCard = ({
  title,
  value,
  icon: Icon,
  colorTheme,
  color,
  isCurrency = false,
  isPercentage = false,
  isLightMode,
  forceWhiteText = false,
}) => {
  let mainColor, shadowColor;
  const targetTheme = colorTheme || color || "cyan";

  if (targetTheme === "cyan") {
    mainColor = isLightMode ? LIGHT_CYAN : NEON_CYAN;
    shadowColor = isLightMode ? "#005a69" : "#008299";
  } else if (targetTheme === "green") {
    mainColor = isLightMode ? LIGHT_GREEN : NEON_GREEN;
    shadowColor = isLightMode ? "#006629" : "#008033";
  } else if (targetTheme === "orange" || targetTheme === "yellow") {
    mainColor = isLightMode
      ? targetTheme === "yellow"
        ? LIGHT_YELLOW
        : LIGHT_ORANGE
      : targetTheme === "yellow"
      ? NEON_YELLOW
      : NEON_ORANGE;
    shadowColor = isLightMode
      ? targetTheme === "yellow"
        ? "#997300"
        : "#a63f04"
      : targetTheme === "yellow"
      ? "#CC9900"
      : "#CC5200";
  } else if (targetTheme === "purple") {
    mainColor = isLightMode ? "#8800CC" : "#B900FF";
    shadowColor = isLightMode ? "#4d0073" : "#660099";
  } else {
    mainColor = isLightMode ? LIGHT_PINK : NEON_PINK;
    shadowColor = isLightMode ? "#990033" : "#990033";
  }

  const bgColor = isLightMode ? "bg-white" : "bg-[#090B10]";
  const iconBg = isLightMode ? "bg-gray-100" : "bg-[#1A2332]";

  let displayValue = value;
  if (isCurrency) displayValue = formatBRL(value);
  else if (isPercentage) displayValue = `${Number(value).toFixed(2)}%`;
  else displayValue = typeof value === "number" ? formatNumber(value) : value;

  const valueColor = forceWhiteText
    ? isLightMode
      ? "#1e293b"
      : "#ffffff"
    : mainColor;
  const valueShadow = forceWhiteText
    ? "none"
    : isLightMode
    ? "none"
    : `0 0 8px ${mainColor}80`;

  return (
    <div
      className={`flex flex-col justify-between p-3 md:p-4 rounded-xl border-2 w-full h-full mb-[6px] transition-transform hover:-translate-y-0.5 ${bgColor}`}
      style={{
        borderColor: mainColor,
        boxShadow: `0px 6px 0px ${shadowColor}`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest"
          style={{
            color: mainColor,
            textShadow: isLightMode ? "none" : `0 0 5px ${mainColor}80`,
          }}
        >
          {title}
        </span>
        <div className={`p-1.5 rounded-md ${iconBg}`}>
          <Icon size={14} color={mainColor} />
        </div>
      </div>
      <div>
        <span
          className="text-2xl md:text-3xl font-black tracking-tight"
          style={{ color: valueColor, textShadow: valueShadow }}
        >
          {displayValue}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// ABA 1: PAINEL DE ENTRADA
// ==========================================
function PainelEntrada({
  data,
  isLightMode,
  setIsLightMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) {
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  // Auto-selecionar o ano/mês mais recente quando os dados chegarem
  useEffect(() => {
    if (!data || data.length === 0) return;
    const years = [
      ...new Set(data.map((item) => item["Ano"]).filter(Boolean)),
    ].sort();
    if (years.length > 0 && selectedYear === "Todos") {
      const latestYear = years[years.length - 1];
      setSelectedYear(latestYear);

      const monthsInLatestYear = data
        .filter((i) => i["Ano"] === latestYear)
        .map((i) => i["Mês"]);
      let maxMonthIndex = -1;
      monthsInLatestYear.forEach((m) => {
        const idx = MONTH_NAMES.indexOf(m);
        if (idx > maxMonthIndex) maxMonthIndex = idx;
      });

      if (maxMonthIndex !== -1) setSelectedMonth(MONTH_NAMES[maxMonthIndex]);
    }
  }, [data]);

  const availableYears = useMemo(
    () => [
      "Todos",
      ...[...new Set(data.map((item) => item["Ano"]).filter(Boolean))].sort(),
    ],
    [data]
  );
  const availableMonths = useMemo(() => {
    const months = [
      ...new Set(data.map((item) => item["Mês"]).filter(Boolean)),
    ];
    months.sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b));
    return ["Todos", ...months];
  }, [data]);

  const checkIsRecusado = (item) => {
    const recebido = String(item["Recebido ?"] || "")
      .toUpperCase()
      .trim();
    const status = String(item["Status"] || "")
      .toUpperCase()
      .trim();
    return (
      recebido === "NÃO" ||
      recebido === "NAO" ||
      status.includes("RECUSAD") ||
      status.includes("CANCELADO")
    );
  };

  const { allEntradas, allRecusados } = useMemo(() => {
    const entradas = [];
    const recusados = [];
    data.forEach((item) => {
      if (checkIsRecusado(item)) recusados.push(item);
      else entradas.push(item);
    });
    return { allEntradas: entradas, allRecusados: recusados };
  }, [data]);

  const filteredEntradas = useMemo(() => {
    return allEntradas.filter(
      (item) =>
        (selectedYear === "Todos" || item["Ano"] === selectedYear) &&
        (selectedMonth === "Todos" || item["Mês"] === selectedMonth)
    );
  }, [allEntradas, selectedYear, selectedMonth]);

  const filteredRecusados = useMemo(() => {
    return allRecusados.filter(
      (item) =>
        (selectedYear === "Todos" || item["Ano"] === selectedYear) &&
        (selectedMonth === "Todos" || item["Mês"] === selectedMonth)
    );
  }, [allRecusados, selectedYear, selectedMonth]);

  const entradasAnoSelecionado = useMemo(
    () =>
      allEntradas.filter(
        (item) => selectedYear === "Todos" || item["Ano"] === selectedYear
      ),
    [allEntradas, selectedYear]
  );

  const kpis = useMemo(() => {
    const sumData = (arr) =>
      arr.reduce(
        (acc, curr) => ({
          qtd: acc.qtd + (curr["Qtd."] || 0),
          custo: acc.custo + (curr["Valor total"] || 0),
        }),
        { qtd: 0, custo: 0 }
      );
    const ent = sumData(filteredEntradas);
    const rec = sumData(filteredRecusados);
    return {
      qtdEntrada: ent.qtd,
      custoEntrada: ent.custo,
      qtdRecusado: rec.qtd,
      custoRecusado: rec.custo,
    };
  }, [filteredEntradas, filteredRecusados]);

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => ({
      dia: String(i + 1).padStart(2, "0"),
      qtd: 0,
    }));
    filteredEntradas.forEach((item) => {
      const dia = item["Dia"];
      if (dia >= 1 && dia <= 31) days[dia - 1].qtd += item["Qtd."] || 0;
    });
    return days;
  }, [filteredEntradas]);

  const monthlyData = useMemo(() => {
    const result = MONTH_NAMES.map((m) => ({
      mes: m.substring(0, 3),
      qtd: 0,
      custo: 0,
    }));
    entradasAnoSelecionado.forEach((item) => {
      const mIndex = MONTH_NAMES.indexOf(item["Mês"]);
      if (mIndex !== -1) {
        result[mIndex].qtd += item["Qtd."] || 0;
        result[mIndex].custo += item["Valor total"] || 0;
      }
    });
    return result;
  }, [entradasAnoSelecionado]);

  const yearlyData = useMemo(() => {
    const yearsMap = {};
    allEntradas.forEach((item) => {
      const ano = item["Ano"];
      if (!ano) return;
      if (!yearsMap[ano]) yearsMap[ano] = { name: ano, qtd: 0, custo: 0 };
      yearsMap[ano].qtd += item["Qtd."] || 0;
      yearsMap[ano].custo += item["Valor total"] || 0;
    });
    return Object.values(yearsMap).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [allEntradas]);

  const generateTableData = (columnName) => {
    const map = {};
    let totalQtd = 0;
    filteredEntradas.forEach((item) => {
      let key = item[columnName] || "N/A";
      const qtd = item["Qtd."] || 0;
      const custo = item["Valor total"] || 0;
      if (!map[key]) map[key] = { name: key, qtd: 0, custo: 0 };
      map[key].qtd += qtd;
      map[key].custo += custo;
      totalQtd += qtd;
    });

    const allItems = Object.values(map).sort((a, b) => b.qtd - a.qtd);
    let itemsWithPct = allItems.map((item) => {
      const exactPct = totalQtd > 0 ? (item.qtd / totalQtd) * 100 : 0;
      return { ...item, exactPct, intPct: Math.floor(exactPct) };
    });

    let currentSum = itemsWithPct.reduce((a, b) => a + b.intPct, 0);
    let remainder = totalQtd > 0 ? 100 - currentSum : 0;
    itemsWithPct.sort(
      (a, b) => b.exactPct - b.intPct - (a.exactPct - a.intPct)
    );
    for (let i = 0; i < remainder && i < itemsWithPct.length; i++)
      itemsWithPct[i].intPct += 1;
    itemsWithPct.sort((a, b) => b.qtd - a.qtd);

    return itemsWithPct
      .slice(0, 10)
      .map((item) => ({
        ...item,
        percent: item.intPct,
        exactPercent: item.exactPct,
      }));
  };

  const tableCategoria = useMemo(
    () => generateTableData("Categoria do item"),
    [filteredEntradas]
  );
  const tableMotivo = useMemo(
    () => generateTableData("Situação do item"),
    [filteredEntradas]
  );
  const tableMarca = useMemo(
    () => generateTableData("Marcas"),
    [filteredEntradas]
  );
  const tableSetor = useMemo(
    () => generateTableData("Setor"),
    [filteredEntradas]
  );

  const CustomTooltipEntrada = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const bg = isLightMode
        ? "bg-white/95 border-gray-200 shadow-lg"
        : "bg-[#0A0D14]/90 border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]";
      const textTitle = isLightMode
        ? "text-gray-600 border-gray-200"
        : "text-[#8B949E] border-[#2A3143]";
      return (
        <div className={`${bg} border p-2 rounded-lg backdrop-blur-md z-50`}>
          <p
            className={`${textTitle} text-[11px] font-bold uppercase tracking-widest mb-1 border-b pb-1`}
          >
            {label}
          </p>
          {payload.map((entry, index) => {
            let labelText = isLightMode ? "text-gray-800" : "text-white";
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-[11px] font-mono my-1"
              >
                <span
                  style={{ color: entry.color || entry.fill }}
                  className="font-bold drop-shadow-sm"
                >
                  {entry.name === "custo" || entry.name === "Financeiro"
                    ? "CUSTO"
                    : "QTD"}
                  :
                </span>
                <span className={`${labelText} font-bold`}>
                  {entry.name === "custo" ||
                  entry.name === "Financeiro" ||
                  entry.dataKey === "custo"
                    ? formatBRL(entry.value)
                    : formatNumber(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const NeonDataTable = ({ title, tableData, headers }) => {
    const bgHeaderCols = isLightMode
      ? "bg-gray-100/80 border-gray-200 text-gray-500"
      : "bg-[#151925]/80 border-[#2A3143] text-[#8B949E]";
    const textColorName = isLightMode ? "text-[#8800CC]" : "text-[#B900FF]";
    const textColorQtd = isLightMode ? "text-[#007489]" : "text-[#00E5FF]";
    const textColorCusto = isLightMode ? "text-[#008033]" : "text-[#00FF66]";

    return (
      <div
        className={`flex flex-col h-full rounded-md border ${
          isLightMode
            ? "bg-white border-gray-200"
            : "bg-[#0D1117] border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        } overflow-hidden relative min-h-0 transition-colors duration-300`}
      >
        <SectionHeader title={title} isLightMode={isLightMode} />
        <div
          className={`flex ${bgHeaderCols} text-[10px] md:text-[11px] font-bold uppercase tracking-widest border-b p-1.5 px-2 md:px-3 shrink-0 text-center transition-colors duration-300 z-10 relative`}
        >
          <div className="flex-1 text-center">{headers[0]}</div>
          <div className="w-14 md:w-16 text-center">{headers[1]}</div>
          <div className="w-14 md:w-16 text-center">{headers[2]}</div>
          <div className="w-20 md:w-24 text-center">{headers[3]}</div>
        </div>
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar rounded-b-lg z-10 relative`}
        >
          {tableData.map((row, idx) => {
            const bgRowEven = isLightMode ? "bg-white/60" : "bg-[#121620]/60";
            const bgRowOdd = isLightMode ? "bg-gray-50/60" : "bg-[#151A26]/60";
            const hoverRow = isLightMode
              ? "hover:bg-gray-100"
              : "hover:bg-[#1E2536]";
            return (
              <div
                key={idx}
                className={`flex items-center text-[10px] md:text-[12px] p-2 px-2 md:px-3 font-medium transition-colors ${hoverRow} ${
                  idx % 2 === 0 ? bgRowEven : bgRowOdd
                }`}
              >
                <div
                  className={`flex-1 truncate px-1 md:px-2 ${textColorName} font-bold tracking-wider text-center`}
                  title={row.name}
                >
                  {row.name}
                </div>
                <div
                  className={`w-14 md:w-16 text-center ${textColorQtd} font-mono`}
                >
                  {formatNumber(row.qtd)}
                </div>
                <div className="w-14 md:w-16 flex items-center justify-center relative h-4 md:h-5">
                  <div
                    className={`absolute left-0 top-1 bottom-1 w-full rounded-full overflow-hidden border ${
                      isLightMode
                        ? "bg-gray-200 border-gray-300"
                        : "bg-[#0A0D14] border-[#2A3143]"
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#00E5FF] to-[#B900FF] rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          row.exactPercent || row.percent,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="relative z-10 text-[9px] md:text-[10px] text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ml-1">
                    {row.percent}%
                  </span>
                </div>
                <div
                  className={`w-20 md:w-24 text-center ${textColorCusto} font-mono`}
                >
                  {formatBRL(row.custo)}
                </div>
              </div>
            );
          })}
          {tableData.length === 0 && (
            <div
              className={`text-center p-4 text-[11px] font-mono ${
                isLightMode ? "text-gray-400" : "text-[#8B949E]"
              }`}
            >
              NO DATA FOUND_
            </div>
          )}
        </div>
      </div>
    );
  };

  const gridStroke = isLightMode ? "#E5E7EB" : "#2A3143";
  const axisTickFill = isLightMode ? "#6B7280" : "#8B949E";

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-3 overflow-y-auto overflow-x-hidden">
      <header className="flex flex-col xl:flex-row justify-between items-center mb-3 shrink-0 gap-3 w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-between">
          <div className="flex items-center gap-3 animate-heartbeat-scale">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                isLightMode
                  ? "bg-white border-cyan-200 shadow-sm"
                  : "bg-[#00E5FF]/10 border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              }`}
            >
              <ArrowDownToLine
                className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
                size={18}
              />
            </div>
            <div>
              <h1
                className={`text-base md:text-lg font-bold uppercase ${
                  isLightMode
                    ? "text-[#007489]"
                    : "text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                }`}
                style={{ letterSpacing: "0.15em" }}
              >
                Visão de Entrada
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 w-full xl:w-auto justify-end">
          <div
            className={`flex items-center gap-3 p-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <Calendar
              size={16}
              className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((ano) => (
                <option
                  key={ano}
                  value={ano}
                  className={isLightMode ? "bg-white" : "bg-[#121620]"}
                >
                  {ano}
                </option>
              ))}
            </select>
            <div
              className={`w-[1px] h-5 ${
                isLightMode ? "bg-gray-200" : "bg-[#2A3143]"
              }`}
            ></div>
            <User
              size={16}
              className={isLightMode ? "text-[#8800CC]" : "text-[#B900FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer capitalize w-20 ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((mes) => (
                <option
                  key={mes}
                  value={mes}
                  className={isLightMode ? "bg-white" : "bg-[#121620]"}
                >
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onRefresh(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <RefreshCw
              size={14}
              className={`${
                isRefreshing
                  ? isLightMode
                    ? "text-[#007489] animate-spin"
                    : "text-white animate-spin"
                  : isLightMode
                  ? "text-[#007489]"
                  : "text-[#00E5FF]"
              }`}
            />
            <div className="flex flex-col text-left hidden sm:flex">
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${
                  isRefreshing
                    ? isLightMode
                      ? "text-[#007489]"
                      : "text-white"
                    : isLightMode
                    ? "text-gray-500"
                    : "text-[#8B949E]"
                }`}
              >
                Atualizar
              </span>
              <span
                className={`text-[9px] font-mono ${
                  isLightMode ? "text-gray-800" : "text-white"
                }`}
              >
                ATT:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-600 hover:text-[#007489] hover:border-[#007489] shadow-sm hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] text-[#00E5FF] hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
            title="Alternar Tema"
          >
            {isLightMode ? (
              <Moon size={16} />
            ) : (
              <Sun
                size={16}
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              />
            )}
          </button>
        </div>
      </header>

      {/* KPIs ENTRADA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0 mb-4 px-1 pb-1 w-full">
        <NeonKpiCard
          title="QTD. ENTRADA"
          value={kpis.qtdEntrada}
          icon={TrendingUp}
          colorTheme="cyan"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="CUSTO ENTRADA"
          value={kpis.custoEntrada}
          icon={DollarSign}
          colorTheme="cyan"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="QTD. RECUSADO"
          value={kpis.qtdRecusado}
          icon={TrendingUp}
          colorTheme="red"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="CUSTO RECUSADO"
          value={kpis.custoRecusado}
          icon={DollarSign}
          colorTheme="red"
          isCurrency={true}
          isLightMode={isLightMode}
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-3 lg:flex-1 lg:min-h-0 w-full pt-2">
        <div className="flex flex-col xl:flex-[7] gap-3 lg:min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="ENTRADA POR DIA" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 20, right: 15, left: -25, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dia"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={(props) => <CustomTooltipEntrada {...props} />}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Bar
                    dataKey="qtd"
                    fill="url(#cyanGrad)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  >
                    <LabelList
                      dataKey="qtd"
                      position="top"
                      fill={isLightMode ? "#334155" : "#FFFFFF"}
                      fontSize={12}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={
                        !isLightMode ? { textShadow: "1px 1px 2px #000" } : {}
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>

          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="ENTRADA POR MÊS" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 25, right: 15, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, (max) => Math.ceil(max * 1.4)]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, (max) => Math.ceil(max * 1.1)]}
                  />
                  <Tooltip
                    content={(props) => <CustomTooltipEntrada {...props} />}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="qtd"
                    fill="url(#pinkGrad)"
                    barSize={50}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="qtd"
                      position="top"
                      fill={isLightMode ? "#334155" : "#FFFFFF"}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={
                        !isLightMode ? { textShadow: "1px 1px 2px #000" } : {}
                      }
                    />
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="custo"
                    stroke={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                    strokeWidth={2}
                    dot={{
                      fill: isLightMode ? LIGHT_YELLOW : NEON_YELLOW,
                      stroke: isLightMode ? "#FFF" : "#121620",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{ r: 6, fill: "#FFF" }}
                    style={!isLightMode ? { filter: "url(#glowDark)" } : {}}
                  >
                    <LabelList
                      dataKey="custo"
                      position="top"
                      offset={10}
                      fill={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                      fontSize={12}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => formatCompactBRL(v)}
                      style={{
                        textShadow: !isLightMode ? "1px 1px 2px #000" : "none",
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0 w-full">
            <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
              <MechPanel title="% ANUAL" isLightMode={isLightMode}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
                    <Pie
                      data={yearlyData}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="75%"
                      paddingAngle={4}
                      cornerRadius={8}
                      dataKey="qtd"
                      stroke="none"
                      labelLine={false}
                      label={(props) =>
                        renderDonutLabel({ ...props, isLightMode })
                      }
                    >
                      {yearlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            NEON_COLORS_ENTRADA[
                              index % NEON_COLORS_ENTRADA.length
                            ]
                          }
                          style={
                            !isLightMode
                              ? {
                                  filter:
                                    "drop-shadow(0 0 5px rgba(255,255,255,0.2))",
                                }
                              : {}
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={(props) => <CustomTooltipEntrada {...props} />}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: axisTickFill,
                        paddingRight: "5px",
                      }}
                      payload={yearlyData.map((item, index) => ({
                        id: item.name,
                        type: "circle",
                        value: item.name,
                        color:
                          NEON_COLORS_ENTRADA[
                            index % NEON_COLORS_ENTRADA.length
                          ],
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </MechPanel>
            </div>

            <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[2] flex flex-col">
              <MechPanel title="ENTRADA POR ANO" isLightMode={isLightMode}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={yearlyData}
                    margin={{ top: 25, right: 15, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: axisTickFill,
                        fontSize: 11,
                        fontFamily: "monospace",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      hide
                      domain={[0, (max) => Math.ceil(max * 1.4)]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      hide
                      domain={[0, (max) => Math.ceil(max * 1.1)]}
                    />
                    <Tooltip
                      content={(props) => <CustomTooltipEntrada {...props} />}
                      cursor={{
                        fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                        opacity: 0.6,
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="qtd"
                      name="Volume"
                      fill="url(#orangeGrad)"
                      barSize={60}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="qtd"
                        position="top"
                        fill={isLightMode ? "#334155" : "#FFFFFF"}
                        fontSize={13}
                        fontFamily="monospace"
                        fontWeight="bold"
                        formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                        style={
                          !isLightMode ? { textShadow: "1px 1px 2px #000" } : {}
                        }
                      />
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="custo"
                      name="Financeiro"
                      stroke={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                      strokeWidth={2}
                      dot={{
                        fill: isLightMode ? LIGHT_YELLOW : NEON_YELLOW,
                        r: 4,
                        stroke: isLightMode ? "#FFF" : "#121620",
                        strokeWidth: 2,
                      }}
                      style={!isLightMode ? { filter: "url(#glowDark)" } : {}}
                    >
                      <LabelList
                        dataKey="custo"
                        position="top"
                        offset={10}
                        fill={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                        fontSize={12}
                        fontFamily="monospace"
                        fontWeight="bold"
                        formatter={(v) => formatCompactBRL(v)}
                        style={{
                          textShadow: !isLightMode
                            ? "1px 1px 2px #000"
                            : "none",
                        }}
                      />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </MechPanel>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-[3] gap-3 lg:min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <NeonDataTable
              title="RANKING CATEGORIAS"
              tableData={tableCategoria}
              headers={["CATEGORIA", "QTD", "SHARE", "CUSTO"]}
              isLightMode={isLightMode}
            />
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <NeonDataTable
              title="DIAGNÓSTICO SITUAÇÃO"
              tableData={tableMotivo}
              headers={["MOTIVO", "QTD", "SHARE", "CUSTO"]}
              isLightMode={isLightMode}
            />
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <NeonDataTable
              title="TOP MARCAS"
              tableData={tableMarca}
              headers={["MARCA", "QTD", "SHARE", "CUSTO"]}
              isLightMode={isLightMode}
            />
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <NeonDataTable
              title="DIRECIONAMENTO SETOR"
              tableData={tableSetor}
              headers={["SETOR", "QTD", "SHARE", "CUSTO"]}
              isLightMode={isLightMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ABA 2: PAINEL DE SAÍDA
// ==========================================
function PainelSaida({
  data,
  isLightMode,
  setIsLightMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) {
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  // Auto-selecionar o ano/mês mais recente quando os dados chegarem
  useEffect(() => {
    if (!data || data.length === 0) return;
    const years = [
      ...new Set(data.map((item) => item["Ano"]).filter(Boolean)),
    ].sort();
    if (years.length > 0 && selectedYear === "Todos") {
      const latestYear = years[years.length - 1];
      setSelectedYear(latestYear);

      const monthsInLatestYear = data
        .filter((i) => i["Ano"] === latestYear)
        .map((i) => i["Mês"]);
      let maxMonthIndex = -1;
      monthsInLatestYear.forEach((m) => {
        const idx = MONTH_NAMES.indexOf(m);
        if (idx > maxMonthIndex) maxMonthIndex = idx;
      });
      if (maxMonthIndex !== -1) setSelectedMonth(MONTH_NAMES[maxMonthIndex]);
    }
  }, [data]);

  const availableYears = useMemo(
    () => [
      "Todos",
      ...[...new Set(data.map((i) => i["Ano"]).filter(Boolean))].sort(),
    ],
    [data]
  );
  const availableMonths = useMemo(() => {
    const months = [...new Set(data.map((i) => i["Mês"]).filter(Boolean))];
    months.sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b));
    return ["Todos", ...months];
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          (selectedYear === "Todos" || item["Ano"] === selectedYear) &&
          (selectedMonth === "Todos" || item["Mês"] === selectedMonth)
      ),
    [data, selectedYear, selectedMonth]
  );
  const dataAnoSelecionado = useMemo(
    () =>
      data.filter(
        (item) => selectedYear === "Todos" || item["Ano"] === selectedYear
      ),
    [data, selectedYear]
  );

  const kpis = useMemo(() => {
    const acc = filteredData.reduce(
      (acc, curr) => ({
        lotes: acc.lotes + curr.QtdPaletes,
        itens: acc.itens + curr.QtdItens,
        custo: acc.custo + curr.ValorCusto,
        venda: acc.venda + curr.ValorVenda,
        recuperado: acc.recuperado + curr.ValorRecuperado,
      }),
      { lotes: 0, itens: 0, custo: 0, venda: 0, recuperado: 0 }
    );
    const pctRecup = acc.custo > 0 ? (acc.recuperado / acc.custo) * 100 : 0;
    return { ...acc, pctRecup };
  }, [filteredData]);

  const monthlyData = useMemo(() => {
    const result = MONTH_NAMES.map((m) => ({
      mes: m.substring(0, 3),
      itens: 0,
      lotes: 0,
      custo: 0,
      venda: 0,
      recuperado: 0,
      pctRecup: 0,
    }));
    dataAnoSelecionado.forEach((item) => {
      const mIndex = MONTH_NAMES.indexOf(item["Mês"]);
      if (mIndex !== -1) {
        result[mIndex].itens += item.QtdItens;
        result[mIndex].lotes += item.QtdPaletes;
        result[mIndex].custo += item.ValorCusto;
        result[mIndex].venda += item.ValorVenda;
        result[mIndex].recuperado += item.ValorRecuperado;
      }
    });
    result.forEach((r) => {
      r.pctRecup =
        r.custo > 0
          ? parseFloat(((r.recuperado / r.custo) * 100).toFixed(1))
          : 0;
    });
    return result;
  }, [dataAnoSelecionado]);

  const yearlyData = useMemo(() => {
    const yearsMap = {};
    data.forEach((item) => {
      const ano = item["Ano"];
      if (!ano) return;
      if (!yearsMap[ano]) yearsMap[ano] = { name: ano, recuperado: 0 };
      yearsMap[ano].recuperado += item.ValorRecuperado;
    });
    return Object.values(yearsMap).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [data]);

  const leiloeiraData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      let key =
        item.Leiloeira && item.Leiloeira !== "N/A" && item.Leiloeira !== "null"
          ? item.Leiloeira
          : "Não Identificada";
      if (!map[key])
        map[key] = {
          leiloeira: key,
          itens: 0,
          lotes: 0,
          custo: 0,
          recuperado: 0,
        };
      map[key].itens += item.QtdItens;
      map[key].lotes += item.QtdPaletes;
      map[key].custo += item.ValorCusto;
      map[key].recuperado += item.ValorRecuperado;
    });
    return Object.values(map)
      .map((r) => ({
        ...r,
        pctRecup:
          r.custo > 0
            ? parseFloat(((r.recuperado / r.custo) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.itens - a.itens)
      .slice(0, 10);
  }, [filteredData]);

  const tableCategoria = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      let key = item.Categoria || "N/A";
      if (!map[key])
        map[key] = { name: key, lotes: 0, itens: 0, custo: 0, recuperado: 0 };
      map[key].lotes += item.QtdPaletes;
      map[key].itens += item.QtdItens;
      map[key].custo += item.ValorCusto;
      map[key].recuperado += item.ValorRecuperado;
    });
    return Object.values(map)
      .map((r) => ({
        ...r,
        pctRecup:
          r.custo > 0
            ? parseFloat(((r.recuperado / r.custo) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.itens - a.itens)
      .slice(0, 10);
  }, [filteredData]);

  const LeiloeiraCustomLabel = (props) => {
    const { x, y, width, height, index, isLightMode } = props;
    const item = leiloeiraData[index];
    if (
      !item ||
      x === undefined ||
      y === undefined ||
      width === undefined ||
      height === undefined
    )
      return null;
    return (
      <g>
        {width > 35 && (
          <text
            x={x + width - 8}
            y={y + height / 2}
            fill={isLightMode ? "#FFF" : "#121620"}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={12}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {formatNumber(item.itens)}
          </text>
        )}
        <text
          x={x + width + 8}
          y={y + height / 2}
          fill={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={13}
          fontFamily="monospace"
          fontWeight="bold"
          style={{
            textShadow: isLightMode ? "none" : "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          — {item.pctRecup.toFixed(2)}%
        </text>
      </g>
    );
  };

  const CustomTooltipSaida = ({ active, payload, label, isLightMode }) => {
    if (active && payload && payload.length) {
      const bg = isLightMode
        ? "bg-white/95 border-gray-200"
        : "bg-[#0A0D14]/90 border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]";
      return (
        <div className={`${bg} border p-3 rounded-md backdrop-blur-md z-50`}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 border-b border-dashed pb-1 text-[#8B949E]">
            {label}
          </p>
          {payload.map((entry, index) => {
            let val = entry.value;
            let name = entry.name || entry.dataKey;
            if (entry.dataKey === "recuperado" && !name) name = "$ Recuperado";
            const isCurrency =
              name &&
              (name.includes("$") ||
                name.toLowerCase().includes("custo") ||
                name.toLowerCase().includes("venda") ||
                name.toLowerCase().includes("recup")) &&
              !name.includes("%");
            const isPct =
              (name && name.includes("%")) || entry.dataKey === "pctRecup";
            const displayValue = isPct
              ? `${Number(val).toFixed(2)}%`
              : isCurrency
              ? formatBRL(val)
              : formatNumber(val);
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-[11px] font-mono my-1.5"
              >
                <span
                  style={{ color: entry.color || entry.fill }}
                  className="font-bold drop-shadow-sm uppercase"
                >
                  {name}:
                </span>
                <span
                  className={`font-bold ${
                    isLightMode ? "text-gray-800" : "text-white"
                  }`}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const NeonCategoryTable = ({ tableData }) => {
    const bgHeaderCols = isLightMode
      ? "bg-gray-100/80 border-gray-200 text-gray-500"
      : "bg-[#1A2332]/80 border-[#1A2332] text-[#8B949E]";
    const textColorName = isLightMode ? "text-[#8800CC]" : "text-[#B900FF]";
    const textColorBase = isLightMode ? "text-gray-700" : "text-white";
    const textColorPct = isLightMode ? "text-[#D95306]" : "text-[#FF6600]";
    const textColorRecup = isLightMode ? "text-[#008033]" : "text-[#00FF66]";

    return (
      <MechPanel title="Visão por Categoria" isLightMode={isLightMode}>
        <div
          className={`flex ${bgHeaderCols} text-[11px] md:text-[12px] font-bold uppercase tracking-widest border-b p-3 px-3 shrink-0 text-center z-10 relative mt-[-10px]`}
        >
          <div className="flex-[1.5] text-center">CATEGORIA</div>
          <div className="flex-1 text-center">LOTE</div>
          <div className="flex-1 text-center">ITENS</div>
          <div className="flex-1 text-center">% RECUP</div>
          <div className="flex-1 text-center">$ RECUP</div>
        </div>
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar rounded-b-lg ${
            isLightMode ? "light-scrollbar" : ""
          } z-10 relative`}
        >
          {tableData.map((row, idx) => {
            const bgRowEven = isLightMode ? "bg-white/60" : "bg-transparent";
            const bgRowOdd = isLightMode ? "bg-gray-50/60" : "bg-[#1A2332]/30";
            return (
              <div
                key={idx}
                className={`flex items-center text-[12px] md:text-[14px] p-3 px-3 font-medium transition-colors ${
                  isLightMode
                    ? "hover:bg-[#007489]/10"
                    : "hover:bg-[#00E5FF]/10"
                } ${idx % 2 === 0 ? bgRowEven : bgRowOdd}`}
              >
                <div
                  className={`flex-[1.5] truncate ${textColorName} font-bold tracking-wider text-center`}
                  title={row.name}
                >
                  {row.name}
                </div>
                <div
                  className={`flex-1 flex justify-center text-center ${textColorBase} font-mono`}
                >
                  {formatNumber(row.lotes)}
                </div>
                <div
                  className={`flex-1 flex justify-center text-center ${textColorBase} font-mono`}
                >
                  {formatNumber(row.itens)}
                </div>
                <div
                  className={`flex-1 flex justify-center text-center ${textColorPct} font-mono font-bold`}
                  style={{ color: isLightMode ? LIGHT_ORANGE : NEON_ORANGE }}
                >
                  {row.pctRecup.toFixed(1)}%
                </div>
                <div
                  className={`flex-1 flex justify-center text-center ${textColorRecup} font-mono font-bold`}
                  style={{ color: isLightMode ? LIGHT_GREEN : NEON_GREEN }}
                >
                  {formatBRL(row.recuperado)}
                </div>
              </div>
            );
          })}
          {tableData.length === 0 && (
            <div
              className={`text-center p-4 text-[12px] font-mono ${
                isLightMode ? "text-gray-400" : "text-[#8B949E]"
              }`}
            >
              SEM DADOS_
            </div>
          )}
        </div>
      </MechPanel>
    );
  };

  const gridStroke = isLightMode ? "#E5E7EB" : "#1A2332";
  const axisTickFill = isLightMode ? "#6B7280" : "#8B949E";

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-3 overflow-y-auto overflow-x-hidden">
      <header className="flex flex-col xl:flex-row justify-between items-center mb-3 shrink-0 gap-3 w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-between">
          <div className="flex items-center gap-3 animate-heartbeat-scale">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                isLightMode
                  ? "bg-white border-orange-200 shadow-sm"
                  : "bg-[#FF6600]/10 border-[#FF6600]/30 shadow-[0_0_15px_rgba(255,102,0,0.2)]"
              }`}
            >
              <ArrowUpFromLine
                className={isLightMode ? "text-[#D95306]" : "text-[#FF6600]"}
                size={18}
              />
            </div>
            <div>
              <h1
                className={`text-base md:text-lg font-bold uppercase ${
                  isLightMode
                    ? "text-[#D95306]"
                    : "text-[#FF6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.6)]"
                }`}
                style={{ letterSpacing: "0.15em" }}
              >
                Visão de Saída
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 w-full xl:w-auto justify-end">
          <div
            className={`flex items-center gap-3 p-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <Calendar
              size={16}
              className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((ano) => (
                <option
                  key={ano}
                  value={ano}
                  className={
                    isLightMode
                      ? "text-gray-800 bg-white"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {ano}
                </option>
              ))}
            </select>
            <div
              className={`w-[1px] h-5 ${
                isLightMode ? "bg-gray-200" : "bg-[#2A3143]"
              }`}
            ></div>
            <User
              size={16}
              className={isLightMode ? "text-[#8800CC]" : "text-[#B900FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] capitalize cursor-pointer max-w-[100px] truncate ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((mes) => (
                <option
                  key={mes}
                  value={mes}
                  className={
                    isLightMode
                      ? "text-gray-800 bg-white"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onRefresh(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <RefreshCw
              size={14}
              className={`${
                isRefreshing
                  ? isLightMode
                    ? "text-[#007489] animate-spin"
                    : "text-white animate-spin"
                  : isLightMode
                  ? "text-[#007489] group-hover:text-[#007489]"
                  : "text-[#00E5FF] group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              }`}
            />
            <div className="flex flex-col text-left hidden sm:flex">
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${
                  isLightMode ? "text-gray-500" : "text-[#8B949E]"
                }`}
              >
                Atualizar
              </span>
              <span
                className={`text-[9px] font-mono ${
                  isLightMode ? "text-gray-800" : "text-white"
                }`}
              >
                ATT:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-600 hover:text-[#007489] hover:border-[#007489] shadow-sm hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] text-[#00E5FF] hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
            title="Alternar Tema"
          >
            {isLightMode ? (
              <Moon size={16} />
            ) : (
              <Sun
                size={16}
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              />
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 shrink-0 mb-4 px-1 pb-1 w-full">
        <NeonKpiCard
          title="% RECUPERADO"
          value={kpis.pctRecup}
          icon={Percent}
          colorTheme="green"
          isPercentage={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="QTD. EXPEDIDO"
          value={kpis.itens}
          icon={Package}
          colorTheme="cyan"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="LOTE EXPEDIDO"
          value={kpis.lotes}
          icon={Box}
          colorTheme="orange"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="VALOR CUSTO"
          value={kpis.custo}
          icon={DollarSign}
          colorTheme="red"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="VALOR VENDA"
          value={kpis.venda}
          icon={DollarSign}
          colorTheme="yellow"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="VALOR RECUPERADO"
          value={kpis.recuperado}
          icon={DollarSign}
          colorTheme="green"
          isCurrency={true}
          isLightMode={isLightMode}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0 w-full pt-2">
        <div className="flex flex-col lg:flex-[1.5] gap-3 lg:min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel
              title="EXPEDIÇÃO MENSAL (itens)"
              isLightMode={isLightMode}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 25, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltipSaida
                        {...props}
                        isLightMode={isLightMode}
                      />
                    )}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Bar
                    dataKey="itens"
                    name="Itens"
                    fill="url(#cyanGrad)"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="itens"
                      position="top"
                      fill={isLightMode ? LIGHT_CYAN : NEON_CYAN}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: !isLightMode ? "1px 1px 3px #000" : "none",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>

          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel
              title="EXPEDIÇÃO MENSAL (lote)"
              isLightMode={isLightMode}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 35, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, (max) => Math.max(10, Math.ceil(max * 6))]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltipSaida
                        {...props}
                        isLightMode={isLightMode}
                      />
                    )}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{
                      top: -10,
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: axisTickFill,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="lotes"
                    name="Qtd Lotes"
                    fill="url(#orangeGrad)"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="lotes"
                      position="top"
                      fill={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? v : "")}
                      style={{
                        textShadow: !isLightMode ? "1px 1px 3px #000" : "none",
                      }}
                    />
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pctRecup"
                    name="% Recuperado"
                    stroke={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: isLightMode ? LIGHT_GREEN : NEON_GREEN,
                      stroke: "#121620",
                      strokeWidth: 2,
                    }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="pctRecup"
                      position="top"
                      offset={12}
                      fill={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
                      style={{
                        textShadow: !isLightMode ? "1px 1px 2px #000" : "none",
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>

          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="EXPEDIÇÃO MENSAL $" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 40, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    padding={{ left: 15, right: 15 }}
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: axisTickFill,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltipSaida
                        {...props}
                        isLightMode={isLightMode}
                      />
                    )}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{
                      top: -10,
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: axisTickFill,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="custo"
                    name="$ Custo"
                    stroke={isLightMode ? LIGHT_PINK : NEON_PINK}
                    strokeWidth={3}
                    dot={{ r: 4, fill: isLightMode ? LIGHT_PINK : NEON_PINK }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="custo"
                      position="top"
                      offset={25}
                      fill={isLightMode ? LIGHT_PINK : NEON_PINK}
                      fontSize={11}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) =>
                        v > 0 ? `R$ ${(v / 1000).toFixed(0)}k` : ""
                      }
                      style={{
                        textShadow: !isLightMode ? "1px 1px 2px #000" : "none",
                      }}
                    />
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="venda"
                    name="$ Venda"
                    stroke={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: isLightMode ? LIGHT_YELLOW : NEON_YELLOW,
                    }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="venda"
                      position="top"
                      offset={15}
                      fill={isLightMode ? LIGHT_YELLOW : NEON_YELLOW}
                      fontSize={11}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) =>
                        v > 0 ? `R$ ${(v / 1000).toFixed(0)}k` : ""
                      }
                      style={{
                        textShadow: !isLightMode ? "1px 1px 2px #000" : "none",
                      }}
                    />
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="recuperado"
                    name="$ Recuperado"
                    stroke={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                    strokeWidth={3}
                    dot={{ r: 4, fill: isLightMode ? LIGHT_GREEN : NEON_GREEN }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="recuperado"
                      position="bottom"
                      offset={10}
                      fill={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                      fontSize={11}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) =>
                        v > 0 ? `R$ ${(v / 1000).toFixed(0)}k` : ""
                      }
                      style={{
                        textShadow: !isLightMode ? "1px 1px 2px #000" : "none",
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
        </div>

        <div className="flex flex-col lg:flex-1 gap-3 lg:min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[1.5] flex flex-col">
            <NeonCategoryTable
              tableData={tableCategoria}
              isLightMode={isLightMode}
            />
          </div>

          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="COMPARAÇÃO ANUAL %" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
                  <Pie
                    data={yearlyData}
                    cx="40%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="75%"
                    paddingAngle={4}
                    cornerRadius={8}
                    dataKey="recuperado"
                    nameKey="name"
                    labelLine={false}
                    label={(props) =>
                      renderDonutLabel({ ...props, isLightMode })
                    }
                    stroke="none"
                  >
                    {yearlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          NEON_COLORS_SAIDA[index % NEON_COLORS_SAIDA.length]
                        }
                        style={{
                          filter: isLightMode ? "none" : "url(#glowDark)",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <CustomTooltipSaida
                        {...props}
                        isLightMode={isLightMode}
                      />
                    )}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: axisTickFill,
                      paddingRight: "5px",
                    }}
                    payload={yearlyData.map((item, index) => ({
                      id: item.name,
                      type: "circle",
                      value: item.name,
                      color:
                        NEON_COLORS_SAIDA[index % NEON_COLORS_SAIDA.length],
                    }))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>

          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel
              title="COMPARATIVO LEILOEIRA ITENS / % RECUP"
              isLightMode={isLightMode}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={leiloeiraData}
                  margin={{ top: 30, right: 80, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="leiloeira"
                    type="category"
                    tick={{
                      fill: isLightMode ? LIGHT_CYAN : NEON_CYAN,
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltipSaida
                        {...props}
                        isLightMode={isLightMode}
                      />
                    )}
                    cursor={{
                      fill: isLightMode ? "#F3F4F6" : "#1A1F2E",
                      opacity: 0.6,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ top: -5 }}
                    content={() => (
                      <div
                        className="flex justify-center gap-4 text-[11px] font-bold uppercase tracking-widest mb-4"
                        style={{ color: axisTickFill }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: isLightMode
                                ? LIGHT_CYAN
                                : NEON_CYAN,
                            }}
                          ></div>
                          <span>Qtd. Expedido</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: isLightMode
                                ? LIGHT_YELLOW
                                : NEON_YELLOW,
                            }}
                          ></div>
                          <span>% Recuperação</span>
                        </div>
                      </div>
                    )}
                  />
                  <Bar
                    dataKey="itens"
                    name="Qtd Itens"
                    fill="url(#cyanGrad)"
                    barSize={30}
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      content={(props) => (
                        <LeiloeiraCustomLabel
                          {...props}
                          isLightMode={isLightMode}
                        />
                      )}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ABA 3: PAINEL COMPARATIVO
// ==========================================
function PainelComparativo({
  data,
  isLightMode,
  setIsLightMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) {
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  // Auto-selecionar o ano/mês mais recente quando os dados chegarem
  useEffect(() => {
    if (!data || data.length === 0) return;
    const years = [
      ...new Set(data.map((item) => item.Ano).filter(Boolean)),
    ].sort();
    if (years.length > 0 && selectedYear === "Todos") {
      const latestYear = years[years.length - 1];
      setSelectedYear(latestYear);
    }
  }, [data]);

  const availableYears = useMemo(
    () => [
      "Todos",
      ...[...new Set(data.map((i) => i.Ano).filter(Boolean))].sort(),
    ],
    [data]
  );
  const availableMonths = useMemo(() => {
    const months = [...new Set(data.map((i) => i.MêsCompleto).filter(Boolean))];
    months.sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b));
    return ["Todos", ...months];
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          (selectedYear === "Todos" || item.Ano === selectedYear) &&
          (selectedMonth === "Todos" || item.MêsCompleto === selectedMonth)
      ),
    [data, selectedYear, selectedMonth]
  );

  const kpis = useMemo(
    () =>
      filteredData.reduce(
        (acc, curr) => ({
          entItens: acc.entItens + curr.entItens,
          saiItens: acc.saiItens + curr.saiItens,
          entCusto: acc.entCusto + curr.entCusto,
          saiRecup: acc.saiRecup + curr.saiRecup,
        }),
        { entItens: 0, saiItens: 0, entCusto: 0, saiRecup: 0 }
      ),
    [filteredData]
  );

  const monthlyData = useMemo(() => {
    const SHORT_MONTHS = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];
    const result = SHORT_MONTHS.map((m) => ({
      mes: m,
      entItens: 0,
      saiItens: 0,
      entCusto: 0,
      saiRecup: 0,
    }));
    data
      .filter((i) => selectedYear === "Todos" || i.Ano === selectedYear)
      .forEach((item) => {
        const mIndex = SHORT_MONTHS.indexOf(item.Mês);
        if (mIndex !== -1) {
          result[mIndex].entItens += item.entItens;
          result[mIndex].saiItens += item.saiItens;
          result[mIndex].entCusto += item.entCusto;
          result[mIndex].saiRecup += item.saiRecup;
        }
      });
    return result;
  }, [data, selectedYear]);

  const categoryData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      let key = item.Categoria || "N/A";
      if (!map[key]) map[key] = { name: key, entItens: 0, saiItens: 0 };
      map[key].entItens += item.entItens;
      map[key].saiItens += item.saiItens;
    });
    return Object.values(map)
      .sort((a, b) => b.entItens + b.saiItens - (a.entItens + a.saiItens))
      .slice(0, 10);
  }, [filteredData]);

  const yearlyData = useMemo(() => {
    const map = {};
    data.forEach((item) => {
      if (!item.Ano) return;
      if (!map[item.Ano])
        map[item.Ano] = { name: item.Ano, entItens: 0, saiItens: 0 };
      map[item.Ano].entItens += item.entItens;
      map[item.Ano].saiItens += item.saiItens;
    });
    return Object.values(map).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [data]);

  const CustomTooltip = ({ active, payload, label, isLightMode }) => {
    if (active && payload && payload.length) {
      const bg = isLightMode
        ? "bg-white/95 border-gray-200 shadow-lg"
        : "bg-[#0D1117]/95 border-[#1A2332] shadow-[0_0_15px_rgba(0,0,0,0.8)]";
      const textTitle = isLightMode
        ? "text-gray-500 border-gray-200"
        : "text-gray-400 border-[#2A3143]";
      const textVal = isLightMode ? "text-gray-800" : "text-white";
      return (
        <div className={`${bg} border p-3 rounded-md backdrop-blur-md z-50`}>
          <p
            className={`text-[11px] font-bold uppercase tracking-widest mb-2 border-b border-dashed pb-1 ${textTitle}`}
          >
            {label}
          </p>
          {payload.map((entry, index) => {
            const isMoney =
              entry.dataKey.includes("Custo") ||
              entry.dataKey.includes("Recup");
            const val = isMoney
              ? formatBRL(entry.value)
              : formatNumber(entry.value);
            return (
              <div
                key={index}
                className="flex items-center gap-3 text-[12px] font-mono my-1.5"
              >
                <span
                  style={{ color: entry.color || entry.fill }}
                  className="font-bold uppercase drop-shadow-[0_0_2px_currentColor]"
                >
                  {entry.name}:
                </span>
                <span className={`font-bold ${textVal}`}>{val}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const strokeGrid = isLightMode ? "#E5E7EB" : "#1A2332";
  const fillTicks = isLightMode ? "#6B7280" : "#8B949E";
  const fillLegend = isLightMode ? "#475569" : "#8B949E";
  const cursorBg = isLightMode ? "#F3F4F6" : "#1A2332";

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-3 overflow-y-auto overflow-x-hidden">
      <div className="w-full flex flex-col xl:flex-row justify-between items-center mb-3 shrink-0 gap-4">
        <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-start">
          <div
            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
              isLightMode
                ? "bg-white border-yellow-200 shadow-sm"
                : "bg-[#FFCC00]/10 border-[#FFCC00]/30 shadow-[0_0_15px_rgba(255,204,0,0.2)]"
            }`}
          >
            <Activity
              className={
                isLightMode
                  ? "text-[#CC9900]"
                  : "text-[#FFCC00] drop-shadow-[0_0_8px_rgba(255,204,0,0.8)]"
              }
              size={18}
            />
          </div>
          <h2
            className={`font-bold text-sm md:text-base tracking-[0.15em] uppercase text-center ${
              isLightMode
                ? "text-[#CC9900]"
                : "text-[#FFCC00] drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]"
            }`}
          >
            VISÃO COMPARATIVA
          </h2>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 w-full xl:w-auto">
          <div
            className={`flex items-center gap-3 p-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <Calendar
              size={16}
              className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((ano) => (
                <option
                  key={ano}
                  value={ano}
                  className={
                    isLightMode
                      ? "bg-white text-gray-800"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {ano}
                </option>
              ))}
            </select>
            <div
              className={`w-[1px] h-5 ${
                isLightMode ? "bg-gray-200" : "bg-[#2A3143]"
              }`}
            ></div>
            <User
              size={16}
              className={isLightMode ? "text-[#8800CC]" : "text-[#B900FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] capitalize cursor-pointer max-w-[100px] truncate ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((mes) => (
                <option
                  key={mes}
                  value={mes}
                  className={
                    isLightMode
                      ? "bg-white text-gray-800"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {mes}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onRefresh(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <RefreshCw
              size={14}
              className={`${
                isRefreshing
                  ? isLightMode
                    ? "text-[#007489] animate-spin"
                    : "text-white animate-spin"
                  : isLightMode
                  ? "text-[#007489] group-hover:text-[#007489]"
                  : "text-[#00E5FF] group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              }`}
            />
            <div className="flex flex-col text-left hidden sm:flex">
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${
                  isLightMode ? "text-gray-500" : "text-[#8B949E]"
                }`}
              >
                Atualizar
              </span>
              <span
                className={`text-[9px] font-mono ${
                  isLightMode ? "text-gray-800" : "text-white"
                }`}
              >
                ATT:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-600 hover:text-[#007489] hover:border-[#007489] shadow-sm hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] text-[#00E5FF] hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
            title="Alternar Tema"
          >
            {isLightMode ? (
              <Moon size={16} />
            ) : (
              <Sun
                size={16}
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full shrink-0 mb-4 px-1 pb-1">
        <NeonKpiCard
          title="QTD. ENTRADA"
          value={formatNumber(kpis.entItens)}
          icon={ArrowDownToLine}
          colorTheme="cyan"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="CUSTO ENTRADA"
          value={formatBRL(kpis.entCusto)}
          icon={DollarSign}
          colorTheme="pink"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="QTD. SAÍDA"
          value={formatNumber(kpis.saiItens)}
          icon={ArrowUpFromLine}
          colorTheme="orange"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="RECUPERADO SAÍDA"
          value={formatBRL(kpis.saiRecup)}
          icon={DollarSign}
          colorTheme="green"
          isLightMode={isLightMode}
        />
      </div>

      <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0 w-full">
        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[3] flex flex-col">
            <MechPanel title="COMPARATIVO MENSAL" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 35, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={strokeGrid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fill: fillTicks,
                      fontSize: 13,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: fillTicks,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      formatCompactBRL(v).replace("R$ ", "")
                    }
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                    cursor={{ fill: cursorBg, opacity: 0.4 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    wrapperStyle={{
                      top: -10,
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                    }}
                  />
                  <Bar
                    dataKey="entItens"
                    name="Entrada"
                    stackId="a"
                    fill="url(#cyanGrad)"
                    maxBarSize={45}
                  >
                    <LabelList
                      dataKey="entItens"
                      position="top"
                      fill={isLightMode ? LIGHT_CYAN : NEON_CYAN}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                  <Bar
                    dataKey="saiItens"
                    name="Saída"
                    stackId="a"
                    fill="url(#orangeGrad)"
                    maxBarSize={45}
                  >
                    <LabelList
                      dataKey="saiItens"
                      position="top"
                      fill={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="SHARE MENSAL % (ITENS)" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Pie
                    data={[
                      { name: "Entrada", value: kpis.entItens },
                      { name: "Saída", value: kpis.saiItens },
                    ]}
                    cx="40%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="75%"
                    paddingAngle={4}
                    cornerRadius={8}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={(props) =>
                      renderDonutLabel({ ...props, isLightMode })
                    }
                  >
                    <Cell
                      fill={isLightMode ? LIGHT_CYAN : NEON_CYAN}
                      style={{
                        filter: isLightMode
                          ? "none"
                          : "drop-shadow(0 0 5px rgba(0,229,255,0.4))",
                      }}
                    />
                    <Cell
                      fill={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
                      style={{
                        filter: isLightMode
                          ? "none"
                          : "drop-shadow(0 0 5px rgba(255,102,0,0.4))",
                      }}
                    />
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                      paddingRight: "5px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[3] flex flex-col">
            <MechPanel title="COMPARATIVO CATEGORIA" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 35, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={strokeGrid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: fillTicks,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: fillTicks,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      formatCompactBRL(v).replace("R$ ", "")
                    }
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                    cursor={{ fill: cursorBg, opacity: 0.4 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    wrapperStyle={{
                      top: -10,
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                    }}
                  />
                  <Bar
                    dataKey="entItens"
                    name="Entrada"
                    stackId="a"
                    fill="url(#cyanGrad)"
                    maxBarSize={45}
                  >
                    <LabelList
                      dataKey="entItens"
                      position="top"
                      fill={isLightMode ? LIGHT_CYAN : NEON_CYAN}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                  <Bar
                    dataKey="saiItens"
                    name="Saída"
                    stackId="a"
                    fill="url(#orangeGrad)"
                    maxBarSize={45}
                  >
                    <LabelList
                      dataKey="saiItens"
                      position="top"
                      fill={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel title="SHARE MENSAL % (CUSTO)" isLightMode={isLightMode}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Pie
                    data={[
                      {
                        name: "Custo Entrada",
                        value: Math.max(0, kpis.entCusto - kpis.saiRecup),
                      },
                      { name: "Recuperado Saída", value: kpis.saiRecup },
                    ]}
                    cx="40%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="75%"
                    paddingAngle={4}
                    cornerRadius={8}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={(props) =>
                      renderDonutLabel({ ...props, isLightMode })
                    }
                  >
                    <Cell
                      fill={isLightMode ? LIGHT_PINK : NEON_PINK}
                      style={{
                        filter: isLightMode
                          ? "none"
                          : "drop-shadow(0 0 5px rgba(255,0,85,0.4))",
                      }}
                    />
                    <Cell
                      fill={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                      style={{
                        filter: isLightMode
                          ? "none"
                          : "drop-shadow(0 0 5px rgba(0,255,102,0.4))",
                      }}
                    />
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                      paddingRight: "5px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-0 w-full">
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[3] flex flex-col">
            <MechPanel
              title="EVOLUÇÃO FINANCEIRA MENSAL ($)"
              isLightMode={isLightMode}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 35, right: 15, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={strokeGrid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fill: fillTicks,
                      fontSize: 13,
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: fillTicks,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCompactBRL(v)}
                    width={60}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                    cursor={{ fill: cursorBg, opacity: 0.4 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    wrapperStyle={{
                      top: -10,
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="entCusto"
                    name="Custo Entrada"
                    stroke={isLightMode ? LIGHT_PINK : NEON_PINK}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: isLightMode ? LIGHT_PINK : NEON_PINK,
                      stroke: isLightMode ? "#FFF" : "#0D1117",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 5 }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="entCusto"
                      position="top"
                      offset={10}
                      fill={isLightMode ? LIGHT_PINK : NEON_PINK}
                      fontSize={12}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatCompactBRL(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 2px #000",
                      }}
                    />
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="saiRecup"
                    name="Recuperado Saída"
                    stroke={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: isLightMode ? LIGHT_GREEN : NEON_GREEN,
                      stroke: isLightMode ? "#FFF" : "#0D1117",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 5 }}
                    style={{ filter: isLightMode ? "none" : "url(#glowDark)" }}
                  >
                    <LabelList
                      dataKey="saiRecup"
                      position="top"
                      offset={10}
                      fill={isLightMode ? LIGHT_GREEN : NEON_GREEN}
                      fontSize={12}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatCompactBRL(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 2px #000",
                      }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
          <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-1 flex flex-col">
            <MechPanel
              title="HISTÓRICO ANUAL (ITENS)"
              isLightMode={isLightMode}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={yearlyData}
                  margin={{ top: 5, right: 60, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={strokeGrid}
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{
                      fill: isLightMode ? LIGHT_CYAN : NEON_CYAN,
                      fontSize: 13,
                      fontWeight: "bold",
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} isLightMode={isLightMode} />
                    )}
                    cursor={{ fill: cursorBg, opacity: 0.4 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    wrapperStyle={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: fillLegend,
                    }}
                  />
                  <Bar
                    dataKey="entItens"
                    name="Entrada"
                    stackId="a"
                    fill="url(#cyanGrad)"
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey="entItens"
                      position="right"
                      fill={isLightMode ? LIGHT_CYAN : NEON_CYAN}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                  <Bar
                    dataKey="saiItens"
                    name="Saída"
                    stackId="a"
                    fill="url(#orangeGrad)"
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey="saiItens"
                      position="right"
                      fill={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
                      fontSize={13}
                      fontFamily="monospace"
                      fontWeight="bold"
                      formatter={(v) => (v > 0 ? formatNumber(v) : "")}
                      style={{
                        textShadow: isLightMode ? "none" : "1px 1px 3px #000",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </MechPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ABA 4: MAPEAMENTO E RANKING 3D
// ==========================================

const Brazil3DMap = ({ data, isLightMode }) => {
  const [geoJson, setGeoJson] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(2.6); // Ajustado para dar foco e preencher a tela como no print
  const [pan, setPan] = useState({ x: 10, y: -20 }); // Ajustado para centralizar o mapa
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"
    )
      .then((res) => res.json())
      .then(setGeoJson)
      .catch(console.error);
  }, []);

  const { stateData, maxLotes } = useMemo(() => {
    const map = {};
    let max = 0;
    data.forEach((d) => {
      const st = d.estado || "Ignorado";
      if (!map[st])
        map[st] = {
          value: 0,
          count: 0,
          arrematantes: new Set(),
          custo: 0,
          vendido: 0,
          itens: 0,
        };
      map[st].value += d.valorRecuperado || 0;
      map[st].custo += d.valorCusto || 0;
      map[st].vendido += d.valorVendido || 0;
      map[st].itens += d.qtdItensLote || 0;
      map[st].count += 1;
      if (d.arrematante) map[st].arrematantes.add(d.arrematante);
      if (map[st].count > max) max = map[st].count;
    });
    const final = {};
    Object.keys(map).forEach((k) => {
      final[k] = {
        valorRecuperado: map[k].value,
        lotes: map[k].count,
        qtdArrematantes: map[k].arrematantes.size,
        valorCusto: map[k].custo,
        valorVendido: map[k].vendido,
        qtdItens: map[k].itens,
      };
    });
    return { stateData: final, maxLotes: max };
  }, [data]);

  const paths = useMemo(() => {
    if (!geoJson) return [];
    const width = 800,
      height = 500;
    const minLon = -73.99,
      maxLon = -34.79,
      minLat = -33.75,
      maxLat = 5.27;
    const baseScale =
      Math.min(width / (maxLon - minLon), height / (maxLat - minLat)) * 0.9;
    const offsetX = (width - (maxLon - minLon) * baseScale) / 2;
    const offsetY = (height - (maxLat - minLat) * baseScale) / 2;
    const project = (lon, lat) => [
      (lon - minLon) * baseScale + offsetX,
      height - (lat - minLat) * baseScale - offsetY,
    ];

    return geoJson.features.map((feat) => {
      const name = feat.properties.name;
      const sigla =
        feat.properties.sigla ||
        Object.entries(ufMapReverse).find(([_, n]) => n === name)?.[0] ||
        name;
      let path = "";
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      const processPolygon = (ring) => {
        ring.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          path += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
        });
        path += "Z ";
      };
      if (feat.geometry.type === "Polygon")
        feat.geometry.coordinates.forEach(processPolygon);
      else if (feat.geometry.type === "MultiPolygon")
        feat.geometry.coordinates.forEach((poly) =>
          poly.forEach(processPolygon)
        );

      let finalCx = (minX + maxX) / 2;
      let finalCy = (minY + maxY) / 2;

      if (sigla === "PE") {
        finalCx += 22;
        finalCy -= 4;
      }
      if (sigla === "AL") {
        finalCx += 12;
        finalCy += 4;
      }
      if (sigla === "SE") {
        finalCx += 8;
        finalCy += 7;
      }
      if (sigla === "RN") {
        finalCx += 15;
        finalCy -= 14;
      }
      if (sigla === "PB") {
        finalCx += 18;
        finalCy -= 9;
      }
      if (sigla === "DF") {
        finalCy -= 2;
      }

      return { sigla, d: path, name, cx: finalCx, cy: finalCy };
    });
  }, [geoJson]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging)
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const getHeatColor = (count) => {
    if (!count) return !isLightMode ? "#0f172a" : "#f1f5f9";
    const rawIntensity = maxLotes > 0 ? count / maxLotes : 0;
    const intensity = Math.pow(rawIntensity, 0.5);
    const baseColor = !isLightMode ? [8, 145, 178] : [6, 182, 212];
    const brightColor = !isLightMode ? [34, 211, 238] : [103, 232, 249];
    const rgb = baseColor.map((c, i) =>
      Math.round(c + (brightColor[i] - c) * intensity)
    );
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };

  return (
    <div
      className="w-full h-full relative flex items-center justify-center bg-transparent overflow-hidden rounded-xl"
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDragging ? "grabbing" : "default" }}
    >
      <div
        className={`absolute bottom-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-sm transition-colors ${
          !isLightMode
            ? "bg-[#050812]/90 border-cyan-900/50"
            : "bg-white/90 border-slate-200"
        }`}
      >
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          className={
            !isLightMode
              ? "text-cyan-400 hover:text-white"
              : "text-blue-500 hover:text-blue-700"
          }
        >
          <ZoomOut size={14} />
        </button>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className={`w-20 h-1 rounded-lg appearance-none cursor-pointer ${
            !isLightMode
              ? "bg-slate-700 accent-cyan-400"
              : "bg-slate-200 accent-blue-500"
          }`}
        />
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 4))}
          className={
            !isLightMode
              ? "text-cyan-400 hover:text-white"
              : "text-blue-500 hover:text-blue-700"
          }
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <div
        className="w-full h-full absolute inset-0"
        style={{ perspective: "1500px" }}
      >
        {geoJson && (
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              willChange: "transform",
            }}
          >
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full"
              style={{
                transform: `rotateX(55deg) rotateZ(-15deg)`,
                transformStyle: "preserve-3d",
                overflow: "visible",
              }}
            >
              {[...Array(6)]
                .map((_, i) => 5 - i)
                .map((i) => (
                  <g key={`l-${i}`} transform={`translate(0, ${i * 2.5})`}>
                    {paths.map((p) => {
                      const stats = stateData[p.sigla];
                      const active = stats && stats.valorRecuperado > 0;
                      const isHovered = hoveredState?.sigla === p.sigla;
                      const intensity =
                        maxLotes > 0 ? (stats?.lotes || 0) / maxLotes : 0;
                      const step = active ? Math.ceil(intensity * 4) : 0;
                      if (step < (6 - i) / 1.5 && active) return null;
                      const heatColor = isHovered
                        ? "#ef4444"
                        : getHeatColor(stats?.lotes || 0);
                      return (
                        <path
                          key={p.sigla}
                          d={p.d}
                          fill={
                            active
                              ? heatColor
                              : !isLightMode
                              ? "#020617"
                              : "#f1f5f9"
                          }
                          stroke={
                            active
                              ? heatColor
                              : !isLightMode
                              ? "#0f172a"
                              : "#e2e8f0"
                          }
                          strokeWidth="1"
                          opacity={0.2}
                        />
                      );
                    })}
                  </g>
                ))}
              <g>
                {paths.map((p) => {
                  const stats = stateData[p.sigla];
                  const hasData = stats && stats.valorRecuperado > 0;
                  const isHovered = hoveredState?.sigla === p.sigla;

                  const heatColor = isHovered
                    ? "#ef4444"
                    : getHeatColor(stats?.lotes || 0);
                  const intensity =
                    maxLotes > 0 ? (stats?.lotes || 0) / maxLotes : 0;
                  const step = Math.ceil(intensity * 4);
                  const elevation = hasData ? 10 + step * 8 : 0;
                  const transform =
                    isHovered && hasData
                      ? `translateZ(${elevation + 12}px) translateY(-10px)`
                      : hasData
                      ? `translateZ(${elevation}px) translateY(-${
                          elevation / 2
                        }px)`
                      : "none";
                  const glow =
                    isHovered && hasData
                      ? `drop-shadow(0 0 25px #ef4444)`
                      : hasData
                      ? `drop-shadow(0 0 ${10 + step * 5}px ${heatColor}88)`
                      : "none";

                  return (
                    <g key={p.sigla}>
                      <path
                        d={p.d}
                        fill={heatColor}
                        stroke={
                          hasData
                            ? isHovered
                              ? "#ffffff"
                              : "#ffffff44"
                            : !isLightMode
                            ? "#1e293b"
                            : "#e2e8f0"
                        }
                        strokeWidth={isHovered ? "2" : hasData ? "0.5" : "1"}
                        style={{
                          filter: glow,
                          transform,
                          transition:
                            "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        }}
                        onMouseEnter={() => {
                          if (!isDragging) setHoveredState({ ...p, ...stats });
                        }}
                        onMouseLeave={() => setHoveredState(null)}
                      />
                      <text
                        x={p.cx}
                        y={p.cy + 3}
                        fill={
                          hasData
                            ? "#ffffff"
                            : !isLightMode
                            ? "#334155"
                            : "#94a3b8"
                        }
                        fontSize="11px"
                        fontWeight="black"
                        textAnchor="middle"
                        style={{
                          pointerEvents: "none",
                          transform,
                          transition: "0.5s",
                          userSelect: "none",
                          filter: "drop-shadow(0 0 3px rgba(0,0,0,0.8))",
                        }}
                      >
                        {p.sigla}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {hoveredState && !isDragging && (
        <div
          className="fixed pointer-events-none z-[9999] flex flex-col items-center"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          <div className="float-box bg-[#050812]/95 border-2 border-red-500 p-5 shadow-[0_0_40px_rgba(239,68,68,0.7)] backdrop-blur-md min-w-[300px] rounded-lg mb-2">
            <div className="flex items-center gap-3 border-b border-red-900/50 pb-3 mb-4">
              <img
                src={`https://raw.githubusercontent.com/bgeneto/bandeiras-br/master/imagens/${hoveredState.sigla.toUpperCase()}.png`}
                alt={hoveredState.sigla}
                className="w-11 h-8 rounded shadow-md border border-slate-700"
              />
              <p className="font-bold text-red-50 text-xl uppercase tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                {hoveredState.name}
              </p>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 text-[13px] uppercase font-mono">
              <span className="text-white font-bold">Arrematantes:</span>
              <span className="text-white font-black text-base">
                {hoveredState.qtdArrematantes || 0}
              </span>
              <span className="text-purple-400 font-bold">Lotes:</span>
              <span className="text-purple-400 font-black text-base">
                {hoveredState.lotes || 0}
              </span>
              <span className="text-yellow-400 font-bold">Itens:</span>
              <span className="text-yellow-400 font-black text-base">
                {(hoveredState.qtdItens || 0).toLocaleString("pt-BR")}
              </span>
              <span className="text-rose-400 font-bold">$ Custo:</span>
              <span className="text-rose-400 font-black text-base">
                R${" "}
                {(hoveredState.valorCusto || 0).toLocaleString("pt-BR", {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-blue-400 font-bold">$ Vendido:</span>
              <span className="text-blue-400 font-black text-base">
                R${" "}
                {(hoveredState.valorVendido || 0).toLocaleString("pt-BR", {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-emerald-400 font-bold">$ Recup.:</span>
              <span className="text-emerald-400 font-black text-xl">
                R${" "}
                {(hoveredState.valorRecuperado || 0).toLocaleString("pt-BR", {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-emerald-400 font-bold">% Recup.:</span>
              <span className="text-emerald-400 font-black text-base">
                {hoveredState.valorCusto > 0
                  ? (
                      (hoveredState.valorRecuperado / hoveredState.valorCusto) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
          </div>
          <div className="w-[2px] h-12 bg-gradient-to-t from-red-500 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <div className="relative flex items-center justify-center">
            <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_12px_white] z-20 animate-radar-blink" />
            <div className="absolute w-8 h-8 rounded-full border-2 border-red-500 radar-ping" />
            <div className="absolute w-16 h-16 rounded-full border border-red-500 radar-ping-delayed" />
          </div>
        </div>
      )}
    </div>
  );
};

const AggregateTableMap = ({ data, isLightMode }) => {
  const aggregated = useMemo(() => {
    const map = new Map();
    const totalLotes = data.length;
    data.forEach((row) => {
      const key = row.arrematante || "Desconhecido";
      if (!map.has(key))
        map.set(key, {
          arrematante: key,
          estado: row.estado,
          qtdLote: 0,
          qtdItens: 0,
          valorCusto: 0,
          valorVendido: 0,
          valorRecuperado: 0,
        });
      const item = map.get(key);
      item.qtdLote += 1;
      item.qtdItens += row.qtdItensLote;
      item.valorCusto += row.valorCusto;
      item.valorVendido += row.valorVendido;
      item.valorRecuperado += row.valorRecuperado;
    });
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percLote: totalLotes > 0 ? (item.qtdLote / totalLotes) * 100 : 0,
      }))
      .sort((a, b) => b.qtdLote - a.qtdLote || b.qtdItens - a.qtdItens);
  }, [data]);

  const bgHeaderCols = isLightMode
    ? "bg-gray-100/80 border-gray-200 text-gray-500"
    : "bg-[#151925]/80 border-[#2A3143] text-[#8B949E]";
  // Fonte cinza claro para arrematante, conforme solicitado
  const textColorName = isLightMode ? "text-slate-600" : "text-slate-200";

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div
        className={`flex ${bgHeaderCols} text-[10px] md:text-[11px] font-bold uppercase tracking-widest border-b p-1.5 px-2 md:px-3 shrink-0 text-center transition-colors duration-300 z-10 relative`}
      >
        <div className="flex-[1.5] text-left">Arrematantes</div>
        <div className="flex-1 text-center">Estado</div>
        <div className="w-12 text-center">Lotes</div>
        <div className="w-16 text-center">Share</div>
        <div className="w-20 text-center">Qtd Itens</div>
        <div className="w-24 text-center">$ Custo</div>
        <div className="w-24 text-center">$ Vendido</div>
        <div className="w-24 text-center">$ Recup.</div>
      </div>
      <div
        className={`flex-1 overflow-y-auto custom-scrollbar rounded-b-lg z-10 relative`}
      >
        {aggregated.map((row, idx) => {
          const bgRowEven = isLightMode ? "bg-white/60" : "bg-[#121620]/60";
          const bgRowOdd = isLightMode ? "bg-gray-50/60" : "bg-[#151A26]/60";
          const hoverRow = isLightMode
            ? "hover:bg-gray-100"
            : "hover:bg-[#1E2536]";
          return (
            <div
              key={row.arrematante}
              className={`flex items-center text-[10px] md:text-[12px] p-2 px-2 md:px-3 font-medium transition-colors ${hoverRow} ${
                idx % 2 === 0 ? bgRowEven : bgRowOdd
              }`}
            >
              <div
                className={`flex-[1.5] text-left truncate px-1 md:px-2 ${textColorName} font-bold tracking-wider`}
                title={row.arrematante}
              >
                {row.arrematante}
              </div>
              <div
                className={`flex-1 text-center ${
                  isLightMode ? "text-purple-600" : "text-purple-400"
                } whitespace-nowrap overflow-hidden text-ellipsis px-1`}
              >
                {ufMapReverse[row.estado] || row.estado}
              </div>
              <div
                className={`w-12 text-center ${
                  isLightMode ? "text-slate-700" : "text-slate-200"
                } font-bold`}
              >
                {row.qtdLote}
              </div>
              <div className="w-16 flex items-center justify-center relative h-4 md:h-5">
                <div
                  className={`absolute left-0 top-1 bottom-1 w-full rounded-full overflow-hidden border ${
                    isLightMode
                      ? "bg-gray-200 border-gray-300"
                      : "bg-[#0A0D14] border-[#2A3143]"
                  }`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#B900FF] rounded-full"
                    style={{ width: `${Math.min(row.percLote, 100)}%` }}
                  />
                </div>
                <span className="relative z-10 text-[9px] text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ml-1">
                  {row.percLote.toFixed(0)}%
                </span>
              </div>
              <div
                className={`w-20 text-center ${
                  isLightMode ? "text-amber-600" : "text-yellow-400"
                } font-mono`}
              >
                {formatNumber(row.qtdItens)}
              </div>
              <div
                className={`w-24 text-center ${
                  isLightMode ? "text-rose-600" : "text-rose-400"
                } font-mono`}
              >
                {formatBRL(row.valorCusto)}
              </div>
              <div
                className={`w-24 text-center ${
                  isLightMode ? "text-blue-600" : "text-blue-400"
                } font-mono`}
              >
                {formatBRL(row.valorVendido)}
              </div>
              <div
                className={`w-24 text-center ${
                  isLightMode ? "text-emerald-600" : "text-emerald-400"
                } font-mono`}
              >
                {formatBRL(row.valorRecuperado)}
              </div>
            </div>
          );
        })}
        {aggregated.length === 0 && (
          <div
            className={`text-center p-4 text-[11px] font-mono ${
              isLightMode ? "text-gray-400" : "text-[#8B949E]"
            }`}
          >
            NO DATA FOUND_
          </div>
        )}
      </div>
    </div>
  );
};

function PainelMapeamento({
  data,
  isLightMode,
  setIsLightMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) {
  const [arrematante, setArrematante] = useState("");
  const [estado, setEstado] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");

  const filtered = useMemo(
    () =>
      data.filter(
        (r) =>
          (!arrematante || r.arrematante === arrematante) &&
          (!estado || r.estado === estado) &&
          (!ano || r.ano === ano) &&
          (!mes || r.mes === mes)
      ),
    [data, arrematante, estado, mes, ano]
  );

  const kpis = {
    recup: filtered.reduce((s, r) => s + (r.valorRecuperado || 0), 0),
    itens: filtered.reduce((s, r) => s + (r.qtdItensLote || 0), 0),
    lotes: filtered.length,
    custo: filtered.reduce((s, r) => s + (r.valorCusto || 0), 0),
    venda: filtered.reduce((s, r) => s + (r.valorVendido || 0), 0),
  };

  const opcoesAno = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter(
              (r) =>
                (!mes || r.mes === mes) &&
                (!arrematante || r.arrematante === arrematante)
            )
            .map((d) => d.ano)
        )
      ).sort(),
    [data, mes, arrematante]
  );
  const opcoesMes = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter(
              (r) =>
                (!ano || r.ano === ano) &&
                (!arrematante || r.arrematante === arrematante)
            )
            .map((d) => d.mes)
        )
      ).sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b)),
    [data, ano, arrematante]
  );
  const opcoesArrematante = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter((r) => (!ano || r.ano === ano) && (!mes || r.mes === mes))
            .map((d) => d.arrematante)
        )
      ).sort(),
    [data, ano, mes]
  );
  const opcoesEstado = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .filter((r) => (!ano || r.ano === ano) && (!mes || r.mes === mes))
            .map((d) => d.estado)
        )
      ).sort(),
    [data, ano, mes]
  );

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-3 overflow-y-auto overflow-x-hidden">
      <header className="flex flex-col xl:flex-row justify-between items-center mb-3 shrink-0 gap-3 w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-between">
          <div className="flex items-center gap-3 animate-heartbeat-scale">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                isLightMode
                  ? "bg-white border-purple-200 shadow-sm"
                  : "bg-[#B900FF]/10 border-[#B900FF]/30 shadow-[0_0_15px_rgba(185,0,255,0.2)]"
              }`}
            >
              <MapPin
                className={isLightMode ? "text-[#8800CC]" : "text-[#B900FF]"}
                size={18}
              />
            </div>
            <div>
              <h1
                className={`text-base md:text-lg font-bold uppercase ${
                  isLightMode
                    ? "text-[#8800CC]"
                    : "text-[#B900FF] drop-shadow-[0_0_8px_rgba(185,0,255,0.6)]"
                }`}
                style={{ letterSpacing: "0.15em" }}
              >
                Visão de Mapeamento
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 w-full xl:w-auto justify-end">
          <div
            className={`flex items-center gap-3 p-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <Calendar
              size={16}
              className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            >
              <option
                value=""
                className={isLightMode ? "bg-white" : "bg-[#121620]"}
              >
                Ano
              </option>
              {opcoesAno.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className={
                    isLightMode
                      ? "bg-white text-gray-800"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {opt}
                </option>
              ))}
            </select>
            <div
              className={`w-[1px] h-5 ${
                isLightMode ? "bg-gray-200" : "bg-[#2A3143]"
              }`}
            ></div>
            <Calendar
              size={16}
              className={isLightMode ? "text-[#8800CC]" : "text-[#B900FF]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] capitalize cursor-pointer max-w-[100px] truncate ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              <option
                value=""
                className={isLightMode ? "bg-white" : "bg-[#121620]"}
              >
                Mês
              </option>
              {opcoesMes.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className={
                    isLightMode
                      ? "bg-white text-gray-800"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {opt}
                </option>
              ))}
            </select>
            <div
              className={`w-[1px] h-5 ${
                isLightMode ? "bg-gray-200" : "bg-[#2A3143]"
              }`}
            ></div>
            <User
              size={16}
              className={isLightMode ? "text-[#D95306]" : "text-[#FF6600]"}
            />
            <select
              className={`bg-transparent border-none outline-none font-mono text-[12px] cursor-pointer max-w-[150px] truncate ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
              value={arrematante}
              onChange={(e) => setArrematante(e.target.value)}
            >
              <option
                value=""
                className={isLightMode ? "bg-white" : "bg-[#121620]"}
              >
                Arrematante
              </option>
              {opcoesArrematante.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className={
                    isLightMode
                      ? "bg-white text-gray-800"
                      : "bg-[#0D1117] text-white"
                  }
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setArrematante("");
              setEstado("");
              setMes("");
              setAno("");
              onRefresh(true);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group ${
              isLightMode
                ? "bg-white border-gray-200 shadow-sm hover:border-[#007489] hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
          >
            <RefreshCw
              size={14}
              className={`${
                isRefreshing
                  ? isLightMode
                    ? "text-[#007489] animate-spin"
                    : "text-white animate-spin"
                  : isLightMode
                  ? "text-[#007489] group-hover:text-[#007489]"
                  : "text-[#00E5FF] group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              }`}
            />
            <div className="flex flex-col text-left hidden sm:flex">
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${
                  isLightMode ? "text-gray-500" : "text-[#8B949E]"
                }`}
              >
                Atualizar
              </span>
              <span
                className={`text-[9px] font-mono ${
                  isLightMode ? "text-gray-800" : "text-white"
                }`}
              >
                ATT:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-600 hover:text-[#007489] hover:border-[#007489] shadow-sm hover:shadow-[0_0_20px_rgba(0,116,137,0.4)]"
                : "bg-[#0D1117] border-[#1A2332] text-[#00E5FF] hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]"
            }`}
            title="Alternar Tema"
          >
            {isLightMode ? (
              <Moon size={16} />
            ) : (
              <Sun
                size={16}
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              />
            )}
          </button>
        </div>
      </header>

      {/* Exatamente na ordem e cores solicitadas. Notar o forceWhiteText={true} no card QTD. LOTES para deixar o número branco. */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 shrink-0 mb-4 px-1 pb-1 w-full">
        <NeonKpiCard
          title="QTD. LOTES"
          value={formatNumber(kpis.lotes)}
          icon={Layers}
          colorTheme="purple"
          isLightMode={isLightMode}
          forceWhiteText={true}
        />
        <NeonKpiCard
          title="QTD. ITENS"
          value={formatNumber(kpis.itens)}
          icon={Package}
          colorTheme="yellow"
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="$ CUSTO"
          value={kpis.custo}
          icon={DollarSign}
          colorTheme="red"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="$ VENDIDO"
          value={kpis.venda}
          icon={DollarSign}
          colorTheme="cyan"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="VALOR RECUPERADO"
          value={kpis.recup}
          icon={DollarSign}
          colorTheme="green"
          isCurrency={true}
          isLightMode={isLightMode}
        />
        <NeonKpiCard
          title="% RECUPERADO"
          value={kpis.custo > 0 ? (kpis.recup / kpis.custo) * 100 : 0}
          icon={Percent}
          colorTheme="green"
          isPercentage={true}
          isLightMode={isLightMode}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-0 w-full">
        <div className="w-full min-h-[300px] lg:min-h-0 lg:flex-[1.5] flex flex-col">
          <MechPanel title="RANKING DE ARREMATANTES" isLightMode={isLightMode}>
            <AggregateTableMap data={filtered} isLightMode={isLightMode} />
          </MechPanel>
        </div>

        <div className="w-full min-h-[400px] lg:min-h-0 lg:flex-[2.5] flex flex-col relative">
          <MechPanel title="DISTRIBUIÇÃO REGIONAL 3D" isLightMode={isLightMode}>
            <div className="absolute top-4 right-4 z-20">
              <div
                className={`border rounded-full px-4 py-1.5 flex items-center shadow-2xl transition-all hover:border-cyan-400 ${
                  !isLightMode
                    ? "bg-[#050812]/90 border-cyan-900/50 backdrop-blur-md"
                    : "bg-white/95 border-slate-200"
                }`}
              >
                <MapPin
                  size={12}
                  className={
                    !isLightMode
                      ? "text-cyan-500 mr-2 shadow-[0_0_5px_cyan]"
                      : "text-[#8800CC] mr-2"
                  }
                />
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className={`bg-transparent text-[11px] font-black focus:outline-none w-32 cursor-pointer uppercase ${
                    !isLightMode ? "text-cyan-100" : "text-slate-700"
                  }`}
                >
                  <option
                    value=""
                    className={!isLightMode ? "bg-[#0a0f1c]" : "bg-white"}
                  >
                    Todos Estados
                  </option>
                  {opcoesEstado.map((s) => (
                    <option
                      key={s}
                      value={s}
                      className={!isLightMode ? "bg-[#0a0f1c]" : "bg-white"}
                    >
                      {ufMapReverse[s] || s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Brazil3DMap data={filtered} isLightMode={isLightMode} />
          </MechPanel>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROOT APP
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState("entrada");
  const [isLightMode, setIsLightMode] = useState(false);

  const [globalData, setGlobalData] = useState({
    entrada: [],
    saida: [],
    comparativo: [],
    mapeamento: [],
  });
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [resEntrada, resSaida, resComparativo] = await Promise.all([
        fetch(CSV_URL_ENTRADA),
        fetch(CSV_URL_SAIDA),
        fetch(CSV_URL_COMPARATIVO),
      ]);

      if (!resEntrada.ok || !resSaida.ok || !resComparativo.ok) {
        throw new Error("Falha ao baixar um ou mais dados das planilhas.");
      }

      const [csvEntrada, csvSaida, csvComparativo] = await Promise.all([
        resEntrada.text(),
        resSaida.text(),
        resComparativo.text(),
      ]);

      const entrada = processEntradaData(csvEntrada);
      const saida = processSaidaData(csvSaida);
      const comparativo = processComparativoData(csvComparativo);
      const mapeamento = processMapeamentoData(csvSaida);

      setGlobalData({ entrada, saida, comparativo, mapeamento });
      setLastUpdated(new Date());
      setGlobalError(null);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setIsGlobalLoading(false);
      if (isManualRefresh) setTimeout(() => setIsRefreshing(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(() => {
      fetchAllData(true);
    }, 3600000);
    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  const themeBg = isLightMode
    ? "bg-[#F3F4F6] text-gray-800"
    : "bg-[#0A0D14] text-white";

  if (isGlobalLoading) {
    const bgLoad = isLightMode
      ? "bg-[#F3F4F6] text-[#007489]"
      : "bg-[#090B10] text-[#00E5FF]";
    return (
      <div
        className={`h-screen w-screen flex flex-col items-center justify-center font-mono ${bgLoad}`}
      >
        <Zap
          className={`w-16 h-16 animate-pulse mb-6 ${
            !isLightMode ? "drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]" : ""
          }`}
        />
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] mb-2 animate-bounce text-center px-4">
          INICIALIZANDO BANCO DE DADOS...
        </h2>
        <p className="text-sm tracking-widest opacity-70">
          Sincronizando todas as bases de uma vez
        </p>
      </div>
    );
  }

  if (globalError) {
    const bgLoad = isLightMode
      ? "bg-[#F3F4F6] text-[#C50042]"
      : "bg-[#090B10] text-[#FF0055]";
    return (
      <div
        className={`h-screen w-screen flex flex-col items-center justify-center font-mono p-6 ${bgLoad}`}
      >
        <AlertTriangle
          className={`w-20 h-20 mb-6 ${
            !isLightMode ? "drop-shadow-[0_0_20px_rgba(255,0,85,0.6)]" : ""
          }`}
        />
        <h2 className="text-2xl font-bold tracking-[0.1em] mb-2">
          FALHA DE COMUNICAÇÃO GLOBAL
        </h2>
        <p
          className={`p-4 rounded-lg border text-center ${
            isLightMode
              ? "bg-red-50 border-red-200"
              : "bg-[#FF0055]/10 border-[#FF0055]/30"
          }`}
        >
          {globalError}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 font-sans ${themeBg}`}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${
          isLightMode ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.3)"
        }; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${
          isLightMode ? "#CBD5E1" : "#1A2332"
        }; border-radius: 4px; border: 1px solid ${
        isLightMode ? "#FFF" : "#0D1117"
      }; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${
          isLightMode ? "#007489" : "#00E5FF"
        }; }
        @keyframes float3d { 0%, 100% { text-shadow: 0 0 10px ${
          isLightMode ? "rgba(0,116,137,0.2)" : "rgba(0,229,255,0.5)"
        }; } 50% { text-shadow: 0 0 20px ${
        isLightMode ? "rgba(136,0,204,0.3)" : "rgba(185,0,255,0.8)"
      }; } }
        .animate-neon-title { animation: float3d 4s ease-in-out infinite; }
        
        @keyframes floatBox { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float-box { animation: floatBox 3s infinite ease-in-out; }
        
        @keyframes radar { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(4); opacity: 0; } }
        .radar-ping { animation: radar 2s infinite cubic-bezier(0, 0, 0.2, 1); }
        .radar-ping-delayed { animation: radar 2s infinite cubic-bezier(0, 0, 0.2, 1) 1s; }

        @keyframes blink { 0%, 100% { opacity: 1; transform: scale(1); filter: brightness(2); } 50% { opacity: 0.3; transform: scale(0.7); filter: brightness(1); } }
        .animate-radar-blink { animation: blink 0.8s infinite ease-in-out; }
      `}</style>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isLightMode ? LIGHT_CYAN : NEON_CYAN}
              stopOpacity={0.9}
            />
            <stop
              offset="100%"
              stopColor={isLightMode ? LIGHT_CYAN : NEON_CYAN}
              stopOpacity={isLightMode ? 0.6 : 0.4}
            />
          </linearGradient>
          <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isLightMode ? LIGHT_PINK : NEON_PINK}
              stopOpacity={0.9}
            />
            <stop
              offset="100%"
              stopColor={isLightMode ? LIGHT_PINK : NEON_PINK}
              stopOpacity={isLightMode ? 0.6 : 0.4}
            />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
              stopOpacity={0.9}
            />
            <stop
              offset="100%"
              stopColor={isLightMode ? LIGHT_ORANGE : NEON_ORANGE}
              stopOpacity={isLightMode ? 0.6 : 0.4}
            />
          </linearGradient>
          <filter id="glowDark">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div
        className={`w-full flex justify-between items-center px-4 md:px-6 py-2 border-b shrink-0 z-50 transition-colors duration-300 ${
          isLightMode
            ? "bg-white border-gray-200 shadow-sm"
            : "bg-[#0D1117] border-[#1A2332] shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`p-2 rounded-lg border shadow-sm ${
              isLightMode
                ? "bg-[#007489]/10 border-[#007489]/30"
                : "bg-[#00E5FF]/10 border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
            }`}
          >
            <LayoutDashboard
              className={isLightMode ? "text-[#007489]" : "text-[#00E5FF]"}
              size={20}
            />
          </div>
          <h1
            className={`text-lg md:text-xl lg:text-2xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r animate-neon-title hidden sm:block ${
              isLightMode
                ? "from-[#007489] to-[#8800CC]"
                : "from-[#00E5FF] to-[#B900FF]"
            }`}
          >
            PAINEL VEN LOT
          </h1>
        </div>

        <div className="flex items-center justify-center flex-shrink-0">
          <div
            className={`flex p-1 rounded-xl border gap-1 shadow-inner ${
              isLightMode
                ? "bg-gray-100 border-gray-200"
                : "bg-[#0A0D14] border-[#1A2332]"
            }`}
          >
            <button
              onClick={() => setActiveTab("entrada")}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "entrada"
                  ? isLightMode
                    ? "bg-white text-[#007489] shadow-sm"
                    : "bg-[#1A1F2E] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                  : isLightMode
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <ArrowDownToLine size={16} />{" "}
              <span className="hidden md:inline">Entrada</span>
            </button>
            <button
              onClick={() => setActiveTab("saida")}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "saida"
                  ? isLightMode
                    ? "bg-white text-[#D95306] shadow-sm"
                    : "bg-[#1A1F2E] text-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.2)]"
                  : isLightMode
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <ArrowUpFromLine size={16} />{" "}
              <span className="hidden md:inline">Saída</span>
            </button>
            <button
              onClick={() => setActiveTab("comparativo")}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "comparativo"
                  ? isLightMode
                    ? "bg-white text-[#CC9900] shadow-sm"
                    : "bg-[#1A1F2E] text-[#FFCC00] shadow-[0_0_10px_rgba(255,204,0,0.2)]"
                  : isLightMode
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <Activity size={16} />{" "}
              <span className="hidden md:inline">Comparativo</span>
            </button>
            <button
              onClick={() => setActiveTab("mapeamento")}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "mapeamento"
                  ? isLightMode
                    ? "bg-white text-[#8800CC] shadow-sm"
                    : "bg-[#1A1F2E] text-[#B900FF] shadow-[0_0_10px_rgba(185,0,255,0.2)]"
                  : isLightMode
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <MapPin size={16} />{" "}
              <span className="hidden md:inline">Mapeamento</span>
            </button>
          </div>
        </div>
        <div className="flex-1 hidden md:block"></div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden flex flex-col">
        {activeTab === "entrada" && (
          <PainelEntrada
            data={globalData.entrada}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            onRefresh={fetchAllData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
        )}
        {activeTab === "saida" && (
          <PainelSaida
            data={globalData.saida}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            onRefresh={fetchAllData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
        )}
        {activeTab === "comparativo" && (
          <PainelComparativo
            data={globalData.comparativo}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            onRefresh={fetchAllData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
        )}
        {activeTab === "mapeamento" && (
          <PainelMapeamento
            data={globalData.mapeamento}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            onRefresh={fetchAllData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    </div>
  );
}
