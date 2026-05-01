from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN')


class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', None) in {'ADMIN', 'STAFF'})


class StaffCreateAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        role = getattr(request.user, 'role', None)
        if request.method == 'POST':
            return role in {'ADMIN', 'STAFF'}
        return role == 'ADMIN'


class StaffOrAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        role = getattr(request.user, 'role', None)
        return role in {'ADMIN', 'STAFF'}
