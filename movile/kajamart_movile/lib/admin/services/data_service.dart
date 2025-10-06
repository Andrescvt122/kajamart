// lib/admin/services/data_service.dart
import '../models/provider.dart';
import '../models/product.dart';
import '../models/client.dart';
import '../models/sale.dart';
import '../models/purchase.dart';
import '../data/sample_providers.dart';
import '../data/sample_data.dart';
import '../data/sample_clients.dart';
import '../data/sample_sales.dart';
import '../data/sample_purchases.dart';

class DataService {
  static List<Provider> get sampleProviders => SampleProviders.sampleProviders;
  static List<Product> get sampleProducts => SampleData.sampleProducts;
  static List<Client> get sampleClients => SampleClients.sampleClients;
  static List<Sale> get sampleSales => SampleSales.sampleSales;
  static List<Purchase> get samplePurchases => SamplePurchases.samplePurchases;

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

  // Método para obtener clientes activos
  static List<Client> get activeClients =>
      sampleClients.where((c) => c.status == ClientStatus.activo).toList();

  // Método para obtener clientes inactivos
  static List<Client> get inactiveClients =>
      sampleClients.where((c) => c.status == ClientStatus.inactivo).toList();

  // Método para obtener ventas completadas
  static List<Sale> get completedSales =>
      sampleSales.where((s) => s.status == SaleStatus.completada).toList();

  // Método para obtener ventas anuladas
  static List<Sale> get cancelledSales =>
      sampleSales.where((s) => s.status == SaleStatus.anulada).toList();

  // Método para obtener compras completadas
  static List<Purchase> get completedPurchases =>
      samplePurchases.where((p) => p.status == PurchaseStatus.completada).toList();

  // Método para obtener compras anuladas
  static List<Purchase> get cancelledPurchases =>
      samplePurchases.where((p) => p.status == PurchaseStatus.anulada).toList();
}
