class NotFoundError(Exception):
    def __init__(self, resource: str, resource_id: int):
        self.resource = resource
        self.resource_id = resource_id
        self.message = f"{resource} with id {resource_id} not found."
        super().__init__(self.message)

class DuplicateError(Exception):
    def __init__(self, field: str, value: str):
        self.field = field
        self.value = value
        self.message = f"{field} '{value}' already exists."
        super().__init__(self.message)

class InsufficientStockError(Exception):
    def __init__(self, product_id: int, available: int, requested: int):
        self.product_id = product_id
        self.available = available
        self.requested = requested
        self.message = f"Insufficient stock for product {product_id}. Available: {available}, Requested: {requested}."
        super().__init__(self.message)

class OrderCancellationError(Exception):
    def __init__(self, reason: str):
        self.reason = reason
        self.message = f"Order cannot be cancelled/deleted: {reason}."
        super().__init__(self.message)

class DependencyError(Exception):
    def __init__(self, resource: str, resource_id: int, reason: str):
        self.resource = resource
        self.resource_id = resource_id
        self.reason = reason
        self.message = f"{resource} with id {resource_id} cannot be deleted: {reason}."
        super().__init__(self.message)
