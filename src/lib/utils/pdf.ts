/**
 * Export PDF côté navigateur — sans dépendance externe.
 *
 * On génère un document HTML complet en UTF-8 et on déclenche l'impression
 * native du navigateur (« Enregistrer au format PDF »). Cette approche rend
 * parfaitement les accents et caractères spéciaux (é, è, à, ç, …), contrairement
 * aux polices par défaut de jsPDF qui produisent des « mots encodés » illisibles.
 */

/** Échappe le HTML pour éviter toute casse de mise en page / injection. */
export function escapeHtml(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface PdfStat {
  label: string
  value: string
}

export interface PdfTable {
  /** En-têtes de colonnes. */
  columns: string[]
  /** Lignes ; chaque cellule est une chaîne déjà formatée. */
  rows: string[][]
  /** Alignement à droite (ex. montants) par index de colonne. */
  alignRight?: number[]
}

export interface PdfReportOptions {
  /** Titre principal du document (ex. « Relevé de revenus »). */
  title: string
  /** Sous-titre / période (ex. « Généré le 14 juin 2026 »). */
  subtitle?: string
  /** Nom du fichier suggéré (sans extension). */
  filename: string
  /** Cartes de synthèse affichées en haut. */
  stats?: PdfStat[]
  /** Tableaux de données. */
  tables?: { heading?: string; table: PdfTable }[]
  /** Pied de page (mentions). */
  footer?: string
}

function buildTableHtml({ heading, table }: { heading?: string; table: PdfTable }): string {
  const alignRight = new Set(table.alignRight ?? [])
  const head = table.columns
    .map(
      (c, i) =>
        `<th style="text-align:${alignRight.has(i) ? 'right' : 'left'}">${escapeHtml(c)}</th>`
    )
    .join('')
  const body = table.rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, i) =>
              `<td style="text-align:${alignRight.has(i) ? 'right' : 'left'}">${escapeHtml(cell)}</td>`
          )
          .join('')}</tr>`
    )
    .join('')
  return `
    ${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body || `<tr><td colspan="${table.columns.length}" class="empty">Aucune donnée</td></tr>`}</tbody>
    </table>`
}

function buildReportHtml(opts: PdfReportOptions): string {
  const stats = (opts.stats ?? [])
    .map(
      (s) =>
        `<div class="stat"><div class="stat-value">${escapeHtml(s.value)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`
    )
    .join('')
  const tables = (opts.tables ?? []).map(buildTableHtml).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(opts.filename)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    padding: 32px 36px;
    font-size: 13px;
    line-height: 1.5;
  }
  header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #0078FF; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 800; color: #0078FF; letter-spacing: -0.02em; }
  .brand span { color: #1ABCCC; }
  .doc-title { font-size: 20px; font-weight: 800; margin: 0; }
  .doc-sub { color: #64748b; font-size: 12px; margin-top: 2px; text-align: right; }
  .stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat { flex: 1 1 160px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
  .stat-value { font-size: 18px; font-weight: 700; }
  .stat-label { font-size: 11px; color: #64748b; margin-top: 2px; }
  h2 { font-size: 14px; font-weight: 700; margin: 24px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 8px 10px; }
  tbody td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
  tbody td.empty { text-align: center; color: #94a3b8; padding: 18px; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
  @media print { body { padding: 0; } @page { margin: 16mm; } }
</style>
</head>
<body>
  <header>
    <div>
      <div class="brand">SOS<span>Local</span></div>
      <h1 class="doc-title">${escapeHtml(opts.title)}</h1>
    </div>
    ${opts.subtitle ? `<div class="doc-sub">${escapeHtml(opts.subtitle)}</div>` : ''}
  </header>
  ${stats ? `<div class="stats">${stats}</div>` : ''}
  ${tables}
  ${opts.footer ? `<footer>${escapeHtml(opts.footer)}</footer>` : ''}
</body>
</html>`
}

/**
 * Génère le document et ouvre la boîte d'impression du navigateur
 * (« Enregistrer au format PDF »). UTF-8 garanti → accents corrects.
 */
export function exportReportAsPdf(opts: PdfReportOptions): void {
  if (typeof window === 'undefined') return
  const html = buildReportHtml(opts)

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const win = iframe.contentWindow!
  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    setTimeout(() => {
      try {
        document.body.removeChild(iframe)
      } catch {
        /* déjà retiré */
      }
    }, 1000)
  }

  const launchPrint = () => {
    try {
      win.document.title = opts.filename
      win.focus()
      win.print()
    } catch {
      /* impression annulée */
    } finally {
      cleanup()
    }
  }

  // L'iframe est synchrone après document.close(), mais on laisse un tick
  // au moteur de rendu (et on garde onload en filet de sécurité).
  win.onafterprint = cleanup
  if (doc.readyState === 'complete') {
    setTimeout(launchPrint, 150)
  } else {
    win.onload = () => setTimeout(launchPrint, 150)
  }
}
