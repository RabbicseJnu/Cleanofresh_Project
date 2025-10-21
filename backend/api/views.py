from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Count
from django.utils.timezone import now
from datetime import timedelta, datetime, timezone
import json
from django.contrib.auth import get_user_model
from django.db import transaction
import uuid
from django.conf import settings
from sslcommerz_lib import SSLCOMMERZ
from django.views.decorators.csrf import csrf_exempt

config = {
    "store_id": settings.SSLCOMMERZ_STORE_ID,
    "store_pass": settings.SSLCOMMERZ_STORE_PASSWORD,
    "issandbox": getattr(settings, "SSLCOMMERZ_SANDBOX", True),
}

from .models import (
    Lead, Customer, Service, Booking, Refund, Product, Vendor, VendorSlot, User,
    ServiceType, SERVICE_TYPE_TO_SUBTYPES, SERVICE_SUBTYPE_EXTRAS, Order, OrderItem, Payment
)
from .serializers import (
    LeadSerializer,
    CustomerSerializer,
    ServiceSerializer,
    BookingSerializer,
    RefundSerializer,
    ProductSerializer,
    VendorSerializer,
    VendorSlotSerializer,
    UserSerializer,
    OrderSerializer, 
    OrderItemSerializer,
    PaymentSerializer,
    PaymentInitSerializer,
)

# ---------------------------------------------------------
# AUTH / CURRENT USER
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user, context={"request": request})
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"status": "logged out"})

User = get_user_model()

class RegisterView(APIView):
    """
    Handles registration for Customer, Vendor, and Admin users.
    Accepts multipart/form-data with optional profile_picture.
    """

    def post(self, request, *args, **kwargs):
        print("===== Incoming request data =====")
        for key, val in request.data.items():
            print(key, ":", val)

        try:
            username = request.data.get("username", "").strip()
            email = request.data.get("email", "").strip()
            password = request.data.get("password", "").strip()
            first_name = request.data.get("first_name", "").strip()
            last_name = request.data.get("last_name", "").strip()
            role = request.data.get("role", "").strip()
            profile_picture = request.FILES.get("profile_picture")

            # Basic validation
            errors = {}
            if not username:
                errors["username"] = "Username is required."
            if not email:
                errors["email"] = "Email is required."
            if not password:
                errors["password"] = "Password is required."
            if role not in ["Customer", "Vendor", "Admin"]:
                errors["role"] = f"Invalid role: {role}"

            if User.objects.filter(username=username).exists():
                errors["username"] = "Username already exists."
            if User.objects.filter(email=email).exists():
                errors["email"] = "Email already exists."

            if errors:
                print("Validation errors:", errors)
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role=role
                )


                if profile_picture:
                    user.profile_picture = profile_picture
                    user.save()
                    print("Saved profile_picture:", profile_picture.name)

                # Handle role-specific data
                if role == "Customer":
                    customer_data_raw = request.data.get("customer")
                    try:
                        customer_data = json.loads(customer_data_raw) if customer_data_raw else {}
                    except json.JSONDecodeError:
                        return Response({"customer": "Invalid JSON"}, status=400)

                    phone = customer_data.get("phone")
                    address = customer_data.get("address")
                    area = customer_data.get("area")

                    if not phone:
                        errors["phone"] = "Phone is required."
                    if not address:
                        errors["address"] = "Address is required."
                    if not area:
                        errors["area"] = "Area is required."

                    if errors:
                        return Response({"errors": errors}, status=400)

                    Customer.objects.create(
                        user=user,
                        phone=phone,
                        address=address,
                        area=area
                    )
                    print(f"Customer created for user {user.username}")

                elif role == "Vendor":
                    vendor_data_raw = request.data.get("vendor")
                    try:
                        vendor_data = json.loads(vendor_data_raw) if vendor_data_raw else {}
                    except json.JSONDecodeError:
                        return Response({"vendor": "Invalid JSON"}, status=400)

                    contact_number = vendor_data.get("contact_number")
                    area = vendor_data.get("area")
                    bio = vendor_data.get("bio", "")
                    services_list = vendor_data.get("services_list", [])
                    skills = vendor_data.get("skills", [])
                    slots = vendor_data.get("slots", [])

                    # Validation
                    if not contact_number:
                        errors["contact_number"] = "Contact number is required."
                    if not area:
                        errors["area"] = "Area is required."
                    if not services_list:
                        errors["services_list"] = "At least one service is required."
                    if not skills:
                        errors["skills"] = "At least one skill is required."
                    if not slots or len(slots) < 5:
                        errors["slots"] = "At least 5 slots are required."

                    if errors:
                        return Response({"errors": errors}, status=400)

                    vendor = Vendor.objects.create(
                        user=user,
                        contact_number=contact_number,
                        area=area,
                        bio=bio,
                        services_list=services_list,
                        skills=skills
                    )
                    # Save slots if needed, assuming you have a VendorSlot model
                    if hasattr(vendor, "slots") and slots:
                        for s in slots:
                            day = s.get("day")
                            start_time = s.get("start_time")
                            end_time = s.get("end_time")
                            if day and start_time and end_time:
                                vendor.slots.create(
                                    day=day,
                                    start_time=start_time,
                                    end_time=end_time
                                )
                    print(f"Vendor created for user {user.username}")

                # For Admin, you can handle if needed

                return Response({"success": True, "username": user.username}, status=201)

        except Exception as e:
            print("Unexpected error during registration:", str(e))
            return Response({"error": str(e)}, status=500)



class LoginView(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(user, context={"request": request})
            return Response({"token": token.key, "user": serializer.data})
        return Response({"error": "Invalid credentials"}, status=400)

# ---------------------------------------------------------
# USER VIEWSETS
# ---------------------------------------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=["post"], url_path="set-role")
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if role not in ["Admin", "Customer", "Vendor"]:
            return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.save()
        return Response({"status": "success", "role": user.role})

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

class UserProfilePictureViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=True, methods=["post"], url_path="upload-profile-picture")
    def upload_profile_picture(self, request, pk=None):
        user = self.get_object()
        file = request.FILES.get("profile_picture")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        user.profile_picture = file
        user.save()
        return Response({
            "status": "success",
            "profile_picture": request.build_absolute_uri(user.profile_picture.url)
        })

# ---------------------------------------------------------
# LEAD VIEWSET
# ---------------------------------------------------------
class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by("-created_at")
    serializer_class = LeadSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=["get"], url_path="stats/today")
    def new_leads_today(self, request):
        today = now().date()
        count = Lead.objects.filter(created_at__date=today).count()
        return Response({"new_leads_today": count})

    @action(detail=False, methods=["get"], url_path="stats/by-status")
    def leads_by_status(self, request):
        data = Lead.objects.values("status").annotate(total=Count("id"))
        return Response(data)

    @action(detail=False, methods=["get"], url_path="stats/top-sources")
    def top_sources(self, request):
        last_week = now() - timedelta(days=7)
        data = (
            Lead.objects.filter(created_at__gte=last_week)
            .values("source")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )
        return Response(data)

    @action(detail=True, methods=["post"], url_path="convert")
    def convert_to_customer(self, request, pk=None):
        lead = self.get_object()
        if lead.status == "Converted":
            return Response({"error": "Lead already converted"}, status=400)
        lead.status = "Converted"
        lead.save()
        customer = getattr(lead, "customer", None)
        return Response({"message": "Lead converted to customer", "customer_id": customer.id if customer else None})

# ---------------------------------------------------------
# CUSTOMER, SERVICE, VENDOR, VENDOR SLOT
# ---------------------------------------------------------
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-joined_at")
    serializer_class = CustomerSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = Service.objects.all()
        service_type = self.request.query_params.get("type")
        subtype = self.request.query_params.get("subtype")
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        if subtype:
            queryset = queryset.filter(service_subtype=subtype)
        return queryset

    @action(detail=False, methods=["get"], url_path="types")
    def types(self, request):
        return Response([choice[0] for choice in ServiceType.choices])

    @action(detail=False, methods=["get"], url_path="subtypes")
    def subtypes(self, request):
        service_type = request.query_params.get("type")
        if not service_type:
            return Response({"error": "Missing 'type' query param"}, status=400)

        subtypes = SERVICE_TYPE_TO_SUBTYPES.get(service_type, [])
        return Response([st for st in subtypes])

    @action(detail=False, methods=["get"], url_path="extras")
    def extras(self, request):
        subtype = request.query_params.get("subtype")
        if not subtype:
            return Response({"error": "Missing 'subtype' query param"}, status=400)

        extras_dict = SERVICE_SUBTYPE_EXTRAS.get(subtype, {})

        return Response({
            "subtype": subtype,
            "extras": [
                {"name": name, "price": price}
                for name, price in extras_dict.items()
            ]
        })


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    @action(detail=True, methods=["get"], url_path="slots")
    def get_slots(self, request, pk=None):
        vendor = self.get_object()
        slots = vendor.slots.all()
        serializer = VendorSlotSerializer(slots, many=True, context={"request": request})
        return Response(serializer.data)

class VendorSlotViewSet(viewsets.ModelViewSet):
    queryset = VendorSlot.objects.all()
    serializer_class = VendorSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def list(self, request, *args, **kwargs):
        vendor_id = request.query_params.get("vendor_id")
        qs = self.get_queryset()
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        vendor = Vendor.objects.get(user=self.request.user)
        serializer.save(vendor=vendor)

# ---------------------------------------------------------
# BOOKING VIEWSET
# ---------------------------------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("start_datetime")
    serializer_class = BookingSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        # Saves the booking and calculates total_price automatically
        serializer.save()

    def perform_update(self, serializer):
        # Saves the booking and recalculates total_price if details changed
        serializer.save()
# ---------------------------------------------------------
# REFUND VIEWSET
# ---------------------------------------------------------
class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all().order_by("-created_at")
    serializer_class = RefundSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.validated_data["booking"]
        if hasattr(booking, "refund"):
            return Response({"error": "Refund already exists for this booking."}, status=400)
        refund = serializer.save()
        return Response(RefundSerializer(refund).data, status=201)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        refund = self.get_object()
        new_status = request.data.get("status")
        if new_status not in [choice[0] for choice in Refund.STATUS_CHOICES]:
            return Response({"error": "Invalid status."}, status=400)
        refund.status = new_status
        refund.save()
        return Response({"status": "success", "refund_status": refund.status})

# ---------------------------------------------------------
# PRODUCT VIEWSET
# ---------------------------------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-id")
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_context(self):
        # ✅ Pass request into serializer so image_url works
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        """Custom create to handle multipart (with image)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Custom update to handle multipart (with image)."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        """Extra endpoint: return products with stock < 5"""
        low_stock_products = Product.objects.filter(stock__lt=5)
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)



# ---------------------------------------------------------
# ORDER VIEWSET
# ---------------------------------------------------------
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response({"error": "Invalid status."}, status=400)
        order.status = new_status
        order.save()
        return Response({"status": "success", "order_status": order.status})

    @action(detail=False, methods=["get"], url_path="by-customer")
    def by_customer(self, request):
        customer_id = request.query_params.get("customer_id")
        if not customer_id:
            return Response({"error": "Missing 'customer_id'"}, status=400)
        orders = self.get_queryset().filter(customer_id=customer_id)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

###################Payment##########################
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer
    
    @action(detail=False, methods=["post"])
    def initiate(self, request):
        serializer = PaymentInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking_id = serializer.validated_data["booking_id"]
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            transaction_id=str(uuid.uuid4())
        )

        # Configure SSLCOMMERZ
        config = {
            "store_id": settings.SSLCOMMERZ_STORE_ID,
            "store_pass": settings.SSLCOMMERZ_STORE_PASSWORD,
            "issandbox": getattr(settings, "SSLCOMMERZ_SANDBOX", True),
        }
        sslc = SSLCOMMERZ(config)

        # Initialize payment
        payload = {
            "total_amount": float(payment.amount),
            "currency": "BDT",
            "tran_id": payment.transaction_id,
            "success_url": settings.SSLCOMMERZ_SUCCESS_URL,
            "fail_url": settings.SSLCOMMERZ_FAIL_URL,
            "cancel_url": settings.SSLCOMMERZ_CANCEL_URL,
            "cus_name": f"{booking.customer.user.first_name} {booking.customer.user.last_name}",
            "cus_email": booking.customer.user.email,
            "cus_add1": booking.customer.address,
            "cus_city": booking.customer.area,
            "cus_postcode": "1216",
            "cus_country": "Bangladesh",
            "cus_phone": booking.customer.phone,
            "shipping_method": "NO",
            "product_name": str(booking.service.name),
            "product_category": "Cleaning",
            "num_of_item": 1,
            "product_profile": "general",
        } 
        
        response_data = sslc.createSession(payload)
        print("SSLCOMMERZ response:", response_data)

        if response_data.get("status") == "SUCCESS":
            return Response({"payment_url": response_data["GatewayPageURL"]}, status=200)
        else:
            return Response({"error": "Failed to initiate payment"}, status=500)
    
    @action(detail=True, methods=["post"])
    @csrf_exempt  # since SSLCOMMERZ calls this externally
    def confirm(self, request, pk=None):
        payment = self.get_object()
        gateway_response = request.data.dict() if hasattr(request.data, "dict") else request.data

        status_flag = gateway_response.get("status", "").upper()
        card_type = gateway_response.get("card_type")

        if status_flag in ["VALID", "VALIDATED"]:
            payment.status = "SUCCESS"
        else:
            payment.status = "FAILED"

        payment.gateway_response = gateway_response
        payment.save()

        # Update booking with actual method used
        booking = payment.booking
        if card_type:
            booking.payment_method = card_type  # e.g. "Bkash-BKash", "VISA-Dutch Bangla"
            booking.save()

        return Response(PaymentSerializer(payment).data)
    