from slowapi import Limiter
from slowapi.util import get_remote_address

# Khởi tạo bộ đếm giới hạn dựa trên địa chỉ IP người dùng
limiter = Limiter(key_func=get_remote_address)