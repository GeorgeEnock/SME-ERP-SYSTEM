from django.contrib import admin
from .models import Supplier, Product, Sales

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'email')
    search_fields = ('name', 'email')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'quantity', 'price', 'supplier', 'last_restocked')
    list_filter = ('category', 'supplier')
    search_fields = ('name', 'category')

@admin.register(Sales)
class SalesAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity_sold', 'sale_date', 'total_price')
    list_filter = ('sale_date', 'product')
    readonly_fields = ('sale_date',)
    search_fields = ('product__name',)
