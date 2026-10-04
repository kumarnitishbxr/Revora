import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Store as StoreIcon,
  Plus,
  ArrowUpDown,
  Mail,
  MapPin,
  Star,
  Edit2,
  Trash2,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast, useDebounce } from '../../hooks';
import type { Store, User } from '../../types';
import {
  Button,
  SearchInput,
  Pagination,
  Modal,
  ConfirmDialog,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import { getErrorMessage } from '../../utils/error';

const storeSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  address: z.string().trim().min(1, 'Address is required').max(400),
  ownerId: z.number().int().positive('Please select a valid store owner'),
});

type StoreFormValues = {
  name: string;
  email: string;
  address: string;
  ownerId: number;
};

export const AdminStoresPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email' | 'address'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available store owners for assignment
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStores({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setStores(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  const loadOwners = async () => {
    try {
      // Fetch owners from user list (can assign STORE_OWNER or SYSTEM_ADMIN)
      const [ownersRes, adminsRes] = await Promise.all([
        adminService.getUsers({ role: 'STORE_OWNER', limit: 100 }),
        adminService.getUsers({ role: 'SYSTEM_ADMIN', limit: 100 }),
      ]);
      setAvailableOwners([...ownersRes.data, ...adminsRes.data]);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isSubmittingCreate },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      ownerId: undefined,
    },
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
  });

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setEditValue('name', store.name);
    setEditValue('email', store.email);
    setEditValue('address', store.address);
    if (store.ownerId) {
      setEditValue('ownerId', store.ownerId);
    }
  };

  const handleCreateStore = async (data: StoreFormValues) => {
    try {
      await adminService.createStore(data);
      success(`Store "${data.name}" created successfully!`, 'Store Created');
      setIsCreateModalOpen(false);
      resetCreate();
      fetchStores();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Failed to Create Store');
    }
  };

  const handleUpdateStore = async (data: StoreFormValues) => {
    if (!editingStore) return;
    try {
      await adminService.updateStore(editingStore.id, data);
      success(`Store "${data.name}" updated successfully!`, 'Store Updated');
      setEditingStore(null);
      resetEdit();
      fetchStores();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Failed to Update Store');
    }
  };

  const handleDeleteStore = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    try {
      await adminService.deleteStore(deletingStore.id);
      success(`Store "${deletingStore.name}" deleted.`, 'Store Deleted');
      setDeletingStore(null);
      fetchStores();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Failed to Delete Store');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Store Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage store listings, assign verified owners, and monitor ratings
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            loadOwners();
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Store
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search store name, email, or address..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Store Name</option>
            <option value="address">Address</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </div>

      {/* Stores Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading store directory..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load stores"
          message={error}
          onRetry={fetchStores}
        />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No stores found"
          description={
            search
              ? 'No stores match your search keyword. Try clearing search.'
              : 'There are currently no stores in the system.'
          }
          actionLabel={search ? 'Clear Search' : 'Add First Store'}
          onAction={search ? () => setSearch('') : () => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {stores.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {s.owner ? (
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {s.owner.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{s.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No owner assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {s.overallRating.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-[11px]">({s.totalRatings})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                          aria-label="Edit store"
                          title="Edit Store"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingStore(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          aria-label="Delete store"
                          title="Delete Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 px-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Store Listing"
        description="Register a verified local business and designate an owner."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmittingCreate}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitCreate(handleCreateStore)}
              isLoading={isSubmittingCreate}
            >
              Create Store
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitCreate(handleCreateStore)} className="space-y-4">
          <Input
            label="Store Name (2-100 chars)"
            placeholder="Sunrise Bakery & Cafe"
            error={createErrors.name?.message}
            {...registerCreate('name')}
          />

          <Input
            label="Store Email"
            type="email"
            placeholder="contact@sunrisebakery.com"
            error={createErrors.email?.message}
            {...registerCreate('email')}
          />

          <Select
            label="Assigned Store Owner"
            placeholder="Select a registered owner account..."
            options={availableOwners.map((o) => ({
              value: o.id,
              label: `${o.name} (${o.email}) — ${o.role}`,
            }))}
            error={createErrors.ownerId?.message}
            {...registerCreate('ownerId', { valueAsNumber: true })}
          />

          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Physical Address <span className="text-rose-500 ml-1">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="45 Market Street, Suite 10, Downtown"
              className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                createErrors.address
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              {...registerCreate('address')}
            />
            {createErrors.address && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {createErrors.address.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit Store Modal */}
      {editingStore && (
        <Modal
          isOpen={!!editingStore}
          onClose={() => setEditingStore(null)}
          title={`Edit Store: ${editingStore.name}`}
          description="Update store information or reassign owner."
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingStore(null)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitEdit(handleUpdateStore)}
                isLoading={isSubmittingEdit}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitEdit(handleUpdateStore)} className="space-y-4">
            <Input
              label="Store Name"
              placeholder="Store Name"
              error={editErrors.name?.message}
              {...registerEdit('name')}
            />

            <Input
              label="Store Email"
              type="email"
              placeholder="store@email.com"
              error={editErrors.email?.message}
              {...registerEdit('email')}
            />

            <Select
              label="Assigned Store Owner"
              options={availableOwners.map((o) => ({
                value: o.id,
                label: `${o.name} (${o.email})`,
              }))}
              error={editErrors.ownerId?.message}
              {...registerEdit('ownerId', { valueAsNumber: true })}
            />

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Physical Address
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
                {...registerEdit('address')}
              />
              {editErrors.address && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {editErrors.address.message}
                </p>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingStore && (
        <ConfirmDialog
          isOpen={!!deletingStore}
          onClose={() => setDeletingStore(null)}
          onConfirm={handleDeleteStore}
          title="Delete Store Listing"
          message={`Are you sure you want to permanently delete "${deletingStore.name}"? All associated rating history for this store will also be removed. This action cannot be undone.`}
          confirmText="Delete Store"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
