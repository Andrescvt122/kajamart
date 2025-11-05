// lib/admin/services/data_service.dart
import '../models/product.dart';
import '../data/sample_data.dart';

class DataService {
  static List<Product> get sampleProducts => SampleData.sampleProducts;

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
