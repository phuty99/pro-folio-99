from fastapi import Request


def get_client_ip(request: Request) -> str:
    # The last X-Forwarded-For hop is the one appended by our own reverse proxy; earlier hops are client-controlled.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"
