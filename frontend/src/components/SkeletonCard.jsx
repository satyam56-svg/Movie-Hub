function SkeletonCard() {
    return (
        <div className="movie-card skeleton-card" aria-hidden="true">
            <div className="movie-poster skeleton-poster">
                <div className="skeleton-shimmer"></div>
            </div>
            <div className="movie-info">
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-year"></div>
                <div className="skeleton-text skeleton-badge"></div>
            </div>
        </div>
    )
}

export default SkeletonCard
