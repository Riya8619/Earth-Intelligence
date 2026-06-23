from datetime import timedelta

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)


def create_user_password(password: str) -> str:
    """
    Hash user password before storing in database.
    """
    return hash_password(password)


def check_user_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify login password.
    """
    return verify_password(
        plain_password,
        hashed_password,
    )


def generate_access_token(
    user_id: int,
    email: str,
) -> str:
    """
    Generate JWT access token.
    """

    payload = {
        "sub": str(user_id),
        "email": email,
    }

    return create_access_token(
        payload,
        timedelta(minutes=60),
    )