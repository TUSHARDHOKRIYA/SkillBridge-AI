import os
import googleapiclient.discovery

def get_youtube_client():
    api_key = os.getenv("YOUTUBE_API_KEY")
    
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY environment variable not found")

    return googleapiclient.discovery.build(
        "youtube", "v3", developerKey=api_key
    )
