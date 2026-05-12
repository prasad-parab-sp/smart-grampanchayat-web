import { HeroBannerConfig } from '../../shared/components/hero-banner/hero-banner-config.model';
import { formatTalukaDistrictLine, gpTitleNameForLang } from '../../shared/components/hero-banner/hero-banner.mapper';

/** Sample data used only in admin preview (replaced from application object at runtime). */
export interface FormatPreviewSample {
  applicantName: string;
  purpose: string;
  mobile: string;
  address: string;
  certificateNumber: string;
  /** Display date line (e.g. Marathi formatted). */
  dateDisplay: string;
  /** Optional — shown when API has no officer names yet. */
  sarpanchName: string;
  gramsevakName: string;
}

export interface FormatPreviewContext {
  banner: HeroBannerConfig;
  uiLang: 'mr' | 'en';
  gpTitlePrefix: string;
  helplineLabel: string;
  helplinePhone: string;
  /** Certificate heading — centered below header in preview/print. */
  documentTitle: string;
  sample: FormatPreviewSample;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPrintableHeaderHtml(cfg: FormatPreviewContext): string {
  const { banner, uiLang, gpTitlePrefix } = cfg;
  const gpName = gpTitleNameForLang(banner, uiLang);
  const meta = formatTalukaDistrictLine(banner, uiLang);
  const logo = (banner.logoUrl?.trim() || '/assets/images/logo.png').trim();
  const parts: string[] = [];
  parts.push(`<div class="fmt-bw-header">`);
  parts.push(`<img class="fmt-bw-header__logo" src="${escapeHtml(logo)}" alt="" />`);
  parts.push(`<div class="fmt-bw-header__text">`);
  parts.push(`<div class="fmt-bw-header__prefix">${escapeHtml(gpTitlePrefix)}</div>`);
  if (gpName) {
    parts.push(`<div class="fmt-bw-header__name">${escapeHtml(gpName)}</div>`);
  }
  if (meta) {
    parts.push(`<div class="fmt-bw-header__meta">${escapeHtml(meta)}</div>`);
  }
  if (cfg.helplinePhone) {
    parts.push(
      `<div class="fmt-bw-header__helpline">${escapeHtml(cfg.helplineLabel)}: ${escapeHtml(cfg.helplinePhone)}</div>`
    );
  }
  parts.push(`</div></div>`);
  return parts.join('');
}

/** Centered certificate title (plain text); empty if no title. */
export function buildDocumentTitleHtml(title: string): string {
  const t = title?.trim() ?? '';
  if (!t) {
    return '';
  }
  return `<div class="fmt-doc-title">${escapeHtml(t)}</div>`;
}

export function buildPrintableFooterHtml(cfg: FormatPreviewContext): string {
  const { sample, uiLang } = cfg;
  const s = escapeHtml(sample.sarpanchName);
  const g = escapeHtml(sample.gramsevakName);
  const stamp =
    uiLang === 'en'
      ? 'Official stamp / seal area (preview)'
      : 'अधिकृत शिक्का / ठिकाण (पूर्वावलोकन)';
  return `
<div class="fmt-bw-footer">
  <div class="fmt-bw-footer__row">
    <div class="fmt-bw-footer__sig"><span class="fmt-bw-footer__lbl">${uiLang === 'en' ? 'Sarpanch' : 'सरपंच'}</span><br/><strong>${s}</strong></div>
    <div class="fmt-bw-footer__sig"><span class="fmt-bw-footer__lbl">${uiLang === 'en' ? 'Gramsevak' : 'ग्रामसेवक'}</span><br/><strong>${g}</strong></div>
  </div>
  <div class="fmt-bw-footer__stamp">${escapeHtml(stamp)}</div>
</div>`.trim();
}

/**
 * Expands {$header}, {$footer}, [$header], [$footer], {$title}, [$title], Marathi bracket tags and {$tokens} using preview samples.
 * Body may contain HTML from the rich editor — we only substitute known tokens; rest left as-is.
 */
export function expandFormatPlaceholders(bodyHtml: string, ctx: FormatPreviewContext): string {
  const header = buildPrintableHeaderHtml(ctx);
  const footer = buildPrintableFooterHtml(ctx);
  const titleBlock = buildDocumentTitleHtml(ctx.documentTitle);
  const gpName = gpTitleNameForLang(ctx.banner, ctx.uiLang);
  const gpLine = [ctx.gpTitlePrefix, gpName].filter(Boolean).join(' ').trim();

  let out = bodyHtml;
  out = out.split('{$header}').join(header);
  out = out.split('{$footer}').join(footer);
  out = out.split('[$header]').join(header);
  out = out.split('[$footer]').join(footer);
  out = out.split('{$title}').join(titleBlock);
  out = out.split('[$title]').join(titleBlock);

  const sm = ctx.sample;
  const pairs: [string, string][] = [
    ['[नाव]', escapeHtml(sm.applicantName)],
    ['[मोबाईल]', escapeHtml(sm.mobile)],
    ['[पत्ता]', escapeHtml(sm.address)],
    ['[कशासाठी]', escapeHtml(sm.purpose)],
    ['[दिनांक]', escapeHtml(sm.dateDisplay)],
    ['[दाखला_क्र]', escapeHtml(sm.certificateNumber)],
    ['{$name}', escapeHtml(sm.applicantName)],
    ['{$purpose}', escapeHtml(sm.purpose)],
    ['{$mobile}', escapeHtml(sm.mobile)],
    ['{$address}', escapeHtml(sm.address)],
    ['{$certificate_no}', escapeHtml(sm.certificateNumber)],
    ['{$date}', escapeHtml(sm.dateDisplay)],
    ['{$gp_line}', escapeHtml(gpLine)],
    ['{$gp_name}', escapeHtml(gpName)]
  ];

  for (const [token, html] of pairs) {
    out = out.split(token).join(html);
  }

  return out;
}

/**
 * When the format has a document title but the template omits {$title}/[$title], insert the centered
 * title immediately after the printable header so preview/print match expectations.
 */
export function injectDocumentTitleBelowHeaderIfMissing(html: string, documentTitle: string): string {
  const t = documentTitle?.trim() ?? '';
  if (!t || html.includes('fmt-doc-title')) {
    return html;
  }
  if (typeof DOMParser === 'undefined' || !html.includes('fmt-bw-header')) {
    return html;
  }
  const doc = new DOMParser().parseFromString(`<div id="__fmt_root">${html}</div>`, 'text/html');
  const root = doc.getElementById('__fmt_root');
  const header = root?.querySelector('.fmt-bw-header');
  if (!root || !header) {
    return html;
  }
  const div = doc.createElement('div');
  div.className = 'fmt-doc-title';
  div.textContent = t;
  header.insertAdjacentElement('afterend', div);
  return root.innerHTML;
}
