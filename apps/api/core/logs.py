import logging
import os
import sys
from python_json_logger import jsonlogger

# Determine the desired log level from environment variable
# Default to INFO if not set or invalid
_log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
_allowed_log_levels = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}
LOG_LEVEL = _allowed_log_levels.get(_log_level_str, logging.INFO)

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(  # noqa: ANN001
        self,
        log_record: dict,
        record: logging.LogRecord,
        message_dict: dict,
    ) -> None:
        super().add_fields(log_record, record, message_dict)
        # timestamp is provided via rename_fields mapping from record.asctime
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname.upper()

        log_record['logger_name'] = record.name
        # Remove default "message" if it's empty and there's a "msg" field from structlog style
        if not log_record.get('message') and log_record.get('msg'):
            log_record['message'] = log_record.pop('msg')

def setup_logging(log_level: int = LOG_LEVEL, app_name: str = "api"):
    """
    Sets up structured JSON logging for the application.
    """
    logger = logging.getLogger(app_name)
    logger.setLevel(log_level)
    logger.handlers = [] # Remove any existing handlers

    # Configure stream handler for stdout
    stream_handler = logging.StreamHandler(sys.stdout)
    
    # Use the custom JSON formatter
    # Example format: %(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(lineno)d %(message)s
    # These will be automatically picked up by JsonFormatter if present in the log record's extra fields
    # or can be added to the format_string if needed for non-extra fields.
    formatter = CustomJsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        rename_fields={"levelname": "level", "asctime": "timestamp"},
        datefmt="%Y-%m-%dT%H:%M:%S.%f" # ISO 8601 format (Z will be added by formatter)
    )
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    # Configure Uvicorn access loggers to use the same handlers and level if desired
    # This ensures Uvicorn's access logs are also in JSON format.
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    uvicorn_access_logger.handlers = [stream_handler]
    uvicorn_access_logger.setLevel(log_level)
    uvicorn_access_logger.propagate = False # Prevent duplicate logs if root logger is also configured

    # Configure Uvicorn error logger similarly
    uvicorn_error_logger = logging.getLogger("uvicorn.error")
    uvicorn_error_logger.handlers = [stream_handler]
    uvicorn_error_logger.setLevel(log_level) # Or a higher level like ERROR
    uvicorn_error_logger.propagate = False

    # Also configure the root logger to catch logs from other libraries
    # and format them as JSON, but only if they are not uvicorn logs
    # (to avoid double logging if uvicorn itself logs to root)
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    # Remove existing handlers from root logger to avoid conflicts or default formatting
    root_logger.handlers = []
    root_logger.addHandler(stream_handler) # Add our JSON handler

    logger.info(f"Logging setup complete for '{app_name}' with level {logging.getLevelName(log_level)}")

# Example usage:
# from api.core.logs import get_logger
# logger = get_logger(__name__)
# logger.info("This is an info message.")
# logger.error("This is an error message.", extra={"key": "value"})

def get_logger(name: str) -> logging.Logger:
    """
    Convenience function to get a logger instance.
    The logger should already be configured by setup_logging.
    """
    return logging.getLogger(name)
