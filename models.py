from django.db import models

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=20)  # Flexible for international/local formats
    email = models.EmailField()

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2)  # High precision for local currencies
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    last_restocked = models.DateField()

    def __str__(self):
        return self.name

class Sales(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')
    quantity_sold = models.PositiveIntegerField()
    sale_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Sale: {self.product.name} ({self.quantity_sold})"

    class Meta:
        verbose_name_plural = "Sales"
