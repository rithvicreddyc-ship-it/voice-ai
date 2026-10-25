/**
 * InGPT Search Service
 * Real-time facts, summaries, and search via DuckDuckGo and Wikipedia APIs.
 */

export async function searchWeb(query = '') {
  if (!query || !query.trim()) {
    return { error: true, message: 'Query cannot be empty.' };
  }

  const cleanQuery = query.trim();

  // Try DuckDuckGo Instant Answer first
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl, { signal: AbortSignal.timeout(4000) });
    if (ddgRes.ok) {
      const data = await ddgRes.json();
      if (data.AbstractText) {
        return {
          success: true,
          source: data.AbstractSource || 'DuckDuckGo',
          sourceUrl: data.AbstractURL,
          title: data.Heading,
          snippet: data.AbstractText,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('DuckDuckGo search error:', err.message);
  }

  // Fallback to Wikipedia summary API
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery.replace(/\s+/g, '_'))}`;
    const wikiRes = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'InGPT-Assistant/1.0 (info@ingpt.ai)' },
      signal: AbortSignal.timeout(4000)
    });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract) {
        return {
          success: true,
          source: 'Wikipedia',
          sourceUrl: wikiData.content_urls?.desktop?.page || '',
          title: wikiData.title,
          snippet: wikiData.extract,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Wikipedia search error:', err.message);
  }

  return {
    success: false,
    message: `No immediate live web extract available for "${cleanQuery}".`
  };
}
