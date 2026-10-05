import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme';
import { userApi } from '../../api/userApi';
import { User, Role } from '../../types';
import { useForm } from '../../hooks/useForm';
import { useSort } from '../../hooks/useSort';
import { validators } from '../../utils/validators';
import { getErrorMessage, formatDate } from '../../utils/formatters';
import { ROLES, DEFAULT_PAGE_SIZE } from '../../utils/constants';

import DataTable, { ColumnDef } from '../../components/DataTable/DataTable';
import SearchBar from '../../components/SearchBar/SearchBar';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import Input from '../../components/Input/Input';
import RoleBadge from '../../components/RoleBadge/RoleBadge';
import ErrorState from '../../components/ErrorState/ErrorState';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const { sortBy, sortOrder, handleSort } = useSort('createdAt', 'desc');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [serverModalError, setServerModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userApi.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        sortBy,
        sortOrder,
      });
      setUsers(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to retrieve users'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Form for Creating a User
  const {
    values: addValues,
    errors: addErrors,
    isSubmitting: isAddingUser,
    handleChange: handleAddChange,
    handleBlur: handleAddBlur,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      address: '',
      role: ROLES.NORMAL_USER as Role,
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const nameRes = validators.name(vals.name);
      if (!nameRes.isValid && nameRes.error) errs.name = nameRes.error;

      const emailRes = validators.email(vals.email);
      if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

      const pwdRes = validators.password(vals.password);
      if (!pwdRes.isValid && pwdRes.error) errs.password = pwdRes.error;

      const addressRes = validators.address(vals.address);
      if (!addressRes.isValid && addressRes.error) errs.address = addressRes.error;

      if (!vals.role) {
        errs.role = 'Role is required';
      }
      return errs;
    },
    onSubmit: async (formValues) => {
      setServerModalError(null);
      try {
        await userApi.createUser({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          address: formValues.address.trim(),
          role: formValues.role,
        });

        setIsAddUserOpen(false);
        resetAddForm();
        setSuccessToast(`User "${formValues.name}" was created successfully.`);
        setTimeout(() => setSuccessToast(null), 4000);
        fetchUsers();
      } catch (err: unknown) {
        setServerModalError(getErrorMessage(err, 'Failed to create user account'));
      }
    },
  });

  // Table Columns
  const columns: ColumnDef<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div>
          <span style={{ fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary }}>
            {u.name}
          </span>
          {u.storeName && (
            <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.primary, marginTop: '2px' }}>
              Store: {u.storeName}
            </div>
          )}
        </div>
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
      render: (u) => (
        <span
          style={{
            maxWidth: '260px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={u.address}
        >
          {u.address}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (u) => formatDate(u.createdAt),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black }}>
            User Management
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
            Browse registered consumers, assign merchant roles, and view user details.
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
            setIsAddUserOpen(true);
          }}
        >
          Add User
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
      {error && <ErrorState message={error} onRetry={fetchUsers} />}

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
          placeholder="Search by name, email, or address..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: 600 }}>
            ROLE:
          </span>
          <div style={{ width: '160px' }}>
            <Select
              options={[
                { value: '', label: 'All Roles' },
                { value: ROLES.SYSTEM_ADMIN, label: 'Administrator' },
                { value: ROLES.STORE_OWNER, label: 'Store Owner' },
                { value: ROLES.NORMAL_USER, label: 'User' },
              ]}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Unified DataTable */}
      <DataTable<User>
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyTitle="No users found"
        emptyDescription="No registered users match your search or filter parameters."
        onRowClick={(u) => setSelectedUser(u)}
        pagination={{
          page,
          totalPages,
          total,
          limit,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* ADD USER MODAL */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => {
          if (!isAddingUser) setIsAddUserOpen(false);
        }}
        title="Add New User"
        subtitle="Provision a new user account with administrative or merchant permissions."
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsAddUserOpen(false)}
              disabled={isAddingUser}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isAddingUser}
              disabled={isAddingUser}
              onClick={() => handleAddSubmit()}
            >
              Create Account
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
          <Field label="Full Name" htmlFor="add-name" error={addErrors.name} hint="20-60 characters" required>
            <Input
              id="add-name"
              name="name"
              type="text"
              placeholder="e.g. Richard Bartholomew Harrington"
              value={addValues.name}
              hasError={!!addErrors.name}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingUser}
            />
          </Field>

          <Field label="Email Address" htmlFor="add-email" error={addErrors.email} required>
            <Input
              id="add-email"
              name="email"
              type="email"
              placeholder="user@revora.com"
              value={addValues.email}
              hasError={!!addErrors.email}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingUser}
            />
          </Field>

          <Field
            label="Initial Password"
            htmlFor="add-password"
            error={addErrors.password}
            hint="8-16 chars, 1 uppercase, 1 special character"
            required
          >
            <Input
              id="add-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={addValues.password}
              hasError={!!addErrors.password}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingUser}
            />
          </Field>

          <Field label="Address" htmlFor="add-address" error={addErrors.address} hint="Max 400 characters" required>
            <Input
              id="add-address"
              name="address"
              type="text"
              placeholder="e.g. 500 Enterprise Way, Suite 100"
              value={addValues.address}
              hasError={!!addErrors.address}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingUser}
            />
          </Field>

          <Field label="System Role" htmlFor="add-role" error={addErrors.role} required>
            <Select
              id="add-role"
              name="role"
              options={[
                { value: ROLES.NORMAL_USER, label: 'User (Standard Customer)' },
                { value: ROLES.STORE_OWNER, label: 'Store Owner (Merchant)' },
                { value: ROLES.SYSTEM_ADMIN, label: 'System Administrator' },
              ]}
              value={addValues.role}
              hasError={!!addErrors.role}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              disabled={isAddingUser}
            />
          </Field>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* USER DETAILS MODAL */}
      {/* ------------------------------------------------------------------ */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User: ${selectedUser.name}`}
          subtitle={`Account ID #${selectedUser.id}`}
          footer={
            <Button variant="secondary" size="md" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
                Role Level:
              </span>
              <RoleBadge role={selectedUser.role} size="md" />
            </div>

            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
              <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, marginBottom: '2px' }}>
                EMAIL
              </div>
              <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium }}>
                {selectedUser.email}
              </div>
            </div>

            <div>
              <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, marginBottom: '2px' }}>
                ADDRESS
              </div>
              <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary }}>
                {selectedUser.address}
              </div>
            </div>

            <div>
              <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, marginBottom: '2px' }}>
                REGISTERED ON
              </div>
              <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
                {formatDate(selectedUser.createdAt)}
              </div>
            </div>

            {/* If selected user is STORE_OWNER */}
            {selectedUser.role === ROLES.STORE_OWNER && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  borderRadius: theme.radii.lg,
                  backgroundColor: theme.colors.roles.STORE_OWNER.bg,
                  border: `1px solid ${theme.colors.roles.STORE_OWNER.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.bold,
                    color: theme.colors.roles.STORE_OWNER.text,
                    marginBottom: '6px',
                  }}
                >
                  Associated Merchant Store
                </div>
                {selectedUser.storeName ? (
                  <div>
                    <div style={{ fontSize: theme.typography.sizes.base, fontWeight: 700, color: '#064e3b' }}>
                      {selectedUser.storeName}
                    </div>
                    <div style={{ fontSize: theme.typography.sizes.xs, color: '#047857', marginTop: '2px' }}>
                      Store Overall Rating:{' '}
                      <strong>{selectedUser.storeRating ? selectedUser.storeRating.toFixed(1) : 'No reviews'}</strong> / 5.0
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textTertiary, fontStyle: 'italic' }}>
                    No store assigned yet. You can assign a store from the Stores directory.
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
