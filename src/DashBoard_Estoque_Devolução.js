import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Package,
  Filter,
  Calendar,
  Tag,
  BarChart2,
  List,
  Grid,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Check,
  MapPin,
  Calculator,
  RefreshCw,
  Clock,
  Moon,
  Sun,
  ShoppingBag,
  Zap,
  Camera,
  Download,
  X,
} from "lucide-react";

// URL do seu CSV
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRNbWns_1KK6Jtoftz4xHcjqXpygwM5cFD9dy_xmiMj3roBkAPrTbHfvXWcY-DSU4TFp-L-lK0h7QM/pub?gid=0&single=true&output=csv";

// Cores base para os gráficos
const COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#a855f7",
];

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const MESES_COMPLETO = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// --- TEMAS (Configuração de Cores Sci-Fi) ---
const getTheme = (isDark) => ({
  bg: isDark ? "bg-[#050910]" : "bg-[#f0f2f5]",
  card: isDark ? "bg-[#0f172a]" : "bg-white",
  border: isDark ? "border-[#1e293b]" : "border-slate-200",
  neonBorder: isDark ? "border-cyan-500/50" : "border-blue-400",
  textMain: isDark ? "text-slate-300" : "text-slate-700",
  textHighlight: isDark ? "text-white" : "text-slate-900",
  textSub: isDark ? "text-slate-500" : "text-slate-500",
  labelNeon: isDark
    ? "text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)]"
    : "text-blue-700 font-bold",
  inputBg: isDark ? "bg-[#111827]" : "bg-slate-50",
  inputBorder: isDark ? "border-[#374151]" : "border-slate-300",
  tooltipBg: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
  tooltipBorder: isDark ? "#06b6d4" : "#3b82f6",
  tooltipText: isDark ? "#fff" : "#1e293b",
  dropdownBg: isDark ? "bg-[#111827]" : "bg-white",
  shadow: isDark
    ? "shadow-[0_0_15px_rgba(0,0,0,0.6)]"
    : "shadow-xl shadow-slate-200/60",
  scrollThumb: isDark ? "#374151" : "#cbd5e1",
  chartLabel: isDark ? "#e2e8f0" : "#334155",
});

// --- GRADIENTES ---
const GradientDefs = () => (
  <defs>
    <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
    </linearGradient>

    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
    </linearGradient>

    <linearGradient id="colorCostNeon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
    </linearGradient>

    {COLORS.map((c, i) => (
      <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c} stopOpacity={1} />
        <stop offset="100%" stopColor={c} stopOpacity={0.6} />
      </linearGradient>
    ))}
  </defs>
);

// --- COMPONENTES AUXILIARES ---

const Card = ({ title, value, icon: Icon, colorClass, bgClass, theme }) => (
  <div className={`perspective-container h-full`}>
    <div
      className={`
        ${theme.card} p-4 rounded-2xl border ${theme.border} 
        relative overflow-hidden group 
        h-full flex flex-col justify-between min-h-[110px]
        transition-all duration-500 ease-out
        card-3d-hover animate-float
        ${
          isDarkTheme(theme)
            ? "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/30"
            : "hover:shadow-2xl"
        }
      `}
    >
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div
        className={`absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-all duration-500 ${colorClass.replace(
          "text-",
          "text-"
        )} transform group-hover:scale-110 group-hover:rotate-12`}
      >
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex justify-between items-start mb-2">
        <p
          className={`${theme.textSub} text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] truncate group-hover:text-cyan-400 transition-colors`}
        >
          {title}
        </p>

        <div
          className={`p-2 rounded-xl border ${
            theme.border
          } shadow-inner bg-opacity-20 backdrop-blur-md group-hover:scale-110 transition-transform duration-300 ${
            bgClass
              ? bgClass.replace("from-", "bg-").replace("500", "500/20")
              : ""
          }`}
        >
          <Icon size={18} className={colorClass} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <h3
          className={`text-3xl sm:text-4xl lg:text-5xl font-black ${theme.textHighlight} tracking-tighter leading-none break-all drop-shadow-md group-hover:translate-x-1 transition-transform duration-300`}
        >
          {value}
        </h3>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800/50 overflow-hidden">
        <div
          className={`h-full ${
            bgClass ? bgClass.replace("from-", "bg-") : "bg-slate-500"
          } w-2/3 opacity-70 group-hover:w-full transition-all duration-700 ease-out shadow-[0_0_10px_currentColor]`}
        ></div>
      </div>
    </div>
  </div>
);

const SummaryCard = ({
  label1,
  value1,
  sub1,
  label2,
  value2,
  colorClass,
  theme,
}) => (
  <div className={`perspective-container h-full`}>
    <div
      className={`
        ${theme.card} p-4 rounded-2xl border ${theme.border} 
        relative overflow-hidden group 
        h-full flex flex-col justify-center min-h-[110px]
        transition-all duration-500 ease-out
        card-3d-hover animate-float
        ${
          isDarkTheme(theme)
            ? "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30"
            : "hover:shadow-2xl"
        }
      `}
    >
      <div
        className={`absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500 opacity-[0.05] blur-3xl rounded-full group-hover:opacity-15 transition-opacity`}
      ></div>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`${theme.textSub} text-[9px] font-bold uppercase mb-1 tracking-[0.1em] truncate`}
          >
            {label1}
          </span>
          <span
            className={`text-xl sm:text-2xl font-black ${theme.textHighlight} font-mono tracking-tighter truncate drop-shadow-md`}
          >
            {value1}{" "}
            <span className="text-[10px] font-medium text-slate-500 font-sans">
              {sub1}
            </span>
          </span>
        </div>
        <div
          className={`w-px h-12 bg-gradient-to-b from-transparent ${
            isDarkTheme(theme) ? "via-emerald-500/50" : "via-slate-400"
          } to-transparent flex-shrink-0`}
        ></div>
        <div className="flex flex-col items-end min-w-0 flex-1">
          <span
            className={`${colorClass} text-[9px] font-bold uppercase mb-1 tracking-[0.1em] truncate`}
          >
            {label2}
          </span>
          <span
            className={`text-base sm:text-lg lg:text-xl font-black font-mono ${colorClass} tracking-tight break-all text-right drop-shadow-md group-hover:scale-105 transition-transform`}
            title={value2}
          >
            {value2}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const isDarkTheme = (t) => t.bg.includes("0f172a") || t.bg.includes("050910");

// Componente MultiSelect (Seleção Múltipla)
const SearchableSelect = ({ label, options, value, onChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter((opt) =>
    String(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica para alternar seleção
  const toggleOption = (option) => {
    // Se clicar em "Todos", limpa a seleção (array vazio = todos)
    if (option === "Todos" || option === "Todas") {
      onChange([]);
    } else {
      let newValue = [...value];
      if (newValue.includes(option)) {
        // Se já existe, remove
        newValue = newValue.filter((item) => item !== option);
      } else {
        // Se não existe, adiciona
        newValue.push(option);
      }
      onChange(newValue);
    }
  };

  const isSelected = (option) => {
    if ((option === "Todos" || option === "Todas") && value.length === 0)
      return true;
    return value.includes(option);
  };

  // Texto para exibir no botão
  const getDisplayValue = () => {
    if (value.length === 0) return "Todos";
    if (value.length === 1) return value[0];
    return `${value.length} Selecionados`;
  };

  return (
    <div
      className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[150px] relative group no-print"
      ref={wrapperRef}
    >
      <div className="flex items-center gap-1 pl-1">
        <div
          className={`w-1 h-1 rounded-full ${
            isDarkTheme(theme)
              ? "bg-cyan-400 shadow-[0_0_5px_#22d3ee]"
              : "bg-blue-600"
          }`}
        ></div>
        <span
          className={`text-[9px] font-mono uppercase tracking-widest ${theme.labelNeon}`}
        >
          {label}
        </span>
      </div>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className={`${theme.inputBg} border ${
          isOpen
            ? "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            : theme.inputBorder
        } relative overflow-hidden rounded-md px-3 py-2 text-xs font-bold ${
          theme.textMain
        } outline-none w-full text-left flex justify-between items-center transition-all duration-300 hover:border-cyan-500/50`}
      >
        <span
          className="truncate block max-w-[120px] relative z-10"
          title={getDisplayValue()}
        >
          {getDisplayValue()}
        </span>
        <ChevronDown size={12} className={`${theme.textSub} relative z-10`} />
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out`}
        ></div>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 w-full sm:w-[220px] z-[9999] ${
            theme.dropdownBg
          } border ${
            theme.border
          } rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col backdrop-blur-xl ${
            isDarkTheme(theme) ? "ring-1 ring-cyan-500/30" : ""
          }`}
        >
          <div className={`p-2 border-b ${theme.border} bg-opacity-50`}>
            <div className="relative">
              <Search
                size={10}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSub}`}
              />
              <input
                autoFocus
                type="text"
                className={`w-full bg-transparent ${theme.textMain} text-xs rounded-md pl-8 pr-2 py-1.5 outline-none border ${theme.inputBorder} focus:border-cyan-500 transition-colors`}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className={`px-4 py-2 text-xs ${
                    theme.textMain
                  } hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer flex justify-between items-center transition-colors ${
                    isSelected(opt)
                      ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400"
                      : ""
                  }`}
                  onClick={() => toggleOption(opt)}
                >
                  <span>{opt}</span>
                  {isSelected(opt) && (
                    <Check size={12} className="text-cyan-400" />
                  )}
                </div>
              ))
            ) : (
              <div className={`p-3 text-xs ${theme.textSub} text-center`}>
                Nada encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BottomChartControls = ({
  view,
  setView,
  availableYears,
  selectedYear,
  setSelectedYear,
  availableMonthsInYear,
  selectedMonth,
  setSelectedMonth,
  theme,
}) => (
  <div
    className={`flex flex-wrap items-center gap-2 ${theme.inputBg} p-1 rounded-lg border ${theme.border} shadow-sm no-print`}
  >
    <div
      className={`flex ${
        isDarkTheme(theme) ? "bg-black/30" : "bg-slate-200"
      } rounded-md p-0.5`}
    >
      <button
        onClick={() => setView("day")}
        className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
          view === "day"
            ? "bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]"
            : `${theme.textSub} hover:text-cyan-500`
        }`}
      >
        <List size={12} /> DIAS
      </button>
      <button
        onClick={() => setView("month")}
        className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
          view === "month"
            ? "bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]"
            : `${theme.textSub} hover:text-cyan-500`
        }`}
      >
        <Grid size={12} /> MESES
      </button>
    </div>

    <div className="flex items-center gap-2 border-l border-slate-600 pl-2 ml-1">
      {view === "day" && (
        <div className="relative group">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className={`appearance-none bg-transparent ${theme.textMain} text-[10px] font-bold rounded py-1 pl-1 pr-4 focus:outline-none cursor-pointer uppercase hover:text-cyan-400 transition-colors`}
          >
            {availableMonthsInYear.map((mIdx) => (
              <option
                key={mIdx}
                value={mIdx}
                className="bg-slate-900 text-slate-200"
              >
                {MESES_COMPLETO[mIdx].toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${theme.textSub} group-hover:text-cyan-400 pointer-events-none`}
          />
        </div>
      )}
      <div className="relative group">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className={`appearance-none bg-transparent ${theme.textMain} text-[10px] font-bold rounded py-1 pl-1 pr-4 focus:outline-none cursor-pointer hover:text-cyan-400 transition-colors`}
        >
          {availableYears.map((y) => (
            <option key={y} value={y} className="bg-slate-900 text-slate-200">
              {y}
            </option>
          ))}
        </select>
        <ChevronDown
          size={10}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${theme.textSub} group-hover:text-cyan-400 pointer-events-none`}
        />
      </div>
    </div>
  </div>
);

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  themeMode,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x}
      y={y}
      fill={themeMode === "dark" ? "#fff" : "#1e293b"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight="800"
      style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const LoadingOverlay = ({ isVisible, theme }) => {
  if (!isVisible) return null;
  return (
    <div
      className={`fixed inset-0 ${
        isDarkTheme(theme) ? "bg-[#050910]/95" : "bg-white/90"
      } backdrop-blur-xl z-[100] flex flex-col items-center justify-center`}
    >
      <div className="relative">
        <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw size={24} className="text-cyan-400 animate-pulse" />
        </div>
      </div>
      <p
        className={`mt-6 ${theme.textMain} font-mono font-bold tracking-[0.3em] text-sm animate-pulse`}
      >
        CARREGANDO DADOS...
      </p>
    </div>
  );
};

export default function App() {
  // --- INJEÇÃO DE ESTILOS E SCRIPT DE PDF ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);

    // Injeção de dependências para Screenshot e PDF
    const script2 = document.createElement("script");
    script2.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
    document.head.appendChild(script2);

    // Injeção de dependências para PDF
    const script3 = document.createElement("script");
    script3.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script3);

    document.documentElement.lang = "pt";
    document.documentElement.setAttribute("translate", "no");
    const metaGoogle = document.createElement("meta");
    metaGoogle.name = "google";
    metaGoogle.content = "notranslate";
    document.head.appendChild(metaGoogle);

    const style = document.createElement("style");
    style.innerHTML = `
      body { top: 0 !important; } 
      .goog-te-banner-frame { display: none !important; } 
      .skiptranslate { display: none !important; }
      font { background-color: transparent !important; box-shadow: none !important; color: inherit !important; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 20px; }
      .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #475569; }
      
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .perspective-container { perspective: 1000px; }
      .card-3d-hover { transform-style: preserve-3d; }
      .card-3d-hover:hover { transform: rotateX(2deg) rotateY(2deg) scale(1.02); }
      
      /* ANIMAÇÃO DE TEXTO HOLOGRÁFICO MELHORADA */
      .animate-hologram {
        background: linear-gradient(90deg, #06b6d4, #a855f7, #ffffff, #06b6d4);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: hologramShine 3s linear infinite;
        filter: drop-shadow(0 0 5px rgba(6,182,212,0.8));
      }
      @keyframes hologramShine { 
        to { background-position: 200% center; }
      }
      @media print { .no-print { display: none !important; } }
    `;
    document.head.appendChild(style);
  }, []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [bottomChartView, setBottomChartView] = useState("day");
  const [bottomSelectedYear, setBottomSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [bottomSelectedMonth, setBottomSelectedMonth] = useState(
    new Date().getMonth()
  );
  const [topSelectedYear, setTopSelectedYear] = useState("Todos");
  const [topSelectedMonth, setTopSelectedMonth] = useState("Todos");

  const [columns, setColumns] = useState([]);
  const [numericCols, setNumericCols] = useState([]);
  const [textCols, setTextCols] = useState([]);
  const [dateCols, setDateCols] = useState([]);

  // Estados dos Filtros (Arrays para Multi-Select)
  const [filterMaterial, setFilterMaterial] = useState([]);
  const [filterMarca, setFilterMarca] = useState([]);
  const [filterCategoria, setFilterCategoria] = useState([]);
  const [filterPosicao, setFilterPosicao] = useState([]);
  const [filterPeriodo, setFilterPeriodo] = useState([]);
  const [filterClassificacao, setFilterClassificacao] = useState([]);

  const [colMaterialName, setColMaterialName] = useState(null);
  const [colMarcaName, setColMarcaName] = useState(null);
  const [colCategoriaName, setColCategoriaName] = useState(null);
  const [colPosicaoName, setColPosicaoName] = useState(null);
  const [colPeriodoName, setColPeriodoName] = useState(null);
  const [colFornecedorName, setColFornecedorName] = useState(null);
  const [colClassificacaoName, setColClassificacaoName] = useState(null);

  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedDateCol, setSelectedDateCol] = useState("");

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const entry = {};
      headers.forEach((h, i) => {
        let val = values[i] ? values[i].trim().replace(/"/g, "") : "";
        if (val.includes("R$") || (val.includes(",") && val.includes(".")))
          val = val
            .replace("R$", "")
            .trim()
            .replace(/\./g, "")
            .replace(",", ".");
        else if (val.includes(",")) val = val.replace(",", ".");
        const isDate =
          val.includes("/") || val.includes(":") || val.includes("-");
        if (!isNaN(parseFloat(val)) && isFinite(val) && val !== "" && !isDate)
          val = parseFloat(val);
        entry[h] = val;
      });
      return entry;
    });
  };

  const findCol = (keywords, list) => {
    const lowerCols = list.map((c) => c.toLowerCase());
    for (let key of keywords) {
      const found = list.find((c) => c.toLowerCase().includes(key));
      if (found) return found;
    }
    return null;
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      if (isRefresh) await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await fetch(`${CSV_URL}&t=${new Date().getTime()}`);
      if (!response.ok) throw new Error("Falha");
      const text = await response.text();
      const parsedData = parseCSV(text);
      if (parsedData.length > 0) {
        const cols = Object.keys(parsedData[0]);
        setColumns(cols);
        const nums = cols.filter((k) => typeof parsedData[0][k] === "number");
        const txts = cols.filter((k) => typeof parsedData[0][k] === "string");
        const dates = cols.filter((k) => {
          const name = k.toLowerCase();
          const val = String(parsedData[0][k]);
          return (
            name.includes("data") ||
            name.includes("date") ||
            name.includes("dia") ||
            (val.length > 5 && (val.includes("/") || val.includes("-")))
          );
        });
        setNumericCols(nums);
        setTextCols(txts);
        setDateCols(dates);

        const matCol = findCol(["tipo_material", "material", "tipo"], txts);
        const marcaCol = findCol(["marca", "brand", "fabricante"], txts);
        const catCol = findCol(["categoria", "category", "grupo"], txts);
        const posCol = findCol(
          ["posicao", "posição", "deposito", "depósito", "local", "armazem"],
          txts
        );
        const perCol = findCol(
          ["periodo", "período", "turno", "shift", "horario"],
          txts
        );
        const fornCol = findCol(
          ["fornecedor", "vendor", "supplier", "parceiro"],
          txts
        );
        const classCol = findCol(
          ["classificacao", "classificação", "classe", "class", "rank"],
          txts
        );

        if (catCol) {
          parsedData.forEach((row) => {
            if (typeof row[catCol] === "string") {
              if (row[catCol].trim().toLowerCase() === "vestuario") {
                row[catCol] = "Vestuário";
              }
            }
          });
        }
        setColMaterialName(matCol);
        setColMarcaName(marcaCol);
        setColCategoriaName(catCol);
        setColPosicaoName(posCol);
        setColPeriodoName(perCol);
        setColFornecedorName(fornCol);
        setColClassificacaoName(classCol);
        setData(parsedData);
        setLastUpdated(new Date());
        if (nums.length > 0) setSelectedMetric(nums[0]);
        if (dates.length > 0) setSelectedDateCol(dates[0]);
      }
    } catch (err) {
      setError("Erro ao ler dados.");
      loadMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMockData = () => {
    const mockData = [
      {
        Produto: "Item A",
        Data: "01/02/2026",
        Qtd: 10,
        Custo: 100,
        CustoTotal: 1000,
        Marca: "Samsung",
        Categoria: "Eletrônicos",
        Material: "Retail",
        Posicao: "A-01",
        Periodo: "Manhã",
        Fornecedor: "Loggi",
        Classificacao: "A",
      },
      {
        Produto: "Item B",
        Data: "02/02/2026",
        Qtd: 20,
        Custo: 150,
        CustoTotal: 3000,
        Marca: "Dell",
        Categoria: "Informática",
        Material: "Fulfillment",
        Posicao: "B-02",
        Periodo: "Tarde",
        Fornecedor: "Sedex",
        Classificacao: "B",
      },
      {
        Produto: "Item A",
        Data: "03/02/2026",
        Qtd: 15,
        Custo: 100,
        CustoTotal: 1500,
        Marca: "Samsung",
        Categoria: "Eletrônicos",
        Material: "Retail",
        Posicao: "A-01",
        Periodo: "Manhã",
        Fornecedor: "Loggi",
        Classificacao: "A",
      },
      {
        Produto: "Item C",
        Data: "04/02/2026",
        Qtd: 5,
        Custo: 500,
        CustoTotal: 2500,
        Marca: "Apple",
        Categoria: "Informática",
        Material: "Fulfillment",
        Posicao: "C-03",
        Periodo: "Noite",
        Fornecedor: "Jadlog",
        Classificacao: "C",
      },
      {
        Produto: "Item B",
        Data: "04/02/2026",
        Qtd: 8,
        Custo: 150,
        CustoTotal: 1200,
        Marca: "Dell",
        Categoria: "Informática",
        Material: "Retail",
        Posicao: "B-02",
        Periodo: "Tarde",
        Fornecedor: "Sedex",
        Classificacao: "B",
      },
    ];
    setData(mockData);
    setLastUpdated(new Date());
    const cols = Object.keys(mockData[0]);
    setColumns(cols);
    setNumericCols(["Qtd", "Custo", "CustoTotal"]);
    setTextCols([
      "Produto",
      "Marca",
      "Categoria",
      "Material",
      "Posicao",
      "Periodo",
      "Fornecedor",
      "Classificacao",
    ]);
    setDateCols(["Data"]);
    setColMaterialName("Material");
    setColMarcaName("Marca");
    setColCategoriaName("Categoria");
    setColPosicaoName("Posicao");
    setColPeriodoName("Periodo");
    setColFornecedorName("Fornecedor");
    setColClassificacaoName("Classificacao");
    setSelectedMetric("CustoTotal");
    setSelectedDateCol("Data");
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const commonFilteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        colMaterialName &&
        filterMaterial.length > 0 &&
        !filterMaterial.includes(item[colMaterialName])
      )
        return false;
      if (
        colMarcaName &&
        filterMarca.length > 0 &&
        !filterMarca.includes(item[colMarcaName])
      )
        return false;
      if (
        colCategoriaName &&
        filterCategoria.length > 0 &&
        !filterCategoria.includes(item[colCategoriaName])
      )
        return false;
      if (
        colPosicaoName &&
        filterPosicao.length > 0 &&
        !filterPosicao.includes(item[colPosicaoName])
      )
        return false;
      if (
        colPeriodoName &&
        filterPeriodo.length > 0 &&
        !filterPeriodo.includes(item[colPeriodoName])
      )
        return false;
      if (
        colClassificacaoName &&
        filterClassificacao.length > 0 &&
        !filterClassificacao.includes(item[colClassificacaoName])
      )
        return false;
      return true;
    });
  }, [
    data,
    filterMaterial,
    filterMarca,
    filterCategoria,
    filterPosicao,
    filterPeriodo,
    filterClassificacao,
    colMaterialName,
    colMarcaName,
    colCategoriaName,
    colPosicaoName,
    colPeriodoName,
    colClassificacaoName,
  ]);

  // Função CASCATA (Filtro Inteligente)
  const getAvailableOptions = (targetCol) => {
    if (!targetCol) return [];
    // Filtra dados considerando TODOS os filtros ativos (inclusive o próprio, para refinamento contextual)
    const validData = data.filter((item) => {
      if (
        colMaterialName &&
        targetCol !== colMaterialName &&
        filterMaterial.length > 0 &&
        !filterMaterial.includes(item[colMaterialName])
      )
        return false;
      if (
        colMarcaName &&
        targetCol !== colMarcaName &&
        filterMarca.length > 0 &&
        !filterMarca.includes(item[colMarcaName])
      )
        return false;
      if (
        colCategoriaName &&
        targetCol !== colCategoriaName &&
        filterCategoria.length > 0 &&
        !filterCategoria.includes(item[colCategoriaName])
      )
        return false;
      if (
        colPosicaoName &&
        targetCol !== colPosicaoName &&
        filterPosicao.length > 0 &&
        !filterPosicao.includes(item[colPosicaoName])
      )
        return false;
      if (
        colPeriodoName &&
        targetCol !== colPeriodoName &&
        filterPeriodo.length > 0 &&
        !filterPeriodo.includes(item[colPeriodoName])
      )
        return false;
      if (
        colClassificacaoName &&
        targetCol !== colClassificacaoName &&
        filterClassificacao.length > 0 &&
        !filterClassificacao.includes(item[colClassificacaoName])
      )
        return false;
      return true;
    });
    const values = Array.from(
      new Set(validData.map((d) => d[targetCol]).filter(Boolean))
    ).sort();
    return [
      targetCol === colMaterialName || targetCol === colPeriodoName
        ? "Todos"
        : "Todas",
      ...values,
    ];
  };

  const materialOptions = useMemo(
    () => getAvailableOptions(colMaterialName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );
  const marcaOptions = useMemo(
    () => getAvailableOptions(colMarcaName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );
  const categoriaOptions = useMemo(
    () => getAvailableOptions(colCategoriaName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );
  const posicaoOptions = useMemo(
    () => getAvailableOptions(colPosicaoName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );
  const periodoOptions = useMemo(
    () => getAvailableOptions(colPeriodoName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );
  const classificacaoOptions = useMemo(
    () => getAvailableOptions(colClassificacaoName),
    [
      data,
      filterMaterial,
      filterMarca,
      filterCategoria,
      filterPosicao,
      filterPeriodo,
      filterClassificacao,
      colMaterialName,
      colMarcaName,
      colCategoriaName,
      colPosicaoName,
      colPeriodoName,
      colClassificacaoName,
    ]
  );

  const validDates = useMemo(() => {
    if (!selectedDateCol) return [];
    return commonFilteredData
      .map((row) => {
        const rawDate = row[selectedDateCol];
        if (typeof rawDate === "string") {
          const parts = rawDate
            .split(" ")[0]
            .split(rawDate.includes("/") ? "/" : "-");
          if (parts.length === 3) {
            let year, month;
            if (parts[0].length === 4) {
              year = parseInt(parts[0]);
              month = parseInt(parts[1]) - 1;
            } else {
              year = parseInt(parts[2]);
              month = parseInt(parts[1]) - 1;
            }
            if (!isNaN(year) && !isNaN(month)) return { year, month };
          }
        }
        return null;
      })
      .filter(Boolean);
  }, [commonFilteredData, selectedDateCol]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(validDates.map((d) => d.year)))
      .sort()
      .reverse();
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [validDates]);

  const topFilterYears = useMemo(
    () => ["Todos", ...availableYears],
    [availableYears]
  );
  const topFilterMonths = useMemo(() => {
    if (topSelectedYear === "Todos") return ["Todos"];
    const months = new Set();
    validDates.forEach((d) => {
      if (d.year === parseInt(topSelectedYear)) months.add(d.month);
    });
    const sortedMonths = Array.from(months).sort((a, b) => a - b);
    return ["Todos", ...sortedMonths];
  }, [validDates, topSelectedYear]);

  useEffect(() => {
    if (
      availableYears.length > 0 &&
      !availableYears.includes(bottomSelectedYear)
    ) {
      setBottomSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  const topSectionData = useMemo(() => {
    return commonFilteredData.filter((row) => {
      if (topSelectedYear === "Todos") return true;
      const rawDate = row[selectedDateCol];
      if (typeof rawDate !== "string") return false;
      const parts = rawDate
        .split(" ")[0]
        .split(rawDate.includes("/") ? "/" : "-");
      if (parts.length !== 3) return false;
      let year, month;
      if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
      } else {
        year = parseInt(parts[2]);
        month = parseInt(parts[1]) - 1;
      }
      if (year !== parseInt(topSelectedYear)) return false;
      if (topSelectedMonth !== "Todos" && month !== parseInt(topSelectedMonth))
        return false;
      return true;
    });
  }, [commonFilteredData, selectedDateCol, topSelectedYear, topSelectedMonth]);

  const colQtd = findCol(
    ["qtd", "quantidade", "quant", "quantity", "vol"],
    numericCols
  );
  const colTotal = findCol(
    ["custo total", "total", "vlr total", "montante"],
    numericCols
  );
  const colSku =
    findCol(["sku", "codigo", "produto", "item"], textCols) || textCols[0];

  const somaQtd = colQtd
    ? topSectionData.reduce((acc, curr) => acc + (curr[colQtd] || 0), 0)
    : 0;
  const somaTotal = colTotal
    ? topSectionData.reduce((acc, curr) => acc + (curr[colTotal] || 0), 0)
    : 0;
  const contagemSkus = useMemo(
    () =>
      colSku ? new Set(topSectionData.map((item) => item[colSku])).size : 0,
    [topSectionData, colSku]
  );

  const pieDataCategoria = useMemo(() => {
    if (!colCategoriaName || !colQtd) return [];
    const grouped = topSectionData.reduce((acc, curr) => {
      let key = curr[colCategoriaName];
      if (key) key = String(key).trim();
      if (
        !key ||
        key === "Não Inf." ||
        key === "" ||
        key.toLowerCase() === "undefined" ||
        key.toLowerCase() === "null"
      )
        return acc;
      if (!acc[key]) acc[key] = 0;
      acc[key] += curr[colQtd] || 0;
      return acc;
    }, {});
    // Filtra valores zerados para não bugar o gráfico
    return Object.keys(grouped)
      .map((key) => ({ name: key, value: grouped[key] }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [topSectionData, colCategoriaName, colQtd]);

  const pieDataMaterial = useMemo(() => {
    if (!colMaterialName || !colQtd) return [];
    const grouped = topSectionData.reduce((acc, curr) => {
      let key = curr[colMaterialName];
      if (key) key = String(key).trim();
      if (
        !key ||
        key === "Não Inf." ||
        key === "" ||
        key.toLowerCase() === "undefined" ||
        key.toLowerCase() === "null"
      )
        return acc;
      if (!acc[key]) acc[key] = 0;
      acc[key] += curr[colQtd] || 0;
      return acc;
    }, {});
    return Object.keys(grouped)
      .map((key) => ({ name: key, value: grouped[key] }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [topSectionData, colMaterialName, colQtd]);

  const listDataFornecedor = useMemo(() => {
    const targetCol = colFornecedorName || colMarcaName;
    if (!targetCol || !colQtd || !colTotal) return [];
    const grouped = topSectionData.reduce((acc, curr) => {
      let key = curr[targetCol];
      if (
        !key ||
        String(key).trim() === "" ||
        String(key).toLowerCase() === "null" ||
        String(key).toLowerCase() === "undefined"
      )
        return acc;
      key = String(key).trim();
      if (!acc[key]) acc[key] = { name: key, qtd: 0, cost: 0 };
      acc[key].qtd += curr[colQtd] || 0;
      acc[key].cost += curr[colTotal] || 0;
      return acc;
    }, {});

    const arr = Object.values(grouped).filter((item) => item.qtd > 0);
    const totalQtdList = arr.reduce((acc, item) => acc + item.qtd, 0);
    return arr
      .map((item) => ({
        ...item,
        percent: totalQtdList > 0 ? (item.qtd / totalQtdList) * 100 : 0,
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 50);
  }, [topSectionData, colFornecedorName, colMarcaName, colQtd, colTotal]);

  const listDataPosicao = useMemo(() => {
    if (!colPosicaoName || !colQtd || !colTotal) return [];
    const grouped = topSectionData.reduce((acc, curr) => {
      let key = curr[colPosicaoName];
      if (
        !key ||
        String(key).trim() === "" ||
        String(key).toLowerCase() === "sem posição" ||
        String(key).toLowerCase().includes("sem posicao") ||
        String(key).toLowerCase() === "null" ||
        String(key).toLowerCase() === "undefined"
      )
        return acc;
      key = String(key).trim();
      if (!acc[key]) acc[key] = { name: key, qtd: 0, cost: 0 };
      acc[key].qtd += curr[colQtd] || 0;
      acc[key].cost += curr[colTotal] || 0;
      return acc;
    }, {});

    const arr = Object.values(grouped).filter((item) => item.qtd > 0);
    const totalQtdList = arr.reduce((acc, item) => acc + item.qtd, 0);
    return arr
      .map((item) => ({
        ...item,
        percent: totalQtdList > 0 ? (item.qtd / totalQtdList) * 100 : 0,
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 50);
  }, [topSectionData, colPosicaoName, colQtd, colTotal]);

  const bottomAvailableMonthsInYear = useMemo(() => {
    const months = new Set();
    validDates.forEach((d) => {
      if (d.year === bottomSelectedYear) months.add(d.month);
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [validDates, bottomSelectedYear]);

  useEffect(() => {
    if (
      bottomAvailableMonthsInYear.length > 0 &&
      !bottomAvailableMonthsInYear.includes(bottomSelectedMonth)
    ) {
      setBottomSelectedMonth(
        bottomAvailableMonthsInYear[bottomAvailableMonthsInYear.length - 1]
      );
    }
  }, [bottomAvailableMonthsInYear]);

  const timeChartData = useMemo(() => {
    if (!selectedDateCol || !colQtd || !colTotal) return [];
    const dataMap = {};
    commonFilteredData.forEach((row) => {
      const rawDate = row[selectedDateCol];
      if (typeof rawDate === "string") {
        let parts = rawDate
          .split(" ")[0]
          .split(rawDate.includes("/") ? "/" : "-");
        if (parts.length === 3) {
          let day, month, year;
          if (parts[0].length === 4) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
          } else {
            year = parseInt(parts[2]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[0]);
          }
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          if (!dataMap[key])
            dataMap[key] = { qtd: 0, cost: 0, day, month, year };
          dataMap[key].qtd += row[colQtd] || 0;
          dataMap[key].cost += row[colTotal] || 0;
        }
      }
    });

    let finalData = [];
    if (bottomChartView === "month") {
      for (let m = 0; m < 12; m++) {
        let monthlyQtd = 0;
        let monthlyCost = 0;
        Object.values(dataMap).forEach((d) => {
          if (d.year === bottomSelectedYear && d.month === m) {
            monthlyQtd += d.qtd;
            monthlyCost += d.cost;
          }
        });
        finalData.push({
          date: MESES_ABREV[m],
          sortKey: `${bottomSelectedYear}-${String(m).padStart(2, "0")}`,
          qtd: monthlyQtd,
          cost: monthlyCost,
        });
      }
    } else {
      const daysInMonth = new Date(
        bottomSelectedYear,
        bottomSelectedMonth + 1,
        0
      ).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        let dailyQtd = 0;
        let dailyCost = 0;
        const key = `${bottomSelectedYear}-${String(
          bottomSelectedMonth + 1
        ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (dataMap[key]) {
          dailyQtd = dataMap[key].qtd;
          dailyCost = dataMap[key].cost;
        }
        finalData.push({
          date: `${String(d).padStart(2, "0")}/${
            MESES_ABREV[bottomSelectedMonth]
          }`,
          sortKey: key,
          qtd: dailyQtd,
          cost: dailyCost,
        });
      }
    }
    return finalData;
  }, [
    commonFilteredData,
    selectedDateCol,
    colQtd,
    colTotal,
    bottomChartView,
    bottomSelectedYear,
    bottomSelectedMonth,
  ]);

  const fmtBRL = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtNum = (val) => val.toLocaleString("pt-BR");
  const fmtRankingCurrency = (val) => {
    const fixedVal = Number(val.toFixed(2));
    if (fixedVal >= 1000000) return `R$ ${(fixedVal / 1000000).toFixed(1)}M`;
    if (fixedVal >= 100000) return `R$ ${(fixedVal / 1000).toFixed(0)}k`;
    return fixedVal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const fmtCompactBRL = (val) =>
    val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : `R$${val}`;

  const { viewTotalQtd, viewTotalCost } = useMemo(() => {
    return timeChartData.reduce(
      (acc, curr) => ({
        viewTotalQtd: acc.viewTotalQtd + curr.qtd,
        viewTotalCost: acc.viewTotalCost + curr.cost,
      }),
      { viewTotalQtd: 0, viewTotalCost: 0 }
    );
  }, [timeChartData]);

  const mediaVal =
    timeChartData.length > 0
      ? (viewTotalQtd / timeChartData.length).toFixed(0)
      : 0;
  const ticketMedioVal = viewTotalQtd > 0 ? viewTotalCost / viewTotalQtd : 0;
  const mediaCostVal =
    timeChartData.length > 0 ? viewTotalCost / timeChartData.length : 0;

  // Função de Download/Impressão PDF
  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading && !refreshing)
    return (
      <div
        className={`flex items-center justify-center h-screen ${theme.bg} ${theme.textMain} notranslate`}
        translate="no"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm uppercase tracking-widest animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );

  return (
    <div
      id="dashboard-container"
      className={`h-screen w-screen ${theme.bg} font-sans ${theme.textMain} flex flex-col notranslate overflow-y-auto lg:overflow-hidden`}
      translate="no"
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: ${theme.scrollThumb}; }
        
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .perspective-container { perspective: 1000px; }
        .card-3d-hover { transform-style: preserve-3d; }
        .card-3d-hover:hover { transform: rotateX(2deg) rotateY(2deg) scale(1.02); }
        .animate-neon-flow {
           background: linear-gradient(90deg, #06b6d4, #e879f9, #ffffff, #06b6d4);
           background-size: 300% 100%;
           -webkit-background-clip: text;
           background-clip: text;
           color: transparent;
           animation: hologramFlow 5s linear infinite;
           filter: drop-shadow(0 0 3px rgba(34,211,238,0.5));
        }
        @keyframes hologramFlow { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <GradientDefs />
      </svg>

      <LoadingOverlay isVisible={refreshing} theme={theme} />

      {/* --- HEADER --- */}
      <div className="flex-none px-4 pt-3 pb-2 z-20">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
              <RotateCcw className="text-white" size={20} />
            </div>
            <div>
              <h1
                className={`text-xl font-black tracking-tight leading-none ${
                  isDarkMode ? "animate-neon-flow" : "text-slate-900"
                }`}
              >
                DEVOLUÇÃO
              </h1>
              <p className={`${theme.textSub} text-[10px] tracking-widest`}>
                PAINEL DE CONTROLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 no-print">
            <span
              className={`text-[10px] font-mono ${theme.textMain} flex items-center gap-1`}
            >
              <Clock size={10} />{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--"}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1.5 rounded-lg ${theme.card} border ${theme.border} hover:border-cyan-500 hover:text-cyan-400 transition-all`}
                title="Alternar Tema"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={handleRefresh}
                className={`p-1.5 rounded-lg ${theme.card} border ${theme.border} hover:border-cyan-500 hover:text-cyan-400 transition-all`}
                title="Atualizar"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div
          className={`relative ${theme.card} p-2 rounded-lg border ${theme.border} flex flex-col md:flex-row flex-wrap items-center gap-3 justify-between shadow-[0_0_15px_rgba(0,0,0,0.1)] no-print`}
        >
          <div className="w-full md:hidden flex justify-between items-center">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMain} flex items-center gap-1`}
            >
              <Filter size={12} /> Filtros
            </span>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className={`p-1 rounded bg-cyan-600 text-white`}
            >
              {showFiltersMobile ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          </div>
          <div
            className={`${
              showFiltersMobile ? "flex" : "hidden"
            } md:flex flex-wrap gap-2 w-full md:w-auto`}
          >
            <div
              className={`hidden md:flex items-center gap-1 pr-3 border-r ${theme.border} h-6 flex-shrink-0`}
            >
              <SlidersHorizontal className="text-cyan-400" size={16} />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${theme.labelNeon}`}
              >
                Filtros
              </span>
            </div>
            {colMaterialName && (
              <SearchableSelect
                label="Material"
                options={materialOptions}
                value={filterMaterial}
                onChange={setFilterMaterial}
                theme={theme}
              />
            )}
            {colMarcaName && (
              <SearchableSelect
                label="Marca"
                options={marcaOptions}
                value={filterMarca}
                onChange={setFilterMarca}
                theme={theme}
              />
            )}
            {colCategoriaName && (
              <SearchableSelect
                label="Categoria"
                options={categoriaOptions}
                value={filterCategoria}
                onChange={setFilterCategoria}
                theme={theme}
              />
            )}
            {colPosicaoName && (
              <SearchableSelect
                label="Posição"
                options={posicaoOptions}
                value={filterPosicao}
                onChange={setFilterPosicao}
                theme={theme}
              />
            )}
            {colPeriodoName && (
              <SearchableSelect
                label="Período"
                options={periodoOptions}
                value={filterPeriodo}
                onChange={setFilterPeriodo}
                theme={theme}
              />
            )}
            {colClassificacaoName && (
              <SearchableSelect
                label="Classificação"
                options={classificacaoOptions}
                value={filterClassificacao}
                onChange={setFilterClassificacao}
                theme={theme}
              />
            )}
          </div>
          <div
            className={`flex items-center gap-2 md:pl-3 md:border-l ${theme.border} w-full md:w-auto justify-end`}
          >
            <span
              className={`${theme.textSub} text-[9px] font-bold uppercase flex items-center gap-1`}
            >
              <Calendar size={10} /> KPI
            </span>
            <div className="flex gap-1">
              <div className="relative h-6 flex items-center">
                <select
                  value={topSelectedYear}
                  onChange={(e) => setTopSelectedYear(e.target.value)}
                  className={`appearance-none ${theme.inputBg} border ${theme.inputBorder} ${theme.textMain} text-[10px] font-bold rounded pl-2 pr-5 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer`}
                >
                  {topFilterYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 ${theme.textSub} pointer-events-none`}
                />
              </div>
              {topSelectedYear !== "Todos" && (
                <div className="relative h-6 flex items-center">
                  <select
                    value={topSelectedMonth}
                    onChange={(e) => setTopSelectedMonth(e.target.value)}
                    className={`appearance-none ${theme.inputBg} border ${theme.inputBorder} ${theme.textMain} text-[10px] font-bold rounded pl-2 pr-5 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer uppercase`}
                  >
                    {topFilterMonths.map((m) => (
                      <option key={m} value={m}>
                        {m === "Todos" ? "TODOS" : MESES_ABREV[m].toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={10}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 ${theme.textSub} pointer-events-none`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="flex-1 flex flex-col gap-3 px-4 pb-4 lg:min-h-0 lg:overflow-hidden overflow-y-auto">
        {/* ROW 1: KPIS */}
        <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-3 lg:h-[13%] min-h-[110px]">
          <Card
            title="TOTAL ITENS"
            value={colQtd ? fmtNum(somaQtd) : "N/A"}
            icon={Package}
            colorClass="text-cyan-400"
            bgClass="from-cyan-500"
            theme={theme}
          />
          <Card
            title="TOTAL SKUS"
            value={fmtNum(contagemSkus)}
            icon={Tag}
            colorClass="text-purple-400"
            bgClass="from-purple-500"
            theme={theme}
          />
          <Card
            title="CUSTO TOTAL"
            value={colTotal ? fmtBRL(somaTotal) : "N/A"}
            icon={DollarSign}
            colorClass="text-emerald-400"
            bgClass="from-emerald-500"
            theme={theme}
          />
          <SummaryCard
            label1={bottomChartView === "day" ? "Média Diária" : "Média Mensal"}
            value1={mediaVal}
            sub1="un"
            label2={
              bottomChartView === "day"
                ? "Custo Médio (Dia)"
                : "Custo Médio (Mês)"
            }
            value2={fmtBRL(mediaCostVal)}
            colorClass="text-emerald-400"
            theme={theme}
          />
        </div>

        {/* ROW 2: TEMPORAL */}
        <div className="flex-none lg:flex-1 min-h-[500px] lg:min-h-0">
          <div
            className={`flex flex-col h-full ${theme.card} rounded-2xl border ${theme.border} ${theme.shadow} p-4`}
          >
            <div className="flex-none flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="text-cyan-400" size={18} />
                <h3
                  className={`text-sm font-bold ${theme.textHighlight} tracking-wide`}
                >
                  EVOLUÇÃO TEMPORAL
                </h3>
              </div>
              <BottomChartControls
                view={bottomChartView}
                setView={setBottomChartView}
                availableYears={availableYears}
                selectedYear={bottomSelectedYear}
                setSelectedYear={setBottomSelectedYear}
                availableMonthsInYear={bottomAvailableMonthsInYear}
                selectedMonth={bottomSelectedMonth}
                setSelectedMonth={setBottomSelectedMonth}
                theme={theme}
              />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:min-h-0">
              <div className="relative w-full h-[250px] lg:h-full">
                <div className="flex justify-between items-center mb-2">
                  <h4
                    className={`text-xs font-bold ${theme.textSub} uppercase tracking-widest flex items-center gap-2`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]"></div>{" "}
                    Volume Físico
                  </h4>
                </div>
                <div className="flex-1 h-[calc(100%-24px)] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeChartData}
                      margin={{ top: 35, right: 10, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#06b6d4"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#06b6d4"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? "#1f2937" : "#e2e8f0"}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: theme.chartLabel,
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                        interval="preserveStartEnd"
                        minTickGap={10}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.chartLabel, fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{
                          fill: isDarkMode ? "#1f2937" : "#f1f5f9",
                          opacity: 0.4,
                        }}
                        contentStyle={{
                          backgroundColor: theme.tooltipBg,
                          borderColor: theme.tooltipBorder,
                          borderRadius: "8px",
                          color: theme.tooltipText,
                          boxShadow: "0 0 10px rgba(6,182,212,0.2)",
                        }}
                      />
                      <Bar
                        dataKey="qtd"
                        name="Qtd"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                        filter="url(#neonGlow)"
                      >
                        <LabelList
                          dataKey="qtd"
                          position="top"
                          fill={theme.chartLabel}
                          fontSize={12}
                          fontWeight="bold"
                          formatter={(val) => (val > 0 ? val : "")}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="relative w-full h-[250px] lg:h-full">
                <div className="flex justify-between items-center mb-2">
                  <h4
                    className={`text-xs font-bold ${theme.textSub} uppercase tracking-widest flex items-center gap-2`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_5px_#8b5cf6]"></div>{" "}
                    Volume Financeiro
                  </h4>
                </div>
                <div className="flex-1 h-[calc(100%-24px)] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeChartData}
                      margin={{ top: 35, right: 10, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? "#1f2937" : "#e2e8f0"}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: theme.chartLabel,
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                        interval="preserveStartEnd"
                        minTickGap={10}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.chartLabel, fontSize: 10 }}
                        tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.tooltipBg,
                          borderColor: theme.tooltipBorder,
                          borderRadius: "8px",
                          color: theme.tooltipText,
                          boxShadow: "0 0 10px rgba(139,92,246,0.2)",
                        }}
                        formatter={(val) => fmtBRL(val)}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        name="Custo"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#areaGradient)"
                        dot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: theme.card,
                          stroke: "#8b5cf6",
                        }}
                        filter="url(#neonGlow)"
                      >
                        <LabelList
                          dataKey="cost"
                          position="top"
                          fill={theme.chartLabel}
                          fontSize={11}
                          fontWeight="bold"
                          formatter={(val) =>
                            val > 0 ? fmtCompactBRL(val) : ""
                          }
                        />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: BOTTOM CHARTS */}
        <div className="flex-none h-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:flex-1 lg:min-h-0">
          {/* PIE 1 */}
          <div
            className={`${theme.card} p-3 rounded-xl border ${theme.border} ${theme.shadow} flex flex-col w-full h-[300px] lg:h-full`}
          >
            <div className="flex items-center gap-2 mb-2">
              <PieIcon className="text-violet-400" size={14} />
              <h3
                className={`text-xs font-bold ${theme.textHighlight} tracking-wide`}
              >
                CATEGORIA
              </h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {pieDataCategoria.length > 0 ? (
                    <Pie
                      data={pieDataCategoria}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      label={(props) =>
                        renderCustomizedLabel({
                          ...props,
                          themeMode: isDarkMode ? "dark" : "light",
                        })
                      }
                      labelLine={false}
                    >
                      {pieDataCategoria.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#pieGrad${index % COLORS.length})`}
                        />
                      ))}
                    </Pie>
                  ) : (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill={theme.textSub}
                      fontSize={12}
                    >
                      Sem dados
                    </text>
                  )}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.tooltipBg,
                      borderColor: theme.tooltipBorder,
                      borderRadius: "8px",
                      color: theme.tooltipText,
                    }}
                    formatter={(value) => fmtNum(value)}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{
                      fontSize: "10px",
                      color: theme.textSub,
                      paddingTop: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE 2 */}
          <div
            className={`${theme.card} p-3 rounded-xl border ${theme.border} ${theme.shadow} flex flex-col w-full h-[300px] lg:h-full`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="text-rose-400" size={14} />
              <h3
                className={`text-xs font-bold ${theme.textHighlight} tracking-wide`}
              >
                MATERIAL
              </h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {pieDataMaterial.length > 0 ? (
                    <Pie
                      data={pieDataMaterial}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      label={(props) =>
                        renderCustomizedLabel({
                          ...props,
                          themeMode: isDarkMode ? "dark" : "light",
                        })
                      }
                      labelLine={false}
                    >
                      {pieDataMaterial.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#pieGrad${(index + 3) % COLORS.length})`}
                        />
                      ))}
                    </Pie>
                  ) : (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill={theme.textSub}
                      fontSize={12}
                    >
                      Sem dados
                    </text>
                  )}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.tooltipBg,
                      borderColor: theme.tooltipBorder,
                      borderRadius: "8px",
                      color: theme.tooltipText,
                    }}
                    formatter={(value) => fmtNum(value)}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{
                      fontSize: "10px",
                      color: theme.textSub,
                      paddingTop: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RANKING POSIÇÃO - NEON */}
          <div
            className={`${theme.card} p-3 rounded-xl border ${theme.border} ${theme.shadow} flex flex-col w-full h-[300px] lg:h-full overflow-hidden`}
          >
            <div
              className={`flex items-center gap-2 mb-2 pb-1 border-b ${theme.border}`}
            >
              <MapPin className="text-orange-400" size={14} />
              <h3
                className={`text-xs font-bold ${theme.textHighlight} tracking-wide`}
              >
                POSIÇÕES
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
              {listDataPosicao.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-bold w-4 h-4 flex-shrink-0 flex items-center justify-center rounded ${
                        idx < 3
                          ? "bg-orange-500/20 text-orange-400"
                          : `${
                              isDarkTheme(theme)
                                ? "bg-slate-700"
                                : "bg-slate-200"
                            } ${theme.textSub}`
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-[10px] ${theme.textMain} font-medium truncate`}
                      >
                        {item.name}
                      </span>
                      <div
                        className={`w-full h-1 ${
                          isDarkTheme(theme) ? "bg-slate-700" : "bg-slate-200"
                        } rounded-full mt-0.5 overflow-hidden`}
                      >
                        <div
                          className="h-full bg-orange-500 shadow-[0_0_8px_#f97316]"
                          style={{
                            width: `${Math.min(item.percent * 2, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-1">
                    <span
                      className={`text-[10px] ${theme.textHighlight} font-bold`}
                    >
                      {fmtNum(item.qtd)}
                    </span>
                    <span className={`text-[8px] ${theme.textSub}`}>
                      {fmtRankingCurrency(item.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RANKING FORNECEDOR - NEON */}
          <div
            className={`${theme.card} p-3 rounded-xl border ${theme.border} ${theme.shadow} flex flex-col w-full h-[300px] lg:h-full overflow-hidden`}
          >
            <div
              className={`flex items-center gap-2 mb-2 pb-1 border-b ${theme.border}`}
            >
              <ShoppingBag className="text-cyan-400" size={14} />
              <h3
                className={`text-xs font-bold ${theme.textHighlight} tracking-wide`}
              >
                FORNECEDORES
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
              {listDataFornecedor.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-bold w-4 h-4 flex-shrink-0 flex items-center justify-center rounded ${
                        idx < 3
                          ? "bg-cyan-500/20 text-cyan-400"
                          : `${
                              isDarkTheme(theme)
                                ? "bg-slate-700"
                                : "bg-slate-200"
                            } ${theme.textSub}`
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-[10px] ${theme.textMain} font-medium truncate`}
                      >
                        {item.name}
                      </span>
                      <div
                        className={`w-full h-1 ${
                          isDarkTheme(theme) ? "bg-slate-700" : "bg-slate-200"
                        } rounded-full mt-0.5 overflow-hidden`}
                      >
                        <div
                          className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"
                          style={{
                            width: `${Math.min(item.percent * 2, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-1">
                    <span
                      className={`text-[10px] ${theme.textHighlight} font-bold`}
                    >
                      {fmtNum(item.qtd)}
                    </span>
                    <span className={`text-[8px] ${theme.textSub}`}>
                      {fmtRankingCurrency(item.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
