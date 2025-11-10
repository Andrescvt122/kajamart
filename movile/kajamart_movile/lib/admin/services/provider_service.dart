// lib/services/provider_service.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/provider.dart';

class ProviderService extends ChangeNotifier {
  ProviderService({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? 'http://localhost:3000/kajamart/api';

  final http.Client _client;
  final String _baseUrl;

  List<Provider> _providers = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Provider> get providers => _providers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Uri get _suppliersUri => Uri.parse('$_baseUrl/suppliers');

  Future<void> fetchProviders() async {
    _setLoading(true);

    try {
      final response = await _client.get(_suppliersUri);

      if (response.statusCode != 200) {
        throw HttpException('Error ${response.statusCode}: ${response.reasonPhrase}');
      }

      final decoded = jsonDecode(response.body);
      final List<dynamic> supplierList = _extractSuppliers(decoded);

      _providers = supplierList
          .whereType<Map<String, dynamic>>()
          .map(Provider.fromJson)
          .toList();
      _errorMessage = null;
    } catch (error) {
      if (kDebugMode) {
        debugPrint('Error al obtener proveedores: $error');
      }
      _providers = [];
      _errorMessage = 'No se pudieron cargar los proveedores.';
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  List<dynamic> _extractSuppliers(dynamic decoded) {
    if (decoded is List) {
      return decoded;
    }

    if (decoded is Map<String, dynamic>) {
      final candidates = [
        decoded['data'],
        decoded['suppliers'],
        decoded['items'],
        decoded['results'],
      ];

      for (final candidate in candidates) {
        if (candidate is List) {
          return candidate;
        }
      }
    }

    return const [];
  }

  Provider? getProviderByNit(String nit) {
    try {
      return _providers.firstWhere((provider) => provider.nit == nit);
    } catch (_) {
      return null;
    }
  }

  List<Provider> getProvidersByCategory(String categoryName) {
    return _providers.where((provider) {
      return provider.categories
          .any((category) => category.name.toLowerCase() == categoryName.toLowerCase());
    }).toList();
  }

  List<Provider> getActiveProviders() {
    return _providers.where((provider) => provider.status == ProviderStatus.activo).toList();
  }

  List<Provider> getInactiveProviders() {
    return _providers.where((provider) => provider.status == ProviderStatus.inactivo).toList();
  }

  List<String> getAllCategories() {
    final categorySet = <String>{};
    for (final provider in _providers) {
      for (final category in provider.categories) {
        categorySet.add(category.name);
      }
    }
    final categories = categorySet.toList();
    categories.sort();
    return categories;
  }

  @override
  void dispose() {
    _client.close();
    super.dispose();
  }
}

class HttpException implements Exception {
  HttpException(this.message);

  final String message;

  @override
  String toString() => 'HttpException: $message';
}
