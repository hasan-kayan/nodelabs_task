import { Input } from '../../../components/ui/input.jsx';

export default function ProjectFilters({ filters, onFiltersChange, teams = [] }) {
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
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="completed">Completed</option>
      </select>
      {teams.length > 0 && (
        <select
          value={filters.teamId || ''}
          onChange={(e) => onFiltersChange({ ...filters, teamId: e.target.value || '' })}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
