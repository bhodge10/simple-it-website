/**
 * Google Reviews Component for Simple IT
 * Fetches and displays real Google reviews on your website
 */

class GoogleReviews {
    constructor(config) {
        this.placeId = config.placeId;
        this.container = document.getElementById(config.containerId);
        this.maxReviews = config.maxReviews || 6;
        this.minRating = config.minRating || 4; // Only show 4-5 star reviews
    }

    /**
     * Fetch reviews from our Netlify Function
     */
    async fetchReviews() {
        if (!this.container) {
            console.error('Reviews container not found');
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(`/.netlify/functions/get-reviews?placeId=${this.placeId}`);
            const data = await response.json();

            if (data.success && data.reviews) {
                this.displayReviews(data.reviews, data.rating, data.totalReviews);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            this.showError();
        }
    }

    /**
     * Display reviews in the container
     */
    displayReviews(allReviews, overallRating, totalReviews) {
        // Filter and sort reviews
        const filteredReviews = allReviews
            .filter(review => review.rating >= this.minRating)
            .slice(0, this.maxReviews);

        if (filteredReviews.length === 0) {
            this.showError('No reviews available');
            return;
        }

        const reviewsHTML = filteredReviews.map(review => this.createReviewCard(review)).join('');

        this.container.innerHTML = `
            <div class="reviews-header">
                <div class="overall-rating">
                    <div class="rating-number">${overallRating.toFixed(1)}</div>
                    <div class="rating-stars">${this.renderStars(overallRating)}</div>
                    <div class="rating-count">Based on ${totalReviews}+ Google Reviews</div>
                </div>
            </div>

            <div class="reviews-grid">
                ${reviewsHTML}
            </div>

            <div class="reviews-footer">
                <a href="https://search.google.com/local/writereview?placeid=${this.placeId}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-review">
                    Leave Us a Review on Google →
                </a>
                <p class="reviews-footnote">Reviews are fetched directly from Google and updated daily</p>
            </div>
        `;
    }

    /**
     * Create HTML for a single review card
     */
    createReviewCard(review) {
        // Handle different field names from new Places API
        const reviewText = review.text?.text || review.text || '';
        const authorName = review.authorAttribution?.displayName || review.author_name || 'Anonymous';
        const authorPhoto = review.authorAttribution?.photoUri || review.profile_photo_url || '';
        const rating = review.rating || 5;
        
        const truncatedText = this.truncateText(reviewText, 200);
        const hasMore = reviewText.length > 200;

        return `
            <div class="review-card" data-rating="${rating}">
                <div class="review-header">
                    <div class="review-author">
                        <img src="${authorPhoto}" 
                             alt="${this.escapeHtml(authorName)}" 
                             class="review-avatar"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%231A1F3A%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 fill=%22%230066FF%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3E${this.getInitials(authorName)}%3C/text%3E%3C/svg%3E'">
                        <div>
                            <div class="review-author-name">${this.escapeHtml(authorName)}</div>
                            <div class="review-date">${this.formatRelativeTime(review.time || review.publishTime)}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(rating)}
                    </div>
                </div>
                <div class="review-text">
                    "${this.escapeHtml(truncatedText)}"
                    ${hasMore ? '<span class="read-more">...</span>' : ''}
                </div>
                ${rating === 5 ? '<div class="verified-badge">✓ Verified Google Review</div>' : ''}
            </div>
        `;
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<span class="star star-full">★</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<span class="star star-half">★</span>';
            } else {
                stars += '<span class="star star-empty">☆</span>';
            }
        }

        return `<span class="stars">${stars}</span>`;
    }

    /**
     * Format timestamp to relative time
     */
    formatRelativeTime(timestamp) {
        if (!timestamp) return 'Recently';
        
        // Handle both Unix timestamp (old API) and ISO string (new API)
        let date;
        if (typeof timestamp === 'string') {
            // New API returns ISO string like "2024-01-26T10:00:00Z"
            date = new Date(timestamp);
        } else {
            // Old API returns Unix timestamp
            date = new Date(timestamp * 1000);
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substr(0, 2);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="reviews-loading">
                <div class="loading-spinner"></div>
                <p>Loading reviews from Google...</p>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError(message = 'Unable to load reviews at this time') {
        this.container.innerHTML = `
            <div class="reviews-error">
                <p>${message}</p>
                <a href="https://search.google.com/local/writereview?placeid=${this.placeId}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn btn-review">
                    View Our Reviews on Google →
                </a>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const reviewsContainer = document.getElementById('google-reviews');
    
    if (reviewsContainer) {
        // Initialize with your Google Place ID
        const reviews = new GoogleReviews({
            placeId: 'ChIJdbPTg2PGhYgRbMm8uG-K0FQ', // Simple IT Place ID
            containerId: 'google-reviews',
            maxReviews: 5,
            minRating: 4
        });
        
        reviews.fetchReviews();
    }
});
