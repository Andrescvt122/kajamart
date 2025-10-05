// lib/admin/services/data_service.dart
import '../models/provider.dart';
import '../models/product.dart';
import '../data/sample_providers.dart';
import '../data/sample_data.dart';

class DataService {
  static List<Provider> get sampleProviders => SampleProviders.sampleProviders;
  static List<Product> get sampleProducts => SampleData.sampleProducts;

  // Método para obtener proveedores activos
  static List<Provider> get activeProviders =>
      sampleProviders.where((p) => p.status == ProviderStatus.activo).toList();

  // Método para obtener proveedores inactivos
  static List<Provider> get inactiveProviders =>
      sampleProviders.where((p) => p.status == ProviderStatus.inactivo).toList();

  // Método para obtener productos activos
  static List<Product> get activeProducts =>
      sampleProducts.where((p) => p.status.toLowerCase() == 'activo').toList();

  // Método para obtener productos inactivos
  static List<Product> get inactiveProducts =>
      sampleProducts.where((p) => p.status.toLowerCase() != 'activo').toList();

  // Método para obtener productos con stock bajo
  static List<Product> get lowStockProducts =>
      sampleProducts.where((p) => p.currentStock <= p.minStock).toList();
}
