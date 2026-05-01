from pathlib import Path

from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import MeView, TokenObtainPairWithActivityView
from apps.ledger.views import (
    BackupExportView,
    BackupImportView,
    ClientViewSet,
    DashboardAnalyticsView,
    ImportJobViewSet,
    LedgerEntryViewSet,
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'ledger-entries', LedgerEntryViewSet, basename='ledger-entry')
router.register(r'import-jobs', ImportJobViewSet, basename='import-job')

urlpatterns = [
    path(
        '',
        lambda request: HttpResponse(
            (Path(__file__).resolve().parents[2] / 'index.html').read_text(encoding='utf-8'),
            content_type='text/html',
        ),
        name='frontend',
    ),
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairWithActivityView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/backup/export/', BackupExportView.as_view(), name='backup_export'),
    path('api/backup/import/', BackupImportView.as_view(), name='backup_import'),
    path('api/analytics/dashboard/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('api/', include(router.urls)),
]
