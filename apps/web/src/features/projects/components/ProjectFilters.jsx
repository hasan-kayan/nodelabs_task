import { Input } from '../../../components/ui/input.jsx';

export default function ProjectFilters({ filters, onFiltersChange }) {
  return (
    <div className="flex gap-4 mb-4">
      <Input
        placeholder="Search projects..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="max-w-sm"
      />
      <select
        value={filters.status}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        className="border rounded-md px-3 py-2"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
