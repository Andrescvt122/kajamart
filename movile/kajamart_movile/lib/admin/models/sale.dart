// lib/models/sale.dart
enum SaleStatus {
  completada,
  anulada,
}

extension SaleStatusExtension on SaleStatus {
  String get displayName {
    switch (this) {
      case SaleStatus.completada:
        return 'Completada';
      case SaleStatus.anulada:
        return 'Anulada';
    }
  }

  int get colorValue {
    switch (this) {
      case SaleStatus.completada:
        return 0xff4CAF50; // Verde
      case SaleStatus.anulada:
        return 0xffF44336; // Rojo
    }
  }
}

class SaleProduct {
  final String name;
  final int quantity;
  final double unitPrice;
  final double total;

  const SaleProduct({
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });
}

class Sale {
  final String id;
  final String clientName;
  final double total;
  final DateTime date;
  final SaleStatus status;
  final List<SaleProduct> products;
  final String? paymentMethod;
  final String? observations;

  const Sale({
    required this.id,
    required this.clientName,
    required this.total,
    required this.date,
    required this.status,
    required this.products,
    this.paymentMethod,
    this.observations,
  });

  @override
  String toString() => 'Venta #$id - $clientName';
}
