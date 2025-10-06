// lib/models/purchase.dart
enum PurchaseStatus {
  completada,
  anulada,
}

extension PurchaseStatusExtension on PurchaseStatus {
  String get displayName {
    switch (this) {
      case PurchaseStatus.completada:
        return 'Completada';
      case PurchaseStatus.anulada:
        return 'Anulada';
    }
  }

  int get colorValue {
    switch (this) {
      case PurchaseStatus.completada:
        return 0xff4CAF50; // Verde
      case PurchaseStatus.anulada:
        return 0xffF44336; // Rojo
    }
  }
}

class PurchaseProduct {
  final String name;
  final int quantity;
  final double unitCost;
  final double subtotal;

  const PurchaseProduct({
    required this.name,
    required this.quantity,
    required this.unitCost,
    required this.subtotal,
  });
}

class Purchase {
  final String id;
  final String providerName;
  final String providerNit;
  final double total;
  final DateTime date;
  final PurchaseStatus status;
  final List<PurchaseProduct> products;
  final double? taxes;
  final String? observations;

  const Purchase({
    required this.id,
    required this.providerName,
    required this.providerNit,
    required this.total,
    required this.date,
    required this.status,
    required this.products,
    this.taxes,
    this.observations,
  });

  @override
  String toString() => 'Compra #$id - $providerName';
}
