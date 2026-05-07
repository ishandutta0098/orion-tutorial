import datetime
from enum import Enum

class LogLevel(Enum):
    INFO = 'INFO'
    WARNING = 'WARNING'
    ERROR = 'ERROR'

class SimpleLogger:
    """
    A simple logger that writes timestamped messages to a log file.
    """

    def __init__(self, log_file: str) -> None:
        """
        Initializes the SimpleLogger with the specified log file.

        :param log_file: The path to the log file.
        """
        self.log_file = log_file

    def log(self, message: str, level: LogLevel = LogLevel.INFO) -> None:
        """
        Logs a message with a timestamp and level to the log file.

        :param message: The message to log.
        :param level: The level of the log message (INFO, WARNING, ERROR).
        """
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f'[{timestamp}] [{level.value}] {message}\n'
        with open(self.log_file, 'a') as file:
            file.write(log_entry)

    def filter_logs(self, level: LogLevel) -> list[str]:
        """
        Retrieves all log entries of the specified level.

        :param level: The log level to filter by.
        :return: A list of log entries with the specified level.
        """
        filtered_logs = []
        with open(self.log_file, 'r') as file:
            for line in file:
                if f'[{level.value}]' in line:
                    filtered_logs.append(line.strip())
        return filtered_logs
