import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  RefreshCcw,
  BarChart2,
  Target,
  Trophy,
  Sun,
  Moon,
  Eye,
  EyeOff,
  UserCircle2,
  BarChart4,
  Inbox,
  Zap,
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Cpu,
  PieChart,
  BarChart3,
  Filter,
  X,
  Check,
  Maximize2,
  ZoomIn,
  LineChart,
} from "lucide-react";

// --- 1. CONFIGURAÇÕES GLOBAIS ---
const tableHoursGlobal = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// --- 2. UTILITÁRIOS E PARSERS ---

function parseNumberBRL(val) {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  let str = val
    .toString()
    .trim()
    .toLowerCase()
    .replace("h", "")
    .replace(/\s/g, "");
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length > 1 && parts[parts.length - 1].length === 3)
      str = str.replace(/\./g, "");
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function getMonthNumber(monthName) {
  if (!monthName) return -1;
  const normalized = monthName
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const map = {
    janeiro: 1,
    jan: 1,
    fevereiro: 2,
    fev: 2,
    marco: 3,
    mar: 3,
    abril: 4,
    abr: 4,
    maio: 5,
    mai: 5,
    junho: 6,
    jun: 6,
    julho: 7,
    jul: 7,
    agosto: 8,
    ago: 8,
    setembro: 9,
    set: 9,
    outubro: 10,
    out: 10,
    novembro: 11,
    nov: 11,
    dezembro: 12,
    dez: 12,
  };
  return map[normalized] || -1;
}

function getMonthName(monthValue) {
  if (!monthValue) return "";
  const num = parseInt(monthValue);
  if (isNaN(num))
    return (
      monthValue.charAt(0).toUpperCase() + monthValue.slice(1).toLowerCase()
    );
  const map = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
  };
  return map[num] || monthValue;
}

function getTargetByMonth(monthName) {
  const m = String(monthName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (
    m.includes("janeiro") ||
    m.includes("dezembro") ||
    m === "1" ||
    m === "12" ||
    m === "jan" ||
    m === "dez"
  )
    return 25;
  return 28;
}

function formatTimeInHouse(totalDays) {
  if (!totalDays || isNaN(parseInt(totalDays))) return "N/A";
  let days = parseInt(totalDays);
  const years = Math.floor(days / 365);
  days %= 365;
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  let parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Ano" : "Anos"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Mês" : "Meses"}`);
  if (remainingDays > 0 || parts.length === 0)
    parts.push(`${remainingDays} ${remainingDays === 1 ? "Dia" : "Dias"}`);
  if (parts.length === 1) return parts[0];
  const lastPart = parts.pop();
  return parts.join(", ") + " e " + lastPart;
}

function parseLine(line, separator) {
  if (!line) return [];
  const result = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === separator && !inQuotes) {
      result.push(cell.trim().replace(/^"|"$|'/g, ""));
      cell = "";
    } else cell += char;
  }
  result.push(cell.trim().replace(/^"|"$|'/g, ""));
  return result;
}

function parseCSV_Daily(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];
  const separator =
    (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length
      ? ";"
      : ",";
  let headerIndex = -1;
  let headers = [];
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const rawCols = parseLine(lines[i], separator);
    const normalized = rawCols.map((c) =>
      c
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    );
    if (
      normalized.some((c) => c.includes("nome") || c.includes("colaborador"))
    ) {
      headerIndex = i;
      headers = normalized;
      break;
    }
  }
  const startRow = headerIndex === -1 ? 1 : headerIndex + 1;
  return lines
    .slice(startRow)
    .map((line) => {
      const values = parseLine(line, separator);
      const obj = {};
      if (headerIndex !== -1) {
        headers.forEach((h, i) => {
          let v = values[i] || "";
          if (
            [
              "producao",
              "meta",
              "hora",
              "dia",
              "ano",
              "enviadas",
              "envio",
              "semana",
            ].some((k) => h.includes(k))
          )
            obj[h] = parseNumberBRL(v);
          else obj[h] = v;
        });
      }
      const getVal = (keys) => {
        for (const k of keys) {
          if (obj[k] !== undefined) return obj[k];
          const p = Object.keys(obj).find((key) => key.includes(k));
          if (p) return obj[p];
        }
        return "";
      };
      const mesRaw = getVal(["mes", "month"]);

      const envioVal = getVal(["envio", "enviadas", "tratativas", "desvio"]);
      const recebimentoVal = getVal([
        "recebimento",
        "entrada",
        "recebido",
        "total_recebido",
      ]);
      const horasTotalVal = getVal(["horas_total", "hora_total", "horastotal"]);

      return {
        nome: String(getVal(["nome", "colaborador"])),
        producao: parseFloat(getVal(["producao", "realizado", "qtd"])) || 0,
        meta:
          parseFloat(getVal(["meta", "objetivo"])) || getTargetByMonth(mesRaw),
        hora: parseInt(getVal(["hora", "hr"])) || 0,
        horas_total: parseNumberBRL(horasTotalVal),
        envio: parseFloat(envioVal) || 0,
        recebimento: parseFloat(recebimentoVal) || 0,
        tempo_casa: getVal(["tempo", "casa"]),
        status: String(getVal(["status", "situacao", "status_colab"])),
        dia: parseInt(getVal(["dia", "day"])) || 0,
        mes: mesRaw,
        ano: parseInt(getVal(["ano", "year"])) || 0,
        semana: String(getVal(["semana"]) || ""),
      };
    })
    .filter((row) => row.nome && row.nome.length > 1);
}

function parseCSV_Weekly(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];
  const separator =
    (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length
      ? ";"
      : ",";
  const headers = parseLine(lines[0], separator).map((h) =>
    h
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
  return lines
    .slice(1)
    .map((line) => {
      const values = parseLine(line, separator);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      const get = (keyPart) => {
        const key = Object.keys(obj).find((k) =>
          k.includes(keyPart.toLowerCase())
        );
        return key ? obj[key] : "";
      };

      const qtdVal = get("qtd") || get("producao") || get("realizado");
      const desvioVal =
        get("desvio") || get("envio") || get("tratativas") || get("enviadas");
      const recebimentoVal =
        get("recebimento") || get("entrada") || get("recebido");

      return {
        mes: get("mes") || "",
        ano: parseInt(get("ano")) || 0,
        semana: get("semanas") || get("semana") || get("escopo") || "Geral",
        qtd: parseNumberBRL(qtdVal),
        itens: parseNumberBRL(get("itens") || get("item")),
        horas: parseNumberBRL(
          get("horas_total") || get("horas") || get("hora")
        ),
        capacidade: parseNumberBRL(get("capacidade") || get("cap")),
        desvio: parseNumberBRL(desvioVal),
        recebimento: parseNumberBRL(recebimentoVal),
        meta: parseNumberBRL(get("meta")),
        q_colab: parseNumberBRL(get("q_colab") || get("total colaborador")),
      };
    })
    .filter(
      (r) => r.qtd > 0 || r.desvio > 0 || r.recebimento > 0 || r.semana !== ""
    );
}

function parseCSV_Curva(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  const separator =
    (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length
      ? ";"
      : ",";
  const rows = lines.map((line) => parseLine(line, separator));

  let headerRowIdx = -1;
  let headerNorm = [];

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const norm = rows[i].map((c) =>
      c
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    );
    if (
      norm.includes("colaborador") &&
      (norm.includes("dia") || norm.includes("data"))
    ) {
      headerRowIdx = i;
      headerNorm = norm;
      break;
    }
  }

  if (headerRowIdx === -1) return [];

  const blocks = [];

  for (let col = 0; col < headerNorm.length; col++) {
    if (headerNorm[col] === "colaborador" || headerNorm[col] === "nome") {
      blocks.push({
        colName: col,
        colDia: col + 1,
        colProd: col + 2,
        colMeta: col + 3,
        colPerc: col + 4,
      });
    }
  }

  const result = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    for (const block of blocks) {
      const nameRaw = row[block.colName] ? row[block.colName].trim() : "";
      const diaRaw = row[block.colDia] ? row[block.colDia].trim() : "";

      if (!nameRaw || !diaRaw) continue;

      const prodRaw = row[block.colProd] || "";
      const metaRaw = row[block.colMeta] || "";
      const percRaw = row[block.colPerc] || "";

      let perc = parseNumberBRL(percRaw);
      if (percRaw && !percRaw.includes("%") && perc > 0 && perc <= 2) {
        perc = perc * 100;
      }

      result.push({
        colaborador: nameRaw.toUpperCase(),
        dia: diaRaw,
        produtividade: parseNumberBRL(prodRaw),
        meta: parseNumberBRL(metaRaw),
        percentual: perc,
      });
    }
  }

  return result;
}

// --- 3. COMPONENTES DE INTERFACE ---

function GlassCard({ children, className = "", accentColor = "blue", isDark }) {
  const borderClassesDark = {
    blue: "border-l-blue-500 border-blue-500/30",
    emerald: "border-l-emerald-500 border-emerald-500/30",
    red: "border-l-red-500 border-red-500/30",
    purple: "border-l-purple-500 border-purple-500/30",
    orange: "border-l-orange-500 border-orange-500/30",
    cyan: "border-l-cyan-400 border-cyan-400/30",
    gold: "border-l-yellow-500 border-yellow-500/30",
    fuchsia: "border-l-fuchsia-500 border-fuchsia-500/30",
    rose: "border-l-red-500 border-red-500/30",
    amber: "border-l-amber-500 border-amber-500/30",
    stone: "border-l-stone-500 border-stone-500/30",
  };

  const borderClassesLight = {
    blue: "border-l-blue-500 border-stone-200",
    emerald: "border-l-emerald-500 border-stone-200",
    red: "border-l-red-500 border-stone-200",
    purple: "border-l-purple-500 border-stone-200",
    orange: "border-l-orange-500 border-stone-200",
    cyan: "border-l-cyan-400 border-stone-200",
    gold: "border-l-yellow-500 border-stone-200",
    fuchsia: "border-l-fuchsia-500 border-stone-200",
    rose: "border-l-red-500 border-stone-200",
    amber: "border-l-amber-500 border-stone-200",
    stone: "border-l-stone-500 border-stone-200",
  };

  const shadowDark = {
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    emerald: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    red: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    purple: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    orange: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    cyan: "shadow-[0_0_15px_rgba(34,211,238,0.15)]",
    gold: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
    fuchsia: "shadow-[0_0_15px_rgba(217,70,239,0.15)]",
    rose: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    amber: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    stone: "shadow-[0_0_15px_rgba(120,113,108,0.15)]",
  };

  const bg = isDark
    ? `bg-[#1c1917]/90 backdrop-blur-xl ${
        shadowDark[accentColor] || "shadow-2xl"
      }`
    : "bg-white/95 backdrop-blur-md shadow-xl";

  const borderClass = isDark
    ? borderClassesDark[accentColor] || "border-l-slate-500 border-white/5"
    : borderClassesLight[accentColor] || "border-l-slate-500 border-stone-200";

  return (
    <div
      className={`rounded-3xl border border-l-8 ${borderClass} ${bg} ${className} transition-all duration-300`}
    >
      {children}
    </div>
  );
}

function StatusBadge({ label, isDark }) {
  let text = String(label || "-");
  const upper = text.toUpperCase();
  if (upper.includes("NOVATO")) text = "NOVATO";
  else if (upper.includes("VETERANO")) text = "VETERANO";
  else if (upper.includes("APOIO")) text = "APOIO";

  let style = isDark
    ? "bg-stone-800 text-stone-300 border-stone-700"
    : "bg-slate-200 text-slate-700 border-slate-300 shadow-sm";
  if (text.toLowerCase().includes("veterano"))
    style = isDark
      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
      : "bg-indigo-100 text-indigo-700 border-indigo-200";
  else if (text.toLowerCase().includes("novato"))
    style = isDark
      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      : "bg-cyan-100 text-cyan-700 border-cyan-200";

  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${style}`}
    >
      {text}
    </span>
  );
}

function TargetArrow3D({ value, target }) {
  const roundedVal = Math.round(value);
  const is27 = roundedVal === 27;
  const isSuccess = roundedVal >= target;

  let color = isSuccess ? "text-emerald-400" : "text-red-500";
  let animClass = isSuccess ? "animate-bounce" : "animate-pulse";
  let transformClass = isSuccess ? "" : "rotate-180";

  if (is27) {
    color = "text-orange-500";
    animClass = "animate-spin";
    transformClass = "";
  }

  return (
    <div
      className={`flex items-center justify-center transition-all duration-700 ${animClass}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={`${color} drop-shadow-[0_0_10px_currentColor] transform ${transformClass}`}
      >
        <path d="M12 2L3 11H8V22H16V11H21L12 2Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function CyberAvatar({ rank = 1 }) {
  const color = rank === 1 ? "#00f2ff" : rank === 2 ? "#ffffff" : "#fb923c";
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]"
      >
        <defs>
          <radialGradient id={`av-glow-${rank}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={`url(#av-glow-${rank})`}
          className="animate-pulse"
        />
        <path
          d="M50 15c-18 0-33 15-33 33 0 11 6.5 21 17 26.5V88l16-4.5 16 4.5V74.5c10.5-5.5 17-15.5 17-26.5 0-18-15-33-33-33z"
          fill="#0f172a"
          stroke={color}
          strokeWidth="2.5"
        />
        <path
          d="M30 46h40v10H30z"
          fill={color}
          className="animate-pulse"
          opacity="0.8"
        />
        <circle cx="50" cy="30" r="3" fill={color} />
      </svg>
    </div>
  );
}

function FuturisticPodium({ winners, isDark }) {
  if (!winners || winners.length < 3) return null;
  const ordered = [winners[1], winners[0], winners[2]];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-4 lg:gap-8 h-full w-full perspective-[1000px] pb-8 mt-6">
      {ordered.map((w, idx) => {
        if (!w) return null;
        const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
        const height =
          place === 1
            ? "h-36 md:h-44"
            : place === 2
            ? "h-28 md:h-36"
            : "h-20 md:h-28";
        const color =
          place === 1 ? "#00f2ff" : place === 2 ? "#ffffff" : "#fb923c";
        const animDelay = `${idx * 0.2}s`;

        return (
          <div
            key={idx}
            className="flex flex-col items-center group w-1/3 max-w-[120px]"
          >
            <div
              className="mb-3 transition-all duration-500 group-hover:-translate-y-4 animate-float"
              style={{ animationDelay: animDelay }}
            >
              <div className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <CyberAvatar rank={place} />
              </div>
              <div className="text-center mt-2">
                <p
                  className={`text-[9px] md:text-[10px] font-black uppercase truncate ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  {String(w.nome).split(" ")[0]}
                </p>
                <p className="text-[11px] font-black" style={{ color }}>
                  {String(w.totalProd)} UN
                </p>
              </div>
            </div>
            <div
              className={`relative w-full ${height} transition-all duration-700 animate-float`}
              style={{ animationDelay: animDelay }}
            >
              <div
                className="absolute -top-3 left-0 w-full h-6 rounded-[50%] z-10 border border-white/20"
                style={{
                  background: `radial-gradient(circle at center, ${color}55, transparent)`,
                  boxShadow: `0 0 20px ${color}77`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-black/90 rounded-t-2xl border-x border-white/5 shadow-2xl overflow-hidden text-white font-black italic text-7xl md:text-9xl flex items-center justify-center opacity-10">
                {place}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FilterWrapper({ label, isDark, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-[7px] font-black uppercase tracking-widest pl-1 ${
          isDark ? "text-stone-400" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function MultiSelectNeon({
  options,
  selected,
  onToggle,
  placeholder,
  isDark,
  accentColor = "cyan",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) => {
    const label = String(o).toLowerCase();
    if (!isNaN(parseInt(o)) && placeholder === "Mês")
      return (
        label.includes(search.toLowerCase()) ||
        getMonthName(o).toLowerCase().includes(search.toLowerCase())
      );
    return label.includes(search.toLowerCase());
  });

  const ringColors = {
    cyan: "border-cyan-500/30 hover:border-cyan-400 focus:border-cyan-400",
    purple:
      "border-purple-500/30 hover:border-purple-400 focus:border-purple-400",
    emerald:
      "border-emerald-500/30 hover:border-emerald-400 focus:border-emerald-400",
  };

  const activeBg = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/20 text-purple-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
  };

  const renderButtonText = () => {
    if (selected.length === 0) return placeholder;
    const getVal = (val) =>
      placeholder === "Mês" && !isNaN(parseInt(val))
        ? getMonthName(val).toUpperCase()
        : String(val).toUpperCase();
    if (selected.length === 1) return getVal(selected[0]);
    return `${getVal(selected[0])}, ...`;
  };

  return (
    <div className="relative group min-w-[150px]" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-xl border-2 cursor-pointer flex items-center justify-between gap-3 transition-all ${
          isDark ? "bg-stone-900/60 text-stone-200" : "bg-white text-slate-800"
        } ${ringColors[accentColor] || ringColors.cyan} shadow-lg`}
      >
        <span className="text-[9px] font-black uppercase truncate max-w-[120px]">
          {renderButtonText()}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div
          className={`absolute top-full left-0 w-full mt-2 rounded-2xl border-2 z-[100] p-2 animate-in fade-in slide-in-from-top-2 ${
            isDark
              ? "bg-[#0f0e0d] border-white/10"
              : "bg-white border-stone-200"
          } shadow-2xl`}
        >
          <div className="relative mb-2">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-40 ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              placeholder="Pesquisar..."
              className={`w-full pl-8 pr-4 py-1.5 text-[10px] ${
                isDark
                  ? "bg-black/50 text-white"
                  : "bg-stone-100 text-slate-800"
              } border border-white/10 rounded-lg outline-none focus:border-opacity-100 transition-all`}
            />
          </div>
          <div
            className={`max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800 hover:scrollbar-thumb-stone-600 pr-1 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[9px] font-black opacity-30 uppercase text-center">
                Vazio
              </div>
            ) : (
              filtered.map((opt) => {
                const display =
                  placeholder === "Mês" && !isNaN(parseInt(opt))
                    ? getMonthName(opt).toUpperCase()
                    : String(opt).toUpperCase();
                return (
                  <div
                    key={String(opt)}
                    onClick={() => onToggle(opt)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold mb-0.5 transition-colors ${
                      selected.includes(opt)
                        ? activeBg[accentColor]
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className={isDark ? "text-white" : "text-slate-900"}>
                      {display}
                    </span>
                    {selected.includes(opt) && <Check className="w-3 h-3" />}
                  </div>
                );
              })
            )}
          </div>
          <div className="pt-2 mt-1 border-t border-white/10 flex justify-between px-1 text-slate-800">
            <button
              onClick={() => setIsOpen(false)}
              className={`text-[8px] font-black uppercase ${
                isDark
                  ? "text-stone-500 hover:text-white"
                  : "text-stone-400 hover:text-slate-800"
              } transition-colors`}
            >
              Fechar
            </button>
            {selected.length > 0 && (
              <button
                onClick={() => {
                  selected.forEach((s) => onToggle(s));
                  setIsOpen(false);
                }}
                className="text-[8px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = "blue",
  isDark,
  isSmall = false,
}) {
  const iconColors = {
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10",
    purple: "text-purple-500 bg-purple-50/10",
    orange: "text-orange-500 bg-orange-50/10",
    cyan: "text-cyan-500 bg-cyan-50/10",
    gold: "text-yellow-500 bg-yellow-500/10",
    fuchsia: "text-fuchsia-500 bg-fuchsia-500/10",
    rose: "text-red-500 bg-red-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    stone: "text-stone-500 bg-stone-500/10",
  };
  const textColors = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    red: "text-red-500",
    purple: "text-purple-400",
    orange: "text-orange-400",
    cyan: "text-cyan-400",
    gold: "text-yellow-400",
    fuchsia: "text-fuchsia-400",
    rose: "text-red-400",
    amber: "text-amber-500",
    stone: "text-stone-400",
  };

  const displayValue =
    typeof value === "number" && !isNaN(value)
      ? value % 1 !== 0
        ? value.toFixed(1)
        : value.toLocaleString()
      : String(value || "0");

  const valueColor = isDark ? textColors[accentColor] : "text-slate-900";

  return (
    <GlassCard
      accentColor={accentColor === "rose" ? "red" : accentColor}
      className={`${
        isSmall ? "py-1.5 px-3" : "py-3 px-4"
      } flex flex-col justify-between h-full group`}
      isDark={isDark}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p
            className={`${
              isSmall ? "text-[8px]" : "text-[10px]"
            } font-black uppercase tracking-widest mb-0.5 ${
              textColors[accentColor]
            } opacity-80 truncate`}
          >
            {String(title)}
          </p>
          <h3
            className={`${
              isSmall ? "text-lg" : "text-xl"
            } font-black ${valueColor} tracking-tighter truncate leading-tight`}
          >
            {String(displayValue)}
          </h3>
        </div>
        <div
          className={`${isSmall ? "p-1.5 rounded-lg" : "p-2 rounded-xl"} ${
            iconColors[accentColor]
          } shadow-inner flex-shrink-0 transition-transform group-hover:rotate-12`}
        >
          <Icon className={isSmall ? "w-4 h-4" : "w-6 h-6"} />
        </div>
      </div>
      {subtext && (
        <p
          className={`text-[10px] opacity-40 mt-0.5 font-bold italic truncate leading-none ${
            isDark ? "text-white" : "text-slate-700"
          }`}
        >
          {String(subtext)}
        </p>
      )}
    </GlassCard>
  );
}

function AttentionList({ list, isDark }) {
  return (
    <div className="space-y-3 h-full">
      {list.map((item, i) => (
        <div
          key={i}
          className={`flex items-center justify-between p-3 rounded-2xl border-l-4 ${
            isDark
              ? "bg-[#09090b] border-white/5 border-l-red-500"
              : "bg-white border-stone-100 border-l-red-500"
          } shadow-sm group hover:bg-red-500/5 transition-all`}
        >
          <div className="flex items-center gap-4 w-full text-white">
            <span
              className={`text-[11px] font-black ${
                isDark ? "text-stone-500" : "text-stone-400"
              }`}
            >
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[12px] font-black ${
                  isDark ? "text-white" : "text-slate-700"
                } truncate`}
              >
                {String(item.nome || "N/A")}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[9px] font-black opacity-60 uppercase ${
                    isDark ? "text-white" : "text-slate-600"
                  }`}
                >
                  {formatTimeInHouse(item.tempo_casa)}
                </span>
                <StatusBadge label={String(item.status)} isDark={isDark} />
              </div>
            </div>
            <p className="text-[14px] font-black text-red-500">
              {String(item.totalProd || 0)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductionChart({ data, isDark }) {
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 10) * 1.6;
  return (
    <div className="w-full h-full flex items-end justify-between gap-1 mt-10">
      {data.map((d, i) => {
        const heightPercent = (d.value / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center h-full group relative text-center"
          >
            {d.value > 0 && (
              <div
                className={`absolute font-black text-[10px] ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}
                style={{ bottom: `calc(${heightPercent}% + 15px)` }}
              >
                {String(d.value)}
              </div>
            )}
            <div className="w-full flex justify-center h-full items-end">
              <div
                className="w-full max-w-[22px] rounded-t-lg bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-700 hover:scale-y-105"
                style={{ height: `${heightPercent}%` }}
              />
            </div>
            <span
              className={`text-[9px] ${
                isDark ? "text-stone-500" : "text-stone-400"
              } mt-2 font-black tracking-tighter uppercase`}
            >
              {String(d.hour)}H
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PowerBattery3D({
  percentage,
  label,
  topLabel,
  bottomLabel,
  capValue,
  prodValue,
  colorType = "cyan",
  isDark,
  topLabelColor,
}) {
  const fillPercent = Math.min(100, Math.max(0, percentage));
  const theme = {
    cyan: "from-cyan-600 via-cyan-400 to-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.4)] border-cyan-400/40",
    amber:
      "from-amber-600 via-amber-500 to-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] border-amber-400/40",
  };
  const labelColor =
    colorType === "cyan"
      ? isDark
        ? "text-cyan-400"
        : "text-blue-700"
      : isDark
      ? "text-amber-500"
      : "text-amber-700";

  return (
    <div
      className={`relative flex flex-col items-center gap-2 flex-shrink-0 min-w-[100px] lg:flex-1 lg:min-w-[80px] xl:max-w-[125px] p-3 rounded-2xl border border-white/5 ${
        isDark
          ? "bg-black/60 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]"
          : "bg-white shadow-lg"
      } group hover:scale-105 transition-transform duration-300`}
    >
      <div className="text-center w-full px-1 relative z-10">
        <p
          className={`text-[8px] font-black uppercase tracking-widest mb-0.5 truncate ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          {String(label)}
        </p>
        <p
          className={`text-[10px] font-black uppercase drop-shadow-[0_0_8px_rgba(251,146,60,0.4)] leading-tight mb-1 ${
            topLabelColor || (isDark ? "text-orange-400" : "text-orange-600")
          }`}
        >
          {String(topLabel)}
          <br />
          <span className="text-[12px] font-black">
            {String(Number(capValue).toLocaleString())}
          </span>
        </p>
      </div>

      <div className="relative w-8 h-18 md:w-10 md:h-22 lg:w-12 lg:h-28 group z-10">
        <div
          className={`absolute -inset-1.5 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-700 ${
            colorType === "cyan" ? "bg-cyan-500" : "bg-amber-500"
          }`}
        />
        <div
          className={`absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-t border-t-2 border-x-2 ${
            isDark
              ? "bg-stone-800 border-white/20"
              : "bg-stone-300 border-stone-400"
          } z-20`}
        />
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden shadow-2xl ${
            isDark
              ? "bg-black/90 border-white/10"
              : "bg-stone-100 border-stone-300"
          } z-10 backdrop-blur-md`}
        >
          <div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-t transition-all duration-1000 ease-in-out shadow-[0_-8px_30px] ${theme[colorType]}`}
            style={{ height: `${fillPercent}%` }}
          >
            <div className="absolute left-0 w-full h-[4px] bg-white blur-[1px] battery-scan shadow-[0_0_15px_rgba(255,255,255,1)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay" />
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none text-[9px] font-black ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {Math.round(fillPercent)}%
        </div>
      </div>

      <div className="text-center w-full px-1 mt-1 relative z-10">
        <p
          className={`text-[10px] font-black uppercase leading-tight ${labelColor}`}
        >
          {String(bottomLabel)}
          <br />
          <span className="text-[12px] font-black">
            {String(Number(prodValue).toLocaleString())}
          </span>
        </p>
      </div>
    </div>
  );
}

function HolographicPieChart({ data, isDark }) {
  let cumulativePercent = 0;
  const total = data.reduce((acc, val) => acc + val.value, 0);

  function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const slices = data.map((slice, index) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    const slicePercent = slice.value / (total || 1);

    const midPercent = cumulativePercent + slicePercent / 2;
    cumulativePercent += slicePercent;

    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
    const fill = slice.label.toLowerCase().includes("veterano")
      ? "indigo"
      : slice.label.toLowerCase().includes("novato")
      ? "cyan"
      : "stone";
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(" ");

    const gradientId = `grad-${fill}-${index}`;
    const colorStart =
      fill === "indigo" ? "#c084fc" : fill === "cyan" ? "#22d3ee" : "#fcd34d";
    const colorEnd =
      fill === "indigo" ? "#6366f1" : fill === "cyan" ? "#0ea5e9" : "#d97706";

    const [labelX, labelY] = getCoordinatesForPercent(midPercent);

    const isSmallSlice = slicePercent <= 0.1;
    const textRadius = isSmallSlice ? 1.3 : 0.775;
    const textX = labelX * textRadius;
    const textY = labelY * textRadius;

    const fontSize = isSmallSlice
      ? "0.14"
      : slicePercent > 0.15
      ? "0.16"
      : "0.12";

    return (
      <g key={index}>
        <defs>
          <radialGradient
            id={gradientId}
            cx="50%"
            cy="50%"
            r="70%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </radialGradient>
        </defs>
        <path
          d={pathData}
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.02"
          className="hover:scale-105 hover:brightness-125 transition-all duration-300 cursor-pointer"
          style={{ filter: `drop-shadow(0 0px 15px ${colorEnd}aa)` }}
        />
        {isSmallSlice && slicePercent > 0 && (
          <line
            x1={labelX * 0.9}
            y1={labelY * 0.9}
            x2={labelX * 1.15}
            y2={labelY * 1.15}
            stroke={colorEnd}
            strokeWidth="0.02"
            className="opacity-70"
          />
        )}
        {slicePercent > 0 && (
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fill={isSmallSlice ? colorEnd : "white"}
            fontWeight="900"
            className="pointer-events-none"
            transform={`rotate(90, ${textX}, ${textY})`}
          >
            {Math.round(slicePercent * 100)}%
          </text>
        )}
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full p-2 overflow-hidden flex-1 min-h-0">
      <div className="relative w-full h-full max-h-[300px] min-h-[150px] aspect-square flex-shrink-1 flex items-center justify-center mx-auto">
        <svg
          viewBox="-1.5 -1.5 3 3"
          className="transform -rotate-90 w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {slices}
          <circle
            cx="0"
            cy="0"
            r="0.55"
            className={isDark ? "fill-[#1c1917]" : "fill-white"}
          />
        </svg>
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full px-2 flex-shrink-0">
        {data.map((s, i) => {
          const colorClass = s.label.toLowerCase().includes("veterano")
            ? "text-indigo-400"
            : s.label.toLowerCase().includes("novato")
            ? "text-cyan-400"
            : "text-amber-500";
          const bgClass = s.label.toLowerCase().includes("veterano")
            ? "bg-indigo-500"
            : s.label.toLowerCase().includes("novato")
            ? "bg-cyan-500"
            : "bg-amber-500";

          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 ${
                isDark ? "bg-[#09090b]" : "bg-slate-50"
              } shadow-sm`}
            >
              <div
                className={`w-2 h-2 rounded-full ${bgClass} shadow-[0_0_8px_currentColor]`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}
              >
                {String(s.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CyberStackedBarChart({ data, isDark, onExpand, monthName }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.prod + d.desv), 10) * 1.5;
  const textBaseColor = isDark ? "text-white" : "text-slate-900";
  const isPanel = !!onExpand;

  return (
    <div className="w-full h-full flex flex-col relative pt-2 min-h-[250px]">
      <div className="flex justify-between items-center z-50 absolute top-0 w-full pointer-events-none px-2">
        {!isPanel && monthName && (
          <div className="text-xl font-black text-cyan-500 opacity-20 uppercase tracking-widest">
            {monthName}
          </div>
        )}
        {onExpand && (
          <button
            onClick={onExpand}
            className="ml-auto p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto text-cyan-400 shadow-lg"
            title="Ampliar análise"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 w-full h-full mt-6 flex flex-col">
        <div className="flex-1 flex items-end justify-between gap-[2px] px-1 relative border-b border-white/10 w-full h-full">
          {data.map((d, i) => {
            const hProd = (d.prod / maxVal) * 100;
            const hDesv = (d.desv / maxVal) * 100;
            const totalH = hProd + hDesv;
            const hasData = d.prod > 0 || d.desv > 0;

            return (
              <div
                key={`bar-${i}`}
                className={`flex-1 w-full flex flex-col items-center h-full justify-end relative group`}
              >
                {hasData && (
                  <div
                    className="absolute flex flex-col items-center pointer-events-none z-40 transition-transform duration-300 group-hover:-translate-y-2 w-full"
                    style={{ bottom: `${totalH}%`, paddingBottom: "4px" }}
                  >
                    <span
                      className={`text-[7px] md:text-[9px] lg:text-[10px] font-black leading-none mb-0.5 ${
                        isDark ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      {d.perc.toFixed(0)}%
                    </span>
                    <span
                      className={`text-[6px] md:text-[8px] lg:text-[9px] font-black drop-shadow-md leading-none ${
                        isDark ? "text-purple-400" : "text-purple-700"
                      }`}
                    >
                      {String(d.desv)}
                    </span>
                    <span
                      className={`text-[6px] md:text-[8px] lg:text-[9px] font-black drop-shadow-md leading-none ${
                        isDark ? "text-emerald-400" : "text-emerald-700"
                      }`}
                    >
                      {String(d.prod)}
                    </span>
                  </div>
                )}

                <div className="w-full h-full flex flex-col items-center justify-end relative cursor-pointer hover:brightness-125 transition-all">
                  <div
                    className={`w-full bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 rounded-t-sm shadow-[0_0_20px_rgba(168,85,247,0.8)] border-t border-x border-purple-300/50 transition-all duration-700`}
                    style={{ height: `${hDesv}%` }}
                  />
                  <div
                    className={`w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.8)] border-t border-x border-emerald-200/50 transition-all duration-700`}
                    style={{ height: `${hProd}%` }}
                  />
                </div>
              </div>
            );
          })}

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
            preserveAspectRatio="none"
          >
            <polyline
              points={data
                .map((d, i) => {
                  const totalBars = data.length;
                  const x = ((i + 0.5) / totalBars) * 100;
                  const hStack = ((d.prod + d.desv) / maxVal) * 100;
                  return `${x}% ${100 - hStack}%`;
                })
                .join(",")}
              fill="none"
              stroke="#00f2ff"
              strokeWidth={isPanel ? 1.5 : 2}
              className="drop-shadow-[0_0_8px_#00f2ff] opacity-40"
            />
          </svg>
        </div>

        <div className="flex items-start justify-between gap-[2px] px-1 pt-1 h-4 w-full flex-shrink-0">
          {data.map((d, i) => (
            <div key={`lbl-day-${i}`} className={`flex-1 flex justify-center`}>
              <span
                className={`text-[7px] md:text-[9px] lg:text-[10px] font-black opacity-80 ${textBaseColor} truncate text-center`}
              >
                {String(d.dateLabel).split("/")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-x-6 md:gap-x-10 border-t border-white/5 pt-2 mt-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded shadow-sm" />
          <span
            className={`text-[9px] font-black opacity-80 uppercase ${textBaseColor}`}
          >
            PRODUÇÃO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded shadow-sm" />
          <span
            className={`text-[9px] font-black opacity-80 uppercase ${textBaseColor}`}
          >
            DESVIO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded shadow-sm bg-amber-500`} />
          <span
            className={`text-[9px] font-black opacity-80 uppercase ${
              isDark ? "text-amber-400" : textBaseColor
            }`}
          >
            % DESVIO
          </span>
        </div>
      </div>
    </div>
  );
}

function CurvaChart({ data, isDark, onHover }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  if (!data || data.length === 0)
    return (
      <div className="flex w-full h-full items-center justify-center text-cyan-500/50 font-black animate-pulse tracking-[0.5em]">
        NENHUM DADO DISPONÍVEL
      </div>
    );

  const maxProd = Math.max(...data.map((d) => d.produtividade), 10);
  // Garante que o pico visual suporte o pico da meta de 28.
  const maxVal = Math.max(maxProd, 28) * 1.25;

  const minWidth = data.length * 55; // Aumentado para melhor visualização das datas completas

  const textCol = isDark ? "text-stone-400" : "text-stone-600";

  // Aqui é calculada a linha exata considerando 25 para (Jan, Dez) e 28 para (Fev-Nov)
  // Sem o símbolo de '%' para renderizar o viewbox SVG corretamente
  const metaPoints = data
    .map((d, i) => {
      const x1 = (i / data.length) * 100;
      const x2 = ((i + 1) / data.length) * 100;
      const mVal = d.meta; // Agora será obrigatoriamente 25 ou 28
      const y = 100 - (mVal / maxVal) * 100;
      return `${x1},${y} ${x2},${y}`;
    })
    .join(" ");

  const monthChanges = [];
  if (data.length > 0) {
    const firstMonth = String(data[0].dia)
      .split("/")[1]
      ?.replace(".", "")
      .toUpperCase();
    if (firstMonth) {
      monthChanges.push({ index: 0, label: firstMonth, meta: data[0].meta });
    }
  }

  for (let i = 1; i < data.length; i++) {
    const prevMonth = String(data[i - 1].dia)
      .split("/")[1]
      ?.replace(".", "")
      .toUpperCase();
    const curMonth = String(data[i].dia)
      .split("/")[1]
      ?.replace(".", "")
      .toUpperCase();
    if (prevMonth && curMonth && prevMonth !== curMonth) {
      monthChanges.push({ index: i, label: curMonth, meta: data[i].meta });
    }
  }

  // Agrupamento de Semanas (1 a 7, 8 a 14, etc.)
  const weeks = [];
  let currentWeek = null;

  data.forEach((d, i) => {
    const dayMatch = String(d.dia).match(/^(\d+)/);
    const dayNum = dayMatch ? parseInt(dayMatch[1]) : 1;
    const weekNum = Math.ceil(dayNum / 7);

    const monthStr = String(d.dia).split("/")[1] || "";
    const weekKey = `${monthStr}-W${weekNum}`;

    if (!currentWeek || currentWeek.key !== weekKey) {
      if (currentWeek) {
        currentWeek.endIdx = i - 1;
        weeks.push(currentWeek);
      }
      currentWeek = {
        key: weekKey,
        label: `SEM ${weekNum}`,
        startIdx: i,
        endIdx: i,
      };
    } else {
      currentWeek.endIdx = i;
    }
  });
  if (currentWeek) {
    weeks.push(currentWeek);
  }

  return (
    <div
      className={`scroll-glow-wrapper w-full h-full relative ${
        isScrolling ? "scrolling-active" : ""
      }`}
    >
      <div
        onScroll={handleScroll}
        className="always-visible-scroll w-full h-full overflow-x-auto overflow-y-hidden relative pb-2"
      >
        <div
          style={{ minWidth: `${Math.max(minWidth, 800)}px` }}
          className="h-full flex flex-col pt-16 px-4 relative mt-2"
        >
          {monthChanges.map((mc) => (
            <div
              key={mc.index}
              className="absolute top-0 bottom-24 border-l-2 border-dashed border-white/10 z-0 pointer-events-none"
              style={{
                left: `calc(${(mc.index / data.length) * 100}% + 16px)`,
              }}
            >
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <div className="bg-white/5 text-white/50 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/5">
                  MÊS: {mc.label}
                </div>
                <div className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                  META: {mc.meta}
                </div>
              </div>
            </div>
          ))}

          <div className="flex-1 w-full h-full flex items-end justify-between gap-2 relative z-10 border-b border-white/20">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline
                points={metaPoints}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_10px_rgba(239,68,68,1)] opacity-90"
              />
            </svg>
            {data.map((d, i) => {
              const hProd = (d.produtividade / maxVal) * 100;
              const isZero = d.produtividade === 0;
              const actualMeta = d.meta; // Utilizando a meta corrigida que é 25 ou 28
              const isSuccess = d.produtividade >= actualMeta;

              const barColor = isSuccess
                ? "from-emerald-600 via-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.8)] border-emerald-300/50"
                : "from-red-600 via-red-500 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] border-red-300/50";

              const textColor = isSuccess
                ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                : "text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]";

              return (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col items-center justify-end group relative cursor-pointer"
                  onMouseEnter={() =>
                    onHover && onHover({ ...d, meta: actualMeta, isSuccess })
                  }
                  onMouseLeave={() => onHover && onHover(null)}
                >
                  {!isZero && (
                    <div
                      className="absolute flex flex-col items-center justify-end z-30 pointer-events-none mb-1 transition-transform group-hover:-translate-y-2"
                      style={{ bottom: `${hProd}%` }}
                    >
                      <span
                        className={`text-[11px] font-black leading-none mb-0.5 ${textColor}`}
                      >
                        {d.produtividade}
                      </span>
                      <span className="text-[10px] font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] bg-black/70 px-1.5 py-0.5 rounded-sm border border-yellow-400/30">
                        {d.percentual.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  <div className="w-full flex justify-center items-end h-full">
                    <div
                      className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 border-t-2 border-x bg-gradient-to-t ${barColor} relative overflow-hidden group-hover:brightness-125`}
                      style={{ height: `${hProd}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent to-white/20 opacity-50" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start justify-between gap-2 w-full mt-4 h-16 flex-shrink-0 relative">
            {data.map((d, i) => (
              <div
                key={`lbl-${i}`}
                className="flex-1 flex justify-center items-start h-full"
              >
                <span
                  className={`text-[11px] font-mono font-bold tracking-[0.1em] uppercase transition-colors ${textCol} group-hover:text-white drop-shadow-md`}
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {d.dia}
                </span>
              </div>
            ))}
          </div>

          <div className="relative w-full h-10 mt-1 mb-2 flex-shrink-0">
            {weeks.map((w, i) => {
              const left = (w.startIdx / data.length) * 100;
              const width = ((w.endIdx - w.startIdx + 1) / data.length) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center pointer-events-none"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <div className="w-[85%] h-2 border-b-2 border-x-2 border-red-500/40 rounded-b-sm" />
                  <span className="text-[10px] font-black text-red-500/80 mt-1 uppercase tracking-widest">
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurvaView({ isDark, refreshTrigger, setIsSyncing, onSyncComplete }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColab, setSelectedColab] = useState("");
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (refreshTrigger === 0) setLoading(true);
      setIsSyncing(true);
      try {
        const res = await fetch(
          `https://docs.google.com/spreadsheets/d/e/2PACX-1vTatTuqFqNuOw3mKCK1Ri-Tb1MINvSxb0BR0WHuHBSoYFSZens2SU3zYHpPmQOtKnfGoMLOuz9LZ3ah/pub?gid=1080365479&single=true&output=csv&t=${Date.now()}`
        );
        const text = await res.text();
        const parsed = parseCSV_Curva(text);
        setData(parsed);

        if (parsed.length > 0) {
          const uniqueColabs = [
            ...new Set(parsed.map((d) => d.colaborador)),
          ].filter(Boolean);
          if (uniqueColabs.length > 0 && !selectedColab) {
            setSelectedColab(uniqueColabs[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
        onSyncComplete();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, setIsSyncing]);

  const colabs = useMemo(() => {
    return [...new Set(data.map((d) => d.colaborador))].filter(Boolean).sort();
  }, [data]);

  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.colaborador === selectedColab);
    if (filtered.length === 0) return [];

    // Parseia a data para um formato calculável (DD/MMM)
    const parseDate = (dStr) => {
      const parts = String(dStr).split("/");
      const day = parseInt(parts[0]) || 1;
      const mStr = parts[1] ? parts[1].replace(".", "").trim() : "";
      let mNum = getMonthNumber(mStr);
      if (mNum === -1) mNum = parseInt(mStr) || 1;
      return { day, month: mNum, original: dStr };
    };

    const mapped = filtered.map((d) => {
      const p = parseDate(d.dia);
      let m = p.month;
      // Forçamos a meta real considerando 25 (Jan/Dez) e 28 (Fev-Nov)
      let calcMeta = m === 1 || m === 12 ? 25 : 28;
      return { ...d, meta: calcMeta, _sortVal: m * 100 + p.day, _parsed: p };
    });

    mapped.sort((a, b) => a._sortVal - b._sortVal);

    // Algoritmo para preencher dias faltantes (buracos)
    const result = [];
    if (mapped.length > 0) {
      let currentVal = mapped[0]._sortVal;
      let dIndex = 0;
      const mNames = [
        "JAN",
        "FEV",
        "MAR",
        "ABR",
        "MAI",
        "JUN",
        "JUL",
        "AGO",
        "SET",
        "OUT",
        "NOV",
        "DEZ",
      ];
      const daysInMonths = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      while (dIndex < mapped.length) {
        const currentData = mapped[dIndex];

        if (currentData._sortVal === currentVal) {
          result.push(currentData);
          // Avança duplicatas no mesmo dia, se existirem
          while (
            dIndex < mapped.length &&
            mapped[dIndex]._sortVal === currentVal
          ) {
            dIndex++;
          }
        } else if (currentData._sortVal > currentVal) {
          // Preenche o dia que foi pulado e zera os dados
          let m = Math.floor(currentVal / 100);
          let day = currentVal % 100;
          let realM = m > 12 ? m - 12 : m;
          let monthStr = mNames[realM - 1] || realM;
          let calcMeta = realM === 1 || realM === 12 ? 25 : 28;
          result.push({
            colaborador: selectedColab,
            dia: `${day}/${monthStr}.`,
            produtividade: 0,
            meta: calcMeta, // Utiliza a meta real calculada
            percentual: 0,
            _sortVal: currentVal,
          });
        }

        // Incrementa currentVal matematicamente de forma segura
        let m = Math.floor(currentVal / 100);
        let day = currentVal % 100;
        let realM = m > 12 ? m - 12 : m;
        let maxDays = daysInMonths[realM] || 31;

        if (day < maxDays) {
          currentVal++;
        } else {
          currentVal = (m + 1) * 100 + 1;
        }
      }
    }
    return result;
  }, [data, selectedColab]);

  const curvaMetrics = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    let totalProd = 0;
    let bestDay = { dia: "-", prod: -1 };

    const monthMap = {};
    const weekMap = {};

    chartData.forEach((d, i) => {
      totalProd += d.produtividade;
      if (d.produtividade > bestDay.prod)
        bestDay = { dia: d.dia, prod: d.produtividade };

      const parts = String(d.dia).split("/");
      const month =
        parts.length > 1 ? parts[1].replace(".", "").toUpperCase() : "GERAL";
      if (!monthMap[month]) monthMap[month] = 0;
      monthMap[month] += d.produtividade;

      const weekNum = Math.floor(i / 7) + 1;
      const weekLabel = `Sem.${weekNum} ${month}`;
      if (!weekMap[weekLabel]) weekMap[weekLabel] = 0;
      weekMap[weekLabel] += d.produtividade;
    });

    let bestMonth = { label: "-", prod: -1 };
    for (const [m, p] of Object.entries(monthMap)) {
      if (p > bestMonth.prod) bestMonth = { label: m, prod: p };
    }

    let bestWeek = { label: "-", prod: -1 };
    for (const [w, p] of Object.entries(weekMap)) {
      if (p > bestWeek.prod) bestWeek = { label: w, prod: p };
    }

    return { totalProd, bestDay, bestMonth, bestWeek };
  }, [chartData]);

  if (loading && refreshTrigger === 0)
    return (
      <div className="p-20 text-center text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">
        Carregando Curva de Produção...
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full max-w-[1920px] mx-auto px-4 lg:px-6 overflow-hidden pb-4">
      <div className="flex flex-wrap items-end justify-center lg:justify-end gap-2 flex-shrink-0 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner w-full lg:w-fit self-end text-white pt-2 mt-2">
        <FilterWrapper label="Colaborador" isDark={isDark}>
          <select
            value={selectedColab}
            onChange={(e) => setSelectedColab(e.target.value)}
            className={`px-4 py-2 rounded-xl border-2 outline-none text-[10px] font-black uppercase shadow-lg cursor-pointer ${
              isDark
                ? "bg-[#1c1917] text-stone-200 border-cyan-500/30"
                : "bg-white text-slate-800 border-cyan-500/30"
            }`}
          >
            {colabs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FilterWrapper>
      </div>

      {curvaMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0 mt-3 text-white">
          <KPICard
            isDark={isDark}
            title="TOTAL PRODUZIDO"
            value={curvaMetrics.totalProd}
            icon={TrendingUp}
            accentColor="cyan"
            isSmall
          />
          <KPICard
            isDark={isDark}
            title="MELHOR MÊS"
            value={curvaMetrics.bestMonth.prod}
            subtext={`No mês de ${curvaMetrics.bestMonth.label}`}
            icon={Trophy}
            accentColor="gold"
            isSmall
          />
          <KPICard
            isDark={isDark}
            title="MELHOR SEMANA"
            value={curvaMetrics.bestWeek.prod}
            subtext={curvaMetrics.bestWeek.label}
            icon={Activity}
            accentColor="purple"
            isSmall
          />
          <KPICard
            isDark={isDark}
            title="MELHOR DIA"
            value={curvaMetrics.bestDay.prod}
            subtext={`Data: ${curvaMetrics.bestDay.dia}`}
            icon={Zap}
            accentColor="emerald"
            isSmall
          />
        </div>
      )}

      <GlassCard
        className="flex-1 mt-3 p-4 md:p-8 flex flex-col overflow-hidden relative"
        isDark={isDark}
        accentColor="cyan"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0 min-h-[4rem]">
          <h2
            className={`text-xl md:text-3xl font-black tracking-tighter uppercase max-w-[50%] truncate transition-all duration-300 ${
              isDark
                ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                : "text-blue-600 drop-shadow-md"
            }`}
          >
            {selectedColab || "SELECIONE UM COLABORADOR"}
          </h2>

          {hoveredData ? (
            <div
              className={`flex items-center gap-4 md:gap-8 bg-black/60 p-3 rounded-2xl border ${
                hoveredData.isSuccess
                  ? "border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  : "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              } animate-in fade-in transition-all backdrop-blur-xl`}
            >
              <div className="flex flex-col text-center">
                <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">
                  DATA
                </span>
                <span className="text-sm md:text-lg font-mono font-black text-white">
                  {String(hoveredData.dia)}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col text-center">
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${
                    hoveredData.isSuccess ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  PRODUÇÃO
                </span>
                <span
                  className={`text-sm md:text-xl font-black ${
                    hoveredData.isSuccess ? "text-emerald-400" : "text-red-400"
                  } drop-shadow-md`}
                >
                  {String(hoveredData.produtividade)}
                </span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">
                  META
                </span>
                <span className="text-sm md:text-xl font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                  {String(hoveredData.meta)}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col text-center">
                <span className="text-[9px] text-yellow-400 font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                  PERCENTUAL
                </span>
                <span className="text-sm md:text-xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                  {String(
                    hoveredData.percentual % 1 !== 0
                      ? hoveredData.percentual.toFixed(1)
                      : hoveredData.percentual
                  )}
                  %
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 md:gap-6 animate-in fade-in">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span
                  className={`text-[10px] font-black uppercase ${
                    isDark ? "text-stone-300" : "text-slate-600"
                  }`}
                >
                  Atingiu Meta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-red-600 to-red-400 rounded shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span
                  className={`text-[10px] font-black uppercase ${
                    isDark ? "text-stone-300" : "text-slate-600"
                  }`}
                >
                  Abaixo da Meta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 border-t-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span
                  className={`text-[10px] font-black uppercase ${
                    isDark ? "text-stone-300" : "text-slate-600"
                  }`}
                >
                  Linha de Meta
                </span>
              </div>
            </div>
          )}
        </div>
        <div
          className={`flex-1 w-full min-h-0 rounded-2xl overflow-hidden border ${
            isDark
              ? "bg-black/40 border-white/5"
              : "bg-stone-50 border-stone-200"
          }`}
        >
          <CurvaChart
            data={chartData}
            isDark={isDark}
            onHover={setHoveredData}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function DailyView({
  isDark,
  refreshTrigger,
  setIsSyncing,
  onSyncComplete,
  onExpandChart,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColabs, setSelectedColabs] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showManagement, setShowManagement] = useState(false);

  const prevDataRef = useRef([]);
  const latestAvailableRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (refreshTrigger === 0) setLoading(true);
      setIsSyncing(true);
      try {
        const res = await fetch(
          `https://docs.google.com/spreadsheets/d/e/2PACX-1vTatTuqFqNuOw3mKCK1Ri-Tb1MINvSxb0BR0WHuHBSoYFSZens2SU3zYHpPmQOtKnfGoMLOuz9LZ3ah/pub?gid=0&single=true&output=csv&t=${Date.now()}`
        );
        const text = await res.text();
        const parsed = parseCSV_Daily(text);

        const oldData = prevDataRef.current;
        const oldDataMap = new Map();
        for (const r of oldData) {
          oldDataMap.set(`${r.nome}-${r.dia}-${r.mes}-${r.ano}`, r);
        }

        const isValid = () => {
          if (parsed.length === 0) return false;
          if (oldData.length > 0) {
            if (parsed.length < oldData.length * 0.5) return false;

            const getProd = (r) =>
              (r.producao !== undefined ? r.producao : r.qtd) || 0;
            const getDesv = (r) =>
              (r.envio !== undefined ? r.envio : r.desvio) || 0;

            const oldProd = oldData.reduce((acc, r) => acc + getProd(r), 0);
            const newProd = parsed.reduce((acc, r) => acc + getProd(r), 0);
            if (oldProd > 0 && newProd < oldProd * 0.1) return false;

            const oldDesv = oldData.reduce((acc, r) => acc + getDesv(r), 0);
            const newDesv = parsed.reduce((acc, r) => acc + getDesv(r), 0);
            if (oldDesv > 0 && newDesv < oldDesv * 0.1) return false;
          }
          return true;
        };

        if (!isValid()) {
          console.warn(
            "Google Sheets recalculando dados ou vazios. Congelando painel com valores anteriores."
          );
          setIsSyncing(false);
          onSyncComplete();
          return;
        }

        const mergedParsed = parsed.map((newRow) => {
          const oldRow = oldDataMap.get(
            `${newRow.nome}-${newRow.dia}-${newRow.mes}-${newRow.ano}`
          );
          if (oldRow) {
            if ((newRow.envio === 0 || isNaN(newRow.envio)) && oldRow.envio > 0)
              newRow.envio = oldRow.envio;
            if (
              (newRow.producao === 0 || isNaN(newRow.producao)) &&
              oldRow.producao > 0
            )
              newRow.producao = oldRow.producao;
          }
          return newRow;
        });

        prevDataRef.current = mergedParsed;
        setData(mergedParsed);

        if (mergedParsed.length > 0) {
          const sorted = [...mergedParsed].sort((a, b) => {
            const anoA = parseInt(a.ano) || 0;
            const anoB = parseInt(b.ano) || 0;
            if (anoB !== anoA) return anoB - anoA;
            const mesDiff = getMonthNumber(b.mes) - getMonthNumber(a.mes);
            if (mesDiff !== 0) return mesDiff;
            return (parseInt(b.dia) || 0) - (parseInt(a.dia) || 0);
          });
          const latestKey = `${sorted[0].ano}-${sorted[0].mes}-${sorted[0].dia}`;
          if (
            latestAvailableRef.current !== latestKey ||
            selectedMonths.length === 0
          ) {
            latestAvailableRef.current = latestKey;
            if (sorted[0].ano) setSelectedYears([sorted[0].ano.toString()]);
            if (sorted[0].mes) setSelectedMonths([sorted[0].mes]);
            if (sorted[0].dia) setSelectedDays([sorted[0].dia.toString()]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
        onSyncComplete();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, setIsSyncing]);

  const availableOptions = useMemo(() => {
    if (!data.length) return { years: [], months: [], days: [], colabs: [] };
    const getFiltered = (field) =>
      data.filter((d) => {
        const yMatch =
          field === "year" ||
          selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString());
        const mMatch =
          field === "month" ||
          selectedMonths.length === 0 ||
          selectedMonths.includes(d.mes);
        const dMatch =
          field === "day" ||
          selectedDays.length === 0 ||
          selectedDays.includes(d.dia.toString());
        const cMatch =
          field === "colab" ||
          selectedColabs.length === 0 ||
          selectedColabs.includes(d.nome);
        return yMatch && mMatch && dMatch && cMatch;
      });
    return {
      years: [
        ...new Set(getFiltered("year").map((d) => d.ano.toString())),
      ].sort((a, b) => parseInt(a) - parseInt(b)),
      months: [...new Set(getFiltered("month").map((d) => d.mes))].sort(
        (a, b) => getMonthNumber(a) - getMonthNumber(b)
      ),
      days: [...new Set(getFiltered("day").map((d) => d.dia.toString()))].sort(
        (a, b) => parseInt(a) - parseInt(b)
      ),
      colabs: [...new Set(getFiltered("colab").map((d) => d.nome))].sort(),
    };
  }, [data, selectedYears, selectedMonths, selectedDays, selectedColabs]);

  const groupedData = useMemo(() => {
    if (!data.length) return null;
    const filtered = data.filter(
      (d) =>
        (selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString())) &&
        (selectedMonths.length === 0 || selectedMonths.includes(d.mes)) &&
        (selectedDays.length === 0 || selectedDays.includes(d.dia.toString()))
    );
    const currentMeta =
      selectedMonths.length > 0 ? getTargetByMonth(selectedMonths[0]) : 28;
    const grouped = {};
    const globalH = {};
    tableHoursGlobal.forEach((h) => (globalH[h] = 0));
    filtered.forEach((row) => {
      if (!grouped[row.nome]) {
        grouped[row.nome] = { ...row, hourly: {}, totalProd: 0, totalEnvio: 0 };
        tableHoursGlobal.forEach((h) => (grouped[row.nome].hourly[h] = 0));
      }
      grouped[row.nome].totalEnvio += row.envio || 0;
      if (tableHoursGlobal.includes(row.hora)) {
        grouped[row.nome].hourly[row.hora] += row.producao;
        grouped[row.nome].totalProd += row.producao;
        globalH[row.hora] += row.producao;
      }
    });

    const rows = Object.values(grouped)
      .map((u) => {
        let active = 0;
        tableHoursGlobal.forEach((h) => {
          if (u.hourly[h] > 0) active += h === 12 ? 0 : 1;
        });
        const divisor = active || 1;
        const target = currentMeta * active;
        const falta = Math.round(Math.max(0, target - u.totalProd));
        const percFalta = target > 0 ? (falta / target) * 100 : 0;
        return {
          ...u,
          target,
          active,
          falta,
          percFalta,
          mediaNormal: u.totalProd / divisor,
          mediaDesvio: (u.totalProd + u.totalEnvio) / divisor,
          percDesvio: u.totalProd > 0 ? (u.totalEnvio / u.totalProd) * 100 : 0,
        };
      })
      .sort((a, b) => b.mediaNormal - a.mediaNormal);

    return {
      rows,
      globalH,
      currentMeta,
    };
  }, [data, selectedYears, selectedMonths, selectedDays]);

  const processedData = useMemo(() => {
    if (!groupedData) return null;
    const finalRows = groupedData.rows.filter(
      (r) => selectedColabs.length === 0 || selectedColabs.includes(r.nome)
    );
    const totalP = finalRows.reduce((a, b) => a + b.totalProd, 0);
    const totalE = finalRows.reduce((a, b) => a + b.totalEnvio, 0);
    const totalF = finalRows.reduce((a, b) => a + b.falta, 0);
    const totalTarget = finalRows.reduce((a, b) => a + b.target, 0);

    const bestH = tableHoursGlobal
      .map((h) => ({ hour: h, value: groupedData.globalH[h] }))
      .reduce((m, cur) => (cur.value > m.value ? cur : m), {
        hour: 0,
        value: 0,
      });

    return {
      rows: finalRows,
      totalProd: totalP,
      totalEnvio: totalE,
      currentMeta: groupedData.currentMeta,
      totalFaltas: totalF,
      percFalta: totalTarget > 0 ? (totalF / totalTarget) * 100 : 0,
      percDesvio: totalP > 0 ? (totalE / totalP) * 100 : 0,
      totalOperators: finalRows.length,
      chartData: tableHoursGlobal.map((h) => ({
        hour: h,
        value: groupedData.globalH[h],
      })),
      bestHour: bestH,
      top3: [...finalRows]
        .sort((a, b) => b.totalProd - a.totalProd)
        .slice(0, 3),
      bottom7: [...finalRows]
        .filter((r) => r.totalProd > 0)
        .sort((a, b) => a.totalProd - b.totalProd)
        .slice(0, 7),
    };
  }, [groupedData, selectedColabs]);

  if (loading && refreshTrigger === 0)
    return (
      <div className="p-20 text-center text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">
        Sincronizando Sistema Diário...
      </div>
    );

  const toggleFilter = (list, item, setter) =>
    setter((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const headerBg = isDark ? "bg-[#27272a]" : "bg-stone-200";

  return (
    <div className="flex flex-col h-full w-full max-w-[1920px] mx-auto px-4 lg:px-6 overflow-y-auto overflow-x-hidden pb-4">
      <div className="flex flex-wrap items-end justify-center lg:justify-end gap-2 flex-shrink-0 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner w-full lg:w-fit self-end text-white pt-2 mt-2">
        <FilterWrapper label="Ano" isDark={isDark}>
          <MultiSelectNeon
            options={availableOptions.years}
            selected={selectedYears}
            onToggle={(o) => toggleFilter(selectedYears, o, setSelectedYears)}
            placeholder="Ano"
            isDark={isDark}
            accentColor="cyan"
          />
        </FilterWrapper>
        <FilterWrapper label="Mês" isDark={isDark}>
          <MultiSelectNeon
            options={availableOptions.months}
            selected={selectedMonths}
            onToggle={(o) => toggleFilter(selectedMonths, o, setSelectedMonths)}
            placeholder="Mês"
            isDark={isDark}
            accentColor="cyan"
          />
        </FilterWrapper>
        <FilterWrapper label="Dia" isDark={isDark}>
          <MultiSelectNeon
            options={availableOptions.days}
            selected={selectedDays}
            onToggle={(o) => toggleFilter(selectedDays, o, setSelectedDays)}
            placeholder="Dia"
            isDark={isDark}
            accentColor="cyan"
          />
        </FilterWrapper>
        <FilterWrapper label="Colaborador" isDark={isDark}>
          <MultiSelectNeon
            options={availableOptions.colabs}
            selected={selectedColabs}
            onToggle={(o) => toggleFilter(selectedColabs, o, setSelectedColabs)}
            placeholder="Colaborador"
            isDark={isDark}
            accentColor="cyan"
          />
        </FilterWrapper>
        {selectedColabs.length > 0 && (
          <button
            onClick={() => setSelectedColabs([])}
            className="flex items-center mb-1 gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/20 transition-all"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {processedData && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 flex-shrink-0 text-white mt-3">
            <KPICard
              isDark={isDark}
              title="PRODUÇÃO"
              value={processedData.totalProd}
              icon={TrendingUp}
              accentColor="emerald"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="TOTAL FALTA"
              value={processedData.totalFaltas}
              icon={AlertTriangle}
              accentColor="red"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="% FALTA"
              value={`${processedData.percFalta.toFixed(1)}%`}
              icon={ArrowDown}
              accentColor="red"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="TOTAL DESVIO"
              value={processedData.totalEnvio}
              icon={AlertTriangle}
              accentColor="amber"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="% DESVIO"
              value={`${processedData.percDesvio.toFixed(1)}%`}
              icon={TrendingUp}
              accentColor="amber"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="OPERADORES"
              value={processedData.totalOperators}
              icon={Users}
              accentColor="purple"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="META HORA"
              value={`${processedData.currentMeta} un.`}
              icon={Target}
              accentColor="cyan"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="MELHOR HORA"
              value={`${processedData.bestHour.value}`}
              subtext={`Pico: ${processedData.bestHour.hour}h`}
              icon={Clock}
              accentColor="fuchsia"
              isSmall
            />
          </div>

          <div className="flex justify-end flex-shrink-0 mt-3">
            <button
              onClick={() => setShowManagement(!showManagement)}
              className={`group flex items-center justify-center gap-3 px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden border ${
                showManagement
                  ? "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                  : "bg-white/5 text-stone-400 border-white/10 hover:border-fuchsia-500/50 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {showManagement ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="relative">
                {showManagement ? "FECHAR PAINEL" : "PAINEL DE GESTÃO"}
              </span>
            </button>
          </div>

          {showManagement && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0 mt-3 lg:h-[320px]">
              <GlassCard
                className="p-4 flex flex-col items-center h-[250px] lg:h-full overflow-hidden"
                isDark={isDark}
                accentColor="gold"
              >
                <FuturisticPodium
                  winners={processedData.top3}
                  isDark={isDark}
                />
              </GlassCard>
              <GlassCard
                className="p-4 flex flex-col h-[250px] lg:h-full overflow-hidden"
                isDark={isDark}
                accentColor="cyan"
              >
                <h4
                  className={`text-[11px] font-black uppercase mb-6 border px-3 py-1 rounded-lg inline-flex items-center gap-2 w-fit ${
                    isDark
                      ? "text-cyan-400 border-cyan-500/20"
                      : "text-blue-600 border-blue-200"
                  }`}
                >
                  FLUXO OPERATIVO
                </h4>
                <div className="flex-1 flex items-end">
                  <ProductionChart
                    data={processedData.chartData}
                    isDark={isDark}
                  />
                </div>
              </GlassCard>
              <GlassCard
                className="p-4 flex flex-col h-[250px] lg:h-full overflow-hidden"
                isDark={isDark}
                accentColor="red"
              >
                <h4
                  className={`text-[11px] font-black uppercase mb-4 border px-3 py-1 rounded-lg w-fit ${
                    isDark
                      ? "text-red-400 border-red-500/20"
                      : "text-red-600 border-red-200"
                  }`}
                >
                  ZONAS CRÍTICAS
                </h4>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800 pr-1">
                  <AttentionList list={processedData.bottom7} isDark={isDark} />
                </div>
              </GlassCard>
            </div>
          )}

          <GlassCard
            className="flex-1 min-h-[400px] lg:min-h-0 border-none shadow-2xl flex flex-col group/table mt-3 overflow-hidden"
            isDark={isDark}
            accentColor="blue"
          >
            <div
              className={`flex-1 overflow-auto scrollbar-thin scrollbar-thumb-transparent group-hover/table:scrollbar-thumb-stone-600 transition-all duration-300 rounded-3xl ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              <table className="w-full text-[13px] text-left whitespace-nowrap border-separate border-spacing-0 min-w-max">
                <thead
                  className={`sticky top-0 z-30 shadow-xl ${
                    isDark
                      ? "text-white bg-[#1c1917]"
                      : "text-slate-800 bg-stone-100"
                  }`}
                >
                  <tr className="text-[11px] font-black uppercase text-center">
                    <th
                      colSpan={7}
                      className={`py-2.5 px-4 text-cyan-400 tracking-[0.5em] rounded-tl-2xl border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      DADOS GERAIS
                    </th>
                    <th
                      colSpan={2}
                      className={`text-fuchsia-400 border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      AM
                    </th>
                    <th
                      colSpan={10}
                      className={`text-blue-400 border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      TURNO PRINCIPAL
                    </th>
                    <th
                      colSpan={2}
                      className={`text-fuchsia-400 border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      PM
                    </th>
                    <th
                      colSpan={2}
                      className={`text-emerald-400 rounded-tr-2xl border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      ANÁLISE
                    </th>
                  </tr>
                  <tr
                    className={`text-[12px] font-black uppercase text-left border-b ${
                      isDark ? "border-white/10" : "border-stone-200"
                    } ${headerBg}`}
                  >
                    <th
                      className={`p-4 sticky left-0 z-30 text-purple-400 min-w-[140px] max-w-[250px] truncate border-neon-b ${headerBg}`}
                    >
                      COLABORADOR
                    </th>
                    <th className="px-3 text-center text-stone-400 border-neon-b">
                      STATUS
                    </th>
                    <th className="px-3 text-center text-emerald-400 font-black border-neon-b">
                      PRODUÇÃO
                    </th>
                    <th className="px-3 text-center text-red-500 font-black border-neon-b">
                      FALTA
                    </th>
                    <th className="px-3 text-center text-red-500 font-black border-neon-b">
                      % FALTA
                    </th>
                    <th className="px-3 text-center text-amber-500 font-black border-neon-b">
                      DESVIO
                    </th>
                    <th
                      className={`px-3 text-center font-black border-neon-b ${
                        isDark ? "text-amber-500" : "text-amber-700"
                      } ${headerBg}`}
                    >
                      % DESVIO
                    </th>

                    {tableHoursGlobal.map((h) => {
                      let textCol = "text-blue-400";
                      if (h === 6 || h === 7 || h === 18 || h === 19)
                        textCol = "text-fuchsia-400";
                      return (
                        <th
                          key={h}
                          className={`px-1 text-center w-10 ${textCol} border-neon-b ${headerBg}`}
                        >
                          {String(h)}H
                        </th>
                      );
                    })}

                    <th className="px-4 text-right text-emerald-400 font-black border-neon-b">
                      MÉDIA
                    </th>
                    <th className="px-4 text-right pr-8 text-amber-500 font-black border-neon-b rounded-tr-2xl">
                      M. DESVIO
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {processedData.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-white/5 transition-all group"
                    >
                      <td
                        className={`p-4 font-black text-xs sticky left-0 z-10 ${
                          isDark
                            ? "bg-[#1c1917] group-hover:bg-[#2a2a2a] text-purple-400 border-white/5"
                            : "bg-white group-hover:bg-slate-50 text-purple-700 border-slate-200"
                        } border-b transition-colors truncate min-w-[140px] max-w-[250px]`}
                      >
                        {String(row.nome)}
                      </td>
                      <td
                        className={`px-3 text-center border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        <StatusBadge
                          label={String(row.status)}
                          isDark={isDark}
                        />
                      </td>
                      <td
                        className={`px-3 text-center font-black border-b ${
                          isDark
                            ? "text-emerald-400 border-white/5"
                            : "text-emerald-700 border-slate-200"
                        }`}
                      >
                        {String(row.totalProd)}
                      </td>
                      <td
                        className={`px-3 text-center text-red-500 font-black border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        {String(row.falta || "0")}
                      </td>
                      <td
                        className={`px-3 text-center text-red-500 font-black text-sm border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        {String(
                          row.percFalta ? Math.round(row.percFalta) + "%" : "0%"
                        )}
                      </td>
                      <td
                        className={`px-3 text-center font-black text-amber-500 border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        {String(row.totalEnvio || "0")}
                      </td>
                      <td
                        className={`px-3 text-center text-amber-500 font-black opacity-80 border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        {String(
                          row.percDesvio
                            ? Math.round(row.percDesvio) + "%"
                            : "0%"
                        )}
                      </td>
                      {tableHoursGlobal.map((h) => {
                        const v = row.hourly[h];
                        let bg =
                          v > 0
                            ? v >= processedData.currentMeta
                              ? "bg-emerald-500"
                              : v < processedData.currentMeta - 3
                              ? "bg-red-500"
                              : "bg-orange-500"
                            : "";
                        return (
                          <td
                            key={h}
                            className={`px-0.5 py-1.5 text-center border-b ${
                              isDark ? "border-white/5" : "border-slate-200"
                            }`}
                          >
                            <div
                              className={`w-8 h-6 mx-auto flex items-center justify-center rounded text-white text-[9px] font-black ${bg} ${
                                v > 0 ? "" : "opacity-10"
                              }`}
                            >
                              {String(v || "-")}
                            </div>
                          </td>
                        );
                      })}
                      <td
                        className={`px-4 text-right font-black border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-end items-center gap-2 text-white">
                          <TargetArrow3D
                            value={row.mediaNormal}
                            target={processedData.currentMeta}
                          />
                          <span
                            className={`text-sm font-black ${
                              isDark ? "text-emerald-400" : "text-emerald-700"
                            }`}
                          >
                            {String(Math.round(row.mediaNormal))}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-4 text-right font-black pr-6 border-b ${
                          isDark ? "border-white/5" : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-end items-center gap-2 text-white">
                          <TargetArrow3D
                            value={row.mediaDesvio}
                            target={processedData.currentMeta}
                          />
                          <span
                            className={`text-sm font-black ${
                              isDark ? "text-amber-500" : "text-amber-700"
                            }`}
                          >
                            {String(Math.round(row.mediaDesvio))}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}

function WeeklyView({
  isDark,
  refreshTrigger,
  setIsSyncing,
  onSyncComplete,
  onExpandChart,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  const prevDataRef = useRef([]);
  const latestAvailableRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (refreshTrigger === 0) setLoading(true);
      setIsSyncing(true);
      try {
        const res = await fetch(
          `https://docs.google.com/spreadsheets/d/e/2PACX-1vTatTuqFqNuOw3mKCK1Ri-Tb1MINvSxb0BR0WHuHBSoYFSZens2SU3zYHpPmQOtKnfGoMLOuz9LZ3ah/pub?gid=1051080963&single=true&output=csv&t=${Date.now()}`
        );
        const text = await res.text();
        const parsed = parseCSV_Weekly(text);

        const oldData = prevDataRef.current;
        const oldDataMap = new Map();
        for (const r of oldData) {
          oldDataMap.set(r.semana, r);
        }

        const isValid = () => {
          if (parsed.length === 0) return false;
          if (oldData.length > 0) {
            if (parsed.length < oldData.length * 0.5) return false;

            const getProd = (r) =>
              (r.producao !== undefined ? r.producao : r.qtd) || 0;
            const getDesv = (r) =>
              (r.envio !== undefined ? r.envio : r.desvio) || 0;

            const oldProd = oldData.reduce((acc, r) => acc + getProd(r), 0);
            const newProd = parsed.reduce((acc, r) => acc + getProd(r), 0);
            if (oldProd > 0 && newProd === 0) return false;

            const oldDesv = oldData.reduce((acc, r) => acc + getDesv(r), 0);
            const newDesv = parsed.reduce((acc, r) => acc + getDesv(r), 0);

            if (oldDesv > 0 && newDesv < oldDesv * 0.05) return false;
          }
          return true;
        };

        if (!isValid()) {
          console.warn(
            "Google Sheets recalculando dados ou vazios. Congelando painel com valores anteriores."
          );
          setIsSyncing(false);
          onSyncComplete();
          return;
        }

        const mergedParsed = parsed.map((newRow) => {
          const oldRow = oldDataMap.get(newRow.semana);
          if (oldRow) {
            if (
              (newRow.desvio === 0 || isNaN(newRow.desvio)) &&
              oldRow.desvio > 0
            )
              newRow.desvio = oldRow.desvio;
            if ((newRow.qtd === 0 || isNaN(newRow.qtd)) && oldRow.qtd > 0)
              newRow.qtd = oldRow.qtd;
          }
          return newRow;
        });

        prevDataRef.current = mergedParsed;
        setData(mergedParsed);

        if (mergedParsed.length > 0) {
          const sorted = [...mergedParsed].sort((a, b) => {
            const anoA = parseInt(a.ano) || 0;
            const anoB = parseInt(b.ano) || 0;
            if (anoB !== anoA) return anoB - anoA;
            return getMonthNumber(b.mes) - getMonthNumber(a.mes);
          });
          const latestKey = `${sorted[0].ano}-${sorted[0].mes}`;
          if (
            latestAvailableRef.current !== latestKey ||
            selectedMonths.length === 0
          ) {
            latestAvailableRef.current = latestKey;
            if (sorted[0].ano) setSelectedYears([sorted[0].ano.toString()]);
            if (sorted[0].mes) setSelectedMonths([sorted[0].mes]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
        onSyncComplete();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, setIsSyncing]);

  const filterOptions = useMemo(() => {
    if (!data.length) return { years: [], months: [] };
    const getFiltered = (field) =>
      data.filter((d) => {
        const yMatch =
          field === "year" ||
          selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString());
        const mMatch =
          field === "month" ||
          selectedMonths.length === 0 ||
          selectedMonths.includes(d.mes);
        return yMatch && mMatch;
      });
    return {
      years: [
        ...new Set(getFiltered("year").map((d) => d.ano.toString())),
      ].sort((a, b) => parseInt(a) - parseInt(b)),
      months: [...new Set(getFiltered("month").map((d) => d.mes))].sort(
        (a, b) => getMonthNumber(a) - getMonthNumber(b)
      ),
    };
  }, [data, selectedYears, selectedMonths]);

  const processed = useMemo(() => {
    if (!data.length) return [];
    const filtered = data.filter(
      (d) =>
        (selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString())) &&
        (selectedMonths.length === 0 || selectedMonths.includes(d.mes))
    );
    const groups = {};
    filtered.forEach((row) => {
      const key = row.semana || "Semana";
      if (!groups[key])
        groups[key] = {
          label: key,
          prod: 0,
          hours: 0,
          cap: 0,
          desvio: 0,
          rec: 0,
          items: 0,
        };
      groups[key].prod += row.qtd;
      groups[key].hours += row.horas;
      groups[key].cap += row.capacidade;
      groups[key].desvio += row.desvio;
      groups[key].rec += row.recebimento;
      groups[key].items += row.itens;
    });
    return Object.values(groups)
      .map((w) => {
        const falta = Math.max(0, w.cap - w.prod);
        return {
          ...w,
          falta,
          percFalta: w.cap > 0 ? (falta / w.cap) * 100 : 0,
          avg: w.hours > 0 ? w.prod / w.hours : 0,
          avgDesv: w.hours > 0 ? (w.prod + w.desvio) / w.hours : 0,
          eff: w.cap > 0 ? (w.prod / w.cap) * 100 : 0,
        };
      })
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      );
  }, [data, selectedYears, selectedMonths]);

  const globalSummary = useMemo(() => {
    const prod = processed.reduce((a, b) => a + b.prod, 0);
    const desv = processed.reduce((a, b) => a + b.desvio, 0);
    const rec = processed.reduce((a, b) => a + b.rec, 0);
    const cap = processed.reduce((a, b) => a + b.cap, 0);
    const falta = Math.max(0, cap - prod);
    return {
      prod,
      hrs: processed.reduce((a, b) => a + b.hours, 0),
      cap,
      rec,
      desv,
      percDesv: prod > 0 ? (desv / prod) * 100 : 0,
      falta,
      percFalta: cap > 0 ? (falta / cap) * 100 : 0,
    };
  }, [processed]);

  if (loading && refreshTrigger === 0)
    return (
      <div className="p-20 text-center text-blue-400 font-black uppercase tracking-[0.4em] animate-pulse">
        Consolidando Matriz Semanal...
      </div>
    );

  const toggleFilter = (list, item, setter) =>
    setter((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const headerBg = isDark ? "bg-[#27272a]" : "bg-stone-200";

  return (
    <div className="flex flex-col h-full w-full max-w-[1920px] mx-auto px-4 lg:px-6 overflow-y-auto overflow-x-hidden pb-4 text-white">
      <div className="flex justify-end flex-wrap items-end justify-center lg:justify-end gap-2 flex-shrink-0 bg-white/5 p-2 rounded-2xl border border-white/5 shadow-inner w-full lg:w-fit self-end text-white pt-2">
        <FilterWrapper label="Ano" isDark={isDark}>
          <MultiSelectNeon
            options={filterOptions.years}
            selected={selectedYears}
            onToggle={(o) => toggleFilter(selectedYears, o, setSelectedYears)}
            placeholder="Ano"
            isDark={isDark}
            accentColor="purple"
          />
        </FilterWrapper>
        <FilterWrapper label="Mês" isDark={isDark}>
          <MultiSelectNeon
            options={filterOptions.months}
            selected={selectedMonths}
            onToggle={(o) => toggleFilter(selectedMonths, o, setSelectedMonths)}
            placeholder="Mês"
            isDark={isDark}
            accentColor="purple"
          />
        </FilterWrapper>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 flex-shrink-0 text-white mt-3">
        <KPICard
          isDark={isDark}
          title="TOTAL PRODUZIDO"
          value={globalSummary.prod}
          icon={TrendingUp}
          accentColor="emerald"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="TOTAL RECEBIDO"
          value={globalSummary.rec}
          icon={Inbox}
          accentColor="orange"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="TOTAL FALTA"
          value={globalSummary.falta}
          icon={AlertTriangle}
          accentColor="red"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="% FALTA"
          value={`${globalSummary.percFalta.toFixed(1)}%`}
          icon={ArrowDown}
          accentColor="red"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="TOTAL DESVIO"
          value={globalSummary.desv}
          icon={AlertTriangle}
          accentColor="amber"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="% DESVIO"
          value={`${globalSummary.percDesv.toFixed(1)}%`}
          icon={TrendingUp}
          accentColor="amber"
          isSmall
        />
        <KPICard
          isDark={isDark}
          title="CAPACIDADE TOTAL"
          value={globalSummary.cap}
          icon={Target}
          accentColor="blue"
          isSmall
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:h-[40%] min-h-[400px] lg:min-h-0 flex-shrink-0 mt-3">
        <div
          className={`p-4 rounded-3xl border-2 flex flex-col overflow-hidden ${
            isDark
              ? "bg-black/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              : "bg-white border-cyan-200 shadow-xl"
          }`}
        >
          <h4
            className={`text-[10px] font-black uppercase opacity-90 tracking-[0.4em] flex items-center gap-4 mb-2 flex-shrink-0 border px-3 py-1 rounded-lg w-fit ${
              isDark
                ? "text-cyan-400 border-cyan-500/20"
                : "text-blue-600 border-blue-200"
            }`}
          >
            CAPACIDADE vs PRODUÇÃO (QTD)
          </h4>
          <div className="flex-1 flex flex-nowrap items-center justify-start lg:justify-center gap-4 md:gap-8 xl:gap-10 overflow-x-auto scrollbar-hide py-4 px-2 w-full">
            {processed.map((w, idx) => (
              <PowerBattery3D
                key={idx}
                percentage={w.cap > 0 ? (w.prod / w.cap) * 100 : 0}
                label={String(w.label)}
                topLabel="CAPACIDADE"
                bottomLabel="PRODUÇÃO"
                capValue={w.cap}
                prodValue={w.prod}
                colorType="cyan"
                isDark={isDark}
                topLabelColor={isDark ? "text-blue-400" : "text-blue-600"}
              />
            ))}
          </div>
        </div>
        <div
          className={`p-4 rounded-3xl border-2 flex flex-col overflow-hidden ${
            isDark
              ? "bg-black/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "bg-white border-orange-200 shadow-xl"
          }`}
        >
          <h4
            className={`text-[10px] font-black uppercase opacity-90 tracking-[0.4em] flex items-center gap-4 mb-2 flex-shrink-0 border px-3 py-1 rounded-lg w-fit ${
              isDark
                ? "text-orange-400 border-orange-500/20"
                : "text-orange-800 border-orange-200"
            }`}
          >
            RECEBIMENTO vs DESVIO
          </h4>
          <div className="flex-1 flex flex-nowrap items-center justify-start lg:justify-center gap-4 md:gap-8 xl:gap-10 overflow-x-auto scrollbar-hide py-4 px-2 w-full">
            {processed.map((w, idx) => (
              <PowerBattery3D
                key={idx}
                percentage={w.rec > 0 ? (w.desvio / w.rec) * 100 : 0}
                label={String(w.label)}
                topLabel="RECEBIMENTO"
                bottomLabel="DESVIO"
                capValue={w.rec}
                prodValue={w.desvio}
                colorType="amber"
                isDark={isDark}
                topLabelColor={isDark ? "text-orange-400" : "text-orange-600"}
              />
            ))}
          </div>
        </div>
      </div>

      <GlassCard
        className="flex-1 min-h-0 border-none shadow-2xl flex flex-col group/table mt-3 overflow-hidden"
        isDark={isDark}
        accentColor="blue"
      >
        <div
          className={`flex-1 overflow-auto scrollbar-thin scrollbar-thumb-transparent group-hover/table:scrollbar-thumb-stone-600 transition-all duration-300 rounded-3xl ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          <table className="w-full text-[13px] text-center whitespace-nowrap border-separate border-spacing-0 text-white min-w-max">
            <thead
              className={`sticky top-0 z-30 shadow-2xl ${
                isDark
                  ? "text-white bg-[#1c1917]"
                  : "text-slate-800 bg-stone-100"
              }`}
            >
              <tr
                className={`text-[11px] font-black uppercase text-left ${headerBg}`}
              >
                <th
                  className={`p-4 sticky left-0 z-30 text-center rounded-tl-2xl border-neon-b text-purple-400 min-w-[140px] max-w-[250px] truncate ${headerBg}`}
                >
                  ESCOPO SEMANA
                </th>
                <th className="px-3 text-center border-neon-b text-orange-400">
                  RECEBIMENTO
                </th>
                <th className="px-3 text-center border-neon-b text-blue-400">
                  CAPACIDADE
                </th>
                <th className="px-3 text-center border-neon-b text-purple-400">
                  HORAS
                </th>
                <th className="px-3 text-center border-neon-b text-emerald-400">
                  PRODUÇÃO
                </th>
                <th className="px-3 text-center border-neon-b text-red-500">
                  FALTA
                </th>
                <th className="px-3 text-center border-neon-b text-red-500">
                  % FALTA
                </th>
                <th className="px-3 text-center border-neon-b text-amber-500">
                  DESVIO
                </th>
                <th className="px-3 text-center border-neon-b text-amber-500">
                  % DESVIO
                </th>
                <th className="px-3 text-center border-neon-b text-emerald-400">
                  MÉDIA
                </th>
                <th className="px-4 pr-8 text-center rounded-tr-2xl border-neon-b text-amber-500">
                  M. DESVIO
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? "text-white" : "text-slate-800"}`}>
              {processed.map((w, i) => {
                const percDesv = w.prod > 0 ? (w.desvio / w.prod) * 100 : 0;
                const meta =
                  selectedMonths.length > 0
                    ? getTargetByMonth(selectedMonths[0])
                    : 28;
                return (
                  <tr key={i} className="hover:bg-white/5 transition-all group">
                    <td
                      className={`p-4 font-black text-center text-sm sticky left-0 z-10 ${
                        isDark
                          ? "bg-[#1c1917] group-hover:bg-[#2a2a2a] text-purple-400 border-white/5"
                          : "bg-white group-hover:bg-slate-50 text-purple-700 border-slate-200"
                      } border-b transition-colors`}
                    >
                      {String(w.label)}
                    </td>
                    <td
                      className={`px-3 font-bold text-center text-sm ${
                        isDark
                          ? "text-orange-400 border-white/5"
                          : "text-orange-800 border-slate-200"
                      } border-b`}
                    >
                      {String(Math.round(w.rec).toLocaleString())}
                    </td>
                    <td
                      className={`px-3 font-bold text-center text-sm ${
                        isDark
                          ? "text-blue-400 border-white/5"
                          : "text-blue-800 border-slate-200"
                      } border-b`}
                    >
                      {String(Math.round(w.cap).toLocaleString())}
                    </td>
                    <td
                      className={`px-3 font-bold text-center text-sm ${
                        isDark
                          ? "text-purple-400 border-white/5"
                          : "text-purple-800 border-slate-200"
                      } border-b`}
                    >
                      {String(w.hours)}
                    </td>
                    <td
                      className={`px-3 font-black text-center text-sm ${
                        isDark
                          ? "text-emerald-400 border-white/5"
                          : "text-emerald-700 border-slate-200"
                      } border-b`}
                    >
                      {String(Math.round(w.prod).toLocaleString())}
                    </td>
                    <td
                      className={`px-3 font-black text-center text-sm ${
                        isDark
                          ? "text-red-500 border-white/5"
                          : "text-red-700 border-slate-200"
                      } border-b`}
                    >
                      {String(Math.round(w.falta).toLocaleString())}
                    </td>
                    <td
                      className={`px-3 font-black text-center text-sm ${
                        isDark
                          ? "text-red-500 border-white/5"
                          : "text-red-700 border-slate-200"
                      } border-b`}
                    >
                      {String(
                        w.percFalta ? Math.round(w.percFalta) + "%" : "0%"
                      )}
                    </td>
                    <td
                      className={`px-3 font-black text-center text-sm ${
                        isDark
                          ? "text-amber-500 border-white/5"
                          : "text-amber-700 border-slate-200"
                      } border-b`}
                    >
                      {String(Math.round(w.desvio).toLocaleString())}
                    </td>
                    <td
                      className={`px-3 text-center border-b ${
                        isDark ? "border-white/5" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3 text-white">
                        <span
                          className={`font-black text-sm ${
                            isDark ? "text-amber-500" : "text-amber-800"
                          }`}
                        >
                          {String(percDesv.toFixed(1))}%
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 text-center border-b ${
                        isDark ? "border-white/5" : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`flex justify-center items-center gap-2 text-white`}
                      >
                        <TargetArrow3D value={w.avg} target={meta} />
                        <span
                          className={`font-black text-sm ${
                            isDark ? "text-emerald-400" : "text-emerald-800"
                          }`}
                        >
                          {String(Math.round(w.avg))}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-4 pr-8 text-center border-b ${
                        isDark ? "border-white/5" : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`flex justify-center items-center gap-2 text-white`}
                      >
                        <TargetArrow3D value={w.avgDesv} target={meta} />
                        <span
                          className={`font-black text-sm ${
                            isDark ? "text-amber-500" : "text-amber-800"
                          }`}
                        >
                          {String(Math.round(w.avgDesv))}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function MonthlyView({
  isDark,
  refreshTrigger,
  setIsSyncing,
  onSyncComplete,
  onExpandChart,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedColabs, setSelectedColabs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedWeeks, setSelectedWeeks] = useState([]);

  const prevDataRef = useRef([]);
  const latestAvailableRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (refreshTrigger === 0) setLoading(true);
      setIsSyncing(true);
      try {
        const res = await fetch(
          `https://docs.google.com/spreadsheets/d/e/2PACX-1vTatTuqFqNuOw3mKCK1Ri-Tb1MINvSxb0BR0WHuHBSoYFSZens2SU3zYHpPmQOtKnfGoMLOuz9LZ3ah/pub?gid=0&single=true&output=csv&t=${Date.now()}`
        );
        const text = await res.text();
        const parsed = parseCSV_Daily(text);

        const oldData = prevDataRef.current;
        const oldDataMap = new Map();
        for (const r of oldData) {
          oldDataMap.set(`${r.nome}-${r.dia}-${r.mes}-${r.ano}`, r);
        }

        const isValid = () => {
          if (parsed.length === 0) return false;
          if (oldData.length > 0) {
            if (parsed.length < oldData.length * 0.5) return false;

            const getProd = (r) =>
              (r.producao !== undefined ? r.producao : r.qtd) || 0;
            const getDesv = (r) =>
              (r.envio !== undefined ? r.envio : r.desvio) || 0;

            const oldProd = oldData.reduce((acc, r) => acc + getProd(r), 0);
            const newProd = parsed.reduce((acc, r) => acc + getProd(r), 0);
            if (oldProd > 0 && newProd === 0) return false;

            const oldDesv = oldData.reduce((acc, r) => acc + getDesv(r), 0);
            const newDesv = parsed.reduce((acc, r) => acc + getDesv(r), 0);

            if (oldDesv > 0 && newDesv < oldDesv * 0.1) return false;
          }
          return true;
        };

        if (!isValid()) {
          console.warn(
            "Google Sheets recalculando dados ou vazios. Congelando painel com valores anteriores."
          );
          setIsSyncing(false);
          onSyncComplete();
          return;
        }

        const mergedParsed = parsed.map((newRow) => {
          const oldRow = oldDataMap.get(
            `${newRow.nome}-${newRow.dia}-${newRow.mes}-${newRow.ano}`
          );
          if (oldRow) {
            if ((!newRow.envio || newRow.envio === 0) && oldRow.envio > 0)
              newRow.envio = oldRow.envio;
            if (
              (!newRow.producao || newRow.producao === 0) &&
              oldRow.producao > 0
            )
              newRow.producao = oldRow.producao;
          }
          return newRow;
        });

        prevDataRef.current = mergedParsed;
        setData(mergedParsed);

        if (mergedParsed.length > 0) {
          const sorted = [...mergedParsed].sort((a, b) => {
            const anoA = parseInt(a.ano) || 0;
            const anoB = parseInt(b.ano) || 0;
            if (anoB !== anoA) return anoB - anoA;
            return getMonthNumber(b.mes) - getMonthNumber(a.mes);
          });
          const latestKey = `${sorted[0].ano}-${sorted[0].mes}`;
          if (
            latestAvailableRef.current !== latestKey ||
            selectedMonths.length === 0
          ) {
            latestAvailableRef.current = latestKey;
            if (sorted[0].ano) setSelectedYears([sorted[0].ano.toString()]);
            if (sorted[0].mes) setSelectedMonths([sorted[0].mes]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
        onSyncComplete();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, setIsSyncing]);

  const filterOptions = useMemo(() => {
    if (!data.length)
      return { years: [], months: [], colabs: [], status: [], weeks: [] };
    const getFiltered = (field) =>
      data.filter((d) => {
        const yMatch =
          field === "year" ||
          selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString());
        const mMatch =
          field === "month" ||
          selectedMonths.length === 0 ||
          selectedMonths.includes(d.mes);
        const cMatch =
          field === "colab" ||
          selectedColabs.length === 0 ||
          selectedColabs.includes(d.nome);
        const sMatch =
          field === "status" ||
          selectedStatus.length === 0 ||
          selectedStatus.includes(d.status);
        const wMatch =
          field === "week" ||
          selectedWeeks.length === 0 ||
          selectedWeeks.includes(d.semana);
        return yMatch && mMatch && cMatch && sMatch && wMatch;
      });
    return {
      years: [
        ...new Set(getFiltered("year").map((d) => d.ano.toString())),
      ].sort((a, b) => parseInt(a) - parseInt(b)),
      months: [...new Set(getFiltered("month").map((d) => d.mes))].sort(
        (a, b) => getMonthNumber(a) - getMonthNumber(b)
      ),
      colabs: [...new Set(getFiltered("colab").map((d) => d.nome))].sort(),
      status: [...new Set(getFiltered("status").map((d) => d.status))]
        .filter((s) => s)
        .sort(),
      weeks: [
        ...new Set(
          getFiltered("week")
            .filter((d) => d.semana)
            .map((d) => d.semana)
        ),
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };
  }, [
    data,
    selectedYears,
    selectedMonths,
    selectedColabs,
    selectedStatus,
    selectedWeeks,
  ]);

  const groupedData = useMemo(() => {
    if (!data.length) return null;
    const filtered = data.filter(
      (d) =>
        (selectedYears.length === 0 ||
          selectedYears.includes(d.ano.toString())) &&
        (selectedMonths.length === 0 || selectedMonths.includes(d.mes)) &&
        (selectedColabs.length === 0 || selectedColabs.includes(d.nome)) &&
        (selectedStatus.length === 0 || selectedStatus.includes(d.status)) &&
        (selectedWeeks.length === 0 || selectedWeeks.includes(d.semana))
    );
    const currentMeta =
      selectedMonths.length > 0 ? getTargetByMonth(selectedMonths[0]) : 28;
    const grouped = {};
    const dailyAgg = {};

    let daysInMonth = 31;
    let monthName = "";
    if (selectedMonths.length === 1 && selectedYears.length === 1) {
      const m = getMonthNumber(selectedMonths[0]);
      const y = parseInt(selectedYears[0]);
      if (m !== 99 && y > 0) {
        daysInMonth = new Date(y, m, 0).getDate();
        monthName = getMonthName(selectedMonths[0])
          .substring(0, 3)
          .toLowerCase();
      }
    }

    for (let i = 1; i <= daysInMonth; i++) {
      dailyAgg[i] = { day: i, prod: 0, desv: 0, monthName };
    }

    filtered.forEach((row) => {
      if (!grouped[row.nome])
        grouped[row.nome] = {
          ...row,
          totalProd: 0,
          totalEnvio: 0,
          totalHorasContadas: 0,
          totalHorasPlanilha: 0,
        };
      grouped[row.nome].totalProd += row.producao;
      grouped[row.nome].totalEnvio += row.envio;

      grouped[row.nome].totalHorasPlanilha += row.horas_total || 0;

      if (row.hora > 0) {
        grouped[row.nome].totalHorasContadas += 1;
      }

      const dKey = row.dia;
      if (dailyAgg[dKey]) {
        dailyAgg[dKey].prod += row.producao;
        dailyAgg[dKey].desv += row.envio;
      }
    });

    const rows = Object.values(grouped)
      .map((u) => {
        const hReal =
          u.totalHorasPlanilha > 0
            ? u.totalHorasPlanilha
            : u.totalHorasContadas;
        const h = hReal || 1;
        const target = currentMeta * h;
        const falta = Math.round(Math.max(0, target - u.totalProd));
        return {
          ...u,
          target,
          totalHoras: hReal % 1 !== 0 ? parseFloat(hReal.toFixed(2)) : hReal,
          mediaNormal: u.totalProd / h,
          mediaDesvio: (u.totalProd + u.totalEnvio) / h,
          percDesvio: u.totalProd > 0 ? (u.totalEnvio / u.totalProd) * 100 : 0,
          falta,
          percFalta: target > 0 ? (falta / target) * 100 : 0,
        };
      })
      .sort((a, b) => b.mediaNormal - a.mediaNormal);

    const statusCounts = {};
    filtered.forEach((row) => {
      if (row.status)
        statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    });

    const chartData = Object.values(dailyAgg)
      .sort((a, b) => a.day - b.day)
      .map((d) => ({
        ...d,
        perc: d.prod > 0 ? (d.desv / d.prod) * 100 : 0,
        dateLabel: d.monthName ? `${d.day}/${d.monthName}` : `${d.day}`,
      }));

    return {
      rows,
      currentMeta,
      statusCounts,
      chartData,
    };
  }, [
    data,
    selectedYears,
    selectedMonths,
    selectedColabs,
    selectedStatus,
    selectedWeeks,
  ]);

  const processed = useMemo(() => {
    if (!groupedData) return null;

    const finalRows = groupedData.rows;

    const totalP = finalRows.reduce((a, b) => a + b.totalProd, 0);
    const totalE = finalRows.reduce((a, b) => a + b.totalEnvio, 0);
    const totalF = finalRows.reduce((a, b) => a + b.falta, 0);
    const totalTarget = finalRows.reduce((a, b) => a + b.target, 0);

    return {
      rows: finalRows,
      totalProd: totalP,
      totalHoras: finalRows.reduce(
        (a, b) =>
          a +
          (b.totalHorasPlanilha > 0
            ? b.totalHorasPlanilha
            : b.totalHorasContadas),
        0
      ),
      totalEnvio: totalE,
      totalFaltas: totalF,
      percFalta: totalTarget > 0 ? (totalF / totalTarget) * 100 : 0,
      percDesvio: totalP > 0 ? (totalE / totalP) * 100 : 0,
      avgMeta: groupedData.currentMeta,
      statusDistribution: Object.entries(groupedData.statusCounts).map(
        ([label, value]) => ({ label, value })
      ),
      dailyChart: groupedData.chartData,
    };
  }, [groupedData]);

  if (loading && refreshTrigger === 0)
    return (
      <div className="p-20 text-center text-emerald-400 font-black uppercase tracking-[0.4em] animate-pulse">
        Analizando Ciclos Mensais...
      </div>
    );

  const toggleFilter = (list, item, setter) =>
    setter((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const headerBg = isDark ? "bg-[#27272a]" : "bg-stone-200";

  return (
    <div className="flex flex-col h-full w-full max-w-[1920px] mx-auto px-4 lg:px-6 overflow-y-auto overflow-x-hidden pb-4">
      <div className="flex flex-wrap items-end justify-center lg:justify-end gap-2 flex-shrink-0 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner w-full lg:w-fit self-end text-white pt-2 mt-2">
        <div className="flex items-center gap-2 border-r border-white/10 pr-4 text-white">
          <FilterWrapper label="Ano" isDark={isDark}>
            <MultiSelectNeon
              options={filterOptions.years}
              selected={selectedYears}
              onToggle={(o) => toggleFilter(selectedYears, o, setSelectedYears)}
              placeholder="Ano"
              isDark={isDark}
              accentColor="emerald"
            />
          </FilterWrapper>
          <FilterWrapper label="Mês" isDark={isDark}>
            <MultiSelectNeon
              options={filterOptions.months}
              selected={selectedMonths}
              onToggle={(o) =>
                toggleFilter(selectedMonths, o, setSelectedMonths)
              }
              placeholder="Mês"
              isDark={isDark}
              accentColor="emerald"
            />
          </FilterWrapper>
        </div>
        <FilterWrapper label="Colaborador" isDark={isDark}>
          <MultiSelectNeon
            options={filterOptions.colabs}
            selected={selectedColabs}
            onToggle={(o) => toggleFilter(selectedColabs, o, setSelectedColabs)}
            placeholder="Colaborador"
            isDark={isDark}
            accentColor="emerald"
          />
        </FilterWrapper>
        <FilterWrapper label="Status" isDark={isDark}>
          <MultiSelectNeon
            options={filterOptions.status}
            selected={selectedStatus}
            onToggle={(o) => toggleFilter(selectedStatus, o, setSelectedStatus)}
            placeholder="Status"
            isDark={isDark}
            accentColor="emerald"
          />
        </FilterWrapper>
        <FilterWrapper label="Semana" isDark={isDark}>
          <MultiSelectNeon
            options={filterOptions.weeks}
            selected={selectedWeeks}
            onToggle={(o) => toggleFilter(selectedWeeks, o, setSelectedWeeks)}
            placeholder="Semana"
            isDark={isDark}
            accentColor="emerald"
          />
        </FilterWrapper>
        {selectedColabs.length + selectedStatus.length + selectedWeeks.length >
          0 && (
          <button
            onClick={() => {
              setSelectedColabs([]);
              setSelectedStatus([]);
              setSelectedWeeks([]);
            }}
            className="flex items-center mb-1 gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/20 transition-all"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>
      {processed && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 flex-shrink-0 text-white mt-3">
            <KPICard
              isDark={isDark}
              title="TOTAL PRODUZIDO"
              value={processed.totalProd}
              icon={TrendingUp}
              accentColor="emerald"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="TOTAL FALTA"
              value={processed.totalFaltas}
              icon={AlertTriangle}
              accentColor="red"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="% FALTA"
              value={`${processed.percFalta.toFixed(1)}%`}
              icon={ArrowDown}
              accentColor="red"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="TOTAL DESVIO"
              value={processed.totalEnvio}
              icon={Inbox}
              accentColor="amber"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="% DESVIO"
              value={`${processed.percDesvio.toFixed(1)}%`}
              icon={TrendingUp}
              accentColor="amber"
              isSmall
            />
            <KPICard
              isDark={isDark}
              title="Meta Hora"
              value={`${processed.avgMeta} un.`}
              icon={Target}
              accentColor="blue"
              isSmall
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 mt-3">
            <div className="lg:w-1/3 flex flex-col gap-4 text-white">
              <GlassCard
                className="p-4 flex flex-col items-center justify-center min-h-[250px] lg:min-h-0 lg:h-[40%] flex-1"
                isDark={isDark}
                accentColor="blue"
              >
                <div className="flex justify-between items-center w-full flex-shrink-0 mb-2">
                  <h4
                    className={`text-[10px] font-black uppercase flex items-center gap-2 border px-3 py-1 rounded-lg ${
                      isDark
                        ? "text-blue-400 border-blue-500/20"
                        : "text-blue-600 border-blue-200"
                    }`}
                  >
                    <PieChart className="w-4 h-4" /> STATUS DISTRIBUIÇÃO
                  </h4>
                </div>
                <div className="flex-1 w-full flex items-center justify-center overflow-hidden min-h-0">
                  <HolographicPieChart
                    data={processed.statusDistribution}
                    isDark={isDark}
                  />
                </div>
              </GlassCard>

              <GlassCard
                className="p-4 flex-1 flex flex-col relative min-h-[300px] lg:min-h-0"
                isDark={isDark}
                accentColor="emerald"
              >
                <h4
                  className={`text-[10px] font-black uppercase flex items-center gap-2 border px-3 py-1 rounded-lg w-fit ${
                    isDark
                      ? "text-emerald-400 border-emerald-500/20"
                      : "text-emerald-800"
                  } flex-shrink-0`}
                >
                  <BarChart4 className="w-4 h-4" /> Fluxo Diário Produção x
                  Desvio
                </h4>
                <div className="flex-1 w-full relative min-h-0">
                  <CyberStackedBarChart
                    data={processed.dailyChart}
                    isDark={isDark}
                    onExpand={() =>
                      onExpandChart({
                        data: processed.dailyChart,
                        monthName: selectedMonths[0]
                          ? getMonthName(selectedMonths[0]).toUpperCase()
                          : "",
                        highlightPerc: true,
                      })
                    }
                    monthName={
                      selectedMonths[0]
                        ? getMonthName(selectedMonths[0]).toUpperCase()
                        : ""
                    }
                    highlightPerc={true}
                  />
                </div>
              </GlassCard>
            </div>
            <GlassCard
              className="lg:w-2/3 border-none shadow-2xl flex flex-col h-full min-h-[400px] group/table text-white overflow-hidden"
              isDark={isDark}
              accentColor="purple"
            >
              <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-transparent group-hover/table:scrollbar-thumb-stone-600 transition-all duration-300 rounded-3xl">
                <table className="w-full text-[13px] text-left whitespace-nowrap border-separate border-spacing-0 text-white min-w-max">
                  <thead
                    className={`sticky top-0 z-30 shadow-2xl ${
                      isDark
                        ? "text-white bg-[#1c1917]"
                        : "text-slate-800 bg-stone-100"
                    }`}
                  >
                    <tr className="text-[11px] font-black uppercase text-center">
                      <th
                        colSpan={9}
                        className={`py-2.5 px-4 text-cyan-400 tracking-[0.5em] rounded-tl-2xl border-b ${
                          isDark ? "border-white/10" : "border-stone-200"
                        } ${headerBg}`}
                      >
                        DADOS GERAIS
                      </th>
                      <th
                        colSpan={2}
                        className={`text-emerald-400 rounded-tr-2xl border-b ${
                          isDark ? "border-white/10" : "border-stone-200"
                        } ${headerBg}`}
                      >
                        ANÁLISE
                      </th>
                    </tr>
                    <tr
                      className={`text-[12px] font-black uppercase text-left border-b ${
                        isDark ? "border-white/10" : "border-stone-200"
                      } ${headerBg}`}
                    >
                      <th
                        className={`p-4 sticky left-0 z-30 text-purple-400 min-w-[120px] max-w-[140px] sm:max-w-[250px] truncate border-neon-b ${headerBg}`}
                      >
                        COLABORADOR
                      </th>
                      <th className="px-3 text-center text-stone-400 border-neon-b">
                        STATUS
                      </th>
                      <th className="px-3 text-center text-stone-300 border-neon-b">
                        TEMPO CASA
                      </th>
                      <th className="px-3 text-center text-purple-400 border-neon-b">
                        HORAS
                      </th>
                      <th className="px-3 text-center text-emerald-400 font-black border-neon-b">
                        PRODUÇÃO
                      </th>
                      <th className="px-3 text-center text-red-500 font-black border-neon-b">
                        FALTA
                      </th>
                      <th className="px-3 text-center text-red-500 font-black border-neon-b">
                        % FALTA
                      </th>
                      <th className="px-3 text-center text-amber-500 font-black border-neon-b">
                        DESVIO
                      </th>
                      <th
                        className={`px-3 text-center font-black border-neon-b ${
                          isDark ? "text-amber-500" : "text-amber-700"
                        } ${headerBg}`}
                      >
                        % DESVIO
                      </th>
                      <th className="px-4 text-right text-emerald-400 font-black border-neon-b">
                        MÉDIA
                      </th>
                      <th className="px-4 text-right pr-8 text-amber-500 font-black border-neon-b rounded-tr-2xl">
                        M. DESVIO
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${isDark ? "text-white" : "text-slate-800"}`}
                  >
                    {processed.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/5 transition-all group"
                      >
                        <td
                          className={`p-4 font-black text-xs sticky left-0 z-10 ${
                            isDark
                              ? "bg-[#1c1917] group-hover:bg-[#2a2a2a] text-purple-400 border-white/5"
                              : "bg-white group-hover:bg-slate-50 text-purple-700 border-slate-200"
                          } border-b transition-colors truncate min-w-[120px] max-w-[140px] sm:max-w-[250px]`}
                        >
                          {String(row.nome)}
                        </td>
                        <td
                          className={`px-3 text-center border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          <StatusBadge
                            label={String(row.status)}
                            isDark={isDark}
                          />
                        </td>
                        <td
                          className={`px-3 text-center text-[10px] font-black opacity-80 uppercase tracking-tighter border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          {formatTimeInHouse(row.tempo_casa)}
                        </td>
                        <td
                          className={`px-3 text-center font-bold text-sm border-b ${
                            isDark
                              ? "text-purple-400 border-white/5"
                              : "text-purple-700 border-slate-200"
                          }`}
                        >
                          {String(row.totalHoras)}
                        </td>
                        <td
                          className={`px-3 text-center font-black text-emerald-400 text-sm border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          {String(row.totalProd)}
                        </td>
                        <td
                          className={`px-3 text-center text-red-500 font-black text-sm border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          {String(row.falta || "0")}
                        </td>
                        <td
                          className={`px-3 text-center text-red-500 font-black text-sm border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          {String(
                            row.percFalta
                              ? Math.round(row.percFalta) + "%"
                              : "0%"
                          )}
                        </td>
                        <td
                          className={`px-3 text-center font-black text-amber-500 border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          {String(row.totalEnvio || "0")}
                        </td>
                        <td
                          className={`px-3 text-center font-black text-xs border-b ${
                            isDark
                              ? "text-amber-500 border-white/5"
                              : "border-slate-200 text-amber-700"
                          }`}
                        >
                          {String(
                            row.percDesvio
                              ? Math.round(row.percDesvio) + "%"
                              : "0%"
                          )}
                        </td>
                        <td
                          className={`px-3 text-right border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          <div className="flex justify-end items-center gap-2 text-white">
                            <TargetArrow3D
                              value={row.mediaNormal}
                              target={processed.avgMeta}
                            />
                            <span
                              className={`text-sm font-black ${
                                isDark ? "text-emerald-400" : "text-emerald-700"
                              }`}
                            >
                              {String(Math.round(row.mediaNormal))}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-4 text-right pr-8 border-b ${
                            isDark ? "border-white/5" : "border-slate-200"
                          }`}
                        >
                          <div className="flex justify-end items-center gap-2 text-white">
                            <TargetArrow3D
                              value={row.mediaDesvio}
                              target={processed.avgMeta}
                            />
                            <span
                              className={`text-sm font-black ${
                                isDark ? "text-amber-500" : "text-amber-700"
                              }`}
                            >
                              {String(Math.round(row.mediaDesvio))}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

// --- 5. COMPONENTE PRINCIPAL ---

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState("daily");

  // Lógica de Atualização em Tempo Real Global (Polling)
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);

  // Estado para Modal de Gráfico Expandido
  const [expandedChart, setExpandedChart] = useState(null);

  useEffect(() => {
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncComplete = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const border = isDark ? "border-white/10" : "border-stone-200";

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${
        isDark ? "bg-[#09090b] text-stone-200" : "bg-white text-stone-800"
      } font-sans transition-colors duration-500 antialiased flex flex-col relative`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            * { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s; }
            *:hover { scrollbar-color: rgba(100,100,100,0.5) transparent; }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
            *:hover::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.5); }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes scan {
                0% { top: 110%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: -10%; opacity: 0; }
            }
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .battery-scan { animation: scan 2.5s ease-in-out infinite; }
            .cyber-header-glow { text-shadow: 0 0 10px rgba(0,242,255,0.5), 0 0 20px rgba(0,242,255,0.3); }
            
            /* Glow interno fixado perfeitamente na base inferior do border-bottom sem vazar nas laterais */
            .border-neon-b {
                border-bottom: 2px solid currentColor !important;
                box-shadow: inset 0 -15px 15px -15px currentColor !important;
            }

            /* --- ESTILOS MODERNOS DA SCROLLBAR DO GRÁFICO --- */
            .always-visible-scroll {
                scrollbar-width: auto !important; 
                scrollbar-color: #00f2ff rgba(255,255,255,0.05) !important;
            }
            .always-visible-scroll::-webkit-scrollbar {
                height: 14px !important;
                background: rgba(0, 0, 0, 0.3) !important;
                border-radius: 10px !important;
            }
            .always-visible-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(90deg, #06b6d4, #3b82f6) !important;
                border-radius: 10px !important;
                border: 2px solid transparent !important;
                background-clip: padding-box !important;
                cursor: grab;
            }
            .always-visible-scroll::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(90deg, #00f2ff, #8b5cf6) !important;
            }
            .always-visible-scroll::-webkit-scrollbar-thumb:active {
                background: #fff !important;
                border: 2px solid #00f2ff !important;
                cursor: grabbing;
            }

            /* Efeito da arte piscando embaixo quando arrastado */
            .scroll-glow-wrapper::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 14px;
                background: linear-gradient(90deg, transparent, rgba(0,242,255,0.6), transparent);
                border-radius: 10px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
            }
            .scroll-glow-wrapper.scrolling-active::after {
                animation: scrollbar-blink 0.5s infinite alternate;
            }
            @keyframes scrollbar-blink {
                0% { opacity: 0.3; box-shadow: 0 0 5px rgba(0,242,255,0.2); }
                100% { opacity: 1; box-shadow: 0 -5px 25px rgba(0,242,255,0.9); }
            }
        `,
        }}
      />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute inset-0 opacity-[0.03] ${
            isDark
              ? "bg-[radial-gradient(#00f2ff_1px,transparent_1px)]"
              : "bg-[radial-gradient(#000_1px,transparent_1px)]"
          }`}
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      <nav
        className={`h-[80px] sticky top-0 z-[200] border-b ${border} ${
          isDark ? "bg-[#09090b]/95" : "bg-white/95"
        } backdrop-blur-3xl px-4 sm:px-6 md:px-10 py-5 flex justify-between items-center shadow-2xl relative text-white flex-shrink-0`}
      >
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2.5 rounded-2xl text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transform hover:scale-110 transition-all duration-300 flex-shrink-0 animate-pulse">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1
            className={`font-black text-lg lg:text-xl tracking-tighter hidden lg:block uppercase cyber-header-glow ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            PAINEL DE CONTROLE
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 ml-2">
              REVERSA BANCADA
            </span>
          </h1>

          <div
            className={`flex p-1 sm:p-1.5 rounded-2xl border ${border} ${
              isDark ? "bg-white/5" : "bg-stone-100"
            } lg:ml-6 shadow-inner`}
          >
            <button
              onClick={() => setCurrentPage("daily")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                currentPage === "daily"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-stone-500 hover:text-white"
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="hidden sm:inline">DIÁRIO</span>
            </button>
            <button
              onClick={() => setCurrentPage("weekly")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                currentPage === "weekly"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-stone-500 hover:text-white"
              }`}
            >
              <Cpu className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="hidden sm:inline">SEMANAL</span>
            </button>
            <button
              onClick={() => setCurrentPage("monthly")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                currentPage === "monthly"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-stone-500 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="hidden sm:inline">MENSAL</span>
            </button>
            <button
              onClick={() => setCurrentPage("curva")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                currentPage === "curva"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-stone-500 hover:text-white"
              }`}
            >
              <LineChart className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="hidden sm:inline">CURVA</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Active Core
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  if (!isGlobalSyncing) setRefreshTrigger((prev) => prev + 1);
                }}
                disabled={isGlobalSyncing}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${
                  isGlobalSyncing
                    ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.6)] animate-pulse"
                    : isDark
                    ? "bg-white/5 text-cyan-400 hover:bg-cyan-500/20 border border-transparent"
                    : "bg-stone-200 text-blue-600 hover:bg-blue-100 border border-transparent"
                }`}
                title="Sincronizar dados agora"
              >
                <RefreshCcw
                  className={`w-3 h-3 ${isGlobalSyncing ? "animate-spin" : ""}`}
                />
                {isGlobalSyncing ? "Atualizando..." : "Atualizar"}
              </button>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${
                  isDark ? "text-white" : "text-slate-600"
                }`}
              >
                Última Att: {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 sm:p-3 rounded-2xl border ${border} hover:text-blue-400 transition-all shadow-xl bg-white/5 border-white/10 text-white`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-stone-800" />
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        {currentPage === "daily" && (
          <div className="flex-1 h-full w-full py-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <DailyView
              isDark={isDark}
              refreshTrigger={refreshTrigger}
              setIsSyncing={setIsGlobalSyncing}
              onSyncComplete={handleSyncComplete}
              onExpandChart={setExpandedChart}
            />
          </div>
        )}
        {currentPage === "weekly" && (
          <div className="flex-1 h-full w-full py-4 animate-in fade-in duration-1000 slide-in-from-right-4">
            <WeeklyView
              isDark={isDark}
              refreshTrigger={refreshTrigger}
              setIsSyncing={setIsGlobalSyncing}
              onSyncComplete={handleSyncComplete}
              onExpandChart={setExpandedChart}
            />
          </div>
        )}
        {currentPage === "monthly" && (
          <div className="flex-1 h-full w-full py-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <MonthlyView
              isDark={isDark}
              refreshTrigger={refreshTrigger}
              setIsSyncing={setIsGlobalSyncing}
              onSyncComplete={handleSyncComplete}
              onExpandChart={setExpandedChart}
            />
          </div>
        )}
        {currentPage === "curva" && (
          <div className="flex-1 h-full w-full py-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <CurvaView
              isDark={isDark}
              refreshTrigger={refreshTrigger}
              setIsSyncing={setIsGlobalSyncing}
              onSyncComplete={handleSyncComplete}
            />
          </div>
        )}
      </main>

      {/* Modal Zoom Gráfico na Raiz para garantir visibilidade 100% */}
      {expandedChart && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 text-white">
          <div
            className={`w-full max-w-[95vw] h-[90vh] rounded-3xl border-2 p-4 sm:p-8 relative flex flex-col ${
              isDark
                ? "bg-stone-900 border-cyan-500/30"
                : "bg-white border-stone-200"
            }`}
          >
            <button
              onClick={() => setExpandedChart(null)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all z-[510]"
            >
              <X className="w-6 h-6" />
            </button>
            <h4
              className={`text-lg sm:text-xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-3 flex-shrink-0 ${
                isDark ? "text-emerald-400" : "text-emerald-700"
              }`}
            >
              <BarChart4 className="w-6 h-6 sm:w-7 sm:h-7" /> FLUXO DIÁRIO
              DETALHADO (PRODUÇÃO vs DESVIO)
            </h4>
            <div className="flex-1 w-full relative overflow-hidden">
              <CyberStackedBarChart
                data={expandedChart.data}
                isDark={isDark}
                onExpand={null}
                highlightPerc={expandedChart.highlightPerc}
                monthName={expandedChart.monthName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
