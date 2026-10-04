import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
  Filter,
  ArrowUpDown,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Star,
  Store,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast, useDebounce } from '../../hooks';
import type { User, Role } from '../../types';
import {
  Button,
  SearchInput,
  Pagination,
  Modal,
  Input,
  Select,
  PasswordInput,
  StarRating,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import { formatDate, formatRoleName, getRoleBadgeClass } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/error';

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  role: z.enum(['NORMAL_USER', 'STORE_OWNER', 'SYSTEM_ADMIN']),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const AdminUsersPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email' | 'address' | 'role'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        sortBy,
        sortOrder,
      });
      setUsers(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'NORMAL_USER',
    },
  });

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      await adminService.createUser(data);
      success(`User account for ${data.name} created!`, 'User Created');
      setIsCreateModalOpen(false);
      reset();
      fetchUsers();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Failed to Create User');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage system administrators, store owners, and normal platform customers
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create New User
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full lg:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, or address..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="NORMAL_USER">Normal User</option>
          </select>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="address">Address</option>
            <option value="role">Role</option>
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

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading users..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load users"
          message={error}
          onRetry={fetchUsers}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            search || roleFilter
              ? 'No users match your applied search query or role filter.'
              : 'There are currently no users registered in the system.'
          }
          actionLabel={search || roleFilter ? 'Clear Filters' : undefined}
          onAction={() => {
            setSearch('');
            setRoleFilter('');
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Store Rating</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {u.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-medium ${getRoleBadgeClass(
                          u.role
                        )}`}
                      >
                        {formatRoleName(u.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.role === 'STORE_OWNER' ? (
                        u.storeRating !== null && u.storeRating !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {u.storeRating.toFixed(1)} / 5.0
                            </span>
                            {u.storeName && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                ({u.storeName})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No store yet</span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{u.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForDetails(u)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        title="View Full User Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
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

      {/* View User Details Modal */}
      {selectedUserForDetails && (
        <Modal
          isOpen={!!selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          title="User Account Details"
          description="Detailed profile and store rating information"
          footer={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedUserForDetails(null)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-medium block">Full Name</span>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 block mt-0.5">
                  {selectedUserForDetails.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Role</span>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-medium ${getRoleBadgeClass(
                    selectedUserForDetails.role
                  )}`}
                >
                  {formatRoleName(selectedUserForDetails.role)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-medium block">Email</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 block mt-0.5">
                  {selectedUserForDetails.email}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-medium block">Address</span>
                <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                  {selectedUserForDetails.address}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Joined Date</span>
                <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                  {formatDate(selectedUserForDetails.createdAt)}
                </span>
              </div>
            </div>

            {/* Store Owner Rating Card */}
            {selectedUserForDetails.role === 'STORE_OWNER' && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>Store Owner Information</span>
                </div>
                {selectedUserForDetails.storeName ? (
                  <div className="space-y-1 pt-1">
                    <div className="text-slate-700 dark:text-slate-300">
                      Store Name: <strong>{selectedUserForDetails.storeName}</strong>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Store Rating:
                      </span>
                      <StarRating
                        value={selectedUserForDetails.storeRating || 0}
                        size="md"
                        showValue
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    This user does not currently have an assigned store in the system.
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision New User Account"
        description="Create an account directly with assigned role permissions."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit(handleCreateUser)}
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
          <Input
            label="Full Name (20-60 chars)"
            placeholder="Johnathan Doe Representative"
            error={formErrors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            error={formErrors.email?.message}
            {...register('email')}
          />

          <Select
            label="User Role"
            options={[
              { value: 'NORMAL_USER', label: 'Normal User (Can browse & rate)' },
              { value: 'STORE_OWNER', label: 'Store Owner (Owns store & views ratings)' },
              { value: 'SYSTEM_ADMIN', label: 'System Admin (Full system control)' },
            ]}
            error={formErrors.role?.message}
            {...register('role')}
          />

          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Address <span className="text-rose-500 ml-1">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="123 Corporate Park, Tech City"
              className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                formErrors.address
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              {...register('address')}
            />
            {formErrors.address && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {formErrors.address.message}
              </p>
            )}
          </div>

          <PasswordInput
            label="Password (8-16 chars, 1 uppercase, 1 special)"
            placeholder="••••••••"
            error={formErrors.password?.message}
            {...register('password')}
          />
        </form>
      </Modal>
    </div>
  );
};
