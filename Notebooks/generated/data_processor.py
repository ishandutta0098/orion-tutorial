from typing import List, Dict, Any, Tuple

class DataProcessor:
    def __init__(self, data: List[Dict[str, Any]]) -> None:
        """Initialize the DataProcessor with a list of dictionaries."""
        self.data = data

    def filter_by(self, key: str, value: Any) -> List[Dict[str, Any]]:
        """Filter the data by a specified key and value."
        return [item for item in self.data if item.get(key) == value]

    def group_by(self, key: str) -> Dict[Any, List[Dict[str, Any]]]:
        """Group the data by a specified key."""
        grouped_data: Dict[Any, List[Dict[str, Any]]] = {}
        for item in self.data:
            group_key = item.get(key)
            if group_key not in grouped_data:
                grouped_data[group_key] = []
            grouped_data[group_key].append(item)
        return grouped_data

    def summarize(self) -> Tuple[int, List[str], Dict[str, Any]]:
        """Return a summary of the data including count, keys present, and a sample row."""
        count = len(self.data)
        keys_present = list({key for item in self.data for key in item.keys()})
        sample_row = self.data[0] if count > 0 else { }
        return count, keys_present, sample_row
