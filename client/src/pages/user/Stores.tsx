import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme';
import { storeApi } from '../../api/storeApi';
import { ratingApi } from '../../api/ratingApi';
import { Store } from '../../types';
import { useSort } from '../../hooks/useSort';
import { formatRating, getErrorMessage } from '../../utils/formatters';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

import SearchBar from '../../components/SearchBar/SearchBar';
import Select from '../../components/Select/Select';
import Stars from '../../components/Stars/Stars';
import Button from '../../components/Button/Button';
import Pagination from '../../components/Pagination/Pagination';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import Modal from '../../components/Modal/Modal';

export const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState<string>('');
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useSort('createdAt', 'desc');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rating Modal state
  const [activeRatingStore, setActiveRatingStore] = useState<Store | null>(null);
  const [pendingScore, setPendingScore] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await storeApi.getStores({
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
      setError(getErrorMessage(err, 'Failed to fetch stores'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const openRatingDialog = (store: Store) => {
    setRatingError(null);
    setActiveRatingStore(store);
    setPendingScore(store.userRating || 5);
  };

  const handleSaveRating = async () => {
    if (!activeRatingStore) return;

    setIsSubmittingRating(true);
    setRatingError(null);

    const hasExistingRating =
      activeRatingStore.userRating !== null && activeRatingStore.userRating !== undefined;

    try {
      if (hasExistingRating) {
        // Update existing rating via PATCH
        await ratingApi.updateRating(activeRatingStore.id, pendingScore);
      } else {
        // Submit new rating via POST
        await ratingApi.submitRating(activeRatingStore.id, pendingScore);
      }

      setSuccessToast(
        hasExistingRating
          ? `Your rating for "${activeRatingStore.name}" was updated to ${pendingScore} stars.`
          : `Thank you! Your ${pendingScore}-star rating for "${activeRatingStore.name}" was submitted.`
      );
      setTimeout(() => setSuccessToast(null), 4000);

      setActiveRatingStore(null);
      fetchStores();
    } catch (err: unknown) {
      setRatingError(getErrorMessage(err, 'Failed to submit rating. Please try again.'));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black }}>
          Discover & Rate Stores
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
          Browse verified merchants and share your authentic customer ratings (1 to 5 stars).
        </p>
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

      {/* Filter and Sorting Toolbar */}
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
          placeholder="Search by store name or address..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: 600 }}>
            SORT BY:
          </span>
          <div style={{ width: '180px' }}>
            <Select
              options={[
                { value: 'createdAt-desc', label: 'Newest First' },
                { value: 'name-asc', label: 'Store Name (A-Z)' },
                { value: 'name-desc', label: 'Store Name (Z-A)' },
                { value: 'address-asc', label: 'Address (A-Z)' },
              ]}
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f);
                setSortOrder(o as 'asc' | 'desc');
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Store Cards Grid */}
      {isLoading ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: theme.radii.lg,
            border: `1px solid ${theme.colors.border}`,
            padding: '60px 20px',
          }}
        >
          <LoadingState label="Loading verified merchant stores..." />
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          title="No stores found"
          description="There are currently no registered stores matching your search criteria."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {stores.map((store) => {
            const overall = store.overallRating ?? store.averageRating ?? 0;
            const hasUserRating =
              store.userRating !== null && store.userRating !== undefined;

            return (
              <div
                key={store.id}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radii.lg,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '24px',
                  boxShadow: theme.shadows.card,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: theme.transitions.fast,
                }}
              >
                <div>
                  {/* Top Bar with Overall Score Badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: theme.typography.sizes.lg,
                        fontWeight: theme.typography.weights.bold,
                        color: theme.colors.textPrimary,
                        lineHeight: 1.3,
                      }}
                    >
                      {store.name}
                    </h3>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: theme.radii.md,
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        fontWeight: theme.typography.weights.bold,
                        fontSize: theme.typography.sizes.xs,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: theme.colors.star }}>★</span>
                      <span>{formatRating(overall)}</span>
                      <span style={{ color: '#b45309', fontWeight: 500 }}>({store.totalRatings ?? 0})</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{
                        fontSize: theme.typography.sizes.xs,
                        color: theme.colors.textTertiary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>✉</span>
                      <span>{store.email}</span>
                    </div>

                    <div
                      style={{
                        fontSize: theme.typography.sizes.sm,
                        color: theme.colors.textSecondary,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ flexShrink: 0 }}>📍</span>
                      <span>{store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Action Box */}
                <div
                  style={{
                    borderTop: `1px solid ${theme.colors.border}`,
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: theme.colors.textMuted, fontWeight: 600 }}>
                      YOUR RATING
                    </div>
                    {hasUserRating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Stars value={store.userRating!} size="sm" />
                        <span
                          style={{
                            fontSize: theme.typography.sizes.xs,
                            fontWeight: theme.typography.weights.bold,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {store.userRating} / 5
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, fontStyle: 'italic' }}>
                        Not rated yet
                      </span>
                    )}
                  </div>

                  <Button
                    variant={hasUserRating ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => openRatingDialog(store)}
                  >
                    {hasUserRating ? 'Modify Rating' : 'Rate Store'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={(p) => setPage(p)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* INTERACTIVE RATING MODAL */}
      {/* ------------------------------------------------------------------ */}
      {activeRatingStore && (
        <Modal
          isOpen={!!activeRatingStore}
          onClose={() => {
            if (!isSubmittingRating) setActiveRatingStore(null);
          }}
          title={
            activeRatingStore.userRating !== null && activeRatingStore.userRating !== undefined
              ? `Update Rating for ${activeRatingStore.name}`
              : `Rate ${activeRatingStore.name}`
          }
          subtitle="Select 1 to 5 stars based on your shopping experience."
          maxWidth={460}
          footer={
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveRatingStore(null)}
                disabled={isSubmittingRating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmittingRating}
                disabled={isSubmittingRating}
                onClick={handleSaveRating}
              >
                {activeRatingStore.userRating !== null && activeRatingStore.userRating !== undefined
                  ? 'Update Rating'
                  : 'Submit Rating'}
              </Button>
            </>
          }
        >
          {ratingError && (
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
              {ratingError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              Click or use arrow keys (← →) and Enter:
            </div>

            <Stars
              value={pendingScore}
              onChange={(s) => setPendingScore(s)}
              size="lg"
              disabled={isSubmittingRating}
            />

            <div
              style={{
                fontSize: theme.typography.sizes['2xl'],
                fontWeight: theme.typography.weights.black,
                color: theme.colors.textPrimary,
              }}
            >
              {pendingScore} of 5 Stars
            </div>

            <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
              {pendingScore === 5 && 'Outstanding customer experience'}
              {pendingScore === 4 && 'Very good experience'}
              {pendingScore === 3 && 'Average experience'}
              {pendingScore === 2 && 'Needs improvement'}
              {pendingScore === 1 && 'Poor customer experience'}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Stores;
