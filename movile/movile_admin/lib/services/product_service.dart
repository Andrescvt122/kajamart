// lib/services/product_service.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/batch.dart';
import '../models/product.dart';

class ProductService extends ChangeNotifier {
  static String get _baseUrl {
    final isLocalPlatform = kIsWeb ||
        defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.linux;

    // En emulador Android usamos 10.0.2.2 para alcanzar localhost
    final host = isLocalPlatform ? 'http://localhost:3000' : 'http://10.0.2.2:3000';
    return '$host/kajamart/api';
  }

  List<Product> _products = [];
  bool _isLoading = false;
  String? _errorMessage;
  String? _batchError;

  ProductService() {
    fetchProducts();
  }

  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get batchError => _batchError;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('$_baseUrl/products'));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List<dynamic>;
        _products = data.map((item) => Product.fromJson(item)).toList();
      } else {
        _errorMessage = 'Error ${response.statusCode} al obtener productos';
      }
    } catch (e) {
      _errorMessage = 'No se pudo conectar con el servidor';
      if (kDebugMode) {
        print('❌ Error fetching products: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Batch>> fetchBatchesForProduct(String productId,
      {double? fallbackPrice}) async {
    _batchError = null;
    notifyListeners();

    try {
      final response = await http
          .get(Uri.parse('$_baseUrl/detailsProducts/producto/$productId'));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body) as List<dynamic>;
        final batches = data
            .map(
              (item) => Batch.fromJson(
                item as Map<String, dynamic>,
                fallbackPrice: fallbackPrice ?? 0,
              ),
            )
            .toList();

        final index = _products.indexWhere((p) => p.id == productId);
        if (index != -1) {
          _products[index] = _products[index].copyWith(batches: batches);
          notifyListeners();
        }

        return batches;
      } else {
        _batchError = 'Error ${response.statusCode} al obtener lotes';
      }
    } catch (e) {
      _batchError = 'No se pudo cargar los lotes';
      if (kDebugMode) {
        print('❌ Error fetching batches for product $productId: $e');
      }
    }
    notifyListeners();
    return [];
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
    return _products
        .where((product) => product.currentStock <= product.minStock)
        .toList();
  }

  List<Product> getExpiringSoonProducts({int daysAhead = 7}) {
    final now = DateTime.now();
    final futureDate = now.add(Duration(days: daysAhead));

    return _products.where((product) {
      return product.batches.any((batch) {
        final expiry = batch.expiryDate;
        if (expiry == null) return false;
        return expiry.isBefore(futureDate) && expiry.isAfter(now);
      });
    }).toList();
  }

  // Estadísticas rápidas
  int get totalProducts => _products.length;

  double get totalInventoryValue {
    return _products
        .fold(0.0, (sum, product) => sum + (product.price * product.currentStock));
  }

  int get lowStockCount => getLowStockProducts().length;

  int get expiringSoonCount => getExpiringSoonProducts().length;
}
