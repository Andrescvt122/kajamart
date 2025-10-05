// lib/services/provider_service.dart
import 'package:flutter/foundation.dart';
import '../models/provider.dart';
import '../models/provider_category.dart';

class ProviderService extends ChangeNotifier {
  List<Provider> _providers = [];

  ProviderService() {
    _loadSampleData();
  }

  List<Provider> get providers => _providers;

  void _loadSampleData() {
    _providers = _getSampleProviders();
    notifyListeners();
  }

  List<Provider> _getSampleProviders() {
    final categories = _getSampleCategories();

    return [
      Provider(
        nit: '900123456-1',
        name: 'Distribuidora ABC S.A.S',
        contactName: 'María González',
        phone: '3001234567',
        categories: [categories[0], categories[1]],
        status: ProviderStatus.activo,
        email: 'contacto@distribuidoraabc.com',
        address: 'Calle 45 # 23-12, Bogotá',
        registrationDate: DateTime(2023, 3, 15),
        averageRating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      ),
      Provider(
        nit: '800987654-2',
        name: 'Alimentos del Campo Ltda',
        contactName: 'Carlos Rodríguez',
        phone: '3109876543',
        categories: [categories[2], categories[3]],
        status: ProviderStatus.activo,
        email: 'ventas@alimentosdelcampo.com',
        address: 'Carrera 15 # 67-89, Medellín',
        registrationDate: DateTime(2023, 1, 20),
        averageRating: 4.2,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      ),
      Provider(
        nit: '901234567-3',
        name: 'Productos Naturales E.U',
        contactName: 'Ana Martínez',
        phone: '3204567890',
        categories: [categories[4]],
        status: ProviderStatus.inactivo,
        email: 'info@productosnaturales.com',
        address: 'Avenida 7 # 34-56, Cali',
        registrationDate: DateTime(2022, 8, 10),
        averageRating: 3.8,
      ),
      Provider(
        nit: '805678901-4',
        name: 'Importaciones Internacionales',
        contactName: 'Roberto Sánchez',
        phone: '3156789012',
        categories: [categories[5], categories[6]],
        status: ProviderStatus.activo,
        email: 'comercial@importaciones.com',
        address: 'Calle 100 # 45-67, Barranquilla',
        registrationDate: DateTime(2023, 5, 5),
        averageRating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      ),
    ];
  }

  List<ProviderCategory> _getSampleCategories() {
    return [
      const ProviderCategory(
        id: 'CAT001',
        name: 'Lácteos',
        description: 'Productos derivados de la leche',
      ),
      const ProviderCategory(
        id: 'CAT002',
        name: 'Carnes',
        description: 'Productos cárnicos y derivados',
      ),
      const ProviderCategory(
        id: 'CAT003',
        name: 'Frutas y Verduras',
        description: 'Productos agrícolas frescos',
      ),
      const ProviderCategory(
        id: 'CAT004',
        name: 'Cereales',
        description: 'Granos y productos derivados',
      ),
      const ProviderCategory(
        id: 'CAT005',
        name: 'Bebidas',
        description: 'Refrescos, jugos y bebidas alcohólicas',
      ),
      const ProviderCategory(
        id: 'CAT006',
        name: 'Envasados',
        description: 'Productos envasados y procesados',
      ),
      const ProviderCategory(
        id: 'CAT007',
        name: 'Limpieza',
        description: 'Productos de aseo y limpieza',
      ),
    ];
  }

  Provider? getProviderByNit(String nit) {
    try {
      return _providers.firstWhere((provider) => provider.nit == nit);
    } catch (e) {
      return null;
    }
  }

  List<Provider> getProvidersByCategory(String categoryName) {
    return _providers.where((provider) {
      return provider.categories.any((category) => category.name == categoryName);
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
    return categorySet.toList()..sort();
  }

  // Métodos para futuras funcionalidades
  Future<void> addProvider(Provider provider) async {
    _providers.add(provider);
    notifyListeners();
  }

  Future<void> updateProvider(Provider updatedProvider) async {
    final index = _providers.indexWhere((provider) => provider.nit == updatedProvider.nit);
    if (index != -1) {
      _providers[index] = updatedProvider;
      notifyListeners();
    }
  }

  Future<void> deleteProvider(String nit) async {
    _providers.removeWhere((provider) => provider.nit == nit);
    notifyListeners();
  }

  // Estadísticas rápidas
  int get totalProviders => _providers.length;

  int get activeProvidersCount => getActiveProviders().length;

  int get inactiveProvidersCount => getInactiveProviders().length;

  double get averageRating {
    if (_providers.isEmpty) return 0.0;
    final totalRating = _providers.fold(0.0, (sum, provider) => sum + (provider.averageRating ?? 0.0));
    return totalRating / _providers.length;
  }
}
