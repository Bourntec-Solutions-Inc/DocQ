from django.urls import path
from .views import LoginAPIView, RegisterAPIView, UserProfileAPIView

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("me/", UserProfileAPIView.as_view(), name="user-profile"),
]
