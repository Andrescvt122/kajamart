// lib/models/batch.dart

class Batch {
  final String idDetalle;
  final String barcode;
  final DateTime? expiryDate;
  final int quantity;
  final int consumedStock;
  final double price;
  final bool isReturn;
  final bool isActive;

  Batch({
    required this.idDetalle,
    required this.barcode,
    required this.expiryDate,
    required this.quantity,
    required this.consumedStock,
    required this.price,
    this.isReturn = false,
    this.isActive = true,
  });

  factory Batch.fromJson(
    Map<String, dynamic> json, {
    double fallbackPrice = 0,
  }) {
    final expiryRaw = json['fecha_vencimiento'];

    return Batch(
      idDetalle: json['id_detalle_producto']?.toString() ?? '',
      barcode: json['codigo_barras_producto_compra']?.toString() ?? '',
      expiryDate:
          expiryRaw != null ? DateTime.tryParse(expiryRaw.toString()) : null,
      quantity: (json['stock_producto'] as num?)?.toInt() ?? 0,
      consumedStock: (json['consumido'] as num?)?.toInt() ?? 0,
      price: (json['precio'] as num?)?.toDouble() ?? fallbackPrice,
      isReturn: json['es_devolucion'] == true,
      isActive: json['estado'] != false,
    );
  }
}
