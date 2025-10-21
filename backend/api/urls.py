from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

#########################




from .views import (
    LeadViewSet,
    CustomerViewSet,
    ServiceViewSet,
    BookingViewSet,
    RefundViewSet,
    ProductViewSet,
    VendorViewSet,
    VendorSlotViewSet,
    RegisterView,
    LoginView,
    UserViewSet,
    current_user,
    logout,
    UserProfilePictureViewSet,
    OrderViewSet,
    PaymentViewSet
)

router = DefaultRouter()
router.register("leads", LeadViewSet)
router.register("customers", CustomerViewSet)
router.register("services", ServiceViewSet)
router.register("bookings", BookingViewSet)
router.register("refunds", RefundViewSet)
router.register("products", ProductViewSet)
router.register("users", UserViewSet)
router.register("vendors", VendorViewSet)
router.register("vendor-slots", VendorSlotViewSet)
# Optional: expose profile picture upload endpoints under a route (if you want)
router.register("user-profile-pictures", UserProfilePictureViewSet, basename="user-profile-pictures")
router.register("orders", OrderViewSet)
router.register("payments", PaymentViewSet, basename="payments")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", current_user, name="current-user"),
    path("auth/logout/", logout, name="logout"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


