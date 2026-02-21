import logging
from ai.resources.youtube_client import get_youtube_client
from ai.resources.query_builder import build_youtube_query
from ai.resources.video_filter import is_high_quality

# Configure Logging
logger = logging.getLogger(__name__)

def fetch_youtube_resources(skill, domain, max_results=5):
    collected = []
    
    try:
        youtube = get_youtube_client()
    except Exception as e:
        logger.warning(f"YouTube Resource Fetch Error: {e}")
        return []

    queries = build_youtube_query(skill, domain)

    for query in queries:
        try:
            request = youtube.search().list(
                q=query,
                part="snippet",
                type="video,playlist",
                maxResults=5,
                relevanceLanguage="en"
            )

            response = request.execute()

            for item in response.get("items", []):
                if is_high_quality(item):
                    resource = {
                        "title": item["snippet"]["title"],
                        "type": item["id"]["kind"].split("#")[-1],
                        "url": f"https://www.youtube.com/watch?v={item['id'].get('videoId')}"
                               if "videoId" in item["id"]
                               else f"https://www.youtube.com/playlist?list={item['id'].get('playlistId')}"
                    }

                    collected.append(resource)

                    if len(collected) >= max_results:
                        return collected
                        
        except Exception as e:
            logger.warning(f"Failed to execute YouTube search for query '{query}': {e}")
            continue

    return collected
