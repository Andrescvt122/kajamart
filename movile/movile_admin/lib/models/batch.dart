// lib/models/batch.dart

class Batch {
  final int idDetalle;
  final String barcode;
  final DateTime? expiryDate;
  final int quantity;
  final int consumedStock;
  final double price;
  final bool isReturn;
  final bool isActive;

  const Batch({
    required this.idDetalle,
    required this.barcode,
    required this.expiryDate,
    required this.quantity,
    required this.consumedStock,
    required this.price,
    required this.isReturn,
    required this.isActive,
  });

  factory Batch.fromJson(
    Map<String, dynamic> json, {
    double? salePrice,
  }) {
    final rawDate = json['fecha_vencimiento'];
    return Batch(
      idDetalle: json['id_detalle_producto'] ?? 0,
      barcode: json['codigo_barras_producto_compra'] ?? '—',
      expiryDate: rawDate != null ? DateTime.tryParse(rawDate) : null,
      quantity: json['stock_producto'] ?? 0,
      consumedStock: json['consumed_stock'] ?? 0,
      price: salePrice ?? (json['precio'] as num?)?.toDouble() ?? 0,
      isReturn: json['es_devolucion'] == true,
      isActive: json['estado'] == null || json['estado'] == true,
    );
  }
}
