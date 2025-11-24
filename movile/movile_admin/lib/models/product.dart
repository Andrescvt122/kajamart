// lib/models/product.dart
import 'batch.dart';

class Product {
  final String id;
  final String name;
  final String category;
  final String? description;
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
  final double? icuPercent;

  final List<Batch> batches;

  Product({
    required this.id,
    required this.name,
    required this.category,
    this.description,
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
    this.icuPercent,
    this.batches = const [],
  });

  Product copyWith({
    List<Batch>? batches,
  }) {
    return Product(
      id: id,
      name: name,
      category: category,
      description: description,
      imageUrl: imageUrl,
      currentStock: currentStock,
      minStock: minStock,
      maxStock: maxStock,
      price: price,
      status: status,
      purchasePrice: purchasePrice,
      salePrice: salePrice,
      markupPercent: markupPercent,
      ivaPercent: ivaPercent,
      icuPercent: icuPercent,
      batches: batches ?? this.batches,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final ivaDetalle = json['iva_detalle'] as Map<String, dynamic>?;
    final icuDetalle = json['icu_detalle'] as Map<String, dynamic>?;
    final incrementoDetalle =
        json['incremento_detalle'] as Map<String, dynamic>?;

    return Product(
      id: json['id_producto']?.toString() ?? '',
      name: json['nombre']?.toString() ?? 'Producto',
      category: json['categoria']?.toString() ??
          (json['categorias']?['nombre_categoria']?.toString() ?? 'Sin categoría'),
      description: json['descripcion']?.toString(),
      imageUrl: json['url_imagen']?.toString() ?? '',
      currentStock: (json['stock_actual'] as num?)?.toInt() ?? 0,
      minStock: (json['stock_minimo'] as num?)?.toInt() ?? 0,
      maxStock: (json['stock_maximo'] as num?)?.toInt() ?? 0,
      price: (json['precio_venta'] as num?)?.toDouble() ?? 0,
      status: json['estado'] == true ? 'Activo' : 'Inactivo',
      purchasePrice: (json['costo_unitario'] as num?)?.toDouble(),
      salePrice: (json['precio_venta'] as num?)?.toDouble(),
      markupPercent:
          (incrementoDetalle?['valor_impuesto'] as num?)?.toDouble(),
      ivaPercent: (ivaDetalle?['valor_impuesto'] as num?)?.toDouble(),
      icuPercent: (icuDetalle?['valor_impuesto'] as num?)?.toDouble(),
    );
  }
}
