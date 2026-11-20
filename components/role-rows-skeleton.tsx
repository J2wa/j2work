export function RoleRowsSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading open roles</span>
      <ul className="role-list" aria-hidden="true">
        {[0, 1, 2].map((row) => (
          <li className="role-row" key={row}>
            <div className="role-row-details">
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
            </div>
            <div className="skeleton-pay" />
            <div className="skeleton-apply" />
          </li>
        ))}
      </ul>
    </div>
  );
}
