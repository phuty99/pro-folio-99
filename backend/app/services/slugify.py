import re
import uuid

_NON_SLUG_CHARS = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    slug = _NON_SLUG_CHARS.sub("-", text.strip().lower()).strip("-")
    return slug or uuid.uuid4().hex[:8]
