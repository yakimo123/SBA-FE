import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'media', label: 'Media' },
    { id: 'guarantee', label: 'Guarantee' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            {id ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Fill in the product details below
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Fira_Sans'] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
          >
            <Save className="h-5 w-5" />
            Save Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 py-4 font-['Fira_Sans'] text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && <BasicInfoTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'attributes' && <AttributesTab />}
          {activeTab === 'media' && <MediaTab />}
          {activeTab === 'guarantee' && <GuaranteeTab />}
        </div>
      </div>
    </div>
  );
}

function BasicInfoTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="iPhone 15 Pro Max"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="AAPL-IP15PM-256"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Code'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={4}
          placeholder="Product description..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
            <option>Select category...</option>
            <option>Smartphones</option>
            <option>Laptops</option>
            <option>Audio</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Trademark <span className="text-red-500">*</span>
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
            <option>Select trademark...</option>
            <option>Apple</option>
            <option>Samsung</option>
            <option>Sony</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Supplier
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
            <option>Select supplier...</option>
            <option>Supplier A</option>
            <option>Supplier B</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PricingTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Base Price (₫) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="29990000"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Sale Price (₫)
          </label>
          <input
            type="number"
            placeholder="27990000"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
          Bulk Price Tiers
        </h3>
        <div className="space-y-3">
          <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                Min Quantity
              </label>
              <input
                type="number"
                placeholder="10"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
            <div>
              <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                Max Quantity
              </label>
              <input
                type="number"
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
            <div>
              <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                Price (₫)
              </label>
              <input
                type="number"
                placeholder="26990000"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
          </div>
          <button
            type="button"
            className="font-['Fira_Sans'] text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            + Add Bulk Price Tier
          </button>
        </div>
      </div>
    </div>
  );
}

function InventoryTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="100"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Low Stock Threshold
          </label>
          <input
            type="number"
            placeholder="10"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Status
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
            <option>Active</option>
            <option>Inactive</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function AttributesTab() {
  return (
    <div className="space-y-4">
      <p className="font-['Fira_Sans'] text-sm text-gray-600">
        Add custom attributes like color, size, material, etc.
      </p>
      <div className="space-y-3">
        <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Attribute Name
            </label>
            <input
              type="text"
              placeholder="Color"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Attribute Value
            </label>
            <input
              type="text"
              placeholder="Black, White, Blue"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
        </div>
        <button
          type="button"
          className="font-['Fira_Sans'] text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          + Add Attribute
        </button>
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <div className="space-y-4">
      <p className="font-['Fira_Sans'] text-sm text-gray-600">
        Upload product images and videos
      </p>
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center">
          <p className="font-['Fira_Sans'] text-sm text-gray-600">
            Drag and drop files here, or click to browse
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 font-['Fira_Sans'] text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Choose Files
          </button>
        </div>
      </div>
    </div>
  );
}

function GuaranteeTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Warranty Period (months)
          </label>
          <input
            type="number"
            placeholder="12"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        <div>
          <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
            Warranty Type
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
            <option>Manufacturer Warranty</option>
            <option>Store Warranty</option>
            <option>Extended Warranty</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
          Warranty Details
        </label>
        <textarea
          rows={3}
          placeholder="Warranty terms and conditions..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
        />
      </div>
    </div>
  );
}
