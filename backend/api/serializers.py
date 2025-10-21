from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time as dt_time, timedelta
from .models import (
    Lead, Customer, Service, Booking, Refund, Product, Vendor, VendorSlot, User, ServiceType, ServiceSubType, SERVICE_TYPE_TO_SUBTYPES, SERVICE_SUBTYPE_EXTRAS, Payment
)
from .models import Order, OrderItem
from django.conf import settings

# =========================================================
# Helpers
# =========================================================

def parse_id_list(value):
    """
    Accepts list input from form-data OR a comma-separated string.
    Returns a list of IDs (ints).
    """
    if value is None or value == "":
        return []
    if isinstance(value, (list, tuple)):
        return [int(v) for v in value if f"{v}".strip() != ""]
    if isinstance(value, str):
        parts = [p.strip() for p in value.split(",")]
        return [int(p) for p in parts if p]
    # Fallback: single int?
    try:
        return [int(value)]
    except Exception:
        return []

# =========================================================
# Vendor Slot
# =========================================================
class VendorSlotSerializer(serializers.ModelSerializer):
    day = serializers.ChoiceField(choices=VendorSlot.DAYS_OF_WEEK)

    class Meta:
        model = VendorSlot
        fields = ["id", "day", "start_time", "end_time"]

# =========================================================
# Vendor
# =========================================================
class VendorSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    profile_picture = serializers.ImageField(source="user.profile_picture", required=False, allow_null=True)
    slots = VendorSlotSerializer(many=True, required=False)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    # Add these two fields to expose services_list as "services" and skills
    services = serializers.ListField(child=serializers.CharField(), required=False, source="services_list")
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    service_types = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id",
            "user",
            "profile_picture",
            "contact_number",
            "email",
            "username",
            "area",
            "bio",
            "services",
            "skills",
            "slots",
            "is_active",
            "service_types"
        ]

    def create(self, validated_data):
        slots_data = validated_data.pop("slots", [])
        vendor = Vendor.objects.create(**validated_data)
        for slot in slots_data:
            VendorSlot.objects.create(vendor=vendor, **slot)
        return vendor

    def update(self, instance, validated_data):
        slots_data = validated_data.pop("slots", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if slots_data is not None:
            for slot in slots_data:
                slot_id = slot.get("id")
                if slot_id:
                    VendorSlot.objects.filter(id=slot_id, vendor=instance).update(**slot)
                else:
                    VendorSlot.objects.create(vendor=instance, **slot)
        return instance
    
    def get_service_types(self, obj):
        return [s.service_type for s in obj.services.all()]

# =========================================================
# Customer
# =========================================================
class CustomerSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    profile_picture = serializers.ImageField(source="user.profile_picture", required=False, allow_null=True)

    class Meta:
        model = Customer
        fields = "__all__"

# =========================================================
# User
# =========================================================
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    customer = CustomerSerializer(required=False, allow_null=True)
    vendor = VendorSerializer(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "profile_picture",
            "password",
            "customer",
            "vendor",
        ]
        read_only_fields = ["id", "is_active"]
        
    def validate_username(self, value):
        if " " in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        customer_data = validated_data.pop("customer", None)
        vendor_data = validated_data.pop("vendor", None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        if password:
            instance.set_password(password)
        instance.save()

        # Update or create Customer
        if customer_data is not None:
            Customer.objects.update_or_create(user=instance, defaults=customer_data)

        # Update or create Vendor
        if vendor_data is not None:
            slots_data = vendor_data.pop("slots", None)
            vendor, _ = Vendor.objects.get_or_create(user=instance, defaults=vendor_data)
            for attr, val in vendor_data.items():
                setattr(vendor, attr, val)
            vendor.save()

            if slots_data is not None:
                for slot in slots_data:
                    slot_id = slot.get("id")
                    if slot_id:
                        VendorSlot.objects.filter(id=slot_id, vendor=vendor).update(**slot)
                    else:
                        VendorSlot.objects.create(vendor=vendor, **slot)

        return instance

# =========================================================
# Lead
# =========================================================
class LeadSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Lead
        fields = "__all__"

# =========================================================
# Service
# =========================================================




class ServiceSerializer(serializers.ModelSerializer):
    assigned_vendors = VendorSerializer(many=True, read_only=True)
    assigned_vendor_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    # Service type and subtype choices
    service_type = serializers.ChoiceField(
        choices=ServiceType.choices, required=True
    )
    service_subtype = serializers.ChoiceField(
        choices=ServiceSubType.choices, required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = Service
        fields = [
            "id", "name", "price", "description", "image",
            "service_type", "service_subtype",
            "assigned_vendors", "assigned_vendor_ids",
        ]

    def validate(self, attrs):
        # Required fields check when creating
        if self.instance is None:
            for field in ["name", "price", "service_type"]:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: f"{field} is required."})

        # Subtype validation
        service_type = attrs.get("service_type") or getattr(self.instance, "service_type", None)
        service_subtype = attrs.get("service_subtype")

        if service_subtype:
            allowed = SERVICE_TYPE_TO_SUBTYPES.get(service_type, [])
            if service_subtype not in allowed:
                raise serializers.ValidationError({
                    "service_subtype": f"{service_subtype} is not valid for type {service_type}."
                })

        return attrs

    def create(self, validated_data):
        vendor_ids = validated_data.pop("assigned_vendor_ids", [])
        service = Service.objects.create(**validated_data)
        if vendor_ids:
            vendors = Vendor.objects.filter(id__in=vendor_ids)
            service.assigned_vendors.set(vendors)
        return service

    def update(self, instance, validated_data):
        vendor_ids = validated_data.pop("assigned_vendor_ids", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if vendor_ids is not None:
            vendors = Vendor.objects.filter(id__in=vendor_ids)
            instance.assigned_vendors.set(vendors)
        return instance


# --- Extra helper serializer for subtypes ---
class SubtypeOptionsSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=ServiceType.choices)

    def to_representation(self, instance):
        service_type = instance.get("type")
        return {
            "type": service_type,
            "subtypes": SERVICE_TYPE_TO_SUBTYPES.get(service_type, [])
        }
        
class ExtrasOptionsSerializer(serializers.Serializer):
    subtype = serializers.ChoiceField(choices=ServiceSubType.choices)

    def to_representation(self, instance):
        subtype = instance.get("subtype")
        return {
            "subtype": subtype,
            "extras": list(SERVICE_SUBTYPE_EXTRAS.get(subtype, {}).keys())
        }

# =========================================================
# Booking
# =========================================================

class BookingSerializer(serializers.ModelSerializer):
    # Nested read-only
    service = ServiceSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    vendor = VendorSerializer(read_only=True, allow_null=True)

    # Write-only for POST/PUT
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source="service", write_only=True
    )
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source="customer", write_only=True
    )
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source="vendor", write_only=True, allow_null=True, required=False
    )

    payment_method = serializers.CharField(
    required=False,
    allow_blank=True,
    allow_null=True,
    read_only=True,  # since we set it from the payment callback, not from frontend
)

    details = serializers.JSONField(required=False, default=list)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "service", "service_id",
            "customer", "customer_id",
            "vendor", "vendor_id",
            "start_datetime",
            "name", "address", "contact_number",
            "status", "completed_photo", "created_at", "notes",
            "area", "payment_method", "details", "total_price",
        ]
        read_only_fields = ["created_at", "total_price"]

    def validate_details(self, value):
        """
        Ensure all details are valid extras for the service subtype.
        """
        service = self.initial_data.get("service_id") or getattr(self.instance, "service", None)
        if not service:
            return value

        # Resolve service object
        if isinstance(service, (str, int)):
            try:
                service = Service.objects.get(pk=service)
            except Service.DoesNotExist:
                raise serializers.ValidationError("Invalid service ID.")

        subtype = service.service_subtype
        allowed_extras = SERVICE_SUBTYPE_EXTRAS.get(subtype, {})

        # Extract names from dicts if needed
        selected_names = [d["name"] if isinstance(d, dict) else str(d) for d in value]

        invalid = [extra for extra in selected_names if extra not in allowed_extras]
        if invalid:
            raise serializers.ValidationError(
                f"Invalid extras for subtype '{subtype}': {invalid}. Allowed: {list(allowed_extras.keys())}"
            )

        return value

    def to_representation(self, instance):
        """Convert details back to list for API response"""
        ret = super().to_representation(instance)
        if instance.details:
            formatted = []
            for d in instance.details:
                if isinstance(d, dict):
                    formatted.append(d)
                else:
                    formatted.append({"name": str(d), "price": SERVICE_SUBTYPE_EXTRAS.get(instance.service.service_subtype, {}).get(str(d), 0)})
            ret["details"] = formatted
        else:
            ret["details"] = []
        return ret

# =========================================================
# Refund
# =========================================================
class RefundSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source="booking",
        write_only=True
    )

    class Meta:
        model = Refund
        fields = [
            "id",
            "booking",
            "booking_id",
            "amount",
            "reason",
            "status",
            "processed_at",
            "time_diff",
            "booking_status",
            "created_at",
            "remarks",
        ]
        read_only_fields = ["time_diff", "booking_status", "processed_at", "created_at"]

# =========================================================
# Product
# =========================================================
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock", "image", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            # fallback if no request context
            return f"{settings.MEDIA_URL}{obj.image}"
        return None


# ---------------------------
# OrderItem
# ---------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "product_id", "quantity", "subtotal"]
        read_only_fields = ["subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal

# ---------------------------
# Order
# ---------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)  # optional now

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_id", "quantity", "price"]

    def create(self, validated_data):
        if "price" not in validated_data:
            validated_data["price"] = validated_data["product"].price * validated_data.get("quantity", 1)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "price" not in validated_data:
            validated_data["price"] = validated_data["product"].price * validated_data.get("quantity", 1)
        return super().update(instance, validated_data)

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source="customer", write_only=True
    )
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "customer", "customer_id", "items", "total_price", "status", "created_at", "updated_at"]
        read_only_fields = ["total_price", "created_at", "updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data.get("quantity", 1)
            price = product.price * quantity
            total += price
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)
        order.total_price = total
        order.save()
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if items_data is not None:
            # Delete old items and recreate
            instance.items.all().delete()
            total = 0
            for item_data in items_data:
                product = item_data["product"]
                quantity = item_data.get("quantity", 1)
                price = product.price * quantity
                total += price
                OrderItem.objects.create(order=instance, product=product, quantity=quantity, price=price)
            instance.total_price = total
            instance.save()

        return instance
    

class PaymentInitSerializer(serializers.Serializer):
    """
    Frontend only sends booking_id.
    Amount always comes from booking.total_price.
    """
    booking_id = serializers.IntegerField()


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = (
            "transaction_id",
            "status",
            "gateway_response",
            "created_at",
            "updated_at",
            "amount",   # amount is auto-filled from booking.total_price
        )

