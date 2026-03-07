import { Building2, Edit, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect,useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { companyService } from '../../services/companyService';
import { CompanyRequest,CompanyResponse } from '../../types';

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);

  // Form states
  const [formData, setFormData] = useState<CompanyRequest>({
    companyName: '',
    taxCode: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch companies from API
  const fetchCompanies = async (searchKeyword = '', page = 0) => {
    try {
      setLoading(true);
      const response = await companyService.search(searchKeyword || undefined, page, 20);
      console.log('Raw API response:', response);
      console.log('Companies data:', response.content);
      if (response.content.length > 0) {
        console.log('First company address:', response.content[0].address);
        console.log('Address char codes:', response.content[0].address?.split('').map((c: string) => c.charCodeAt(0)));
      }
      setCompanies(response.content);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCompanies(keyword, 0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      companyName: '',
      taxCode: '',
      email: '',
      phone: '',
      address: '',
    });
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    } else if (formData.companyName.length < 2 || formData.companyName.length > 100) {
      errors.companyName = 'Company name must be between 2 and 100 characters';
    }

    if (!formData.taxCode.trim()) {
      errors.taxCode = 'Tax code is required';
    } else if (formData.taxCode.length > 50) {
      errors.taxCode = 'Tax code must not exceed 50 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email must be valid';
    }

    if (formData.phone && formData.phone.length > 50) {
      errors.phone = 'Phone must not exceed 50 characters';
    }

    if (formData.address && formData.address.length > 500) {
      errors.address = 'Address must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create dialog
  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (company: CompanyResponse) => {
    setSelectedCompany(company);
    setFormData({
      companyName: company.companyName,
      taxCode: company.taxCode,
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle delete with confirmation
  const handleDeleteClick = async (company: CompanyResponse) => {
    console.log('Delete clicked for:', company.companyName);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.companyName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Starting delete for company ID:', company.companyId);
      await companyService.delete(company.companyId);
      console.log('Delete successful');

      alert('Company deleted successfully!');
      await fetchCompanies(keyword, 0);
    } catch (error: any) {
      console.error('!!! Error deleting company:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete company';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Submit create
  const handleSubmitCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await companyService.create(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCompanies(keyword, 0);
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit update
  const handleSubmitEdit = async () => {
    if (!validateForm() || !selectedCompany) return;

    try {
      setSubmitting(true);
      await companyService.update(selectedCompany.companyId, formData);
      setIsEditDialogOpen(false);
      resetForm();
      fetchCompanies(keyword, 0);
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Failed to update company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CompanyResponse>[] = [
    {
      header: 'Company Name',
      accessor: 'companyName',
      render: (c) => (
        <div className="font-medium text-purple-900">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            {c.companyName}
          </div>
          <span className="text-xs text-gray-500 font-normal">Tax Code: {c.taxCode}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (c) => c.email ? (
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3 text-gray-400" />
          {c.email}
        </div>
      ) : <span className="text-gray-400">-</span>
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (c) => c.phone ? (
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          {c.phone}
        </div>
      ) : <span className="text-gray-400">-</span>
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (c) => c.address ? (
        <div className="max-w-xs truncate text-sm text-gray-700" title={c.address}>
          {c.address}
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'companyId',
      sortable: false,
      render: (company) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
            title="Edit"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                handleEdit(company);
              } catch (err) {
                console.error('Error in handleEdit:', err);
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
            title="Delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                handleDeleteClick(company);
              } catch (err) {
                console.error('Error in handleDeleteClick:', err);
              }
            }}
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Companies</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">B2B Customer Management</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search companies by name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={companies} keyField="companyId" pageSize={20} />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter the company details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
              />
              {formErrors.companyName && (
                <p className="text-sm text-red-600">{formErrors.companyName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxCode">Tax Code *</Label>
              <Input
                id="taxCode"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                placeholder="Enter tax code"
              />
              {formErrors.taxCode && (
                <p className="text-sm text-red-600">{formErrors.taxCode}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
                rows={3}
              />
              {formErrors.address && (
                <p className="text-sm text-red-600">{formErrors.address}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-companyName">Company Name *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
              />
              {formErrors.companyName && (
                <p className="text-sm text-red-600">{formErrors.companyName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-taxCode">Tax Code *</Label>
              <Input
                id="edit-taxCode"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                placeholder="Enter tax code"
              />
              {formErrors.taxCode && (
                <p className="text-sm text-red-600">{formErrors.taxCode}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
                rows={3}
              />
              {formErrors.address && (
                <p className="text-sm text-red-600">{formErrors.address}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
