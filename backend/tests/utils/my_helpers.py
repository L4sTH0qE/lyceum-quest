import uuid


def is_uuidv4(uuid_string):
    try:
        # Attempt to create a UUID object from the string
        val = uuid.UUID(uuid_string, version=4)
    except ValueError:
        # If it raises a ValueError, it's not a valid UUID
        return False
    # Check if the generated UUID matches the input string
    return str(val) == uuid_string
