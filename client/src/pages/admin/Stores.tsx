import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme';
import { storeApi } from '../../api/storeApi';
import { userApi } from '../../api/userApi';
import { Store, User } from '../../types';
import { useForm } from '../../hooks/useForm';
import { useSort } from '../../hooks/useSort';
import { validators } from '../../utils/validators';
import { getErrorMessage, formatRating } from '../../utils/formatters';
import { ROLES, DEFAULT_PAGE_SIZE } from '../../utils/constants';

import DataTable, { ColumnDef } from '../../components/DataTable/DataTable';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Field from '../../components/Field/Field';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Stars from '../../components/Stars/Stars';
import ErrorState from '../../components/ErrorState/ErrorState';

export const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState<string>('');
  const { sortBy, sortOrder, handleSort } = useSort('createdAt', 'desc');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Available owners list for assignment dropdown
  const [eligibleOwners, setEligibleOwners] = useState<User[]>([]);

  // Modals state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [serverModalError, setServerModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await storeApi.getAdminStores({
        page,
        limit,
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
      });
      setStores(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to retrieve stores'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  const loadEligibleOwners = useCallback(async () => {
    try {
      // Fetch owners who have STORE_OWNER or SYSTEM_ADMIN role
      const res = await userApi.getUsers({ limit: 100 });
      const owners = res.data.filter(
        (u) => u.role === ROLES.STORE_OWNER || u.role === ROLES.SYSTEM_ADMIN
      );
      setEligibleOwners(owners);
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    loadEligibleOwners();
  }, [loadEligibleOwners]);

  // Form for Creating a Store
  const {
    values: addValues,
    errors: addErrors,
    isSubmitting: isAddingStore,
    handleChange: handleAddChange,
    handleBlur: handleAddBlur,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      address: '',
      ownerId: '' as unknown as number,
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const nameRes = validators.storeName(vals.name);
      if (!nameRes.isValid && nameRes.error) errs.name = nameRes.error;

      const emailRes = validators.email(vals.email);
      if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

      const addressRes = validators.address(vals.address);
      if (!addressRes.isValid && addressRes.error) errs.address = addressRes.error;

      if (!vals.ownerId) {
        errs.ownerId = 'Assigning an owner is required';
      }
      return errs;
    },
    onSubmit: async (formValues) => {
      setServerModalError(null);
      try {
        await storeApi.createStore({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          address: formValues.address.trim(),
          ownerId: Number(formValues.ownerId),
        });

        setIsAddStoreOpen(false);
        resetAddForm();
        setSuccessToast(`Store "${formValues.name}" was registered successfully.`);
        setTimeout(() => setSuccessToast(null), 4000);
        fetchStores();
      } catch (err: unknown) {
        setServerModalError(getErrorMessage(err, 'Failed to create store'));
      }
    },
  });

  // Form for Editing a Store
  const {
    values: editValues,
    errors: editErrors,
    isSubmitting: isUpdatingStore,
    handleChange: handleEditChange,
    handleBlur: handleEditBlur,
    handleSubmit: handleEditSubmit,
    setFieldValue: setEditFieldValue,
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      address: '',
      ownerId: '' as unknown as number,
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const nameRes = validators.storeName(vals.name);
      if (!nameRes.isValid && nameRes.error) errs.name = nameRes.error;

      const emailRes = validators.email(vals.email);
      if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

      const addressRes = validators.address(vals.address);
      if (!addressRes.isValid && addressRes.error) errs.address = addressRes.error;

      return errs;
    },
    onSubmit: async (formValues) => {
      if (!editingStore) return;
      setServerModalError(null);
      try {
        await storeApi.updateStore(editingStore.id, {
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          address: formValues.address.trim(),
          ownerId: formValues.ownerId ? Number(formValues.ownerId) : undefined,
        });

        setEditingStore(null);
        setSuccessToast(`Store "${formValues.name}" was updated successfully.`);
        setTimeout(() => setSuccessToast(null), 4000);
        fetchStores();
      } catch (err: unknown) {
        setServerModalError(getErrorMessage(err, 'Failed to update store'));
      }
    },
  });

  const openEditModal = (store: Store) => {
    setServerModalError(null);
    setEditingStore(store);
    setEditFieldValue('name', store.name);
    setEditFieldValue('email', store.email);
    setEditFieldValue('address', store.address);
    setEditFieldValue('ownerId', store.ownerId || '');
  };

  const handleDeleteStore = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    try {
      await storeApi.deleteStore(deletingStore.id);
      setDeletingStore(null);
      setSuccessToast(`Store "${deletingStore.name}" was deleted successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);
      fetchStores();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete store'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns
  const columns: ColumnDef<Store>[] = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <span style={{ fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary }}>
          {s.name}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (s) => (
        <span
          style={{
            maxWidth: '260px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={s.address}
        >
          {s.address}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (s) =>
        s.owner ? (
          <div>
            <div style={{ fontWeight: theme.typography.weights.medium }}>{s.owner.name}</div>
            <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
              {s.owner.email}
            </div>
          </div>
        ) : (
          <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>Unassigned</span>
        ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (s) => {
        const ratingVal = s.overallRating ?? s.averageRating ?? 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stars value={ratingVal} size="sm" />
            <span style={{ fontWeight: theme.typography.weights.bold }}>
              {formatRating(ratingVal)}
            </span>
            <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
              ({s.totalRatings ?? 0})
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(s)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" style={{ color: theme.colors.danger }} onClick={() => setDeletingStore(s)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black }}>
            Store Directory
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
            Register new retail locations, assign merchant owners, and track customer scores.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
          onClick={() => {
            setServerModalError(null);
            setIsAddStoreOpen(true);
          }}
        >
          Add Store
        </Button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div
          role="status"
          style={{
            padding: '12px 18px',
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.successLight,
            border: `1px solid ${theme.colors.successBorder}`,
            color: theme.colors.successText,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          ✓ {successToast}
        </div>
      )}

      {/* Error State */}
      {error && <ErrorState message={error} onRetry={fetchStores} />}

      {/* Filters Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '14px 18px',
          borderRadius: theme.radii.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
        }}
      >
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by store name, email, or address..."
        />
      </div>

      {/* Unified DataTable */}
      <DataTable<Store>
        columns={columns}
        data={stores}
        keyExtractor={(s) => s.id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyTitle="No stores found"
        emptyDescription="No registered stores match your search query."
        pagination={{
          page,
          totalPages,
          total,
          limit,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* ADD STORE MODAL */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => {
          if (!isAddingStore) setIsAddStoreOpen(false);
        }}
        title="Add New Store"
        subtitle="Register a new store and assign a verified merchant owner."
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsAddStoreOpen(false)}
              disabled={isAddingStore}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isAddingStore}
              disabled={isAddingStore}
              onClick={() => handleAddSubmit()}
            >
              Register Store
            </Button>
          </>
        }
      >
        {serverModalError && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.dangerLight,
              border: `1px solid ${theme.colors.dangerBorder}`,
              color: theme.colors.dangerText,
              fontSize: theme.typography.sizes.sm,
              marginBottom: '16px',
            }}
          >
            {serverModalError}
          </div>
        )}

        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Store Name" htmlFor="add-store-name" error={addErrors.name} hint="2-100 characters" required>
            <Input
              id="add-store-name"
              name="name"
              type="text"
              placeholder="e.g. Revora Gourmet Market"
              value={addValues.name}
              hasError={!!addErrors.name}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingStore}
            />
          </Field>

          <Field label="Store Contact Email" htmlFor="add-store-email" error={addErrors.email} required>
            <Input
              id="add-store-email"
              name="email"
              type="email"
              placeholder="contact@storedomain.com"
              value={addValues.email}
              hasError={!!addErrors.email}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingStore}
            />
          </Field>

          <Field label="Store Address" htmlFor="add-store-address" error={addErrors.address} hint="Max 400 characters" required>
            <Input
              id="add-store-address"
              name="address"
              type="text"
              placeholder="e.g. 100 Commercial Plaza, Floor 1"
              value={addValues.address}
              hasError={!!addErrors.address}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingStore}
            />
          </Field>

          <Field label="Assigned Store Owner" htmlFor="add-store-owner" error={addErrors.ownerId} required>
            <Select
              id="add-store-owner"
              name="ownerId"
              placeholder="-- Select a Store Owner --"
              options={eligibleOwners.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email})`,
              }))}
              value={addValues.ownerId || ''}
              hasError={!!addErrors.ownerId}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingStore}
            />
          </Field>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* EDIT STORE MODAL */}
      {/* ------------------------------------------------------------------ */}
      {editingStore && (
        <Modal
          isOpen={!!editingStore}
          onClose={() => {
            if (!isUpdatingStore) setEditingStore(null);
          }}
          title={`Edit Store: ${editingStore.name}`}
          subtitle="Update store name, contact email, address, or reassign owner."
          footer={
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditingStore(null)}
                disabled={isUpdatingStore}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isUpdatingStore}
                disabled={isUpdatingStore}
                onClick={() => handleEditSubmit()}
              >
                Save Changes
              </Button>
            </>
          }
        >
          {serverModalError && (
            <div
              role="alert"
              style={{
                padding: '10px 14px',
                borderRadius: theme.radii.md,
                backgroundColor: theme.colors.dangerLight,
                border: `1px solid ${theme.colors.dangerBorder}`,
                color: theme.colors.dangerText,
                fontSize: theme.typography.sizes.sm,
                marginBottom: '16px',
              }}
            >
              {serverModalError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Store Name" htmlFor="edit-store-name" error={editErrors.name} required>
              <Input
                id="edit-store-name"
                name="name"
                type="text"
                value={editValues.name}
                hasError={!!editErrors.name}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                disabled={isUpdatingStore}
              />
            </Field>

            <Field label="Store Contact Email" htmlFor="edit-store-email" error={editErrors.email} required>
              <Input
                id="edit-store-email"
                name="email"
                type="email"
                value={editValues.email}
                hasError={!!editErrors.email}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                disabled={isUpdatingStore}
              />
            </Field>

            <Field label="Store Address" htmlFor="edit-store-address" error={editErrors.address} required>
              <Input
                id="edit-store-address"
                name="address"
                type="text"
                value={editValues.address}
                hasError={!!editErrors.address}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                disabled={isUpdatingStore}
              />
            </Field>

            <Field label="Assigned Store Owner" htmlFor="edit-store-owner">
              <Select
                id="edit-store-owner"
                name="ownerId"
                placeholder="-- Select a Store Owner --"
                options={eligibleOwners.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.email})`,
                }))}
                value={editValues.ownerId || ''}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                disabled={isUpdatingStore}
              />
            </Field>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DELETE STORE CONFIRMATION */}
      {/* ------------------------------------------------------------------ */}
      <ConfirmDialog
        isOpen={!!deletingStore}
        onClose={() => setDeletingStore(null)}
        onConfirm={handleDeleteStore}
        title="Delete Store"
        message={`Are you sure you want to delete "${deletingStore?.name}"? All associated ratings and records will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete Store"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminStores;
