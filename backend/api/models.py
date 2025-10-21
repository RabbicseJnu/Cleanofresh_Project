from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
import os
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
from datetime import datetime, timedelta
import uuid

# --------------------------
# CUSTOM USER
# --------------------------

# username, email, first_name, last_name, password exist in AbstractUser
class User(AbstractUser):
    ROLE_CHOICES = [
        ("Admin", "Admin"),
        ("Customer", "Customer"),
        ("Vendor", "Vendor"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="Customer")

    # New field for profile picture
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
        help_text="Optional profile picture for all users"
    )


# -----------------------------
# Delete old profile picture on update
# -----------------------------
@receiver(pre_save, sender=User)
def auto_delete_old_profile_picture_on_update(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when updating User.profile_picture with a new one.
    """
    if not instance.pk:
        return  # New user, nothing to delete

    try:
        old_file = User.objects.get(pk=instance.pk).profile_picture
    except User.DoesNotExist:
        return

    new_file = instance.profile_picture
    if old_file and old_file != new_file:
        try:
            if old_file.path and os.path.isfile(old_file.path):
                os.remove(old_file.path)
        except (ValueError, FileNotFoundError):
            pass


# -----------------------------------------
# Delete profile picture on user deletion
# -----------------------------------------
@receiver(post_delete, sender=User)
def auto_delete_profile_picture_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when User object is deleted.
    """
    if instance.profile_picture:
        try:
            if instance.profile_picture.path and os.path.isfile(instance.profile_picture.path):
                os.remove(instance.profile_picture.path)
        except (ValueError, FileNotFoundError):
            pass

# ---------------------------
# CUSTOMER
# ---------------------------

class Customer(models.Model):
    AREA_CHOICES = [
        ("Banasree", "Banasree"),
        ("Mirpur", "Mirpur"),
        ("Badda", "Badda"),
        ("Gulshan", "Gulshan"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer"
    )
    lead = models.OneToOneField(
        "Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customer"
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    area = models.CharField(max_length=50, choices=AREA_CHOICES)
    address = models.TextField(blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Customer: {self.user.username} ({self.area})"
    
    @property
    def profile_picture(self):
        return self.user.profile_picture

# ---------------------------
# VENDOR
# ---------------------------
class Vendor(models.Model):
    AREA_CHOICES = [
        ("Banasree", "Banasree"),
        ("Mirpur", "Mirpur"),
        ("Badda", "Badda"),
        ("Gulshan", "Gulshan"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor"
    )
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(max_length=254)
    area = models.CharField(max_length=50, choices=AREA_CHOICES)

    # Instead of assigning services here, vendors describe themselves
    bio = models.TextField(
        blank=True,
        null=True,
        help_text="Describe your skills, expertise, and experience in your own words."
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Vendor: {self.user.username} ({self.area})"
    
    @property
    def profile_picture(self):
        return self.user.profile_picture

    # New fields
    services_list = ArrayField(models.CharField(max_length=100), blank=True, default=list)
    skills = ArrayField(models.CharField(max_length=100), blank=True, default=list)
# ---------------------------
# VENDOR SLOTS
# ---------------------------
class VendorSlot(models.Model):
    DAYS_OF_WEEK = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday"),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="slots")
    day = models.CharField(max_length=20, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.vendor.user.username} - {self.day} {self.start_time} to {self.end_time}"

# ---------------------------
# LEAD
# ---------------------------
class Lead(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Converted", "Converted"),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=20)
    lead_score = models.IntegerField(default=0)
    source = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.status})"

# Auto-create Customer when Lead is converted
@receiver(post_save, sender=Lead)
def create_customer_when_converted(sender, instance, created, **kwargs):
    if not created and instance.status == "Converted" and not hasattr(instance, 'customer'):
        user = User.objects.create(username=instance.email, email=instance.email, role="Customer")
        Customer.objects.create(
            lead=instance,
            user=user,
            phone=instance.phone,
            area="Banasree"  # default, can update later
        )

# ---------------------------
# SERVICE
# ---------------------------
# =========================================================
# ENUMS
# =========================================================
class ServiceType(models.TextChoices):
    RESIDENTIAL = "RESIDENTIAL", "Residential Cleaning"
    DEEP = "DEEP", "Deep Cleaning"
    DRY = "DRY", "Dry Cleaning Services"
    FLOOR = "FLOOR", "Floor Cleaning"
    OFFICE = "OFFICE", "Office Cleaning"


class ServiceSubType(models.TextChoices):
    # Residential
    KITCHEN = "KITCHEN", "Kitchen"
    LIVING_ROOM = "LIVING_ROOM", "Living Room"
    BATHROOMS = "BATHROOMS", "Bathrooms"
    BEDROOMS = "BEDROOMS", "Bedrooms"

    # Deep
    CABINETS = "CABINETS", "Hand-washing Cabinets"
    UPHOLSTERY = "UPHOLSTERY", "Vacuuming Upholstery"
    POLISH_WOOD = "POLISH_WOOD", "Polishing Wood"
    CLEAN_OVEN = "CLEAN_OVEN", "Cleaning Oven"
    FAN_BLADES = "FAN_BLADES", "Ceiling Fan Blades"
    BASEBOARDS = "BASEBOARDS", "Baseboards"

    # Dry
    CARPET = "CARPET", "Carpet Cleaning"
    CLOTHING = "CLOTHING", "Certain Clothing"

    # Floor
    SWEEP_MOP = "SWEEP_MOP", "Floor Sweeping & Mopping"
    HARDWOOD = "HARDWOOD", "Hardwood Polishing"
    TILE_GROUT = "TILE_GROUT", "Tile Grout Cleaning"
    FLOOR_WAX = "FLOOR_WAX", "Floor Waxing"
    CEMENT = "CEMENT", "Cement Sealing"

    # Office
    CUBICLES = "CUBICLES", "Cubicles"
    RESTROOMS = "RESTROOMS", "Restrooms"
    OFFICE_KITCHEN = "OFFICE_KITCHEN", "Kitchens"
    RECEPTION = "RECEPTION", "Reception Areas"


# =========================================================
# MAPPING: Type → Allowed Subtypes
# =========================================================
SERVICE_TYPE_TO_SUBTYPES = {
    ServiceType.RESIDENTIAL: [
        ServiceSubType.KITCHEN,
        ServiceSubType.LIVING_ROOM,
        ServiceSubType.BATHROOMS,
        ServiceSubType.BEDROOMS,
    ],
    ServiceType.DEEP: [
        ServiceSubType.CABINETS,
        ServiceSubType.UPHOLSTERY,
        ServiceSubType.POLISH_WOOD,
        ServiceSubType.CLEAN_OVEN,
        ServiceSubType.FAN_BLADES,
        ServiceSubType.BASEBOARDS,
    ],
    ServiceType.DRY: [
        ServiceSubType.CARPET,
        ServiceSubType.CLOTHING,
    ],
    ServiceType.FLOOR: [
        ServiceSubType.SWEEP_MOP,
        ServiceSubType.HARDWOOD,
        ServiceSubType.TILE_GROUT,
        ServiceSubType.FLOOR_WAX,
        ServiceSubType.CEMENT,
    ],
    ServiceType.OFFICE: [
        ServiceSubType.CUBICLES,
        ServiceSubType.RESTROOMS,
        ServiceSubType.OFFICE_KITCHEN,
        ServiceSubType.RECEPTION,
    ],
}

# =========================================================
# EXTRA DETAILS PRICING PER SUBTYPE
# =========================================================
# Each subtype maps to a dictionary of extra detail → extra price
SERVICE_SUBTYPE_EXTRAS = {
    # Residential
    ServiceSubType.KITCHEN: {
        "Deep Stove Cleaning": 200,
        "Fridge Wipe Down": 150,
        "Cabinet Sanitization": 100,
    },
    ServiceSubType.LIVING_ROOM: {
        "Curtain Washing": 300,
        "Carpet Vacuum": 250,
        "Sofa Cleaning": 200,
    },
    ServiceSubType.BATHROOMS: {
        "Mirror Polishing": 100,
        "Tile Scrub": 200,
        "Shower Head Descaling": 150,
    },
    ServiceSubType.BEDROOMS: {
        "Mattress Vacuum": 250,
        "Wardrobe Dusting": 150,
        "Bed Frame Polishing": 100,
    },

    # Deep Cleaning
    ServiceSubType.CABINETS: {
        "Door Polishing": 150,
        "Deep Cabinet Scrub": 200,
    },
    ServiceSubType.UPHOLSTERY: {
        "Vacuuming": 100,
        "Stain Treatment": 200,
    },
    ServiceSubType.POLISH_WOOD: {
        "Furniture Polishing": 150,
        "Floor Polish": 200,
    },
    ServiceSubType.CLEAN_OVEN: {
        "Grill Cleaning": 150,
        "Rack Cleaning": 100,
    },
    ServiceSubType.FAN_BLADES: {
        "Ceiling Fan Dusting": 50,
        "Fan Motor Wipe": 50,
    },
    ServiceSubType.BASEBOARDS: {
        "Deep Scrub": 100,
        "Repaint Touch-up": 150,
    },

    # Dry Cleaning
    ServiceSubType.CARPET: {
        "Deep Shampoo": 400,
        "Odor Removal": 250,
    },
    ServiceSubType.CLOTHING: {
        "Stain Removal": 100,
        "Pressing & Folding": 50,
    },

    # Floor
    ServiceSubType.SWEEP_MOP: {
        "Extra Mop Treatment": 50,
        "Disinfectant Wash": 100,
    },
    ServiceSubType.HARDWOOD: {
        "Polish Application": 150,
        "Scratch Repair": 200,
    },
    ServiceSubType.TILE_GROUT: {
        "Deep Grout Cleaning": 150,
        "Sealant Application": 200,
    },
    ServiceSubType.FLOOR_WAX: {
        "Wax Layer Extra": 100,
        "Buffing": 150,
    },
    ServiceSubType.CEMENT: {
        "Sealing": 200,
        "Patch Repair": 150,
    },

    # Office
    ServiceSubType.CUBICLES: {
        "Desk Sanitization": 500,
        "Keyboard Cleaning": 300,
    },
    ServiceSubType.RESTROOMS: {
        "Toilet Disinfecting": 150,
        "Mirror & Sink Cleaning": 100,
    },
    ServiceSubType.OFFICE_KITCHEN: {
        "Appliance Wipe": 150,
        "Countertop Sanitizing": 100,
    },
    ServiceSubType.RECEPTION: {
        "Reception Desk Wipe": 100,
        "Chair Cleaning": 150,
    },
}


# =========================================================
# SERVICE MODEL
# =========================================================
class Service(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="services/", blank=True, null=True)

    service_type = models.CharField(
        max_length=20,
        choices=ServiceType.choices,
        default=ServiceType.RESIDENTIAL,
    )
    service_subtype = models.CharField(
        max_length=50,
        choices=ServiceSubType.choices,
        blank=True,
        null=True,
    )

    # Admin can assign vendors to services after reviewing bios
    assigned_vendors = models.ManyToManyField(
        "Vendor",
        related_name="services",
        blank=True,
        help_text="Select which vendors are approved to provide this service."
    )

    def clean(self):
        """Ensure subtype matches selected type"""
        if self.service_subtype:
            allowed = SERVICE_TYPE_TO_SUBTYPES.get(self.service_type, [])
            if self.service_subtype not in allowed:
                raise ValidationError({
                    "service_subtype": f"'{self.service_subtype}' is not valid for type '{self.service_type}'."
                })

    def __str__(self):
        return f"{self.name} (${self.price})"


# =========================================================
# IMAGE CLEANUP SIGNALS
# =========================================================
@receiver(pre_save, sender=Service)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """Delete old file when replacing image"""
    if not instance.pk:
        return False
    try:
        old_file = Service.objects.get(pk=instance.pk).image
    except Service.DoesNotExist:
        return False
    new_file = instance.image
    if old_file and old_file != new_file and os.path.isfile(old_file.path):
        os.remove(old_file.path)


@receiver(post_delete, sender=Service)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """Delete file when model is deleted"""
    if instance.image and os.path.isfile(instance.image.path):
        os.remove(instance.image.path)

# ---------------------------
# BOOKING
# ---------------------------

# ---------------------------
# BOOKING
# ---------------------------
class Booking(models.Model):
    STATUS_CHOICES = [
        ("Not Accepted", "Not Accepted"),
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Overdue", "Overdue"),
        ("Refunded","Refunded"),
        ("Refunded But Pending","Refunded But Pending"),
        ("Refunded But Rejected","Refunded But Rejected")
        
    ]

    service = models.ForeignKey(
        "Service", on_delete=models.CASCADE, related_name="bookings"
    )
    customer = models.ForeignKey(
        "Customer", on_delete=models.CASCADE, related_name="bookings"
    )
    vendor = models.ForeignKey(
        "Vendor", on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )

    start_datetime = models.DateTimeField(default=timezone.now)
    name = models.CharField(max_length=200)
    address = models.TextField()
    contact_number = models.CharField(max_length=20)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Not Accepted")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_photo = models.ImageField(upload_to="booking_completed/", blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    area = models.CharField(max_length=100, blank=True, null=True)

    # ---------------------------
    # New fields
    # ---------------------------
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
    max_length=100,
    blank=True,
    null=True,
    help_text="Set after payment success (e.g. Visa, Master, Bkash, Nagad, etc.)"
    )
    details = models.JSONField(default=list, blank=True)

    def calculate_total_price(self):
        """
        Calculate total price:
        base price + extras + optional notes fee
        """
        total = self.service.price or 0

        # Extras
        for detail in self.details or []:
            # detail can be dict (from frontend) or string (legacy)
            if isinstance(detail, dict) and "name" in detail:
                extras_name = detail["name"]
            else:
                extras_name = str(detail)
            extras = SERVICE_SUBTYPE_EXTRAS.get(self.service.service_subtype, {})
            total += extras.get(extras_name, 0)

        # Optional notes fee (example: 500)
        if self.notes and self.notes.strip():
            total += 500

        return total

    def save(self, *args, **kwargs):
        # Update total price before saving
        self.total_price = self.calculate_total_price()

        now = timezone.now()
        # Update status to Overdue if start_datetime is in the past
        if self.status != "Completed" and self.start_datetime < now:
            self.status = "Overdue"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.service.name} booking for {self.name} with {self.vendor} ({self.status})"

        
# ---------------------------
# Expired Bookings
# ---------------------------
 
        
# ---------------------------
# REFUND
# ---------------------------
class Refund(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="refund"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    processed_at = models.DateTimeField(blank=True, null=True)
    time_diff = models.DurationField(blank=True, null=True)
    booking_status = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.booking_status and self.booking:
            self.booking_status = self.booking.status
        if not self.time_diff and self.booking:
            self.time_diff = timezone.now() - self.booking.start_datetime
        if self.status == "Approved" and not self.processed_at:
            self.processed_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Refund for {self.booking} - {self.status}"

# ---------------------------
# PRODUCT (E-COMMERCE)
# ---------------------------
class Product(models.Model):
    name = models.CharField(max_length=255) 
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) 
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to="products/", blank=True, null=True) 

    def __str__(self): 
        return self.name
    

    # ---------------------------
# PRODUCT ORDER
# ---------------------------
class Order(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="orders")
    products = models.ManyToManyField(Product, through="OrderItem")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # product price at the time of order

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.product.price
        super().save(*args, **kwargs)


#====================================
#Payment
#====================================

def generate_transaction_id():
    return str(uuid.uuid4())

class Payment(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
    ]

    booking = models.ForeignKey("Booking", on_delete=models.CASCADE, related_name="payments")
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        default=generate_transaction_id,
        editable=False
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    gateway_response = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.status}"

