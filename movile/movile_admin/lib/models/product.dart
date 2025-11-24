// lib/models/product.dart
import 'batch.dart';

class Product {
  final int id;
  final String name;
  final String category;
  final String imageUrl;
  final int currentStock;
  final int minStock;
  final int maxStock;
  final double price;
  final String status;

  final double? purchasePrice;
  final double? salePrice;
  final double? markupPercent;
  final double? ivaPercent;
  final double? icuPercent;

  final List<Batch> batches;

  const Product({
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
    this.icuPercent,
    this.batches = const [],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final ivaDetail = json['iva_detalle'] ??
        json['impuestos_productos_productos_ivaToimpuestos_productos'];
    final icuDetail = json['icu_detalle'] ??
        json['impuestos_productos_productos_icuToimpuestos_productos'];
    final incrementoDetail = json['incremento_detalle'] ??
        json['impuestos_productos_productos_porcentaje_incrementoToimpuestos_productos'];

    final isActive = json['estado'] == true || json['estado'] == 1;

    return Product(
      id: json['id_producto'] ?? 0,
      name: json['nombre'] ?? 'Sin nombre',
      category: json['categoria'] ??
          json['categorias']?['nombre_categoria'] ??
              (json['categorias']?['nombre'] ?? 'Sin categoría'),
      imageUrl: json['url_imagen'] ?? '',
      currentStock: json['stock_actual'] ?? 0,
      minStock: json['stock_minimo'] ?? 0,
      maxStock: json['stock_maximo'] ?? 0,
      price: (json['precio_venta'] as num?)?.toDouble() ?? 0,
      status: isActive ? 'Activo' : 'Inactivo',
      purchasePrice: (json['costo_unitario'] as num?)?.toDouble(),
      salePrice: (json['precio_venta'] as num?)?.toDouble(),
      markupPercent: (incrementoDetail?['valor_impuesto'] as num?)?.toDouble(),
      ivaPercent: (ivaDetail?['valor_impuesto'] as num?)?.toDouble(),
      icuPercent: (icuDetail?['valor_impuesto'] as num?)?.toDouble(),
    );
  }

  Product copyWith({List<Batch>? batches}) {
    return Product(
      id: id,
      name: name,
      category: category,
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
}
