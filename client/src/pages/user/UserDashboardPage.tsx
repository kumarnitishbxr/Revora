import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Star,
  MapPin,
  Mail,
  ArrowUpDown,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { storeService } from '../../services/store.service';
import { ratingService } from '../../services/rating.service';
import { useAuth, useToast, useDebounce } from '../../hooks';
import type { Store } from '../../types';
import {
  Button,
  SearchInput,
  StarRating,
  Pagination,
  Modal,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import { getErrorMessage } from '../../utils/error';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'address'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await storeService.getStores({
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
      setFetchError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Reset to page 1 on new search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openRatingModal = (store: Store) => {
    setSelectedStore(store);
    setSelectedRating(store.userRating || 5);
  };

  const closeRatingModal = () => {
    setSelectedStore(null);
    setIsSubmittingRating(false);
  };

  const handleRatingSubmit = async () => {
    if (!selectedStore) return;

    setIsSubmittingRating(true);
    try {
      let res;
      if (selectedStore.userRating) {
        // User already rated -> use PATCH
        res = await ratingService.updateRating(selectedStore.id, selectedRating);
        success(`Rating updated to ${selectedRating} stars!`, 'Rating Updated');
      } else {
        // First rating -> use POST
        res = await ratingService.submitRating(selectedStore.id, selectedRating);
        success(`Submitted ${selectedRating} star rating!`, 'Rating Submitted');
      }

      // Update store state in-place without page reload
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              overallRating: res.averageRating,
              totalRatings: res.totalRatings,
              userRating: selectedRating,
            };
          }
          return s;
        })
      );

      closeRatingModal();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Rating Submission Failed');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Stores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse registered businesses, view verified community ratings, and share your reviews
          </p>
        </div>

        {/* User quick status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Signed in as <strong>{user?.name}</strong></span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by store name or address..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </div>

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
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>

      {/* Stores Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading stores directory..." />
        </div>
      ) : fetchError ? (
        <ErrorState
          title="Could not load stores"
          message={fetchError}
          onRetry={fetchStores}
        />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No stores found"
          description={
            search
              ? `No businesses matched your search "${search}". Try different keywords.`
              : 'There are currently no stores available in the directory.'
          }
          actionLabel={search ? 'Clear Search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => {
            const hasUserRated = store.userRating !== null && store.userRating !== undefined;

            return (
              <div
                key={store.id}
                className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Bar with rating badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                      {store.name}
                    </h3>
                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{store.overallRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Rating summary & action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <StarRating value={store.overallRating} size="sm" />
                      <span className="text-[11px] text-slate-400">
                        ({store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {hasUserRated && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Rated: {store.userRating}★
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={hasUserRated ? 'outline' : 'primary'}
                    className="w-full"
                    onClick={() => openRatingModal(store)}
                    leftIcon={<Star className="w-3.5 h-3.5" />}
                  >
                    {hasUserRated ? 'Modify My Rating' : 'Rate This Store'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && stores.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      )}

      {/* Interactive Rating Modal */}
      {selectedStore && (
        <Modal
          isOpen={!!selectedStore}
          onClose={closeRatingModal}
          title={
            selectedStore.userRating ? `Update Rating for ${selectedStore.name}` : `Rate ${selectedStore.name}`
          }
          description="Select a score from 1 to 5 stars to share your verified experience."
          maxWidth="sm"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={closeRatingModal}
                disabled={isSubmittingRating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRatingSubmit}
                isLoading={isSubmittingRating}
                leftIcon={<Star className="w-4 h-4 fill-white" />}
              >
                {selectedStore.userRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </>
          }
        >
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {selectedRating} / 5
            </div>

            <StarRating
              value={selectedRating}
              onChange={setSelectedRating}
              interactive
              size="lg"
            />

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              {selectedRating === 5 && 'Outstanding — Excellent service and experience!'}
              {selectedRating === 4 && 'Good — Satisfying experience overall.'}
              {selectedRating === 3 && 'Average — Met expectations.'}
              {selectedRating === 2 && 'Fair — Needs improvement.'}
              {selectedRating === 1 && 'Poor — Disappointing experience.'}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
