import { ScanDoc } from '../types';

function createReceiptSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
    <rect width="800" height="1100" fill="#f8fafc"/>
    <!-- Paper texture & fold -->
    <rect x="50" y="40" width="700" height="1020" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="50" y1="360" x2="750" y2="360" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="8 8"/>
    
    <!-- Receipt Header -->
    <text x="400" y="110" font-family="Courier, monospace" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">CAFFÈ &amp; BISTROT ROMA</text>
    <text x="400" y="145" font-family="Courier, monospace" font-size="16" fill="#475569" text-anchor="middle">Via dei Condotti 42, 00187 Roma</text>
    <text x="400" y="170" font-family="Courier, monospace" font-size="15" fill="#475569" text-anchor="middle">P.IVA 08492040582 - Tel. 06 698231</text>
    
    <line x1="100" y1="205" x2="700" y2="205" stroke="#334155" stroke-width="2"/>
    <text x="100" y="240" font-family="Courier, monospace" font-size="16" fill="#334155">DOC. COMMERCIALE: #84920</text>
    <text x="700" y="240" font-family="Courier, monospace" font-size="16" fill="#334155" text-anchor="end">26/10/2026 09:15</text>
    <text x="100" y="270" font-family="Courier, monospace" font-size="16" fill="#334155">CASSA: 02 - OPERATORE: MARCO</text>
    <line x1="100" y1="300" x2="700" y2="300" stroke="#334155" stroke-width="2"/>
    
    <!-- Items -->
    <text x="100" y="350" font-family="Courier, monospace" font-size="18" fill="#0f172a">2x Espresso Biologico</text>
    <text x="700" y="350" font-family="Courier, monospace" font-size="18" fill="#0f172a" text-anchor="end">€ 2.60</text>
    
    <text x="100" y="400" font-family="Courier, monospace" font-size="18" fill="#0f172a">1x Cornetto Crema &amp; Amarena</text>
    <text x="700" y="400" font-family="Courier, monospace" font-size="18" fill="#0f172a" text-anchor="end">€ 1.80</text>
    
    <text x="100" y="450" font-family="Courier, monospace" font-size="18" fill="#0f172a">1x Spremuta d'Arancia Rossa</text>
    <text x="700" y="450" font-family="Courier, monospace" font-size="18" fill="#0f172a" text-anchor="end">€ 4.50</text>
    
    <text x="100" y="500" font-family="Courier, monospace" font-size="18" fill="#0f172a">1x Panino Gourmet Prosciutto Parma</text>
    <text x="700" y="500" font-family="Courier, monospace" font-size="18" fill="#0f172a" text-anchor="end">€ 6.50</text>
    
    <line x1="100" y1="560" x2="700" y2="560" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
    
    <!-- Total -->
    <text x="100" y="620" font-family="Courier, monospace" font-size="24" font-weight="bold" fill="#0f172a">TOTALE COMPLESSIVO</text>
    <text x="700" y="620" font-family="Courier, monospace" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="end">€ 15.40</text>
    
    <text x="100" y="670" font-family="Courier, monospace" font-size="16" fill="#475569">PAGAMENTO: Carta di Credito (Contactless)</text>
    <text x="100" y="700" font-family="Courier, monospace" font-size="15" fill="#475569">AUTH CODE: 938210 - C.I.D. A0000000041010</text>
    
    <!-- Stamp -->
    <g transform="translate(480, 720) rotate(-12)">
      <rect width="180" height="70" rx="8" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 2"/>
      <text x="90" y="44" font-family="sans-serif" font-size="22" font-weight="bold" fill="#dc2626" text-anchor="middle">PAGATO</text>
    </g>
    
    <!-- Barcode simulation -->
    <rect x="250" y="860" width="300" height="50" fill="#0f172a"/>
    <text x="400" y="930" font-family="Courier, monospace" font-size="14" fill="#64748b" text-anchor="middle">RT 99201940 019482 0019</text>
    
    <text x="400" y="980" font-family="Courier, monospace" font-size="15" fill="#475569" text-anchor="middle">Grazie per la vostra visita!</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createContractSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1130" viewBox="0 0 800 1130">
    <rect width="800" height="1130" fill="#ffffff"/>
    <rect x="40" y="40" width="720" height="1050" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <text x="400" y="110" font-family="serif" font-size="24" font-weight="bold" fill="#1e293b" text-anchor="middle">CONTRATTO DI LOCAZIONE AD USO ABITATIVO</text>
    <text x="400" y="140" font-family="serif" font-size="14" font-style="italic" fill="#64748b" text-anchor="middle">(Legge 9 dicembre 1998, n. 431 - Articolo 2, comma 1)</text>
    
    <line x1="80" y1="165" x2="720" y2="165" stroke="#94a3b8" stroke-width="1.5"/>
    
    <text x="80" y="210" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">TRA LE PARTI CONTRAENTI:</text>
    <text x="80" y="240" font-family="sans-serif" font-size="13" fill="#334155">1. Il Locatore: Mario Rossi, nato a Milano il 14/05/1975, C.F. RSSMRA75E14F205Z</text>
    <text x="80" y="265" font-family="sans-serif" font-size="13" fill="#334155">2. Il Conduttore: Alessandro Bianchi, nato a Torino il 22/09/1988, C.F. BNCLSN88P22L219W</text>
    
    <text x="80" y="320" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Art. 1 - Oggetto della locazione</text>
    <text x="80" y="345" font-family="sans-serif" font-size="13" fill="#334155">Il locatore concede in locazione l'immobile sito in Via Dante 18, piano 3, interno 7,</text>
    <text x="80" y="370" font-family="sans-serif" font-size="13" fill="#334155">composto da 3 vani catastali, cucina e doveri annessi, completamente arredato.</text>
    
    <text x="80" y="420" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Art. 2 - Durata del contratto</text>
    <text x="80" y="445" font-family="sans-serif" font-size="13" fill="#334155">Il presente contratto è stipulato per la durata di anni 4 (quattro), a decorrere</text>
    <text x="80" y="470" font-family="sans-serif" font-size="13" fill="#334155">dal 1° Novembre 2026 al 31 Ottobre 2030, rinnovabile tacitamente alle medesime condizioni.</text>
    
    <text x="80" y="520" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Art. 3 - Canone di locazione</text>
    <text x="80" y="545" font-family="sans-serif" font-size="13" fill="#334155">Il canone annuo concordato tra le parti è fissato in € 9.600,00 (novemila seicento/00),</text>
    <text x="80" y="570" font-family="sans-serif" font-size="13" fill="#334155">da corrispondere in 12 rate mensili anticipate di € 800,00 entro il 5 di ogni mese.</text>
    
    <!-- Signatures section -->
    <rect x="80" y="800" width="280" height="130" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
    <text x="100" y="830" font-family="sans-serif" font-size="12" fill="#64748b">Firma del Locatore:</text>
    <path d="M 110 880 Q 150 850 190 890 T 260 870" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
    <text x="100" y="915" font-family="sans-serif" font-size="11" fill="#94a3b8">Mario Rossi (Firmato digitalmente)</text>
    
    <rect x="440" y="800" width="280" height="130" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
    <text x="460" y="830" font-family="sans-serif" font-size="12" fill="#64748b">Firma del Conduttore:</text>
    <path d="M 470 885 Q 520 860 560 885 T 640 865" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
    <text x="460" y="915" font-family="sans-serif" font-size="11" fill="#94a3b8">Alessandro Bianchi</text>
    
    <text x="400" y="1030" font-family="sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Pagina 1 di 1 - Registrato all'Agenzia delle Entrate</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function getSampleDocuments(): ScanDoc[] {
  const receiptImg = createReceiptSvg();
  const contractImg = createContractSvg();

  return [
    {
      id: 'doc-sample-1',
      name: 'Ricevuta Caffè & Bistrot',
      created: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      ocrLang: 'latin',
      ocrText: `CAFFÈ & BISTROT ROMA
Via dei Condotti 42, 00187 Roma
P.IVA 08492040582 - Tel. 06 698231
DOC. COMMERCIALE: #84920
26/10/2026 09:15
CASSA: 02 - OPERATORE: MARCO

2x Espresso Biologico         € 2.60
1x Cornetto Crema & Amarena   € 1.80
1x Spremuta d'Arancia Rossa   € 4.50
1x Panino Gourmet Prosciutto  € 6.50

TOTALE COMPLESSIVO: € 15.40
PAGAMENTO: Carta di Credito (Contactless)
AUTH CODE: 938210
PAGATO`,
      pages: [
        {
          id: 'p1',
          imageUrl: receiptImg,
          originalUrl: receiptImg,
          rotation: 0,
          activeFilter: 'orig',
        },
      ],
    },
    {
      id: 'doc-sample-2',
      name: 'Contratto di Locazione Abitativa',
      created: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      ocrLang: 'latin',
      ocrText: `CONTRATTO DI LOCAZIONE AD USO ABITATIVO
(Legge 9 dicembre 1998, n. 431 - Articolo 2, comma 1)

TRA LE PARTI CONTRAENTI:
1. Il Locatore: Mario Rossi, nato a Milano il 14/05/1975, C.F. RSSMRA75E14F205Z
2. Il Conduttore: Alessandro Bianchi, nato a Torino il 22/09/1988, C.F. BNCLSN88P22L219W

Art. 1 - Oggetto della locazione
Il locatore concede in locazione l'immobile sito in Via Dante 18, piano 3, interno 7,
composto da 3 vani catastali, cucina e doveri annessi, completamente arredato.

Art. 2 - Durata del contratto
Il presente contratto è stipulato per la durata di anni 4 (quattro), a decorrere
dal 1° Novembre 2026 al 31 Ottobre 2030, rinnovabile tacitamente alle medesime condizioni.

Art. 3 - Canone di locazione
Il canone annuo concordato tra le parti è fissato in € 9.600,00 (novemila seicento/00),
da corrispondere in 12 rate mensili anticipate di € 800,00 entro il 5 di ogni mese.`,
      pages: [
        {
          id: 'p2',
          imageUrl: contractImg,
          originalUrl: contractImg,
          rotation: 0,
          activeFilter: 'orig',
        },
      ],
    },
  ];
}
