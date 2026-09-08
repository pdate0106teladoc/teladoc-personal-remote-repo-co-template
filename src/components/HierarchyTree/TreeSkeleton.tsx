export const TreeSkeleton = ({ level }: { level: number }) => (
    <div
        className="tree-node skeleton"
        style={{ paddingLeft: `${level * 1.5}rem` }}
    >
        <div className="tree-node-content">
            <div className="spinner-border spinner-border-sm text-secondary me-3" />
            <div className="skeleton-text" />
        </div>
    </div>
);
