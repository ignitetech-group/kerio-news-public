import { query } from './db';

interface NewsItem {
  id: number;
  feed_slug: string;
  category: string;
  title: string;
  content: string;
  article_date: string;
  sort_order: number;
  is_active: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Build a complete news feed HTML page from news_items in the database.
 * Returns null if no items exist for this feed (caller should fall back to static HTML).
 */
export async function buildFeedPage(feedSlug: string): Promise<string | null> {
  try {
    const items = await query<NewsItem[]>(
      'SELECT * FROM news_items WHERE feed_slug = $1 AND is_active = true ORDER BY sort_order ASC, article_date DESC',
      [feedSlug]
    );

    if (items.length === 0) return null;

    // Get unique categories from the items
    const categories = [...new Set(items.map(i => i.category))];

    const articlesHtml = items.map(item => `
                <div class="news-article" data-tag="${escapeHtml(item.category)}">
                    <div class="article-header">
                        <span class="article-tag">${escapeHtml(item.category)}</span>
                        <span class="article-date">${formatDate(item.article_date)}</span>
                    </div>
                    <h2>${escapeHtml(item.title)}</h2>
                    ${item.content}
                </div>`).join('\n');

    const filterButtonsHtml = categories.map(cat =>
      `                    <button onclick="filterArticles('${escapeAttr(cat)}')">${escapeHtml(cat)}</button>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GFI Dashboard - News Feed</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; color: #121457; overflow-x: hidden; font-size: 11.2px; }
        .main-container { display: flex; flex-direction: row; width: 100%; max-width: 1075px; margin: 0 auto; padding: 0; min-height: 100vh; }
        .main-content { flex: 1; width: 100%; display: flex; flex-direction: column; gap: 35px; padding: 14px; }
        .news-feed { background-color: white; border-radius: 7px; padding: 14px; box-shadow: 0 2.8px 5.6px rgba(0, 0, 0, 0.1); width: 100%; }
        .news-feed .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .news-feed h2 { font-size: 1.05rem; color: #121457; margin: 0; }
        .clear-filters { background-color: transparent; border: 1px solid #121457; color: #121457; padding: 5.6px 8.4px; border-radius: 3.5px; cursor: pointer; font-size: 0.6125rem; }
        .clear-filters:hover { background-color: #1f2280; color: white; }
        .filter-buttons { display: flex; justify-content: space-between; gap: 7px; flex-wrap: wrap; margin-bottom: 14px; }
        .filter-buttons button { padding: 5.6px 7px; background-color: #E5F1FF; color: #3E4757; border: 1px solid #121457; border-radius: 3.5px; cursor: pointer; font-size: 0.6125rem; font-weight: bold; flex: 1; min-width: 100px; }
        .filter-buttons button:hover { background-color: #1f2280; color: white; }
        .cta-button { padding: 7px 14px; background-color: #121457; color: white; border: none; border-radius: 3.5px; cursor: pointer; text-align: center; display: inline-block; font-size: 0.7rem; font-weight: bold; transition: background-color 0.3s ease, transform 0.3s ease; text-decoration: none; }
        .cta-button:hover { background-color: #1f2280; transform: translateY(-1.4px); }
        .cta-button:active { transform: translateY(0); }
        .news-article { border-top: 2.8px solid #121457; background-color: white; padding: 10.5px; margin-bottom: 14px; box-shadow: 0 1.4px 3.5px rgba(0, 0, 0, 0.1); border-radius: 3.5px; display: block; }
        .article-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .article-tag { background-color: #e5f1ff; color: #121457; padding: 2.8px 5.6px; border-radius: 2.8px; font-size: 0.6125rem; font-weight: 600; }
        .article-date { font-size: 0.6125rem; color: #545f73; }
        .news-article h2 { font-size: 0.875rem; color: #121457; margin: 7px 0; }
        .news-article h3 { font-size: 0.77rem; color: #121457; margin: 10.5px 0 7px 0; }
        .news-article h4 { font-size: 0.7rem; color: #121457; margin: 8.4px 0 5.6px 0; }
        .news-article h5 { font-size: 0.63rem; color: #121457; margin: 7px 0 4.2px 0; }
        .news-article p { max-height: none; overflow: visible; line-height: 1.4; margin-bottom: 10.5px; }
        .news-article ul, .news-article ol { margin: 7px 0; padding-left: 14px; }
        .news-article li { margin-bottom: 3.5px; line-height: 1.3; }
        .news-article img { max-width: 100%; height: auto; margin: 7px 0; }
        .product-section { margin-bottom: 14px; }
        .product-section:last-child { margin-bottom: 0; }
        .note { font-style: italic; color: #666; margin-top: 14px; }
        @media (max-width: 768px) { .main-container { flex-direction: column; } }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="main-content">
            <div class="news-feed">
                <div class="header-row">
                    <h2>News feed</h2>
                    <button class="clear-filters" onclick="clearFilters()">Clear filters</button>
                </div>

                <div class="filter-buttons">
${filterButtonsHtml}
                </div>
${articlesHtml}

            </div>
        </div>
    </div>

    <script>
        function filterArticles(tag) {
            const articles = document.querySelectorAll('.news-article');
            articles.forEach(article => {
                const articleTag = article.getAttribute('data-tag');
                article.style.display = (articleTag === tag) ? 'block' : 'none';
            });
        }
        function clearFilters() {
            const articles = document.querySelectorAll('.news-article');
            articles.forEach(article => { article.style.display = 'block'; });
        }
    </script>
</body>
</html>`;
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
