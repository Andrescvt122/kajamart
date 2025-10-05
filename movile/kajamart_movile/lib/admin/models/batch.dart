// lib/models/batch.dart

class Batch {
  final String idDetalle;
  final String barcode;
  final DateTime expiryDate;
  final int quantity;
  final int consumedStock;
  final double price;

  Batch({
    required this.idDetalle,
    required this.barcode,
    required this.expiryDate,
    required this.quantity,
    required this.consumedStock,
    required this.price,
  });
}
