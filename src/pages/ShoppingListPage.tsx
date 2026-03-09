import { useState, useEffect, useCallback } from 'react';
import {
  fetchShoppingList, addShoppingListItem, toggleShoppingListItem, deleteShoppingListItem,
  type ShoppingListItem,
} from '@/lib/api';
import { ShoppingCart, Plus, Trash2, Search } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';
import { clearAllCache } from '@/lib/cache';

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState('');
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      clearAllCache();
      const data = await fetchShoppingList();
      setItems(data);
    } catch {
      setError('Failed to load shopping list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItem.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      await addShoppingListItem(name);
      setNewItem('');
      await loadItems();
    } catch {
      setError('Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item: ShoppingListItem) => {
    // Optimistic update
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)));
    try {
      await toggleShoppingListItem(item.id, !item.checked);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)));
    }
  };

  const handleDelete = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteShoppingListItem(id);
    } catch {
      await loadItems();
    }
  };

  const filtered = filter
    ? items.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
    : items;

  if (loading) return <LoadingSpinner />;
  if (error && !items.length) return <ErrorState message={error} />;

  return (
    <div className="py-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Shopping List</h2>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newItem.trim()}
          className="px-4 py-2.5 rounded-full bg-[var(--color-brand-pink)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/* Search filter */}
      {items.length > 5 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter items..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-border-light)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors text-sm"
          />
        </div>
      )}

      {/* Items list */}
      {!filtered.length ? (
        <EmptyState icon={<ShoppingCart size={40} />} message={filter ? 'No items match your filter.' : 'Your shopping list is empty.'} />
      ) : (
        <div className="space-y-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors group"
            >
              <button
                onClick={() => handleToggle(item)}
                className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.checked
                    ? 'bg-[var(--color-brand-pink)] border-[var(--color-brand-pink)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-brand-pink)]'
                }`}
              >
                {item.checked && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${item.checked ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                {item.name}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="shrink-0 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-all"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
