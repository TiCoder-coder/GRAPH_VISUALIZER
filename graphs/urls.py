from django.urls import path
from .View.Home_view import home_page
from .View.Fleury_view import fleury_page, get_graph_data, get_pdf_text
from .View.Hierholzer_view import hierholzer_page, hierholzer_api

urlpatterns = [
    path('', home_page, name='home'),

    # Fleury
    path('fleury/', fleury_page, name='fleury_page'),

    # MUST PLACE HIERHOLZER API FIRST
    path('hierholzer/', hierholzer_page, name='hierholzer_page'),
    path('api/graph/hierholzer/', hierholzer_api, name='api_graph_hierholzer'),

    # Fleury API (MUST BE AFTER HIERHOLZER)
    path('api/graph/<str:algorithm>/', get_graph_data, name='api_graph_data'),

    # PDF
    path("api/pdf-text/", get_pdf_text, name="pdf_text"),
]
