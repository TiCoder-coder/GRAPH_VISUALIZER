from django.urls import path
from . import views

urlpatterns = [
    path('api/graph/<str:algorithm>/', views.get_graph_data, name='api_graph_data'),
]
