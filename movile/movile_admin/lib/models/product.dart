// lib/models/product.dart
import 'batch.dart';

class Product {
  final String id;
  final String name;
  final String category;
  final String imageUrl;
  final int currentStock;
  final int minStock;
  final int maxStock;
  final double price;
  final String status;

  // Opcionales
  final double? purchasePrice;
  final double? salePrice;
  final double? markupPercent;
  final double? ivaPercent;

  final List<Batch> batches;

  Product({
    required this.id,
    required this.name,
    required this.category,
    required this.imageUrl,
    required this.currentStock,
    required this.minStock,
    required this.maxStock,
    required this.price,
    required this.status,
    this.purchasePrice,
    this.salePrice,
    this.markupPercent,
    this.ivaPercent,
    this.batches = const [],
  });
}
