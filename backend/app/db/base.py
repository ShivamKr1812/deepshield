# Import all the models so that Base has them registered before initializing tables
from app.core.database import Base
from app.models.user import User
from app.models.analysis import Analysis
from app.models.log import Log
from app.models.system import SystemMetric
