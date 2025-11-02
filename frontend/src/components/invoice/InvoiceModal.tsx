import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSales, getSaleById, type SaleResponse } from '../../services/salesService';
import { createLog } from '../../services/logService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SaleListItem {
  id: number;
  title: string;
  subtitle?: string;
  total: number;
  date: string;
}

const currency = (n: number) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const InvoiceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SaleListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // load recent sales when modal opens
    void fetchSales();
  }, [isOpen]);

  const fetchSales = async () => {
    try {
      setFetching(true);
      setError(null);
      const data = await getSales(page, search);
      const list = (data?.results || []).map((s: any) => ({
        id: s.id_venda ?? s.id,
        title: s.nome_produto ?? 'Venda',
        subtitle: s.cliente_nome || s.nome_vendedor || '',
        total: Number(s.preco_total ?? 0),
        date: s.data_venda || new Date().toISOString(),
      })) as SaleListItem[];
      setItems(list);
    } catch (e: any) {
      setError('Não foi possível carregar as vendas.');
    } finally {
      setFetching(false);
    }
  };

  const handleEmit = async () => {
    if (!selectedId) {
      setError('Selecione uma venda.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sale: SaleResponse = await getSaleById(selectedId);
      const el = buildInvoiceContent(sale);
      contentRef.current = el;
      document.body.appendChild(el);

      // Aguarda o layout do elemento antes de capturar (evita PDF em branco)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Log dimensões para diagnóstico em caso de PDF em branco
      const rect = el.getBoundingClientRect();
      console.debug('[NF-e] Dimensões elemento para PDF:', rect.width, rect.height);

      // Gera PDF usando html2canvas + jsPDF diretamente (mais confiável)
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      // A4 em mm: 210x297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`NFe-${selectedId}.pdf`);

      // Log no sistema
      try {
        await createLog({
          action_type: 'CREATE',
          model_name: 'nota_fiscal',
          object_id: selectedId,
          description: `Emissão de NF-e para venda ID ${selectedId}`,
        });
      } catch (e) {
        // opcional: erro de log não impede o uso
        console.warn('Falha ao registrar log de emissão de NF-e', e);
      }

      onClose();
    } catch (e: any) {
      console.error(e);
      setError('Falha ao gerar a NF-e.');
    } finally {
      setLoading(false);
      if (contentRef.current) {
        document.body.removeChild(contentRef.current);
        contentRef.current = null;
      }
    }
  };

  const buildInvoiceContent = (sale: SaleResponse) => {
    const wrapper = document.createElement('div');
    wrapper.id = 'nfe-print-root';
    // Totalmente visível e renderizável, mas fora da viewport do usuário
    wrapper.setAttribute('style', 'position:absolute;left:0;top:0;z-index:10000;background:#ffffff;');

    const buyer = sale.cliente_nome || 'Consumidor Final';
    const issueDate = new Date(sale.data_venda || new Date().toISOString()).toLocaleString('pt-BR');
    const qty = Number(sale.quantidade || 1);
    const unit = Number(sale.preco_unitario ?? 0);
    const total = Number(sale.preco_total ?? qty * unit);

    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      /* A4 aproximado em 96dpi: 794x1123 px */
      .a4 { width: 794px; min-height: 1123px; padding: 32px; background: #fff; color: #111; font-family: Arial, Helvetica, sans-serif; }
      .row { display: flex; gap: 0; }
      .col { flex: 1; }
      .box { border: 1px solid #222; padding: 6px; margin-bottom: 4px; }
      .title { font-size: 14px; font-weight: 700; }
      .muted { color: #444; }
      .small { font-size: 10px; }
      .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .table th, .table td { border: 1px solid #222; padding: 4px; font-size: 10px; }
      .right { text-align: right; }
      .center { text-align: center; }
      .mt8 { margin-top: 8px; }
      .mt12 { margin-top: 12px; }
      .barcode { height: 28px; border: 1px solid #222; background: repeating-linear-gradient(90deg,#000 0,#000 2px,#fff 2px,#fff 4px); margin-top: 8px; }
    `;

    const html = `
      <div class="a4">
        <div class="row" style="gap:8px;">
          <div class="col box">
            <div class="title">NF-e</div>
            <div class="small muted">Número: ${String(sale.id_venda).padStart(6,'0')} &nbsp;&nbsp; Série: 1</div>
          </div>
          <div class="col box">
            <div class="center small">DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</div>
            <div class="barcode"></div>
            <div class="small center mt8">Chave de acesso: 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000</div>
          </div>
        </div>

        <div class="row mt12" style="gap:8px;">
          <div class="col box">
            <div class="small muted">Destinatário</div>
            <div><strong>${buyer}</strong></div>
            ${sale.cliente_email ? `<div class="small">${sale.cliente_email}</div>` : ''}
            ${sale.cliente_telefone ? `<div class="small">${sale.cliente_telefone}</div>` : ''}
          </div>
          <div class="col box">
            <div class="small muted">Data/Hora de emissão</div>
            <div>${issueDate}</div>
          </div>
        </div>

        <div class="box mt12">
          <table class="table">
            <thead>
              <tr>
                <th class="center">Cód</th>
                <th>Descrição do Produto/Serviço</th>
                <th class="right">Qtd</th>
                <th class="right">Vlr Unit</th>
                <th class="right">Vlr Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="center">${(sale as any).produto_id ?? sale.id_venda}</td>
                <td>${sale.nome_produto || 'Produto'}</td>
                <td class="right">${qty}</td>
                <td class="right">${currency(unit)}</td>
                <td class="right">${currency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row mt12" style="gap:8px;">
          <div class="col box">
            <div class="small">Base Cálculo ICMS: 0,00 &nbsp;&nbsp; Valor ICMS: 0,00 &nbsp;&nbsp; Valor Total da Nota: ${currency(total)}</div>
          </div>
        </div>

        <div class="box mt12 small">
          <strong>Informações Complementares:</strong>
          <div>Documento gerado pelo sistema (sem valor fiscal). Modelo de DANFE para impressão/compartilhamento.</div>
        </div>
      </div>
    `;

    wrapper.innerHTML = `<style>${css}</style>${html}`;
    return wrapper;
  };  const listContent = useMemo(() => (
    <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2">
      {items.length === 0 && !fetching && (
        <p className="text-sm text-gray-500">Nenhuma venda encontrada.</p>
      )}
      {items.map((it) => (
        <label key={it.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="selectedSale"
              value={it.id}
              checked={selectedId === it.id}
              onChange={() => setSelectedId(it.id)}
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{it.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{it.subtitle || '—'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-600">{currency(it.total)}</p>
            <p className="text-xs text-gray-500">{new Date(it.date).toLocaleString('pt-BR')}</p>
          </div>
        </label>
      ))}
    </div>
  ), [items, selectedId, fetching]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Emitir NF-e</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">×</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar venda</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              placeholder="Cliente, produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={fetchSales}
              disabled={fetching}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {fetching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        {listContent}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            type="button"
            onClick={handleEmit}
            disabled={!selectedId || loading}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Gerando...' : 'Emitir NF-e'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
