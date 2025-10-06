// lib/services/product_service.dart
import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../data/sample_data.dart';

class ProductService extends ChangeNotifier {
  List<Product> _products = [];

  ProductService() {
    _loadSampleData();
  }

  List<Product> get products => _products;

  void _loadSampleData() {
    _products = SampleData.sampleProducts;
    notifyListeners();
  }

  Product? getProductById(String id) {
    try {
      return _products.firstWhere((product) => product.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Product> getProductsByCategory(String category) {
    return _products.where((product) => product.category == category).toList();
  }

  List<Product> getLowStockProducts() {
    return _products.where((product) => product.currentStock <= product.minStock).toList();
  }

  List<Product> getExpiringSoonProducts({int daysAhead = 7}) {
    final now = DateTime.now();
    final futureDate = now.add(Duration(days: daysAhead));

    return _products.where((product) {
      return product.batches.any((batch) {
        return batch.expiryDate.isBefore(futureDate) && batch.expiryDate.isAfter(now);
      });
    }).toList();
  }

  // Métodos para futuras funcionalidades
  Future<void> addProduct(Product product) async {
    _products.add(product);
    notifyListeners();
  }

  Future<void> updateProduct(Product updatedProduct) async {
    final index = _products.indexWhere((product) => product.id == updatedProduct.id);
    if (index != -1) {
      _products[index] = updatedProduct;
      notifyListeners();
    }
  }

  Future<void> deleteProduct(String id) async {
    _products.removeWhere((product) => product.id == id);
    notifyListeners();
  }

  // Estadísticas rápidas
  int get totalProducts => _products.length;

  double get totalInventoryValue {
    return _products.fold(0.0, (sum, product) => sum + (product.price * product.currentStock));
  }

  int get lowStockCount => getLowStockProducts().length;

  int get expiringSoonCount => getExpiringSoonProducts().length;
}
