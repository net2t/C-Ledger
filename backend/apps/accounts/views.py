from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.models import ActivityAction, ActivityLog


def _get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class TokenObtainPairWithActivitySerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = getattr(user, 'role', None)
        token['company_id'] = getattr(user, 'company_id', None)
        return token


class TokenObtainPairWithActivityView(TokenObtainPairView):
    serializer_class = TokenObtainPairWithActivitySerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = getattr(request, 'user', None)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        if getattr(user, 'company_id', None):
            ActivityLog.objects.create(
                company=user.company,
                action=ActivityAction.LOGIN,
                model_name='User',
                object_id=str(user.pk),
                user=user,
                ip_address=_get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                timestamp=timezone.now(),
                created_by=user,
                updated_by=user,
            )

        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response(
            {
                'id': u.pk,
                'username': u.get_username(),
                'email': getattr(u, 'email', ''),
                'role': getattr(u, 'role', None),
                'company_id': getattr(u, 'company_id', None),
            }
        )
