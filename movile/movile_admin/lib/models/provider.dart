// lib/models/provider.dart
import 'provider_category.dart';

enum ProviderStatus {
  activo,
  inactivo,
}

extension ProviderStatusExtension on ProviderStatus {
  String get displayName {
    switch (this) {
      case ProviderStatus.activo:
        return 'Activo';
      case ProviderStatus.inactivo:
        return 'Inactivo';
    }
  }

  int get colorValue {
    switch (this) {
      case ProviderStatus.activo:
        return 0xff4CAF50; // Verde
      case ProviderStatus.inactivo:
        return 0xffF44336; // Rojo
    }
  }
}

class Provider {
  final String nit;
  final String name;
  final String contactName;
  final String phone;
  final List<ProviderCategory> categories;
  final ProviderStatus status;
  final String? email;
  final String? address;
  final DateTime? registrationDate;
  final double? averageRating;
  final String? imageUrl;

  const Provider({
    required this.nit,
    required this.name,
    required this.contactName,
    required this.phone,
    required this.categories,
    required this.status,
    this.email,
    this.address,
    this.registrationDate,
    this.averageRating,
    this.imageUrl,
  });

  // Método para obtener las primeras 2 categorías y contar las restantes
  String get categoriesDisplay {
    if (categories.length <= 2) {
      return categories.map((cat) => cat.name).join(', ');
    }
    final firstTwo = categories.take(2).map((cat) => cat.name).join(', ');
    final remaining = categories.length - 2;
    return '$firstTwo, +$remaining';
  }

  // Método para obtener todas las categorías como string
  String get allCategoriesDisplay {
    return categories.map((cat) => cat.name).join(', ');
  }

  @override
  String toString() => name;
}
