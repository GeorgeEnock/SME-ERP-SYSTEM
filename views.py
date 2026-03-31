from django.db import transaction
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Supplier, Product, Sales
from .serializers import SupplierSerializer, ProductSerializer, SalesSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Suppliers to be viewed or edited.
    """
    queryset = Supplier.objects.all().order_by('id')
    serializer_class = SupplierSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Products to be viewed or edited.
    """
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

class SalesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Sales records to be viewed or edited.
    """
    queryset = Sales.objects.all().order_by('id')
    serializer_class = SalesSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            # Lock the product row to prevent race conditions during concurrent sales
            product = Product.objects.select_for_update().get(id=serializer.validated_data['product'].id)
            quantity_sold = serializer.validated_data['quantity_sold']

            if product.quantity < quantity_sold:
                raise ValidationError({"quantity_sold": f"Not enough stock. Only {product.quantity} units left."})

            product.quantity -= quantity_sold
            product.save()
            
            # Calculate total price on backend to prevent price tampering
            total_price = product.price * quantity_sold
            serializer.save(total_price=total_price)

class SummaryView(APIView):
    """
    Endpoint for Dashboard Summary data.
    """
    def get(self, request):
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(quantity__lt=10).count()
        total_revenue = float(Sales.objects.aggregate(total=Sum('total_price'))['total'] or 0)
        
        # Get specific products that are low in stock
        low_stock_products = Product.objects.filter(quantity__lt=10).values(
            'id', 'name', 'quantity', 'supplier__name'
        )

        # Aggregating sales per product to find top sellers
        top_selling_qs = Product.objects.annotate(
            total_sold=Sum('sales__quantity_sold')
        ).filter(total_sold__gt=0).order_by('-total_sold')[:5]
        
        top_selling = [
            {"name": p.name, "total_sold": p.total_sold} for p in top_selling_qs
        ]

        # Sales trends (Last 7 days)
        sales_trends_qs = Sales.objects.annotate(date=TruncDate('sale_date')).values('date').annotate(
            daily_revenue=Sum('total_price')
        ).order_by('date')[:7]

        sales_trends = [
            {"date": s['date'].strftime('%Y-%m-%d'), "amount": float(s['daily_revenue'] or 0)} 
            for s in sales_trends_qs
        ]

        # Dynamic Marketing Insights logic
        marketing_insights = []
        if top_selling:
            marketing_insights.append({
                "type": "Bundle",
                "title": f"Create {top_selling[0]['name']} Bundles",
                "description": "This is your fastest moving item. Create a 'Buy 3 Get 5% Off' bundle to increase average order value.",
                "priority": "High"
            })
        
        if total_revenue > 0:
            marketing_insights.append({
                "type": "Loyalty",
                "title": "Mobile Money Cash-Back",
                "description": "Incentivize repeat visits by offering KES 50 back on M-Pesa transactions over KES 2000.",
                "priority": "Medium"
            })

        # Inventory by Category distribution
        category_dist_qs = Product.objects.values('category').annotate(count=Sum('quantity')).order_by('-count')[:5]
        category_dist = [
            {"category": c['category'], "quantity": c['count']} for c in category_dist_qs
        ]

        return Response({
            "total_products": total_products,
            "low_stock_count": low_stock_count,
            "low_stock_products": list(low_stock_products),
            "total_revenue": total_revenue,
            "top_selling": top_selling,
            "sales_trends": sales_trends,
            "category_distribution": category_dist,
            "marketing_insights": marketing_insights
        })