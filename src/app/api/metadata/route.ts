import { NextResponse } from 'next/server'

interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  type?: string
  url?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; readon.gr/1.0; +https://readon.gr/)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 })
    }

    const html = await response.text()
    
    // Extract OpenGraph and meta tags
    const metadata: OpenGraphData = {}
    
    // OpenGraph tags
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i)
    const ogType = html.match(/<meta\s+property="og:type"\s+content="([^"]+)"/i)
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)
    
    // Fallback to regular meta tags
    const title = html.match(/<title[^>]*>([^<]+)</i)
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
    
    metadata.title = ogTitle?.[1] || title?.[1] || ''
    metadata.description = ogDescription?.[1] || description?.[1] || ''
    metadata.image = ogImage?.[1] || ''
    metadata.siteName = ogSiteName?.[1] || new URL(url).hostname
    metadata.type = ogType?.[1] || 'website'
    metadata.url = ogUrl?.[1] || url

    // Clean up and decode HTML entities
    Object.keys(metadata).forEach(key => {
      if (typeof metadata[key as keyof OpenGraphData] === 'string') {
        metadata[key as keyof OpenGraphData] = (metadata[key as keyof OpenGraphData] as string)
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .trim()
      }
    })

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}