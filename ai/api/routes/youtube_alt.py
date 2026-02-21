"""
YouTube alternatives route: fetch 2-3 alternative videos for the same topic.
Uses YouTube Data API v3.
"""
import os
import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/youtube", tags=["YouTube"])

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


def search_youtube(query: str, max_results: int = 5) -> list:
    """Search YouTube Data API and return video items."""
    if not YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YOUTUBE_API_KEY not configured")

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "order": "relevance",
        "videoDuration": "any",
        "key": YOUTUBE_API_KEY,
    }
    resp = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json().get("items", [])


def get_video_details(video_ids: list) -> dict:
    """Get duration details for a list of video IDs."""
    if not video_ids or not YOUTUBE_API_KEY:
        return {}
    params = {
        "part": "contentDetails,snippet",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY,
    }
    resp = requests.get("https://www.googleapis.com/youtube/v3/videos", params=params, timeout=10)
    resp.raise_for_status()
    items = resp.json().get("items", [])
    return {item["id"]: item for item in items}


def format_duration(iso_duration: str) -> str:
    """Convert ISO 8601 duration (PT1H2M3S) to human-readable."""
    import re
    hours = re.search(r"(\d+)H", iso_duration)
    minutes = re.search(r"(\d+)M", iso_duration)
    seconds = re.search(r"(\d+)S", iso_duration)
    parts = []
    if hours:
        parts.append(f"{hours.group(1)}h")
    if minutes:
        parts.append(f"{minutes.group(1)}m")
    if seconds and not hours:
        parts.append(f"{seconds.group(1)}s")
    return " ".join(parts) or "?"


@router.get("/alternatives")
async def get_alternative_videos(
    topic: str = Query(..., description="Topic to search for"),
    current_url: str = Query("", description="Current video URL to exclude")
):
    """
    Return 3 alternative YouTube videos for the same topic:
    - A short crash course
    - A longer deep dive
    - A project-based tutorial
    """
    current_video_id = ""
    if "v=" in current_url:
        current_video_id = current_url.split("v=")[-1].split("&")[0]

    try:
        # 3 targeted searches
        queries = [
            f"{topic} crash course quick",
            f"{topic} complete tutorial in depth",
            f"{topic} project tutorial hands on build",
        ]
        labels = ["Short Crash Course", "In-Depth Guide", "Project-Based"]
        
        alternatives = []
        for query, label in zip(queries, labels):
            items = search_youtube(query, max_results=5)
            for item in items:
                vid_id = item.get("id", {}).get("videoId")
                if not vid_id or vid_id == current_video_id:
                    continue

                snippet = item.get("snippet", {})
                
                # Get duration info
                details = get_video_details([vid_id])
                duration_iso = details.get(vid_id, {}).get("contentDetails", {}).get("duration", "")
                duration_str = format_duration(duration_iso) if duration_iso else "?"

                alternatives.append({
                    "title": snippet.get("title", ""),
                    "channel": snippet.get("channelTitle", ""),
                    "url": f"https://www.youtube.com/watch?v={vid_id}",
                    "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                    "duration": duration_str,
                    "label": label,
                })
                break  # One match per category

        return {"alternatives": alternatives, "topic": topic}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")
