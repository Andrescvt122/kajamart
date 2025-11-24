// lib/services/product_service.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:movile_admin/constants/app_constants.dart';
import '../models/batch.dart';
import '../models/product.dart';

class ProductService extends ChangeNotifier {
  List<Product> _products = [];
  bool _isLoading = false;
  String? _error;

  ProductService() {
    fetchProducts();
  }

  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse(AppConstants.productsEndpoint));

      if (response.statusCode != 200) {
        throw Exception('Error al obtener productos (${response.statusCode})');
      }

      final data = jsonDecode(response.body) as List<dynamic>;
      _products = data.map((item) => Product.fromJson(item)).toList();
    } catch (e) {
      _error = 'No se pudieron cargar los productos: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Product? getProductById(int id) {
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
    return _products
        .where((product) => product.currentStock <= product.minStock)
        .toList();
  }

  List<Product> getExpiringSoonProducts({int daysAhead = 7}) {
    final now = DateTime.now();
    final futureDate = now.add(Duration(days: daysAhead));

    return _products.where((product) {
      return product.batches.any((batch) {
        if (batch.expiryDate == null) return false;
        return batch.expiryDate!.isBefore(futureDate) &&
            batch.expiryDate!.isAfter(now);
      });
    }).toList();
  }

  Future<List<Batch>> fetchProductBatches(int productId, double? salePrice) async {
    try {
      final url =
          '${AppConstants.productDetailsEndpoint}/producto/$productId';
      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        throw Exception('Error al obtener lotes (${response.statusCode})');
      }

      final data = jsonDecode(response.body) as List<dynamic>;
      final batches =
          data.map((item) => Batch.fromJson(item, salePrice: salePrice)).toList();

      // Actualizar lista del producto
      final index = _products.indexWhere((p) => p.id == productId);
      if (index != -1) {
        _products[index] = _products[index].copyWith(batches: batches);
        notifyListeners();
      }

      return batches;
    } catch (e) {
      _error = 'No se pudieron cargar los lotes: $e';
      notifyListeners();
      rethrow;
    }
  }

  // Estadísticas rápidas
  int get totalProducts => _products.length;

  double get totalInventoryValue {
    return _products.fold(
      0.0,
      (sum, product) => sum + (product.price * product.currentStock),
    );
  }

  int get lowStockCount => getLowStockProducts().length;

  int get expiringSoonCount => getExpiringSoonProducts().length;
}
