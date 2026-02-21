def is_high_quality(video):
    """
    Filters videos based on heuristics
    """
    title = video["snippet"]["title"].lower()
    description = video["snippet"].get("description", "").lower()

    blacklist = ["shorts", "reel", "clip", "meme"]
    if any(word in title for word in blacklist):
        return False

    return True
