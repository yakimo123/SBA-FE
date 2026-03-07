import { Edit, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { attributeService } from '../../services/attributeService';
import { Attribute } from '../../types/product';

export function AttributeList() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attributeService.getAttributes(page, PAGE_SIZE);
      setAttributes(data.content ?? (data as unknown as Attribute[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attributes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const openCreate = () => {
    setEditingAttribute(null);
    setAttributeName('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (attr: Attribute) => {
    setEditingAttribute(attr);
    setAttributeName(attr.attributeName);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!attributeName.trim()) {
      setFormError('Attribute name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingAttribute) {
        await attributeService.updateAttribute(editingAttribute.attributeId, attributeName);
      } else {
        await attributeService.createAttribute(attributeName);
      }
      setIsModalOpen(false);
      fetchAttributes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save attribute';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (attr: Attribute) => {
    if (!window.confirm(`Delete attribute "${attr.attributeName}"?`)) return;
    try {
      await attributeService.deleteAttribute(attr.attributeId);
      fetchAttributes();
    } catch {
      alert('Failed to delete attribute');
    }
  };

  const columns: Column<Attribute>[] = [
    {
      header: 'Attribute Name',
      accessor: 'attributeName',
      render: (attr) => <span className="font-medium text-purple-900">{attr.attributeName}</span>,
    },
    {
      header: 'ID',
      accessor: 'attributeId',
      render: (attr) => (
        <span className="font-['Fira_Code'] text-xs text-gray-500">#{attr.attributeId}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'attributeId',
      sortable: false,
      render: (attr) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(attr)}
            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(attr)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            Product Attributes
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage global product attributes
            {totalElements > 0 && (
              <span className="ml-2 text-sm text-gray-400">({totalElements} total)</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" /> Add Attribute
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={attributes}
          keyField="attributeId"
          pageSize={PAGE_SIZE}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-['Fira_Sans'] text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttribute ? 'Edit Attribute' : 'Add Attribute'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Attribute Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              placeholder="e.g. RAM, Color, Storage"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {editingAttribute ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
