# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse  # <-- add this
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # include your app routes at /api/

    # Root URL handler
    path('', lambda request: HttpResponse("<h2 style='color:green;'>✅ Django server is running</h2>")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
