import React, { useEffect, useState } from 'react';
import { updateSale, deleteSale } from '../../services/salesService';

export interface EditSaleData {
	id_venda: number;
	nome_produto: string;
	nome_vendedor: string;
	quantidade: number;
	preco_total: string | number;
	data_venda: string;
	cliente_nome?: string | null;
	cliente_email?: string | null;
	cliente_telefone?: string | null;
}

interface EditSaleModalProps {
	isOpen: boolean;
	sale: EditSaleData | null;
	onClose: () => void;
	onSaved: () => void;
	onDeleted: () => void;
}

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, sale, onClose, onSaved, onDeleted }) => {
	const [form, setForm] = useState({
		quantidade: 1,
		cliente_nome: '',
		cliente_email: '',
		cliente_telefone: '',
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (sale) {
			setForm({
				quantidade: sale.quantidade ?? 1,
				cliente_nome: sale.cliente_nome ?? '',
				cliente_email: sale.cliente_email ?? '',
				cliente_telefone: sale.cliente_telefone ?? '',
			});
			setError(null);
		}
	}, [sale]);

	if (!isOpen || !sale) return null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: name === 'quantidade' ? Number(value) : value }));
	};

	const handleSave = async () => {
		if (!sale) return;
		setSaving(true);
		setError(null);
		try {
			await updateSale(sale.id_venda, {
				quantidade: form.quantidade,
				cliente_nome: form.cliente_nome || null,
				cliente_email: form.cliente_email || null,
				cliente_telefone: form.cliente_telefone || null,
			});
			onSaved();
			onClose();
		} catch (e: any) {
			const msg = e?.response?.data?.quantidade || e?.response?.data?.detail || 'Falha ao salvar as alterações.';
			setError(typeof msg === 'string' ? msg : 'Falha ao salvar as alterações.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!sale) return;
		if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;
		setSaving(true);
		setError(null);
		try {
			await deleteSale(sale.id_venda);
			onDeleted();
			onClose();
		} catch (e) {
			setError('Falha ao excluir a venda.');
		} finally {
			setSaving(false);
		}
	};

	const formatCurrency = (value: number | string) => {
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (Number.isNaN(num)) return 'R$ 0,00';
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Editar Venda</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
				</div>

				<div className="space-y-3">
					<div>
						<label className="block text-sm text-gray-600">Produto</label>
						<div className="mt-1 font-medium">{sale.nome_produto}</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-gray-600">Vendedor</label>
							<div className="mt-1">{sale.nome_vendedor}</div>
						</div>
						<div>
							<label className="block text-sm text-gray-600">Data</label>
							<div className="mt-1">{new Date(sale.data_venda).toLocaleString('pt-BR')}</div>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600">Quantidade</label>
						<input
							type="number"
							name="quantidade"
							min={1}
							value={form.quantidade}
							onChange={handleChange}
							className="mt-1 w-full border rounded px-3 py-2"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-gray-600">Cliente - Nome</label>
							<input
								name="cliente_nome"
								type="text"
								value={form.cliente_nome}
								onChange={handleChange}
								className="mt-1 w-full border rounded px-3 py-2"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600">Cliente - Telefone</label>
							<input
								name="cliente_telefone"
								type="text"
								value={form.cliente_telefone}
								onChange={handleChange}
								className="mt-1 w-full border rounded px-3 py-2"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm text-gray-600">Cliente - E-mail</label>
							<input
								name="cliente_email"
								type="email"
								value={form.cliente_email}
								onChange={handleChange}
								className="mt-1 w-full border rounded px-3 py-2"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600">Total</label>
						<div className="mt-1 font-semibold text-blue-600">{formatCurrency(sale.preco_total)}</div>
						<p className="text-xs text-gray-500">O total será recalculado automaticamente ao salvar com base no preço atual do produto.</p>
					</div>

					{error && (
						<div className="text-red-600 text-sm">{error}</div>
					)}
				</div>

				<div className="mt-6 flex justify-between">
					<button
						onClick={handleDelete}
						disabled={saving}
						className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
					>
						Excluir
					</button>
					<div className="space-x-2">
						<button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
						<button
							onClick={handleSave}
							disabled={saving}
							className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
						>
							{saving ? 'Salvando...' : 'Salvar alterações'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditSaleModal;
